<script setup lang="ts">
import { initFlowbite } from 'flowbite'
import type { Player, Mob, Skill } from "./playerMob.types"
import { usePlayerWithMob } from './playerMob'
import { whileLoop } from '@utils/whileLoop'
import "@utils/forEachAsync";
import * as R from "remeda";
// 啟用 Flowbite  UI 框架

// 初始化 Flowbite
onMounted(() => {
  initFlowbite()
})

// 取用角色狀態資料
const { playersRef, mobsRef, itemRefs, mobsDom } = usePlayerWithMob()

// 戰鬥過程描述的面板(主要在戰鬥途中，或戰鬥後用來顯示訊息的功能)
const actionDesc = ref('')
const buttonText = ref('')

// 狀態切換的開關
// 用來切換 hover事件處理是否執行的狀態值
const isHoverEnabled = ref(true);

// 鼠標懸停按鈕，顯示技能訊息
// 參數為從模板輸入的技能資料
const hover = (skill: { name: string, cost: number, damage: number }) => {
  if (!isHoverEnabled.value) return
  actionDesc.value = `${skill.name} <br>
  消耗魔力：${skill.cost} <br>
  傷害：${skill.damage}`
}

// 操作卡片 聚焦/未聚焦 的狀態處理函式
// 按鈕 啟用/禁用 的效果
const enableButton = (player: Player | Mob) => {
  const playerCardElem = (player.refDom as Element).querySelectorAll('[type="button"]')
  playerCardElem.forEach((el) => {
    el.classList.remove('cursor-not-allowed')
    el.classList.add('hover:bg-gray-100')
    el.classList.add('cursor-pointer')
  });
}
const disableButton = (player: Player | Mob) => {
  const playerCardElem = (player.refDom as Element).querySelectorAll('[type="button"]')
  playerCardElem.forEach((el) => {
    el.classList.add('cursor-not-allowed')
    el.classList.remove('hover:bg-gray-100')
    el.classList.remove('cursor-pointer')
  });
}

// 卡片縮放效果的 啟用/關閉
const enableCardAnimat = (player: Player | Mob) => {
  player.isGrow = true;
}
const disableCardAnimat = (player: Player | Mob) => {
  player.isGrow = false;
}

// 等待玩家選取技能
const awaitSelection = async (player: Player): Promise<Skill> => {
  return new Promise((resolve) => {
    let elem = player.refDom as Element
    let handleSkillSelect = (event: Event) => {

      // 定義內部變數
      const target = event.target as Element
      let skill: Skill | undefined

      // 透過當前角色所有技能，來匹配點擊元素中的文字
      player.skill.forEach((_skill) => {
        _skill.name === target.textContent ? skill = _skill : null
      })
      // 若匹配不到，則空值台顯示回饋，並且不往下執行
      if (!skill) return; actionDesc.value = '尚未正確選擇角色動作'

      // 檢驗魔力消耗，並作相應處理
      if (player.mp >= skill.cost) {
        player.mp -= skill.cost
        elem.removeEventListener('click', handleSkillSelect)
        resolve(skill)
      } else {
        actionDesc.value = '魔力不足!'
      }
    }
    // 監聽該區塊元素下，哪一個按鈕被點擊
    elem.addEventListener('click', handleSkillSelect)
  })
};

// 分別處理攻擊、補血的技能
const handleSkillEffect = (skill: { id: number, name: string, cost: number, damage: number }, player: Player) => {
  // 執行該技能效果，並顯示戰鬥描述
  // 主要分為攻擊與補血
  if (skill.id === 5) {
    playersRef.value.forEach((_player) => {

      // 需先想辦法篩選掉已經死亡的隊友
      // 對於補血後，會超過最大值的角色，補倒滿不要超過
      if (_player.hp === 0) return

      _player.hp + skill.damage > _player.oringInfo!.hp
        ? _player.hp = _player.oringInfo!.hp
        : _player.hp += skill.damage
      actionDesc.value = `${_player.name} 對 我方成員 使出 ${skill.name} 恢復了 ${skill.damage} HP！`
    })
  }
  if (skill.id != 5) {
    // 血量低於 0時，校正為 0
    mobsRef.value[0].hp - skill.damage < 0
      ? mobsRef.value[0].hp = 0
      : mobsRef.value[0].hp -= skill.damage
    actionDesc.value = `${player.name} 對 ${mobsRef.value[0].name} 使出 ${skill.name} 造成了 ${skill.damage} 傷害！`

  }
}


// 當前回合角色，的行動流程函式
const playerAction = async (player: Player): Promise<boolean | undefined> => {
  // 當前角色沒有血量，就不執行攻擊流程，直接 return 後，進入下個角色操作
  if (player.hp === 0) return
  enableButton(player)
  enableCardAnimat(player)


  // 等待玩家正確選取技能後，將技能資料回傳
  const skill = await awaitSelection(player)
  handleSkillEffect(skill, player)

  const [isGameOver, defeatedSide] = checkGameOver()
  if (isGameOver) {
    await handleGameOver(defeatedSide, player)
    await sleep(1)
    isBreak_forEach = !isBreak_forEach
    return
  }

  disableButton(player)
  disableCardAnimat(player)
}

// 結束遊戲的處理
const checkGameOver = () => {
  let defeatedSide
  if (playersRef.value.every((_player) => _player.hp == 0)) defeatedSide = 'players'
  if (mobsRef.value[0].hp == 0) defeatedSide = 'mobs'
  const isGameOver = defeatedSide ? true : false
  return [isGameOver, defeatedSide]
}
const handleGameOver = async (defeatedSide: any, player: Player | Mob, player2?: Player | Mob): Promise<undefined> => {
  handleVictoryDefeat(defeatedSide)
  await handleBattleOutcome(player, player2)
  // 玩家點擊後，卡片聚焦要重置，並回道地一個勇者的行動回合
}
const handleVictoryDefeat = (defeatedSide: any) => {
  if (defeatedSide === 'players') {
    actionDesc.value = '勇者全滅！'
    buttonText.value = '重新遊戲'
  }
  if (defeatedSide === 'mobs') {
    actionDesc.value = '怪物消滅！'
    buttonText.value = '是否再挑戰一次！'
  }
}
const handleBattleOutcome = async (player: Player | Mob, player2?: Player | Mob) => {
  if (!player2) disableButton(player)
  isHoverEnabled.value = false
  // 等待玩家點擊重新開始按鈕
  await waitClick(player, player2)
}

// 設定共享的變數
// 要將「解決堵塞」的函式，共享給重新開始按鈕的處理函式中執行
// 並且一併傳輸「最後回合仍有放大效果的卡片」引用，到重新開始按鈕的處理函式中使用
let resolveWaitClick: [(value: unknown) => void, Player | Mob, player2?: Player | Mob]
const waitClick = async (player: Player | Mob | Mob, player2?: Player | Mob) => new Promise((resolve) => {
  // 通常要建立一個等待使用者觸發事件的函式
  // 會需要 new Promise() 並且將其傳遞給其 CallBack 的 resolve() 函式，用來解除等待
  // 而當 new Promise() 執行時，其內部的同步代碼會先執行，此時可以用來註冊監聽器
  // 此時將 resolve() 使用在 new Promise() 內部的監聽器中，當監聽器觸發時，就能夠透過「作用域鏈」來調用 這個 Promise 的 resolve() 函式
  resolveWaitClick = [resolve, player, player2]
})

const restart = () => {
  // 移除按鈕文字
  // 移除卡片聚焦效果
  // 恢復鼠標懸浮顯示技能訊息
  // 重置玩家與敵人狀態
  // 解決堵塞
  buttonText.value = ''
  const [resolve, player, player2] = resolveWaitClick
  console.log('player', player)
  console.log('player2', player2)
  disableCardAnimat(player)
  if (player2) disableCardAnimat(player2)
  isHoverEnabled.value = true

  // 角色怪物皆恢復初始狀態
  playersRef.value.forEach((player) => {
    player.hp = player.oringInfo!.hp
    player.mp = player.oringInfo!.mp
  })
  mobsRef.value.forEach((player) => {
    player.hp = player.oringInfo!.hp
    player.mp = player.oringInfo!.mp
  })
  resolve(null)

}

// 設定等待時間
const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000))


// 取得要被攻擊的勇者的 index
const pickAttackedPlayerIndex = () => {
  let survivors = R.filter(playersRef.value, (player) => player.hp > 0)
  let survivor = getRandomElement(survivors)
  let index = R.findIndex(playersRef.value, (player) => player.name === survivor.name)
  return index
}

// 從陣列中隨機選取一個元素的函式
const getRandomElement = (arr: any) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 處理並顯示怪物開始攻擊
const mobAttackHandleDisplay = (mob: Mob, player: Player) => {
  if (player.hp - mob.skill[0].damage! < 0) {
    player.hp = 0
    player.status = '無法戰鬥'
  }
  else player.hp -= mob.skill[0].damage
  actionDesc.value = `${mob.name} 對 ${player.name} 使出 ${mob.skill[0].name} 造成了 ${mob.skill[0].damage} 傷害！`
}


// 共享 勇者陣列.forEachAsync 中 CallBack 的 isBreak 參數，主要用在該 CallBack 函式中回傳以產生迴圈中斷的效果
// 主要用來控制 forEachAsync 迴圈的中斷，同時也用來控制 whileLoop 迴圈的 Continue 效果
let isBreak_forEach: boolean

onMounted(async () => {

  // 自定義的 whileLoop 函式，也有自己的 break、continue 的功能
  whileLoop(async (isBreak, data, isContinue) => {

    //  每此 whileLoop 後，重置 isBreak_forEach
    // isBreak_forEach = false

    await playersRef.value.forEachAsync(async (player, isBreak) => {
      isBreak_forEach = isBreak! // 兩者的初始值皆為 true
      await playerAction(player) // 在這個函式中，可能會修改 isBreak_forEach 的狀態
      return [!isBreak_forEach] // 若 isBreak_forEach 沒被修改狀態，原則上會繼續執行迴圈
    })

    isContinue = !isBreak_forEach // 原則上也是繼續執行迴圈
    if (isContinue) return [!isBreak]
    // 若 勇者陣列.forEachAsync 有被提早中斷了，代表勇者死光，無須進入下面怪物攻擊的回合
    // 因此會提早 return，從 whileLoop 的前面開始
    // 這個 return [!isBreak] 代表，whileLoop 沒有要被中斷
    // 若要中斷可以回傳 return [isBreak]


    // 進入怪物攻擊的回合
    // 下面怪物每個動作，都用 1 秒間隔，讓用戶能夠自然瀏覽效果
    await mobsRef.value.forEachAsync(async (mob, isBreak) => {

      await sleep(1)
      mob.isGrow = true // 怪物卡片放大效果
      await sleep(1)

      // 決定要被攻擊用者的 index
      let Index = pickAttackedPlayerIndex()
      const playerRef = playersRef.value[Index]
      playerRef.isGrow = true // 被攻擊勇者卡片放大效果
      await sleep(1)
      mobAttackHandleDisplay(mob, playerRef) // 處理並顯示怪物開始攻擊
      await sleep(1)
      // 確認是否結束與後續處理
      const [isGameOver, defeatedSide] = checkGameOver()
      if (isGameOver) {
        await handleGameOver(defeatedSide, mob, playerRef)
        await sleep(1)
        return [isBreak] // 直接回傳當前 forEachAsync 的 CallBack 的 isBreak 參數來中斷
      }

      // 怪物回合結束後，要縮小怪物與勇者卡片的效果
      // 若遊戲結束時，就由遊戲結束函式自己處理
      playerRef.isGrow = false
      mob.isGrow = false

    })
  })
})
</script>
<template>
  <div class="mt-16 container mx-auto grid grid-cols-3 gap-4">
    <ul>
      <li v-for="(player, i) in playersRef" :key="i">
        <div href="#" ref="itemRefs" class=" mb-4 !grid grid-cols-2 gap-8 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          <ul>
            <li class="flex justify-between "><span>{{ player.name }}</span><span>{{ player.class }}</span></li>
            <li class="flex justify-between"><span>HP</span><span>{{ player.hp }}</span></li>
            <li class="flex justify-between"><span>MP</span><span>{{ player.mp }}</span></li>
            <li class="flex justify-between"><span>狀態</span><span>{{ player.status }}</span></li>
          </ul>
          <div> <span>技能</span>
            <ul class="text-center space-y-px">
              <li v-for="(skill, l) in player.skill " @mouseenter="hover(skill)" :key="l" type="button" class="px-2 rounded-md border border-gray-300  cursor-not-allowed  text-center" disabled><a class="block">{{ skill.name }}</a></li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
    <div class="ml-4">
      <div v-html="actionDesc"></div>
      <button @click="restart" v-if="buttonText" type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">{{ buttonText }}</button>

    </div>
    <div>
      <ul>
        <li v-for="(mob, i) in mobsRef" :key="i">
          <div href="#" ref="mobsDom" class=" mb-4 !grid grid-cols-2 gap-8 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <ul>
              <li class="flex justify-between "><span>{{ mob.name }}</span><span>{{ mob.class }}</span></li>
              <li class="flex justify-between"><span>HP</span><span>{{ mob.hp }}</span></li>
              <li class="flex justify-between"><span>MP</span><span>{{ mob.mp }}</span></li>
              <li class="flex justify-between"><span>狀態</span><span>{{ mob.status }}</span></li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>


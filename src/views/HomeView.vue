<script setup lang="ts">
import { initFlowbite } from 'flowbite'
import type { Player, Mob } from "./battle.types"
import { useBattleInit } from './battleInit'
import { whileLoop } from '@utils/fpTools'
import "../utils/asyncTools";
import * as R from "remeda";
// 啟用 Flowbite  UI 框架

// 初始化 Flowbite
onMounted(() => {
  initFlowbite()
})

// 一些類型介面
interface Skill { id: number, name: string, cost: number, damage: number }

// 取用角色狀態資料
const { playersRef, mobsRef, itemRefs, mobsDom } = useBattleInit()

// 戰鬥過程描述的面板(主要在戰鬥途中，或戰鬥後用來顯示訊息的功能)
const actionDesc = ref('')
const buttonText = ref('')
// 用來切換 hover事件處理是否執行的狀態值
const isHoverEnabled = ref(true);


// 鼠標懸停時，顯示技能訊息的事件
const hover = (skill: { name: string, cost: number, damage: number }) => {
  if (!isHoverEnabled.value) return
  actionDesc.value = `${skill.name} <br>
  消耗魔力：${skill.cost} <br>
  傷害：${skill.damage}`
}

// 按鈕啟用/按鈕禁用狀態的處理函式
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

// 角色卡片聚焦/解除聚焦狀態的處理函式
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


// 當前角色行動流程的函式
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

let currentPlayer: Player
let resolveWaitClick: [(value: unknown) => void, Player | Mob, player2?: Player | Mob]
const waitClick = async (player: Player | Mob | Mob, player2?: Player | Mob) => new Promise((resolve) => {
  // 通常要建立一個等待使用者觸發事件的函式
  // 會需要 new Promise() 並且將其傳遞給其 CallBack 的 resolve() 函式，用來解除等待
  // 而當 new Promise() 執行時，其內部的同步代碼會先執行，此時可以用來註冊監聽器
  // 此時將 resolve() 使用在 new Promise() 內部的監聽器中，當監聽器觸發時，就能夠透過「作用域鏈」來調用 這個 Promise 的 resolve() 函式
  resolveWaitClick = [resolve, player, player2]
})


// 分別處理攻擊、補血的技能
const handleSkillEffect = (skill: { id: number, name: string, cost: number, damage: number }, player: Player) => {
  // 執行該技能效果，並顯示戰鬥描述
  // 主要分為攻擊與補血
  if (skill.id === 5) {
    playersRef.value.forEach((_player) => {

      // 需先想辦法篩選掉已經死亡的隊友
      // 對於補血後，會超過最大值的角色，補倒滿不要超過
      if (_player.hp === 0) return
      console.log('oringInfo', _player.oringInfo!.hp)
      if (_player.hp + skill.damage > _player.oringInfo!.hp) {
        _player.hp = _player.oringInfo!.hp
      }
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

// 是否 GameOver
// 應在每次角色或怪物攻擊後檢查
const checkGameOver = () => {
  let defeatedSide
  if (playersRef.value.every((_player) => _player.hp == 0)) defeatedSide = 'players'
  if (mobsRef.value[0].hp == 0) defeatedSide = 'mobs'
  const isGameOver = defeatedSide ? true : false
  return [isGameOver, defeatedSide]
}

const restart = () => {
  // 移除按鈕文字
  // 移除卡片聚焦效果
  // 恢復鼠標懸浮顯示技能訊息
  // 重置玩家與敵人狀態
  // 解決堵塞
  buttonText.value = ''
  const [resolve, player, player2] = resolveWaitClick
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

const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000))

// 寫一個從陣列中隨機選取一個元素的函式
const getRandomElement = (arr: any) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const getAttackedRandomPlayer = () => {
  let survivors = playersRef.value.filter((player) => player.hp > 0)
  return getRandomElement(survivors)
}
const AttackHandleDisplay = (mob: Mob, player: Player) => {
  player.hp - mob.skill[0].damage < 0
    ? player.hp = 0
    : player.hp -= mob.skill[0].damage
  actionDesc.value = `${mob.name} 對 ${player.name} 使出 ${mob.skill[0].name} 造成了 ${mob.skill[0].damage} 傷害！`

}
let isBreak_forEach: boolean
onMounted(async () => {

  whileLoop(async (isBreak, data, isContinue) => {
    isBreak_forEach = false
    await playersRef.value.forEachAsync(async (player, isBreak) => {
      isBreak_forEach = isBreak!
      await playerAction(player)
      return [!isBreak_forEach]
    })

    isContinue = !isBreak_forEach
    if (isContinue) return [!isBreak]



    await mobsRef.value.forEachAsync(async (mob, isBreak) => {
      if (mob.hp === 0) return
      await sleep(1)
      mob.isGrow = true
      await sleep(1)
      const target = getAttackedRandomPlayer()
      // 回傳一接受攻擊的對象
      await playersRef.value.forEachAsync(async (player, isBreak) => {
        if (player.name === target.name) {
          player.isGrow = true
          await sleep(1)
          AttackHandleDisplay(mob, player)
          await sleep(1)
          const [isGameOver, defeatedSide] = checkGameOver()
          if (isGameOver) {
            await handleGameOver(defeatedSide, mob, player)
            await sleep(1)
            return [isBreak]

          }
          player.isGrow = false
          mob.isGrow = false
        }
      });
    })
  })
})
</script>
<template>
  <div class="container mx-auto grid grid-cols-3 gap-4">
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
    <!-- hover:bg-gray-100 -->
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


<script setup lang="ts">
import { initFlowbite } from 'flowbite'
import { useHvr } from '../components/Hvr'
import type { Ref } from "vue";
import type { Player, Mobs } from "./battle.types"
import { useBattleInit } from './battleInit'
import { whileLoop } from '@utils/fpTools'

// 啟用 Flowbite  UI 框架
onMounted(() => {
  initFlowbite()
})

// 取用角色狀態資料
const { playersRef, mobsRef, itemRefs } = useBattleInit()


// 戰鬥過程描述的面板
const actionDesc = ref('')
const buttonText = ref('')

// 懸停顯示技能重要訊息
function hover(skill: { name: string, cost: number, damage: number }) {
  actionDesc.value = `${skill.name} <br>
  消耗魔力：${skill.cost} <br>
  傷害：${skill.damage}`
}

// 重新開始遊戲
function restart() {
  buttonText.value = ''
  // 角色怪物皆恢復初始狀態
  playersRef.value.forEach((player) => {
    player.hp = player.oringInfo!.hp
    player.mp = player.oringInfo!.mp
  })
  mobsRef.value.forEach((player) => {
    player.hp = player.oringInfo!.hp
    player.mp = player.oringInfo!.mp
  })
}

// 當前角色操作面板的啟用
function enableCardUI(player: Player) {
  // 當前角色操作面板的啟用(即包含角色面板使用突出動畫，並解除按鈕禁用)
  player.isAnimating = true;
  (player.refDom as Element).querySelectorAll('[type="button"]').forEach((el) => {
    el.classList.remove('cursor-not-allowed')
    el.classList.add('hover:bg-gray-100')
    el.classList.add('cursor-pointer')
  });
}
function disableCardUI(player: Player) {
  player.isAnimating = false;
  ; (player.refDom as Element).querySelectorAll('[type="button"]').forEach((el) => {
    el.classList.add('cursor-not-allowed')
    el.classList.remove('hover:bg-gray-100')
    el.classList.remove('cursor-pointer')
  });
}

// 個別角色攻擊時的流程
async function playerAttack(player: Player) {
  console.log('我進入角色攻擊流程')
  // 當前角色沒有血量，就不執行攻擊流程，直接 return 後，進入下個角色操作
  if (player.hp === 0) return

  enableCardUI(player)

  // 等待玩家正確選取技能後，將技能資料回傳
  const skill = await waitPlayerAction(player)
  handleSkillEffect(skill, player)
  isGameOver()
  disableCardUI(player)
}


interface Skill { id: number, name: string, cost: number, damage: number }
// 等待玩家選取技能
async function waitPlayerAction(player: Player): Promise<Skill> {
  return new Promise((resolve, reject) => {
    // 監聽該區塊元素下，哪一個按鈕被點擊
    ; (player.refDom as Element).addEventListener('click', (event) => {

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
        resolve(skill)
      } else {
        actionDesc.value = '魔力不足!'
      }
    })
  })
};

// 分別處理攻擊、補血的技能
function handleSkillEffect(skill: { id: number, name: string, cost: number, damage: number }, player: Player) {
  // 執行該技能效果，並顯示戰鬥描述
  //
  console.log('技能效果處理')
  // 主要分為攻擊與補血
  if (skill.id === 5) {
    playersRef.value.forEach((player) => {
      player.hp += skill.damage
      // 超過原始HP，則限制為原始HP
      player.hp > player.oringInfo!.hp ? player.hp = player.oringInfo!.hp :
        actionDesc.value = `${player.name} 對 我方成員 使出 ${skill.name} 恢復了 ${skill.damage} HP！`
    })
  }
  if (skill.id != 5) {
    mobsRef.value[0].hp -= skill.damage
    // 血量低於 0時，校正為 0
    mobsRef.value[0].hp < 0 ? mobsRef.value[0].hp = 0 :
      actionDesc.value = `${player.name} 對 ${mobsRef.value[0].name} 使出 ${skill.name} 造成了 ${skill.damage} 傷害！`
  }
}

// 是否 GameOver
// 應在每次角色或怪物攻擊後檢查
function isGameOver() {
  if (playersRef.value.every((play) => play.hp == 0)) {
    // 顯示勇者全滅，你是否重新遊戲
    actionDesc.value = '勇者全滅！'
    buttonText.value = '重新遊戲'

  }
  if (mobsRef.value[0].hp == 0) {
    // 顯示怪物已消滅，你是否再挑戰一次
    actionDesc.value = '怪物消滅！'
    buttonText.value = '是否再挑戰一次！'
  }
}

onMounted(async () => {

  whileLoop(async () => {
    for (const player of playersRef.value) {
      await playerAttack(player)
    }
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
      <ul href="#" class=" max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <li class="flex justify-between "><span>巴哈姆特</span><span>Boss</span></li>
        <li class="flex justify-between"><span>HP</span><span>{{ mobsRef[0].hp }}</span></li>
        <li class="flex justify-between"><span>MP</span><span>{{ mobsRef[0].mp }}</span></li>
        <li class="flex justify-between"><span>狀態</span><span>正常</span></li>
      </ul>
    </div>
  </div>
</template>


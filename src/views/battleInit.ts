import type { Player, Mobs } from './battle.types'
import { useHvr } from '../components/Hvr'
import type { Ref } from 'vue'

export const useBattleInit = () => {
  // 建立角色資料
  const players: Player[] = [
    {
      name: 'Cloud',
      class: '戰士',
      hp: 5500,
      mp: 500,
      status: '正常',
      skill: [
        { id: 0, name: '攻擊', cost: 0, damage: 400 },
        { id: 1, name: '超究武神霸斬', cost: 50, damage: 2000 }
      ]
    },
    {
      name: 'Tifa',
      class: '格鬥家',
      hp: 5000,
      mp: 500,
      status: '正常',
      skill: [
        { id: 2, name: '攻擊', cost: 0, damage: 600 },
        { id: 3, name: 'ファイナルヘブン（最終天堂）', cost: 80, damage: 2000 }
      ]
    },
    {
      name: 'Aerith',
      class: '魔法師',
      hp: 4800,
      mp: 800,
      status: '正常',
      skill: [
        { id: 4, name: '攻擊', cost: 0, damage: 800 },
        { id: 5, name: 'ケアルガ（全體恢復）', cost: 50, damage: 2000 },
        { id: 6, name: 'ホーリー（聖光）', cost: 80, damage: 900 },
        {
          id: 7,
          name: 'デブチョコボ召喚（召喚胖陸行鳥）',
          cost: 100,
          damage: 1500
        }
      ]
    }
  ]
  // 建立怪物資料
  const mobs: Mobs[] = [
    {
      name: '巴哈姆特',
      class: 'BOSS',
      hp: 10000,
      mp: 20000,
      status: '不爽',
      skill: [{ name: 'メガフレア（超巨爆）', cost: 0, damage: 3000 }]
    }
  ]

  // 將每支角色原始資料放到角色下面的 oringInfo 屬性
  const players2 = players.map((player) => {
    // 使用淺拷貝，避免物件直接同步
    return (player.oringInfo = { ...player })
  })

  const mobs2 = mobs.map((mob) => {
    // 使用淺拷貝，避免物件直接同步
    return (mob.oringInfo = { ...mob })
  })

  // 建立角色響應資料
  // 此處不能使用 <Player[]> 泛型，要使用 Ref<Player[]> 斷言
  const playersRef = ref(players2) as Ref<Player[]>

  // 建立怪物響應資料
  const mobsRef = ref(mobs2)

  const itemRefs = ref<HTMLDivElement[]>([])
  const isAnimating: (Ref<boolean | null> | (boolean | null))[] = []
  for (let i = 0; i < 3; i++) {
    isAnimating.push(useHvr(itemRefs, i, 'grow'))
  }

  onMounted(() => {
    // 將角色資訊區塊的 Dom、相應的特效開關，添加到角色的物件中
    // 將角色的 Dom與isAnimating響應變數，綁定到角色的物件上
    playersRef.value.forEach((player, i) => {
      player.refDom = itemRefs.value[i]
      player.isAnimating = isAnimating[i]
    })
  })

  return { playersRef, mobsRef, itemRefs, isAnimating }
}

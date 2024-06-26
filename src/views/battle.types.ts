import type { Ref, ComponentPublicInstance } from 'vue'

// 角色初始基礎資料介面
interface PlayerBasicInfo {
  name: string
  class: string
  hp: number
  mp: number
  status: string
  skill: { id: number; name: string; cost: number; damage: number }[]
}
// 角色資料介面
interface Player extends PlayerBasicInfo {
  refDom?: Element | ComponentPublicInstance | null
  isAnimating?: Ref<boolean | null> | (boolean | null)
  oringInfo?: PlayerBasicInfo
}

interface MobsBasicInfo {
  name: string
  class: string
  hp: number
  mp: number
  status: string
  skill: { name: string; cost: number; damage: number }[]
}
interface Mobs extends MobsBasicInfo {
  oringInfo?: MobsBasicInfo
}

export type { Player, Mobs }

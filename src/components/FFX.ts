export class Ffx {
  // 角色資訊
 players = [
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

// 怪物資訊
const mobs = [
  {
    name: '巴哈姆特',
    class: 'BOSS',
    hp: 10000,
    mp: 20000,
    status: '不爽',
    skill: [{ name: 'メガフレア（超巨爆）', cost: 0, damage: 3000 }]
  }
]
  constructor() {

  }

}
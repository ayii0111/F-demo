

// 是否 GameOver
// 應在每次角色或怪物攻擊後檢查
function isGameOver() {
  if (playersRef.value.every((item) => item.hp == 0)) {
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

// 等待玩家選取技能
async function waitPlayerAction(player: Player) {
  return new Promise((resolve, reject) => {
    // 監聽該區塊元素下，哪一個按鈕被點擊
    ; (player.refDom!.value as Element).addEventListener('click', (event) => {
      const target = event.target as Element
      let skill
      player.skill.forEach((_skill) => {
        _skill.name === target.textContent ? skill = _skill : null
      })
      if (player.mp > skill!.cost) {
        player.mp -= skill!.cost
        resolve(skill)
      } else {
        actionDesc.value = '魔力不足'
      }
      // 若點擊的元素，並非相應技能的元素，則控制台顯示警告訊息，而不往下執行
      console.log('尚未選擇角色動作')
    })
  })
};

// 分別處理攻擊、補血的技能
function handleSkillType(skill: { id: number, name: string, cost: number, damage: number }, player: Player) {
  // 執行該技能效果，並顯示戰鬥描述
  // 判斷是否為補血技能
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
      actionDesc.value = `${player.name} 對 ${mobsRef.value[0].name} 使出 ${skill.name} 造成了 ${''} 傷害！`
  }
}

// 個別角色攻擊時的流程
async function playerAttack(player: Player) {
  console.log('我進入角色攻擊流程')
  // 當前角色沒有血量，就不執行攻擊流程
  if (player.hp === 0) return
  // 當前角色操作面板的啟用(即包含角色面板使用突出動畫，並解除按鈕禁用)
  player.isAnimating!.value = true;
  (player.refDom!.value as Element).querySelectorAll('[type="button"]').forEach((el) => {
    el.classList.remove('cursor-not-allowed')
    el.classList.add('hover:bg-gray-100')
    el.classList.add('cursor-pointer')
  });


  // 等待玩家正確選取技能後，將技能資料回傳
  const skill = await waitPlayerAction(player) as { id: number, name: string, cost: number, damage: number }
  handleSkillType(skill, player)
  isGameOver()
}

function getRandomPlayer<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
async function mobAttack() {
  const player = getRandomPlayer(playersRef.value)
  let mobSkill = mobsRef.value[0].skill[0]
  player.hp -= mobSkill.damage
  // 血量低於 0時，校正為 0
  if (player.hp < 0) {
    player.hp = 0
    player.status = '無法戰鬥'
  }
  actionDesc.value = `${mobsRef.value[0].name} 對 ${player.name} 使出 ${mobSkill.name} 造成了 ${''} 傷害！`
  isGameOver()
}

onMounted(async () => {



  // for (let player of playersRef.value) {
  //   await playerAttack(player)
  // }

  // while (true) {
  //   // 角色攻擊
  //   for (let player of playerRef.value) {
  //     if (player.hp > 0) await playerAttack(player)
  //   }
  //   // 怪物攻擊
  //   for (let player of mobsRef.value) {
  //     if (player.hp > 0) await mobAttack()
  //   }
  // }

})

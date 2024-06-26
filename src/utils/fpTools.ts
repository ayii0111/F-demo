// 可將多個執行步驟的 CallBack函式作為參數帶入
// 這些函式可以接收一個 isBreak參數，當要跳出迴圈時，回傳 true 或 !isBreak 即可，若回傳為空值，則繼續執行
const whileLoop = async (...fns: any) => {
  let isBreak = false
  const breakWrap =
    (fn: any) =>
    async (isBreak: boolean): Promise<boolean> => {
      if (isBreak) return isBreak
      return (await fn(isBreak)) ?? isBreak
    }

  const loop = async (): Promise<any> => {
    // await 異步函式...

    await [...fns].reduce(async (promise, fn) => {
      isBreak = await promise
      isBreak = await breakWrap(fn)(isBreak)
      return isBreak
    }, Promise.resolve(isBreak))
    if (!!isBreak) return '終止迴圈'
    return loop()
  }
  return loop()
}

export { whileLoop }

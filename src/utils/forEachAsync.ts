export {} // 宣告為模組，否則 daclare global 會報錯

// 布林值後面聯合的 undefined型別，是因為參數isBreak 輸入時有 ? 的關係，若是輸出有 isBreak，則也要添加上 undefined
interface ForEachAsyncCB<T, D> {
  (
    elem: T,
    isBreak?: boolean,
    data?: D,
    isContinue?: boolean | void
  ): Promise<[boolean | undefined, D | undefined] | [boolean | undefined] | void>
}

interface ForEachAsync<T, D> {
  (callback: ForEachAsyncCB<T, D>, data?: D): D | void
}

// 宣告為全域型別
declare global {
  interface Array<T> {
    forEachAsync: ForEachAsync<T, unknown>
  }
}

// 可跌異步迭代陣列的原型方法的定義
Array.prototype.forEachAsync = async function (callbackFn, data) {
  let _isBreak: boolean | undefined
  let _data: any
  let isContinue: boolean
  await this.reduce(async (promise, elem) => {
    // 此處作為每次迭代的異步堵塞
    // 在「...reduce 與 ...await promise」之間的代碼，都是同步代碼，會直接執行，故上面不要寫任何代碼
    _data = await promise
    isContinue = false
    _isBreak = _isBreak ?? false
    if (_isBreak) return _data
    // 傳遞給 CallBackFn 時將 isBreak 顛倒邏輯，改為預設 true
    _isBreak = !_isBreak
    ;[_isBreak, _data] = (await callbackFn(elem, _isBreak, _data, isContinue)) ?? [!_isBreak, _data]
    // 若 CallBackFn 回傳為空值，則默認給他，不會中斷的值，也就是還要再邏輯顛倒一次
    return _data
  }, Promise.resolve(data))
  return _data
}

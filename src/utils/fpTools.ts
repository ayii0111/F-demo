interface CallBackFn<T> {
  (
    isBreak: boolean,
    data?: T,
    isContinue?: boolean | void
  ): Promise<[boolean, T | undefined] | [boolean] | void>
}
// 下面兩者的差異說明
// Promise<[boolean, T | undefined]|[boolean]>
// Promise<[boolean, T | undefined]> | Promise<[boolean]>
// 前者可以同時接收 if...return [!isBreak]     else... return [isBreak, data]
// 後者則不行 (GPT 的說明是，後者代表兩種不同的 Promise 實例，因此反而返回同一種實例，會報錯)

interface Loop<T> {
  (isBreak: boolean | undefined, data: T): Promise<T | void>
}

interface WhileLoop<T> {
  (callBackFn: CallBackFn<T>, data?: T): Promise<T | void>
}

const whileLoop: WhileLoop<any> = async (callBackFn, data) => {
  let _isBreak: boolean
  let _data: any
  let __data: any
  let isContinue: boolean

  const loop: Loop<any> = async (isBreak, data) => {
    _isBreak = true
    isContinue = false
    // 此處上下 isBreak 邏輯是顛倒的
    // 上面讓默認的 _isBreak 為 true 給下面 callBack 使用，callBack 若不想中斷就會回傳[!_isBreak]
    // 而 callBack 回傳的默認處理是讓 _isBreak 為 false，這樣後續也會比較服合變數字面意義
    ;[_isBreak, __data] = (await callBackFn(_isBreak, data, isContinue)) ?? [false, data]
    _data = __data ?? _data
    if (_isBreak) return _data
    return loop(_isBreak, _data)
  }
  return loop(undefined, data)
}

export { whileLoop }

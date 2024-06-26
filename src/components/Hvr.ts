import type { Ref } from 'vue'
// useHvr() 可使用參數
// useHvr(refElement, 樣式名稱)
// useHvr(reactivElementsArr, key, 樣式名稱)

// 詳細說明
// 使用函式多載
// 第一種是僅輸入一個 refElement 元素物件的響應變數與樣式名稱
// 第二種是輸入一個 reactiveElementsDom元素陣列的響應變數與索引值，以及樣式名稱
// 第三個則是參數與型別的整合（即需將上述參數與型別整合起來）
export function useHvr(refElement: Ref<HTMLDivElement | null>, animate: string): Ref<boolean | null>
export function useHvr(
  reactivElementsArr: Ref<HTMLDivElement[] | HTMLDivElement | null>,
  key: number,
  animate: string
): Ref<boolean | null>

export function useHvr(
  element: Ref<HTMLDivElement[] | HTMLDivElement | null>,
  keyOrAnimate: number | string,
  animate?: string
) {
  // 將第二第三個參數，解析出 _animate 或 _key與_animate
  let _key: number
  let _animate: string
  if (typeof keyOrAnimate == 'number') {
    _key = keyOrAnimate
    _animate = animate!
  } else {
    _animate = keyOrAnimate
  }

  let clsInit = `hvr-${_animate}-init`
  let clsAnim = `hvr-${_animate}-anim`
  let el: HTMLDivElement | null
  onMounted(() => {
    // 將 Dom元素物件解析為 el變數，再來操作
    Array.isArray(element.value) ? (el = element.value[_key]) : (el = element.value)
    el!.classList.add(clsInit)
  })
  const isAnimating = ref<boolean | null>(null)
  watch(isAnimating, () => {
    isAnimating.value ? el!.classList.add(clsAnim) : el!.classList.remove(clsAnim)
  })

  // 當只有回傳單一物件時，不可以使用花括號
  return isAnimating
}

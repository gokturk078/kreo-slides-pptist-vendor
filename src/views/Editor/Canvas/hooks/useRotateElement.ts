import type { Ref, ShallowRef } from 'vue'
import { useSlidesStore } from '@/store'
import type { PPTElement, PPTLineElement, PPTVideoElement, PPTAudioElement, PPTChartElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

/**

 * @param x Point x
 * @param y Point y
 */
const getAngleFromCoordinate = (x: number, y: number) => {
  const radian = Math.atan2(x, y)
  const angle = 180 / Math.PI * radian
  return angle
}

export default (
  elementList: Ref<PPTElement[]>,
  viewportRef: ShallowRef<HTMLElement | null>,
  canvasScale: Ref<number>,
) => {
  const slidesStore = useSlidesStore()

  const { addHistorySnapshot } = useHistorySnapshot()

  const rotateElement = (e: MouseEvent | TouchEvent, element: Exclude<PPTElement, PPTChartElement | PPTLineElement | PPTVideoElement | PPTAudioElement>) => {
    const isTouchEvent = !(e instanceof MouseEvent)
    if (isTouchEvent && (!e.changedTouches || !e.changedTouches[0])) return
  
    let isMouseDown = true
    let angle = 0
    const elOriginRotate = element.rotate || 0

    const elLeft = element.left
    const elTop = element.top
    const elWidth = element.width
    const elHeight = element.height

    const centerX = elLeft + elWidth / 2
    const centerY = elTop + elHeight / 2

    if (!viewportRef.value) return
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const handleMousemove = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown) return

      const currentPageX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX
      const currentPageY = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY
      

      const mouseX = (currentPageX - viewportRect.left) / canvasScale.value
      const mouseY = (currentPageY - viewportRect.top) / canvasScale.value
      const x = mouseX - centerX
      const y = centerY - mouseY

      angle = getAngleFromCoordinate(x, y)

      const sorptionRange = 5
      if ( Math.abs(angle) <= sorptionRange ) angle = 0
      else if ( angle > 0 && Math.abs(angle - 45) <= sorptionRange ) angle -= (angle - 45)
      else if ( angle < 0 && Math.abs(angle + 45) <= sorptionRange ) angle -= (angle + 45)
      else if ( angle > 0 && Math.abs(angle - 90) <= sorptionRange ) angle -= (angle - 90)
      else if ( angle < 0 && Math.abs(angle + 90) <= sorptionRange ) angle -= (angle + 90)
      else if ( angle > 0 && Math.abs(angle - 135) <= sorptionRange ) angle -= (angle - 135)
      else if ( angle < 0 && Math.abs(angle + 135) <= sorptionRange ) angle -= (angle + 135)
      else if ( angle > 0 && Math.abs(angle - 180) <= sorptionRange ) angle -= (angle - 180)
      else if ( angle < 0 && Math.abs(angle + 180) <= sorptionRange ) angle -= (angle + 180)

      elementList.value = elementList.value.map(el => element.id === el.id ? { ...el, rotate: angle } : el)
    }

    const handleMouseup = () => {
      isMouseDown = false
      document.onmousemove = null
      document.onmouseup = null

      if (elOriginRotate === angle) return

      slidesStore.updateSlide({ elements: elementList.value })
      addHistorySnapshot()
    }

    if (isTouchEvent) {
      document.ontouchmove = handleMousemove
      document.ontouchend = handleMouseup
    }
    else {
      document.onmousemove = handleMousemove
      document.onmouseup = handleMouseup
    }
  }

  return {
    rotateElement,
  }
}
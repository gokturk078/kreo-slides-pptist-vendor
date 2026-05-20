import { useScreenStore, useSlidesStore } from '@/store'

type KreoPresentStart = 'current' | 'beginning'

const dispatchKreoPresent = (startFrom: KreoPresentStart) => {
  window.dispatchEvent(new CustomEvent('kreo:slides:present', {
    detail: { startFrom, fullscreen: true },
  }))
}

export default () => {
  const screenStore = useScreenStore()
  const slidesStore = useSlidesStore()

  const enterScreening = () => {
    dispatchKreoPresent('current')
  }

  const enterScreeningFromStart = () => {
    slidesStore.updateSlideIndex(0)
    dispatchKreoPresent('beginning')
  }

  const exitScreening = () => {
    screenStore.setScreening(false)
  }

  return {
    enterScreening,
    enterScreeningFromStart,
    exitScreening,
  }
}

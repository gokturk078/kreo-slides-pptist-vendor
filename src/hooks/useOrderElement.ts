import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { ElementOrderCommands } from '@/types/edit'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const slidesStore = useSlidesStore()
  const { currentSlide } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  /**

   */
  const getCombineElementLevelRange = (elementList: PPTElement[], combineElementList: PPTElement[]) => {
    return {
      minLevel: elementList.findIndex(_element => _element.id === combineElementList[0].id),
      maxLevel: elementList.findIndex(_element => _element.id === combineElementList[combineElementList.length - 1].id),
    }
  }

  /**

   */
  const moveUpElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {

      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel, maxLevel } = getCombineElementLevelRange(elementList, combineElementList)

      if (maxLevel === elementList.length - 1) return

      const nextElement = copyOfElementList[maxLevel + 1]
      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)

      if (nextElement.groupId) {
        const nextCombineElementList = copyOfElementList.filter(_element => _element.groupId === nextElement.groupId)
        copyOfElementList.splice(minLevel + nextCombineElementList.length, 0, ...movedElementList)
      }
      else copyOfElementList.splice(minLevel + 1, 0, ...movedElementList)
    }

    else {

      const level = elementList.findIndex(item => item.id === element.id)

      if (level === elementList.length - 1) return

      const nextElement = copyOfElementList[level + 1]
      const movedElement = copyOfElementList.splice(level, 1)[0]

      if (nextElement.groupId) {
        const combineElementList = copyOfElementList.filter(_element => _element.groupId === nextElement.groupId)
        copyOfElementList.splice(level + combineElementList.length, 0, movedElement)
      }
      else copyOfElementList.splice(level + 1, 0, movedElement)
    }

    return copyOfElementList
  }

  /**

   */
  const moveDownElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (minLevel === 0) return

      const prevElement = copyOfElementList[minLevel - 1]
      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)

      if (prevElement.groupId) {
        const prevCombineElementList = copyOfElementList.filter(_element => _element.groupId === prevElement.groupId)
        copyOfElementList.splice(minLevel - prevCombineElementList.length, 0, ...movedElementList)
      }
      else copyOfElementList.splice(minLevel - 1, 0, ...movedElementList)
    }

    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === 0) return

      const prevElement = copyOfElementList[level - 1]
      const movedElement = copyOfElementList.splice(level, 1)[0]

      if (prevElement.groupId) {
        const combineElementList = copyOfElementList.filter(_element => _element.groupId === prevElement.groupId)
        copyOfElementList.splice(level - combineElementList.length, 0, movedElement)
      }
      else copyOfElementList.splice(level - 1, 0, movedElement)
    }

    return copyOfElementList
  }

  /**

   */
  const moveTopElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {

      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel, maxLevel } = getCombineElementLevelRange(elementList, combineElementList)

      if (maxLevel === elementList.length - 1) return null

      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)
      copyOfElementList.push(...movedElementList)
    }

    else {

      const level = elementList.findIndex(item => item.id === element.id)

      if (level === elementList.length - 1) return null

      copyOfElementList.splice(level, 1)
      copyOfElementList.push(element)
    }

    return copyOfElementList
  }

  /**

   */
  const moveBottomElement = (elementList: PPTElement[], element: PPTElement) => {
    const copyOfElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    if (element.groupId) {
      const combineElementList = copyOfElementList.filter(_element => _element.groupId === element.groupId)
      const { minLevel } = getCombineElementLevelRange(elementList, combineElementList)
      if (minLevel === 0) return

      const movedElementList = copyOfElementList.splice(minLevel, combineElementList.length)
      copyOfElementList.unshift(...movedElementList)
    }

    else {
      const level = elementList.findIndex(item => item.id === element.id)
      if (level === 0) return

      copyOfElementList.splice(level, 1)
      copyOfElementList.unshift(element)
    }

    return copyOfElementList
  }

  /**

   */
  const orderElement = (element: PPTElement, command: ElementOrderCommands) => {
    let newElementList
    
    if (command === ElementOrderCommands.UP) newElementList = moveUpElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.DOWN) newElementList = moveDownElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.TOP) newElementList = moveTopElement(currentSlide.value.elements, element)
    else if (command === ElementOrderCommands.BOTTOM) newElementList = moveBottomElement(currentSlide.value.elements, element)

    if (!newElementList) return

    slidesStore.updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    orderElement,
  }
}
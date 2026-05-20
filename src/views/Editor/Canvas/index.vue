<template>
  <div 
    class="canvas" 
    ref="canvasRef"
    @wheel="$event => handleMousewheelCanvas($event)"
    @mousedown="$event => handleClickBlankArea($event)"
    @dblclick="$event => handleDblClick($event)"
    v-contextmenu="contextmenus"
    v-click-outside="removeEditorAreaFocus"
  >
    <ElementCreateSelection
      v-if="creatingElement"
      @created="data => insertElementFromCreateSelection(data)"
    />
    <ShapeCreateCanvas
      v-if="creatingCustomShape"
      @created="data => insertCustomShape(data)"
    />
    <div 
      class="viewport-wrapper"
      :style="{
        width: viewportStyles.width * canvasScale + 'px',
        height: viewportStyles.height * canvasScale + 'px',
        left: viewportStyles.left + 'px',
        top: viewportStyles.top + 'px',
      }"
    >
      <div class="operates">
        <AlignmentLine 
          v-for="(line, index) in alignmentLines" 
          :key="index" 
          :type="line.type" 
          :axis="line.axis" 
          :length="line.length"
          :canvasScale="canvasScale"
        />
        <MultiSelectOperate 
          v-if="activeElementIdList.length > 1"
          :elementList="elementList"
          :scaleMultiElement="scaleMultiElement"
          :rotateGroupElement="rotateGroupElement"
        />
        <Operate
          v-for="element in elementList" 
          :key="element.id"
          :elementInfo="element"
          :isSelected="activeElementIdList.includes(element.id)"
          :isActive="handleElementId === element.id"
          :isActiveGroupElement="activeGroupElementId === element.id"
          :isMultiSelect="activeElementIdList.length > 1"
          :rotateElement="rotateElement"
          :scaleElement="scaleElement"
          :dragLineElement="dragLineElement"
          :moveShapeKeypoint="moveShapeKeypoint"
          v-show="!hiddenElementIdList.includes(element.id)"
        />
        <ElementFloatLayer
          :elementList="elementList"
          :canvasRef="canvasRef"
          :viewportStyles="viewportStyles"
          :openLinkDialog="openLinkDialog"
        />
        <ViewportBackground />
      </div>

      <div 
        class="viewport" 
        ref="viewportRef"
        :style="{ transform: `scale(${canvasScale})` }"
      >
        <MouseSelection 
          v-if="mouseSelectionVisible"
          :top="mouseSelection.top" 
          :left="mouseSelection.left" 
          :width="mouseSelection.width" 
          :height="mouseSelection.height" 
          :quadrant="mouseSelectionQuadrant"
        />      
        <EditableElement 
          v-for="(element, index) in elementList" 
          :key="element.id"
          :elementInfo="element"
          :elementIndex="index + 1"
          :isMultiSelect="activeElementIdList.length > 1"
          :selectElement="selectElement"
          :openLinkDialog="openLinkDialog"
          v-show="!hiddenElementIdList.includes(element.id)"
        />
      </div>
    </div>

    <div class="drag-mask" v-if="spaceKeyState"></div>

    <Ruler :viewportStyles="viewportStyles" :elementList="elementList" v-if="showRuler" />

    <Modal
      v-model:visible="linkDialogVisible" 
      :width="540"
    >
      <LinkDialog @close="linkDialogVisible = false" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, provide, ref, watch, watchEffect, useTemplateRef } from 'vue'
import { throttle } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import type { PPTElement, PPTShapeElement } from '@/types/slides'
import type { AlignmentLineProps, CreateCustomShapeData } from '@/types/edit'
import { injectKeySlideScale } from '@/types/injectKey'
import { removeAllRanges } from '@/utils/selection'
import { KEYS } from '@/configs/hotkey'

import useViewportSize from './hooks/useViewportSize'
import useMouseSelection from './hooks/useMouseSelection'
import useDrop from './hooks/useDrop'
import useRotateElement from './hooks/useRotateElement'
import useRotateGroupElement from './hooks/useRotateGroupElement'
import useScaleElement from './hooks/useScaleElement'
import useSelectAndMoveElement from './hooks/useSelectElement'
import useDragElement from './hooks/useDragElement'
import useDragLineElement from './hooks/useDragLineElement'
import useMoveShapeKeypoint from './hooks/useMoveShapeKeypoint'
import useInsertFromCreateSelection from './hooks/useInsertFromCreateSelection'

import useDeleteElement from '@/hooks/useDeleteElement'
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement'
import useSelectElement from '@/hooks/useSelectElement'
import useScaleCanvas from '@/hooks/useScaleCanvas'
import useScreening from '@/hooks/useScreening'
import useSlideHandler from '@/hooks/useSlideHandler'
import useCreateElement from '@/hooks/useCreateElement'

import EditableElement from './EditableElement.vue'
import MouseSelection from './MouseSelection.vue'
import ViewportBackground from './ViewportBackground.vue'
import ElementFloatLayer from './ElementFloatLayer/index.vue'
import AlignmentLine from './AlignmentLine.vue'
import Ruler from './Ruler.vue'
import ElementCreateSelection from './ElementCreateSelection.vue'
import ShapeCreateCanvas from './ShapeCreateCanvas.vue'
import MultiSelectOperate from './Operate/MultiSelectOperate.vue'
import Operate from './Operate/index.vue'
import LinkDialog from './LinkDialog.vue'
import Modal from '@/components/Modal.vue'
import message from '@/utils/message'

const mainStore = useMainStore()
const {
  activeElementIdList,
  activeGroupElementId,
  handleElementId,
  hiddenElementIdList,
  editorAreaFocus,
  gridLineSize,
  showRuler,
  showBubbleMenu,
  creatingElement,
  creatingCustomShape,
  canvasScale,
  textFormatPainter,
} = storeToRefs(mainStore)
const { currentSlide } = storeToRefs(useSlidesStore())
const { ctrlKeyState, spaceKeyState } = storeToRefs(useKeyboardStore())

const viewportRef = useTemplateRef<HTMLElement>('viewportRef')
const alignmentLines = ref<AlignmentLineProps[]>([])

const linkDialogVisible = ref(false)
const openLinkDialog = () => linkDialogVisible.value = true

watch(handleElementId, () => {
  mainStore.setActiveGroupElementId('')
})

const elementList = ref<PPTElement[]>([])
const setLocalElementList = () => {
  elementList.value = currentSlide.value ? JSON.parse(JSON.stringify(currentSlide.value.elements)) : []
}
watchEffect(setLocalElementList)

const canvasRef = useTemplateRef<HTMLElement>('canvasRef')
const { dragViewport, viewportStyles } = useViewportSize(canvasRef)

useDrop(canvasRef)

const { mouseSelection, mouseSelectionVisible, mouseSelectionQuadrant, updateMouseSelection } = useMouseSelection(elementList, viewportRef)

const { dragElement } = useDragElement(elementList, alignmentLines, canvasScale)
const { dragLineElement } = useDragLineElement(elementList)
const { selectElement } = useSelectAndMoveElement(elementList, dragElement)
const { scaleElement, scaleMultiElement } = useScaleElement(elementList, alignmentLines, canvasScale)
const { rotateElement } = useRotateElement(elementList, viewportRef, canvasScale)
const { rotateGroupElement } = useRotateGroupElement(elementList, viewportRef, canvasScale)
const { moveShapeKeypoint } = useMoveShapeKeypoint(elementList, canvasScale)

const { selectAllElements } = useSelectElement()
const { deleteAllElements } = useDeleteElement()
const { pasteElement } = useCopyAndPasteElement()
const { enterScreeningFromStart } = useScreening()
const { updateSlideIndex } = useSlideHandler()
const { createTextElement, createShapeElement } = useCreateElement()

onMounted(() => {
  if (activeElementIdList.value.length) {
    nextTick(() => mainStore.setActiveElementIdList([]))
  }
})

const handleClickBlankArea = (e: MouseEvent) => {
  if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])

  if (!spaceKeyState.value) updateMouseSelection(e)
  else dragViewport(e)

  if (!editorAreaFocus.value) mainStore.setEditorareaFocus(true)
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
  removeAllRanges()
}

const handleDblClick = (e: MouseEvent) => {
  if (activeElementIdList.value.length || creatingElement.value || creatingCustomShape.value) return
  if (!viewportRef.value) return

  const viewportRect = viewportRef.value.getBoundingClientRect()
  const left = (e.pageX - viewportRect.x) / canvasScale.value
  const top = (e.pageY - viewportRect.y) / canvasScale.value

  createTextElement({
    left,
    top,
    width: 200 / canvasScale.value,
    height: 0,
  })
}

onUnmounted(() => {
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
})

const removeEditorAreaFocus = () => {
  if (editorAreaFocus.value) mainStore.setEditorareaFocus(false)
}

const { scaleCanvas } = useScaleCanvas()
const throttleScaleCanvas = throttle(scaleCanvas, 100, { leading: true, trailing: false })
const throttleUpdateSlideIndex = throttle(updateSlideIndex, 300, { leading: true, trailing: false })

const handleMousewheelCanvas = (e: WheelEvent) => {
  e.preventDefault()

  if (ctrlKeyState.value) {
    if (e.deltaY > 0) throttleScaleCanvas('-')
    else if (e.deltaY < 0) throttleScaleCanvas('+')
  }

  else {
    if (e.deltaY > 0) throttleUpdateSlideIndex(KEYS.DOWN)
    else if (e.deltaY < 0) throttleUpdateSlideIndex(KEYS.UP)
  }
}

const toggleRuler = () => {
  mainStore.setRulerState(!showRuler.value)
}

const toggleBubbleMenu = () => {
  mainStore.setBubbleMenuState(!showBubbleMenu.value)
  message.success(`${showBubbleMenu.value ? '' : ''}`)
}

const { insertElementFromCreateSelection, formatCreateSelection } = useInsertFromCreateSelection(viewportRef)

const insertCustomShape = (data: CreateCustomShapeData) => {
  const {
    start,
    end,
    path,
    viewBox,
  } = data
  const position = formatCreateSelection({ start, end })
  if (position) {
    const supplement: Partial<PPTShapeElement> = {}
    if (data.fill) supplement.fill = data.fill
    if (data.outline) supplement.outline = data.outline
    createShapeElement(position, { path, viewBox }, supplement)
  }

  mainStore.setCreatingCustomShapeState(false)
}

const contextmenus = (): ContextmenuItem[] => {
  return [
    {
      text: 'Paste',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    {
      text: 'Select all',
      subText: 'Ctrl + A',
      handler: selectAllElements,
    },
    {
      text: 'Ruler',
      subText: showRuler.value ? '√' : '',
      handler: toggleRuler,
    },
    {
      text: 'Grid',
      handler: () => mainStore.setGridLineSize(gridLineSize.value ? 0 : 50),
      children: [
        {
          text: 'None',
          subText: gridLineSize.value === 0 ? '√' : '',
          handler: () => mainStore.setGridLineSize(0),
        },
        {
          text: 'Small',
          subText: gridLineSize.value === 25 ? '√' : '',
          handler: () => mainStore.setGridLineSize(25),
        },
        {
          text: 'Medium',
          subText: gridLineSize.value === 50 ? '√' : '',
          handler: () => mainStore.setGridLineSize(50),
        },
        {
          text: 'Large',
          subText: gridLineSize.value === 100 ? '√' : '',
          handler: () => mainStore.setGridLineSize(100),
        },
      ],
    },
    {
      text: 'Reset current slide',
      handler: deleteAllElements,
    },
    {
      text: '',
      subText: showBubbleMenu.value ? '√' : '',
      handler: toggleBubbleMenu,
    },
    { divider: true },
    {
      text: 'Slide',
      subText: 'F5',
      handler: enterScreeningFromStart,
    },
  ]
}

provide(injectKeySlideScale, canvasScale)
</script>

<style lang="scss" scoped>
.canvas {
  height: 100%;
  user-select: none;
  overflow: hidden;
  background-color: $lightGray;
  position: relative;
}
.drag-mask {
  cursor: grab;
  @include absolute-0();
}
.viewport-wrapper {
  position: absolute;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.01), 0 0 12px 0 rgba(0, 0, 0, 0.1);
}
.viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
</style>

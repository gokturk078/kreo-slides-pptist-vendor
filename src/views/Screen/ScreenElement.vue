<template>
  <div 
    class="screen-element"
    :class="{ 'link': elementInfo.link }"
    :id="`screen-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
      color: theme.fontColor,
      fontFamily: theme.fontName,
      visibility: needWaitAnimation ? 'hidden' : 'visible',
    }"
    :title="elementInfo.link?.target || ''"
    @click="$event => openLink($event)"
  >
    <component
      :is="currentElementComponent"
      :elementInfo="elementInfo"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import { ElementTypes, type PPTElement } from '@/types/slides'

import BaseImageElement from '@/views/components/element/ImageElement/BaseImageElement.vue'
import BaseTextElement from '@/views/components/element/TextElement/BaseTextElement.vue'
import BaseShapeElement from '@/views/components/element/ShapeElement/BaseShapeElement.vue'
import BaseLineElement from '@/views/components/element/LineElement/BaseLineElement.vue'
import BaseChartElement from '@/views/components/element/ChartElement/BaseChartElement.vue'
import BaseTableElement from '@/views/components/element/TableElement/BaseTableElement.vue'
import BaseLatexElement from '@/views/components/element/LatexElement/BaseLatexElement.vue'
import ScreenVideoElement from '@/views/components/element/VideoElement/ScreenVideoElement.vue'
import ScreenAudioElement from '@/views/components/element/AudioElement/ScreenAudioElement.vue'

const props = defineProps<{
  elementInfo: PPTElement
  elementIndex: number
  animationIndex: number
  turnSlideToId: (id: string) => void
  manualExitFullscreen: () => void
}>()

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ElementTypes.IMAGE]: BaseImageElement,
    [ElementTypes.TEXT]: BaseTextElement,
    [ElementTypes.SHAPE]: BaseShapeElement,
    [ElementTypes.LINE]: BaseLineElement,
    [ElementTypes.CHART]: BaseChartElement,
    [ElementTypes.TABLE]: BaseTableElement,
    [ElementTypes.LATEX]: BaseLatexElement,
    [ElementTypes.VIDEO]: ScreenVideoElement,
    [ElementTypes.AUDIO]: ScreenAudioElement,
  }
  return elementTypeMap[props.elementInfo.type] || null
})

const { formatedAnimations, theme } = storeToRefs(useSlidesStore())

const needWaitAnimation = computed(() => {

  const elementIndexInAnimation = formatedAnimations.value.findIndex(item => {
    const elIds = item.animations.map(item => item.elId)
    return elIds.includes(props.elementInfo.id)
  })

  if (elementIndexInAnimation === -1) return false

  if (elementIndexInAnimation < props.animationIndex) return false

  const firstAnimation = formatedAnimations.value[elementIndexInAnimation].animations.find(item => item.elId === props.elementInfo.id)
  if (firstAnimation?.type === 'in') return true
  return false
})

const openLink = (e: MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'A') {
    props.manualExitFullscreen()
    return
  }

  const link = props.elementInfo.link
  if (!link) return

  if (link.type === 'web') {
    props.manualExitFullscreen()
    window.open(link.target)
  }
  else if (link.type === 'slide') {
    props.turnSlideToId(link.target)
  }
}
</script>

<style lang="scss" scoped>
.link {
  cursor: pointer;
}
</style>
<template>
  <div class="multi-position-panel">
    <ButtonGroup class="row">
      <Button style="flex: 1;" v-tooltip="'Align'" @click="alignElement(ElementAlignCommands.LEFT)"><i-icon-park-outline:align-left /></Button>
      <Button style="flex: 1;" v-tooltip="'Align center'" @click="alignElement(ElementAlignCommands.HORIZONTAL)"><i-icon-park-outline:align-horizontally /></Button>
      <Button style="flex: 1;" v-tooltip="'Align'" @click="alignElement(ElementAlignCommands.RIGHT)"><i-icon-park-outline:align-right /></Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button style="flex: 1;" v-tooltip="'Align'" @click="alignElement(ElementAlignCommands.TOP)"><i-icon-park-outline:align-top /></Button>
      <Button style="flex: 1;" v-tooltip="'Align center'" @click="alignElement(ElementAlignCommands.VERTICAL)"><i-icon-park-outline:align-vertically /></Button>
      <Button style="flex: 1;" v-tooltip="'Align'" @click="alignElement(ElementAlignCommands.BOTTOM)"><i-icon-park-outline:align-bottom /></Button>
    </ButtonGroup>
    <ButtonGroup class="row" v-if="displayItemCount > 2">
      <Button style="flex: 1;" @click="uniformHorizontalDisplay()">Distribute horizontally</Button>
      <Button style="flex: 1;" @click="uniformVerticalDisplay()">Distribute vertically</Button>
    </ButtonGroup>

    <Divider />

    <ButtonGroup class="row">
      <Button :disabled="!canCombine" @click="combineElements()" style="flex: 1;"><i-icon-park-outline:group style="margin-right: 3px;" />Group</Button>
      <Button :disabled="canCombine" @click="uncombineElements()" style="flex: 1;"><i-icon-park-outline:ungroup style="margin-right: 3px;" />CancelGroup</Button>
    </ButtonGroup>
  </div>
</template>

<script lang="ts" setup>
import { ElementAlignCommands } from '@/types/edit'
import useCombineElement from '@/hooks/useCombineElement'
import useAlignActiveElement from '@/hooks/useAlignActiveElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useUniformDisplayElement from '@/hooks/useUniformDisplayElement'
import Divider from '@/components/Divider.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'

const { canCombine, combineElements, uncombineElements } = useCombineElement()
const { alignActiveElement } = useAlignActiveElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { displayItemCount, uniformHorizontalDisplay, uniformVerticalDisplay } = useUniformDisplayElement()

const alignElement = (command: ElementAlignCommands) => {
  if (canCombine.value) alignActiveElement(command)
  else alignElementToCanvas(command)
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
<template>
  <div class="editor-header">
    <div class="left">
      <Popover trigger="click" placement="bottom-start" v-model:value="mainMenuVisible">
        <template #content>
          <PopoverMenuItem class="popover-menu-item" @click="mainMenuVisible = false; hotkeyDrawerVisible = true"><i-icon-park-outline:command class="icon" /> Keyboard shortcuts</PopoverMenuItem>
        </template>
        <div class="menu-item"><i-icon-park-outline:hamburger-button class="icon" /></div>
      </Popover>

      <div class="title">
        <Input 
          class="title-input" 
          ref="titleInputRef"
          v-model:value="titleValue" 
          @blur="handleUpdateTitle()" 
          v-if="editingTitle" 
        ></Input>
        <div 
          class="title-text"
          @click="startEditTitle()"
          :title="title"
          v-else
        >{{ title }}</div>
      </div>
    </div>

    <div class="right">
      <button class="kreo-present-button" type="button" v-tooltip="'Present'" @click="enterScreening()">
        <i-icon-park-outline:ppt class="icon" />
        <span>Present</span>
      </button>
    </div>

    <Drawer
      :width="320"
      v-model:visible="hotkeyDrawerVisible"
      placement="right"
    >
      <HotkeyDoc />
      <template v-slot:title>Keyboard shortcuts</template>
    </Drawer>

  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useScreening from '@/hooks/useScreening'

import HotkeyDoc from './HotkeyDoc.vue'
import Drawer from '@/components/Drawer.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { title } = storeToRefs(slidesStore)
const { enterScreening } = useScreening()

const mainMenuVisible = ref(false)
const hotkeyDrawerVisible = ref(false)
const editingTitle = ref(false)
const titleValue = ref('')
const titleInputRef = useTemplateRef<InstanceType<typeof Input>>('titleInputRef')

const startEditTitle = () => {
  titleValue.value = title.value
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

const handleUpdateTitle = () => {
  slidesStore.setTitle(titleValue.value)
  editingTitle.value = false
}

</script>

<style lang="scss" scoped>
.editor-header {
  background-color: #fff;
  user-select: none;
  border-bottom: 1px solid $borderColor;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}
.left, .right {
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu-item {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 0 10px;
  border-radius: $borderRadius;
  cursor: pointer;

  .icon {
    font-size: 18px;
    color: #666;
  }
  .text {
    width: 18px;
    text-align: center;
    font-size: 17px;
  }
  .ai {
    background: linear-gradient(270deg, #d897fd, #33bcfc);
    background-clip: text;
    color: transparent;
    font-weight: 700;
  }

  &:hover {
    background-color: #f1f1f1;
  }
}
.popover-menu-item {
  display: flex;
  padding: 8px 10px;

  .icon {
    font-size: 18px;
    margin-right: 10px;
  }
}
.kreo-present-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 6px;
  background: #111827;
  color: #fff;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .2s, border-color .2s, transform .2s;

  .icon {
    font-size: 16px;
  }

  &:hover {
    background: #1f2937;
    border-color: rgba(31, 41, 55, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
}
.statement {
  font-size: 12px;
  color: #999;
  padding: 8px 10px;
  font-style: italic;
}
.main-menu {
  width: 300px;
}
.ai-menu {
  background: linear-gradient(270deg, #f8edff, #d4f1ff);
  color: $themeColor;
  border-radius: $borderRadius;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;

  .icon {
    font-size: 22px;
    margin-right: 16px;
  }
  .aippt-content {
    display: flex;
    flex-direction: column;
  }
  .aippt {
    font-weight: 700;
    font-size: 16px;

    span {
      background: linear-gradient(270deg, #d897fd, #33bcfc);
      background-clip: text;
      color: transparent;
    }
  }
  .aippt-subtitle {
    font-size: 12px;
    color: #777;
    margin-top: 5px;
  }
}

.import-section {
  padding: 5px 0;

  .import-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 6px;
  }
  .import-grid {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }
  .import-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border-radius: $borderRadius;
    border: 1px solid $borderColor;
    transition: background-color .2s;
    cursor: pointer;
  
    &:hover {
      background-color: #f1f1f1;
    }
    .icon {
      font-size: 24px;
      margin-bottom: 2px;
    }
    .label {
      font-size: 12px;
      text-align: center;
    }
    .sub-label {
      font-size: 10px;
      color: #999;
    }
  }
}

.group-menu-item {
  height: 30px;
  display: flex;
  margin: 0 8px;
  padding: 0 2px;
  border-radius: $borderRadius;

  &:hover {
    background-color: #f1f1f1;
  }

  .menu-item {
    padding: 0 3px;
  }
  .arrow-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
.title {
  height: 30px;
  margin-left: 2px;
  font-size: 13px;

  .title-input {
    width: 200px;
    height: 100%;
    padding-left: 0;
    padding-right: 0;

    ::v-deep(input) {
      height: 28px;
      line-height: 28px;
    }
  }
  .title-text {
    min-width: 20px;
    max-width: 400px;
    line-height: 30px;
    padding: 0 6px;
    border-radius: $borderRadius;
    cursor: pointer;

    @include ellipsis-oneline();

    &:hover {
      background-color: #f1f1f1;
    }
  }
}
.github-link {
  display: inline-block;
  height: 30px;
}
</style>

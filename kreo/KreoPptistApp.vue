<template>
  <div class="kreo-pptist-app">
    <Editor />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import Editor from '@/views/Editor/index.vue';
import { applyPptistDocumentToStores, initializePptistSnapshotStore } from './pptistStateBridge';

const props = defineProps<{
  initialDocument?: unknown;
  onMountedReady?: () => void;
}>();

applyPptistDocumentToStores(props.initialDocument);

onMounted(async () => {
  await initializePptistSnapshotStore();
  props.onMountedReady?.();
});
</script>

<style lang="scss" scoped>
.kreo-pptist-app {
  height: 100%;
  min-height: 0;
}
</style>

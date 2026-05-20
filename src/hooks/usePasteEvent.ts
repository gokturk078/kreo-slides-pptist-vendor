import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import usePasteTextClipboardData from './usePasteTextClipboardData'
import usePasteDataTransfer from './usePasteDataTransfer'

export default () => {
  const { editorAreaFocus, thumbnailsFocus, disableHotkeys } = storeToRefs(useMainStore())

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { pasteDataTransfer } = usePasteDataTransfer()

  /**

   * @param e ClipboardEvent
   */
  const pasteListener = (e: ClipboardEvent) => {
    if (!editorAreaFocus.value && !thumbnailsFocus.value) return
    if (disableHotkeys.value) return

    if (!e.clipboardData) return

    const { isFile, dataTransferFirstItem } = pasteDataTransfer(e.clipboardData)
    if (isFile) return
    

    if (dataTransferFirstItem && dataTransferFirstItem.kind === 'string' && dataTransferFirstItem.type === 'text/plain') {
      dataTransferFirstItem.getAsString(text => pasteTextClipboardData(text))
    }
  }

  onMounted(() => {
    document.addEventListener('paste', pasteListener)
  })
  onUnmounted(() => {
    document.removeEventListener('paste', pasteListener)
  })
}
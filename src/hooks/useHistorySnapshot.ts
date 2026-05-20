import { debounce, throttle} from 'lodash'
import { useSnapshotStore } from '@/store'

export default () => {
  const snapshotStore = useSnapshotStore()

  const addHistorySnapshot = debounce(function() {
    snapshotStore.addSnapshot()
  }, 300, { trailing: true })

  const redo = throttle(function() {
    snapshotStore.reDo()
  }, 100, { leading: true, trailing: false })

  const undo = throttle(function() {
    snapshotStore.unDo()
  }, 100, { leading: true, trailing: false })

  return {
    addHistorySnapshot,
    redo,
    undo,
  }
}
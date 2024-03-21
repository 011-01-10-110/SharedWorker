import sharedWorkerUrl from '../service/sharedWorker?url'
import { Events } from './WorkerEvents'

// worker实例
let sharedWorker = null
export default () => {
  if (sharedWorker) {
    return sharedWorker
  }
  sharedWorker = new SharedWorker(sharedWorkerUrl)
  sharedWorker.port.start()
  sharedWorker.port.onmessage = ({ data }) => {
    Events[data.method](sharedWorker.port, data.args)
  }
  return sharedWorker
}

import { EventBus } from '@/utils/EventBus'
// shardWorker的hash值可以用来发送close事件给worker，不发close也会有心跳检查
export let hash = null
// 全局单例属于shardWorker的发布订阅者
export const workerEventBus = new EventBus()
/**
 * web中的处理worker的事件
 */
export const Events = {
  heartbeat: (port, args) => {
    hash = args.hash
    port.postMessage({
      method: 'heartbeat',
      args
    })
  },
  refresh: (port, args) => {
    console.log('refresh', args);
    workerEventBus.publish('refresh', args)
  }
}


// 储存所有tab的port
const allPorts = new Map()
const heartbeatSet = new Set()

/**
 * 停止这个port
 * @param {*} hash
 */
const stopPort = (hash) => {
  const { port, timer } = allPorts.get(hash)
  allPorts.delete(hash)
  heartbeatSet.delete(hash)
  clearInterval(timer)
  port.close()
  console.log('close port:', hash);
}
/**
 * 初始化一个新的port
 * @param {*} port
 */
const initPort = (port) => {
  const hash = new Date().getTime() + Math.round(Math.random() * 1000)
  // 心跳2s发一次
  const timer = setInterval(() => {
    if (heartbeatSet.has(hash)) {
      stopPort(hash)
      return
    }
    heartbeatSet.add(hash)
    port.postMessage({
      method: 'heartbeat',
      args: {
        hash
      }
    })
  }, 2000)
  allPorts.set(hash, { port, timer })
  console.log('init port:', hash);
}

/**
 * 广播消息
 * @param {*} message
 */
function broadcast (message) {
  [...allPorts.entries()].forEach(([key, { port }]) => {
    // 给浏览器页签发消息
    port.postMessage(message)
  })
}
/**
 * 所有已定义的事件
 */
const events = {
  /**
   * 心跳由worker 发给 web，没有回应就说明tab被关了，2s内回应了就清掉上次的记录
   * @param {*} port
   * @param {*} args
   */
  heartbeat: (port, args) => {
    heartbeatSet.delete(args.hash)
  },
  /**
   * 通知刷新
   * @param {*} port
   * @param {*} args
   */
  refresh: (port, args) => {
    broadcast({
      method: 'refresh',
      args
    })
  },
  /**
   * 关闭这边记录的port
   * @param {*} port
   * @param {*} args
   */
  close: (port, args) => {
    stopPort(args.hash)
  }
}

self.onconnect = e => {
  const port = e.ports[0];

  initPort(port)

  // 监听浏览器页签发送的消息
  port.onmessage = (e) => {
    events[e.data.method](port, e.data.args)
  }
}

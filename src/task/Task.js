class Task {
  websocketServer

  constructor(websocketServer) {
    this.websocketServer = websocketServer
  }

  start() {

  }

  onClient() {

  }

  startTask(task, timeout = 20 * 1000) {
    let queue = []
    let isFirst = true

    queue.push([task, 0])
    setInterval(async () => {
      if (queue.length) {
        let currentTask = queue.shift()
        if (isFirst) {
          isFirst = false
          await currentTask[0]()
          queue.push([task, timeout])
        } else {
          setTimeout(async () => {
            await currentTask[0]()
            queue.push([task, timeout])
          }, currentTask[1])
        }
      }
    }, 200)
  }
}

module.exports = Task

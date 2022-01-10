const Task = require('./Task')

class ServerTimestampTask extends Task {
  type = 'serverTimestamp'

  constructor(websocketServer) {
    super(websocketServer)
  }

  start() {
    this.startTask(async () => {
      this.send(this.websocketServer.connInfoList)
    })
  }

  onClient(connInfo) {
    this.websocketServer.onClientMessage(connInfo, this.type, () => {
      this.send([connInfo])
    })
  }

  send(connList) {
    this.websocketServer.sendClient(connList, this.type, +new Date())
  }
}

module.exports = ServerTimestampTask

const Task = require('./Task')

class ServerTimestampTask extends Task {
  type = 'wsServerTimestamp'
  connList

  constructor(websocketServer, connList) {
    super(websocketServer)
    this.connList = connList
  }

  start() {
    this.startTask(async () => {
      this.send(this.connList)
    }, 60 * 1000)
  }

  onClient(connInfo) {
    this.websocketServer.onClientMessage(connInfo, this.type, () => {
      this.send([connInfo])
    })
  }

  send(connList) {
    this.websocketServer.sendClient(connList, this.type, Math.ceil(+new Date() / 1000))
  }
}

module.exports = ServerTimestampTask

let ws = require('nodejs-websocket')
let isEqual = require('lodash/isEqual')
const {middleware} = require('./middleware')

class JsonWebsocketServer {
  connInfoList = []
  port
  taskList = []
  middlewareList = []

  constructor(port) {
    this.port = port
  }

  use(middleware) {
    this.middlewareList.push(middleware)
  }

  addTask(task) {
    task.start()
    this.taskList.push(task)
  }

  start() {
    let server = ws.createServer((conn) => {
      conn.setMaxListeners(20)
      let currentConnInfo = {
        conn,
        timestamp: +new Date(),
        types: ['error'],
        prevData: {}
      }

      this.connInfoList.push(currentConnInfo)

      for (let task of this.taskList) {
        task.onClient(currentConnInfo)
      }

      this.onClientMessage(currentConnInfo, 'version', (data) => {
        currentConnInfo.version = data
      })

      this.onClientMessage(currentConnInfo, 'close', (closeType) => {
        let index = currentConnInfo.types.indexOf(closeType)
        if (index !== -1) {
          currentConnInfo.types.splice(index, 1)
        }
      })

      conn.on('close', () => {
        clear()
      })
      conn.on('error', () => {
        clear()
      })

      const clear = () => {
        let index = this.connInfoList.findIndex(item => item.conn === conn)
        if (index !== -1) {
          this.connInfoList.splice(index, 1)
        }
      }
    })
    server.listen(this.port)
  }

  onClientMessage(connInfo, type, handleMessage) {
    connInfo.conn.on('text', async (clientStr) => {
      let clientInfo
      try {
        clientInfo = JSON.parse(clientStr)
      } catch (e) {
        console.log('json parse error ', clientStr)
        return
      }

      if (clientInfo.type !== type) {
        return
      }
      if (!clientInfo.once) {
        connInfo.types.push(type)
      }
      let complete = async (_, __, next) => {
        if (handleMessage) {
          try {
            await handleMessage(clientInfo.data)
          } catch (e) {
            console.log(clientInfo.data)
            console.log(e)
          }
        }
        next()
      }
      try {
        await middleware([...this.middlewareList, complete], connInfo, clientInfo)
      } catch (e) {

      }
    })
  }

  sendClient(connInfoList, type, newData, isForce) {
    if (connInfoList.length === 0) {
      return
    }
    try {
      // logger.debug('sendClient start', JSON.stringify(newData).substr(0, 15))
    } catch (_) {
    }

    for (let i = 0; i < connInfoList.length; i++) {
      let connInfo = connInfoList[i]
      let isNeed = connInfo.types.find(item => item === type) !== undefined
      if (!isNeed) {
        continue
      }
      if (newData === null) {
        continue
      }
      if (isForce || !isEqual(connInfo.prevData[type], newData)) {
        if (type === 'wsUpdateInfo') {
          console.log(connInfo.address, newData)
        }
        connInfo.prevData[type] = newData
        connInfo.conn.sendText(JSON.stringify({
          type,
          data: newData
        }))
      } else {
        // logger.debug('sendClient data isEqual')
      }
    }
  }

}

module.exports = JsonWebsocketServer

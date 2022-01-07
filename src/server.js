let ws = require('nodejs-websocket')

const {sendClient} = require('./socketUtil')
const {onClientMessage} = require('./socketUtil')

let connInfoList = []

function startSocketServer(port, dbConn) {
  let server = ws.createServer(function (conn) {
    conn.setMaxListeners(20)
    let currentConnInfo = {
      conn,
      datetime: currentDatetime(),
      ip: conn.headers['x-real-ip' || 'x-forwarded-for'] || '',
      address: '',
      types: [],
      active: '1',
      version: '',
      prevData: {}
    }

    connInfoList.push(currentConnInfo)

    onClientMessage(currentConnInfo, 'version', (data) => {
      currentConnInfo.version = data

    })

    onClientMessage(currentConnInfo, 'close', (closeType) => {
      let index = currentConnInfo.types.indexOf(closeType)
      if (index != -1) {
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
      let index = connInfoList.findIndex(item => item.conn == conn)
      if (index != -1) {
        connInfoList.splice(index, 1)
      }
    }
  })
  server.listen(port)
}

module.exports = startSocketServer

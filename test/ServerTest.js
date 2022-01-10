let JsonWebsocketServer = require('../src/JsonWebsocketServer')
const ServerTimestampTask = require('../src/task/ServerTimestampTask')
const middleware = require('../src/middleware')

let websocketServer = new JsonWebsocketServer(8899)
websocketServer.start()
websocketServer.addTask(new ServerTimestampTask(websocketServer))
websocketServer.use(middleware.ip)
websocketServer.use(middleware.version)
websocketServer.use(async (connInfo, clientData, next) => {
  if (clientData.token !== 'abc') {
    websocketServer.sendClient([connInfo], 'error', {errorCode: 1, errorMsg: 'login first'})
  } else {
    await next()
  }
})

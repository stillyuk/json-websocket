# json-websocket

###server
```javascript
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

```

###client
```javascript
  import JsonWebsocketClient from '../src/JsonWebsocketClient.js'

  let client = new JsonWebsocketClient('ws:localhost:8899')

  client.addWatch('serverTimestamp', null, (a) => {
    console.log(a)
  })
  client.addWatch('version', '1.0')
  client.addWatch('error', null, (data) => {
    console.log(data)
  })
```
let isEqual = require('lodash/isEqual')

function onClientMessage(connInfo, type, handleMessage) {
  connInfo.conn.on('text', async (clientStr) => {
    let clientInfo
    try {
      clientInfo = JSON.parse(clientStr)
    } catch (e) {
      console.log('json parse error ', clientStr)
      return
    }

    if (clientInfo.type != type) {
      return
    }
    if (!clientInfo.once) {
      connInfo.types.push(type)
    }
    if (handleMessage) {
      try {
        await handleMessage(clientInfo.data)
      } catch (e) {
        console.log(clientInfo.data)
        console.log(e)
      }
    }
  })
}

const sendClient = (connInfoList, type, newData, isForce) => {
  if (connInfoList.length == 0) {
    return
  }
  try {
    logger.debug('sendClient start', JSON.stringify(newData).substr(0, 15))
  } catch (_) {
  }

  for (let i = 0; i < connInfoList.length; i++) {
    let connInfo = connInfoList[i]
    let isNeed = connInfo.types.find(item => item == type) != undefined
    if (!isNeed) {
      continue
    }
    if (newData === null) {
      continue
    }
    if (isForce || !isEqual(connInfo.prevData[type], newData)) {
      if (type == 'wsUpdateInfo') {
        console.log(connInfo.address, newData)
      }
      connInfo.prevData[type] = newData
      connInfo.conn.sendText(JSON.stringify({
        type,
        data: newData
      }))
    } else {
      logger.debug('sendClient data isEqual')
    }
  }
}

function startTask(task, timeout = 20 * 1000) {
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

module.exports = {
  onClientMessage,
  sendClient,
  startTask,
}

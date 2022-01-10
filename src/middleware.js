async function middleware(list, connInfo, clientData) {
  let current = -1
  return await toNext()

  async function toNext() {
    current++
    if (current < list.length) {
      await list[current](connInfo, clientData, toNext)
    }
  }
}

async function version(connInfo, clientData, next) {
  if (clientData.type === 'version') {
    connInfo.version = clientData.data
  }
  next()
}

async function ip(connInfo, clientData, next) {
  if (clientData.type === 'ip') {
      connInfo.ip = connInfo.conn.headers['x-real-ip' || 'x-forwarded-for'] || ''
  }
  next()
}

module.exports = {
  middleware, version, ip
}

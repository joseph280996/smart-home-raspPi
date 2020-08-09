import WebSocket from 'ws'

class APISocket {
  constructor(link, fan, heat, damper, eventEmitter) {
    const newWs = new WebSocket(link)
    newWs.on('open', () => {
      console.log(`WS Connection to ${process.env.WS_IP_ADDRESS} established`)
    })
    newWs.on('error', (err) => {
      console.error(err.message)
      ws.close()
    })

    newWs.on('close', (code, reason) => {
      console.log(code, reason)
    })
    newWs.on('message', async (data) => {
      console.log(`ws.onMessage: ${data}`)
      this.message = data
      this.emitter.emit('newData')
    })
    this.ws = newWs
    this.emitter = eventEmitter
    this.message = ''
  }
  getMessage() {
    return this.message
  }
  close() {
    this.ws.close(1000, "Exiting")
  }
  send(data) {
    this.ws.send(data)
  }
}

export default APISocket
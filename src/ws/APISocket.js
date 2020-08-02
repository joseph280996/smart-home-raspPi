import WebSocket from 'ws'

class APISocket {
  constructor(link, fan, heat, damper) {
    this.ws = new WebSocket(link)
    const wsInstance = this.ws
    this.ws.on('open', () => {
      console.log(`WS Connection to ${process.env.WS_IP_ADDRESS} established`)
    })
    this.ws.on('message', async (data) => {
      const setTempReg = /temperature:/i
      if (setTempReg.test(data)) {
        console.log(data)
      }
    })

    this.ws.on('error', (err) => {
      console.error(err.message)
      ws.close()
    })

    this.ws.on('close', (code, reason) => {
      console.log(code, reason)
    })
  }
  close() {
    this.ws.close(1000, "Exiting")
  }
  send(data) {
    this.ws.send(data)
  }
}

export default APISocket
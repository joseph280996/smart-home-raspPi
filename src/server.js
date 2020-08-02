import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import axios from 'axios'
import {Gpio} from 'onoff'
import {createCredential, writeToFile} from './utils/createCredential'
import APISocket from './ws/APISocket'
import getSensorData from './utils/getSensorData'
import moment from 'moment'
import 'moment-timezone'

dotenv.config()


const port = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(helmet())

// Sensor and pin out

const damper = new Gpio(5, 'out')
const fan = new Gpio(6, 'out')
const heat = new Gpio(19, 'out')

fan.writeSync(1) // 1 for shutdown, 0 for run
heat.writeSync(1) // 1 for shutdown, 0 for run
damper.writeSync(0) // 0 for shutdown, 1 for run

// Create or get the home data from server
let zones = [{name: 'zone 1', temperature: 70}, {name: 'zone 2', temperature: 70}]
let credential, ws
  ; (async () => {
    credential = createCredential()
    try {
      const response = await axios.post(`${process.env.SERVER_IP}/home`, {uuid: credential.deviceId, zones})
      zones = response.data.home.zones
    } catch (err) {
      console.error(err.message)
    }
  })()

app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}`)
})

const interval = setInterval(async () => {
  try {
    if (!ws && credential) {
      ws = new APISocket(`${process.env.WS_IP_ADDRESS}/?home=${credential.deviceId}`)
    }
    const sensorData = await Promise.all(
      zones.map(async zone => {
        const data = await getSensorData(zone.name)
        return data
      })
    )
    const timeStamp = moment.tz('America/New_York').unix()
    // if (sensorData.temperature < zones[temperature) {
    //   damper.writeSync(0) // 0 for shutdown, 1 for run
    //   fan.writeSync(-1) // 1 for shutdown, 0 for run
    //   heat.writeSync(-1) // 1 for shutdown, 0 for run
    // } else {
    //   fan.writeSync(0) // 1 for shutdown, 0 for run
    //   heat.writeSync(0) // 1 for shutdown, 0 for run
    //   damper.writeSync(-1) // 0 for shutdown, 1 for run
    // }
    console.log({timeStamp, sensorData})
    ws.send(`sensor:${JSON.stringify({timeStamp, sensorData})}`)
  } catch (err) {
    throw new Error(err)
  }
}, 1000 * 5)
function exitHandler(options, exitCode) {
  if (ws) ws.close(1000, "End Connection")
  if (interval) clearInterval(interval)
  process.exit()
}

process.on("SIGINT", exitHandler)
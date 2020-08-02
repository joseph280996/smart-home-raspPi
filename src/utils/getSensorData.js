import {promises as sensor} from 'node-dht-sensor'

const getSensorData = async (zoneName) => {
  const zones = {
    'zone 1': {
      type: 11,
      pin: 4,
    },
    'zone 2': {
      type: 11,
      pin: 17,
    },
  }
  const zone = zones[zoneName]
  const {type, pin} = zone
  let data = {}
  try {
    data = await sensor.read(type, pin)
  } catch (err) {
    console.error('Failed to read sensor data:', err)
  }
  const tempInF = (data.temperature * 9) / 5 + 32
  return {
    name: zoneName,
    temperature: tempInF.toFixed(1),
    humidity: data.humidity.toFixed(1),
  }
}
export default getSensorData

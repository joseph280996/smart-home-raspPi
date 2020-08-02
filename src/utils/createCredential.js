import fs from 'fs'
import path from 'path'
import {v4 as uuidv4} from 'uuid'

export const createCredential = () => {
  try {
    const filePath = path.join(__dirname, '../../credential.json')
    let credential
    const credentialExist = fs.existsSync(filePath)
    if (credentialExist)
      credential = JSON.parse(fs.readFileSync(filePath))
    else {
      credential = {
        deviceId: uuidv4()
      }
      writeToFile(filePath, JSON.stringify(credential))
    }
    return credential
  } catch (err) {
    throw new Error(err)
  }
}

export const writeToFile = (path, data) => {
  fs.writeFileSync(path, data)
}
const fs = require('fs')
const fsPromises = fs.promises
const elog = require('electron-log')
const path = require('path')

module.exports = {
  dirExist: function(dir) {
    return fs.existsSync(dir)
  },
  dirResolve: function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    return dir
  },
  writeFileAsync: async function(dir, fileName, datas, logs = true) {
    const fullFilePath = path.join(dir, fileName)
    if (logs) console.time(`Write "${fullFilePath}" in `)
    module.exports.dirResolve(dir)
    try {
      await fsPromises.writeFile(fullFilePath, datas);
    } catch (error) {
      console.log(error)
      elog.error(error)
      return false
    }
    if (logs) console.timeEnd(`Write "${fullFilePath}" in `)
    return fullFilePath
  },
  fileResolve: async function(dir, file, defaultDatas) {
    const fullPath = path.join(dir, file)
    if(!module.exports.dirExist(fullPath)) {
      await module.exports.writeFileAsync(dir, file, defaultDatas)
    }
    return fullPath
  },
  readFileAsync: async function(dir, fileName, logs = true) {
    const fullFilePath = path.join(dir, fileName)
    if (logs) console.time(`Read "${fullFilePath}" in `)
    let file
    if (module.exports.dirExist(dir)) {
      try {
        file = await fsPromises.readFile(fullFilePath)
      } catch (error) {
        console.log(error)
        elog.error(error)
        return false
      }
    }
    if (logs) console.timeEnd(`Read "${fullFilePath}" in `)
    return file;
  },
  removeFileAsync: async function(dir, fileName, logs = true) {
    const fullFilePath = path.join(dir, fileName)
    if (logs) console.time(`Remove "${fullFilePath}" in `)
    if (module.exports.dirExist(dir)) {
      try {
        await fsPromises.unlink(fullFilePath)
      } catch (error) {
        console.log(error)
        elog.error(error)
        return false
      }
    }
    if (logs) console.timeEnd(`Remove "${fullFilePath}" in `)
    return true
  }
}
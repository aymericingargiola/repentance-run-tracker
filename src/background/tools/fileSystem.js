const fs = require('fs');
const fsPromises = fs.promises
const elog = require('electron-log')
module.exports = {
  dirExist: function(dir) {
    if (!fs.existsSync(dir)) return false
    else return true
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
    if (logs) console.time(`Write "${dir}\\${fileName}" in `)
    module.exports.dirResolve(dir)
    try {
      await fsPromises.writeFile(`${dir}\\${fileName}`, datas);
    } catch (error) {
      console.log(error)
      elog.error(error)
      return false
    }
    if (logs) console.timeEnd(`Write "${dir}\\${fileName}" in `)
    return `${dir}\\${fileName}`
  },
  fileResolve: async function(path, file, defaultDatas) {
    if(!module.exports.dirExist(`${path}\\${file}`)) await module.exports.writeFileAsync(path, file, defaultDatas)
    return `${path}\\${file}`
  },
  readFileAsync: async function(dir, fileName, logs = true) {
    if (logs) console.time(`Read "${dir}\\${fileName}" in `)
    let file
    if (module.exports.dirExist(dir)) {
      try {
        file = await fsPromises.readFile(`${dir}\\${fileName}`)
      } catch (error) {
        console.log(error)
        elog.error(error)
        return false
      }
    }
    if (logs) console.timeEnd(`Read "${dir}\\${fileName}" in `)
    return file;
  },
  removeFileAsync: async function(dir, fileName, logs = true) {
    if (logs) console.time(`Remove "${dir}\\${fileName}" in `)
    if (module.exports.dirExist(dir)) {
      try {
        await fsPromises.unlink(`${dir}\\${fileName}`)
      } catch (error) {
        console.log(error)
        elog.error(error)
        return false
      }
    }
    if (logs) console.timeEnd(`Remove "${dir}\\${fileName}" in `)
    return true
  }
}
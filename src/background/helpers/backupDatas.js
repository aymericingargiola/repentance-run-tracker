const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises
const { app, ipcMain } = require('electron')
const { asyncForEach } = require('../tools/methods')
const { writeFileAsync } = require('../tools/fileSystem')
const moment = require('moment')
const AdmZip = require("adm-zip")
const elog = require('electron-log')
const dataFolder = app.getPath("userData")
const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`

ipcMain.on('ASK_ERROR_ZIP', async (event) => {
  const zipBuffer = await module.exports.generateErrorZip()
  event.reply('ASK_ERROR_ZIP', {datas:zipBuffer,fileName:`repentance_run_tracker_error_dump-${moment().format('MM-D-YY-hhmmssa')}.zip`})
})

module.exports = {
  addLocalFiles: async function(zip, files, context) {
    await asyncForEach(files, async (file) => {
      try {
        return zip.addLocalFile(file.path, file.zipFolder)
      } catch (err) {
        return elog.error(`Can't add ${path.normalize(file.path)} to ${context} zip file !`)
      }
    })
    return zip
  },
  backupDatas: async function(dataFolder) {
    console.time('App datas backup created in')
    elog.info('Creating app datas backup zip file...')
    let zip = new AdmZip()
    let files = [
      {
        path: `${dataFolder}/runs.json`,
        zipFolder: null
      },
      {
        path: `${dataFolder}/trash.json`,
        zipFolder: null
      },
      {
        path: `${dataFolder}/tags.json`,
        zipFolder: null
      },
      {
        path: `${dataFolder}/config.json`,
        zipFolder: null
      },
      {
        path: `${dataFolder}/winStreaks.json`,
        zipFolder: null
      }
    ]
    zip = await module.exports.addLocalFiles(zip, files, 'datas backup')
    zip.writeZip(`${dataFolder}/backups/backup_datas_${moment().format('MM-D-YY-hhmmssa')}.zip`)
    console.timeEnd('App datas backup created in')
    elog.info('App datas backup created')
    return true
  },
  restoreDatas: async function(dataFolder, filesToRestore) {
    elog.info(`Restoring ${filesToRestore} from backups...`)
    console.time("Datas restored in")
    let filesRestored = 0
    let backupZips
    try {
      backupZips = await fsPromises.readdir(`${dataFolder}/backups/`)
    } catch (err) {
      elog.error(`There is no backups in ${dataFolder}/backups/`)
      console.timeEnd("Datas restored in")
      return false
    }
    backupZips = backupZips.map(function (fileName) { return { name: fileName, time: fs.statSync(`${dataFolder}/backups/${fileName}`).mtime.getTime() } }).sort(function (a, b) { return b.time - a.time }).map(function (f) { return f.name })
    await asyncForEach(filesToRestore, async (fileName) => {
      let fileRestored
      await asyncForEach(backupZips, async (backupZip) => {
        if (fileRestored) return
        const zip = new AdmZip(`${dataFolder}/backups/${backupZip}`)
        const fileEntry = zip.getEntry(fileName)
        const fileContent = zip.readAsText(fileEntry)
        try {
          JSON.parse(fileContent)
        } catch (err) {
          elog.warn(`${fileName} file is corrupted from ${backupZip}! Try an other one...`);
          return fileRestored
        }
        await writeFileAsync(dataFolder, fileName, fileContent)
        elog.info(`${fileName} was restored from ${backupZip}`)
        return fileRestored = true
      })
      return filesRestored = fileRestored ? ++filesRestored : filesRestored
    })
    console.timeEnd("Datas restored in")
    return filesRestored == filesToRestore.length
  },
  generateErrorZip: async function() {
    console.time('Error zip file created in')
    elog.info('Creating error zip file...')
    let zip = new AdmZip()
    let files = [
      {
        path: `${dataFolder}/runs.json`,
        zipFolder: '/app/datas'
      },
      {
        path: `${dataFolder}/trash.json`,
        zipFolder: '/app/datas'
      },
      {
        path: `${dataFolder}/tags.json`,
        zipFolder: '/app/datas'
      },
      {
        path: `${dataFolder}/config.json`,
        zipFolder: '/app/datas'
      },
      {
        path: `${dataFolder}/winStreaks.json`,
        zipFolder: '/app/datas'
      },
      {
        path: `${dataFolder}/logs/main.log`,
        zipFolder: '/app/logs'
      },
      {
        path: `${repentanceFolderPath}/log.txt`,
        zipFolder: '/game/logs'
      }
    ]
    zip = await module.exports.addLocalFiles(zip, files, 'error')
    console.timeEnd('Error zip file created in')
    elog.info('Error zip file created')
    return zip.toBuffer()
  }
}
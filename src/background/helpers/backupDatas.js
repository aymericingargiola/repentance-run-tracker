const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises
const { app, ipcMain } = require('electron')
const { asyncForEach } = require('../tools/methods')
const { writeFileAsync, removeFileAsync } = require('../tools/fileSystem')
const { DateTime, Duration } = require('luxon')
const AdmZip = require("adm-zip")
const elog = require('electron-log')
const dataFolder = app.getPath("userData")
const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`

ipcMain.on('ASK_ERROR_ZIP', async (event) => {
  const zipBuffer = await module.exports.generateErrorZip()
  event.reply('ASK_ERROR_ZIP', {datas:zipBuffer,fileName:`repentance_run_tracker_error_dump-${DateTime.now().toFormat('LL-dd-yy-hhmmssa')}.zip`})
})

module.exports = {
  getBackupZips: async function() {
    try {
      return await fsPromises.readdir(`${dataFolder}/backups/`)
    } catch (err) {
      elog.error(`There is no backups in ${dataFolder}/backups/`)
      return false
    }
  },
  cleanBackups: async function() {
    elog.info("Cleaning backups...")
    console.time("Cleaning backups done in")
    // First, remove backups with corrupted datas
    let backupZips = await module.exports.getBackupZips()
    if (!backupZips) return console.timeEnd("Cleaning backups done in")
    backupZips = backupZips.filter(zipName => !zipName.split('_').includes('checked.zip'))
    await asyncForEach(backupZips, async (backupZip) => {
      const zip = new AdmZip(`${dataFolder}/backups/${backupZip}`)
      let toRemove
      await asyncForEach(zip.getEntries(), async (entry) => {
        if (toRemove) return
        const entryExt = path.extname(entry.entryName)
        if (entryExt === ".json") {
          const fileContent = zip.readAsText(entry)
          try {
            JSON.parse(fileContent)
          } catch (err) {
            elog.warn(`${entry.entryName} file from ${backupZip} is corrupted, removing ${backupZip}...`)
            return toRemove = true
          }
        }
        return
      })
      if (toRemove) {
        const removed = await removeFileAsync(`${dataFolder}/backups`, backupZip)
        if (removed) return elog.info(`${backupZip} removed`)
        return elog.error(`Error while removing ${backupZip}!`)
      } else {
        await fsPromises.rename(`${dataFolder}/backups/${backupZip}`, `${dataFolder}/backups/${backupZip.replace('.zip', '')}_checked.zip`)
      }
      return
    })
    // Then, remove backups older than 1 months (keep at least 10 backups)
    backupZips = await module.exports.getBackupZips()
    backupZips = backupZips.map(function (fileName) { return { name: fileName, time: fs.statSync(`${dataFolder}/backups/${fileName}`).mtime.getTime() } }).sort(function (a, b) { return b.time - a.time })
    const backupsNumber = backupZips.length
    if (backupZips && backupsNumber > 10) {
      let removedBackups = 0
      await asyncForEach(backupZips, async (backupZip) => {
        const diff = DateTime.now().diff(DateTime.fromMillis(backupZip.time), ["months"])
        const months = diff.values.months
        if (months > 1 && backupsNumber - removedBackups >= 10) {
          const removed = await removeFileAsync(`${dataFolder}/backups`, backupZip.name)
          if (removed) {
            ++removedBackups
            return elog.info(`${backupZip.name} removed`)
          }
          return elog.error(`Error while removing ${backupZip.name}!`)
        }
        return
      })
    }
    console.timeEnd("Cleaning backups done in")
    elog.info("Cleaning backups done")
    return true
  },
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
    zip.writeZip(`${dataFolder}/backups/backup_datas_${DateTime.now().toFormat('LL-dd-yy-hhmmssa')}.zip`)
    console.timeEnd('App datas backup created in')
    elog.info('App datas backup created')
    return true
  },
  restoreDatas: async function(dataFolder, filesToRestore) {
    elog.info(`Restoring ${filesToRestore} from backups...`)
    console.time("Restoring datas done in")
    let filesRestored = 0
    let backupZips = await module.exports.getBackupZips()
    backupZips = backupZips.map(function (fileName) { return { name: fileName, time: fs.statSync(`${dataFolder}/backups/${fileName}`).mtime.getTime() } }).sort(function (a, b) { return b.time - a.time }).map(function (f) { return f.name })
    if (!backupZips) return console.timeEnd("Datas restored in")
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
          elog.warn(`${fileName} file is corrupted from ${backupZip}! Try an other one...`)
          return fileRestored
        }
        await writeFileAsync(dataFolder, fileName, fileContent)
        elog.info(`${fileName} was restored from ${backupZip}`)
        return fileRestored = true
      })
      return filesRestored = fileRestored ? ++filesRestored : filesRestored
    })
    console.timeEnd("Restoring datas done in")
    elog.info(`Restoring datas done.`)
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
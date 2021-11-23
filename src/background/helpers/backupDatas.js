const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises
const { app, ipcMain } = require('electron')
const { asyncForEach } = require('../tools/methods')
const { writeFileAsync } = require('../tools/fileSystem')
const moment = require('moment')
const AdmZip = require("adm-zip")
const log = require('electron-log')
const dataFolder = app.getPath("userData")

ipcMain.on('ASK_ERROR_ZIP', async (event) => {
  const zipBuffer = await module.exports.generateErrorZip()
  event.reply('ASK_ERROR_ZIP', {datas:zipBuffer,fileName:`repentance_run_tracker_error_dump-${moment().format('MM-D-YY-hhmmssa')}.zip`})
})

module.exports = {
  backupDatas: async function(dataFolder) {
    let zip = new AdmZip()
    zip.addLocalFile(`${dataFolder}/runs.json`)
    zip.addLocalFile(`${dataFolder}/trash.json`)
    zip.addLocalFile(`${dataFolder}/tags.json`)
    zip.addLocalFile(`${dataFolder}/config.json`)
    zip.addLocalFile(`${dataFolder}/winStreaks.json`)
    zip.writeZip(`${dataFolder}/backups/backup_datas_${moment().format('MM-D-YY-hhmmssa')}.zip`)
    return true
  },
  restoreDatas: async function(dataFolder, filesToRestore) {
    console.log("Restoring datas...")
    log.info(`Restoring ${filesToRestore} from backups...`)
    console.time("Datas restored in")
    let filesRestored = 0
    let backupZips
    try {
      backupZips = await fsPromises.readdir(`${dataFolder}/backups/`)
    } catch (err) {
      log.error(`There is no backups in ${dataFolder}/backups/`)
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
          log.warn(`${fileName} file is corrupted from ${backupZip}! Try an other one...`);
          return fileRestored
        }
        await writeFileAsync(dataFolder, fileName, fileContent)
        log.info(`${fileName} was restored from ${backupZip}`)
        return fileRestored = true
      })
      return filesRestored = fileRestored ? ++filesRestored : filesRestored
    })
    console.timeEnd("Datas restored in")
    return filesRestored == filesToRestore.length
  },
  generateErrorZip: async function() {
    let zip = new AdmZip()
    zip.addLocalFile(`${dataFolder}/runs.json`)
    zip.addLocalFile(`${dataFolder}/trash.json`)
    zip.addLocalFile(`${dataFolder}/tags.json`)
    zip.addLocalFile(`${dataFolder}/config.json`)
    zip.addLocalFile(`${dataFolder}/winStreaks.json`)
    zip.addLocalFile(`${dataFolder}/logs/main.log`)
    return zip.toBuffer()
  }
}
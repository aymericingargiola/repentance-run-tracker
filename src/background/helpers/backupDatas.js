const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises
const { asyncForEach } = require('../tools/methods')
const { writeFileAsync } = require('../tools/fileSystem')
const moment = require('moment')
const AdmZip = require("adm-zip")
const log = require('electron-log')

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
    await asyncForEach(filesToRestore, async (fileName) => {
      let fileRestored
      await asyncForEach(backupZips.reverse(), async (backupZip) => {
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
  }
}
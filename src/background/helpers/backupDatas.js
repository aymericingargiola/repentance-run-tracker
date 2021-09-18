const moment = require('moment')
const AdmZip = require("adm-zip")

module.exports = {
	backupDatas: async function(dataFolder) {
        let zip = new AdmZip()
        zip.addLocalFile(`${dataFolder}/runs.json`)
        zip.addLocalFile(`${dataFolder}/tags.json`)
        zip.addLocalFile(`${dataFolder}/config.json`)
        zip.addLocalFile(`${dataFolder}/winStreaks.json`)
        zip.writeZip(`${dataFolder}/backups/backup_datas_${moment().format('MM-D-YY-hhmmssa')}.zip`)
        return true
	}
}
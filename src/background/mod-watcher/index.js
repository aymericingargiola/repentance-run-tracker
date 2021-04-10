const { watch, copyFile, unlinkSync } = require('fs')
const path = require('path')
const { fileResolve, dirExist } = require('../tools/fileSystem')
const modName = 'Repentance_Run_Tracker_Extended'
const IsaacModFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Afterbirth+ Mods`
const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`
const repentanceOptionsFile = `${repentanceFolderPath}\\options.ini`
let modDevFile, modDevBuffer

async function watchMod() {
    fileResolve(`${IsaacModFolderPath}\\${modName}`, 'main.lua', '')
    watch(modDevFile, (eventType, filename) => {
        if (eventType === 'change') {
            copyFile(modDevFile, `${IsaacModFolderPath}\\${modName}\\main.lua`, (err) => {
                if (err) {
                    console.log("Error Found:", err);
                }
                else {
                    if (dirExist(repentanceOptionsFile)) unlinkSync(repentanceOptionsFile)
                    console.log("Mod file updated")
                }
            })
        }
    })
}

module.exports = {
    startModWatch: function(window, isDevelopment, dataFolder) {
        if(!isDevelopment) return
        modDevFile = `${dataFolder}\\mod\\main.lua`
        console.log("Watching mod file...", modDevFile)
        watchMod()
    }
}
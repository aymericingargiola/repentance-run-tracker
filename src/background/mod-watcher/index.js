const fs = require('fs')
const { app } = require('electron')
const { watch, unlinkSync } = require('fs')
const path = require('path')
const compareVersions = require('compare-versions')
const convert = require('xml-js')
const { dirExist, fileResolve, writeFileAsync, readFileAsync } = require('../tools/fileSystem')
const dataFolder = app.getPath("userData")
const modName = 'Repentance_Run_Tracker_Extended'
//const isaacModFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Afterbirth+ Mods`
//const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`
//const repentanceOptionsFile = `${repentanceFolderPath}\\options.ini`
let modFile, modMetadata, modDevFolder, modDevFile, modDevMetadataFile, config, isaacModFolderPath

async function watchMod() {
    await fileResolve(`${isaacModFolderPath}\\${modName}`, 'main.lua', '')
    await fileResolve(`${isaacModFolderPath}\\${modName}`, 'metadata.xml', '')
    watch(modDevFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'main.lua', false)
            await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'main.lua', newContent, false)
            console.log("Mod file updated")
        }
    })
    watch(modDevMetadataFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'metadata.xml', false)
            await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'metadata.xml', newContent, false)
            console.log("Mod metadata file updated")
        }
    })
}

async function checkMod() {
    console.log("Checking mod...")
    if(!dirExist(`${isaacModFolderPath}\\${modName}`)) {
        console.log("Mod does not exist, create files...")
        console.log(modMetadata)
        await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'main.lua', modFile)
        await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'metadata.xml', modMetadata)
        await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'disable.it', '')
        console.log("Mod files created")
        return
    }
    const currentModMetadataFile = await readFileAsync(`${isaacModFolderPath}\\${modName}`, `metadata.xml`)
    const currentModVersion = JSON.parse(convert.xml2json(currentModMetadataFile, {compact: true, spaces: 4})).metadata.version._text
    const appModVersion = JSON.parse(convert.xml2json(modMetadata, {compact: true, spaces: 4})).metadata.version._text
    if(compareVersions(currentModVersion, appModVersion) === -1) {
        console.log("Current mod version is older, update...")
        await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'main.lua', modFile)
        await writeFileAsync(`${isaacModFolderPath}\\${modName}`, 'metadata.xml', modMetadata)
        console.log("Mod updated")
    }
}

module.exports = {
    startModWatch: async function(window, isDevelopment, modFileContent, modeMetadataContent, conf) {
        config = conf
        const isaacModFolderPathField = config.filter(field => field.id === "isaacModFolderPath")[0]
        if(isDevelopment && isaacModFolderPathField && isaacModFolderPathField.value != "") {
            isaacModFolderPath = isaacModFolderPathField.value
            modDevFolder = `${__dirname}/../src/background/mod-watcher/mod`
            modDevFile = `${__dirname}/../src/background/mod-watcher/mod/main.lua`
            modDevMetadataFile = `${__dirname}/../src/background/mod-watcher/mod/metadata.xml`
            watchMod()
        } else if (modFileContent && modeMetadataContent && isaacModFolderPathField && isaacModFolderPathField.value != "") {
            isaacModFolderPath = isaacModFolderPathField.value
            modFile = modFileContent
            modMetadata = modeMetadataContent
            checkMod()
        }
    }
}
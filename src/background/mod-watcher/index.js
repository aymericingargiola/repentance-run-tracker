const fs = require('fs')
const { watch, unlinkSync } = require('fs')
const path = require('path')
const compareVersions = require('compare-versions')
const convert = require('xml-js')
const { dirExist, fileResolve, writeFileAsync, readFileAsync } = require('../tools/fileSystem')
const dataFolder = path.resolve(process.cwd(), 'datas')
const modName = 'Repentance_Run_Tracker_Extended'
//const IsaacModFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Afterbirth+ Mods`
//const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`
//const repentanceOptionsFile = `${repentanceFolderPath}\\options.ini`
let modFile, modMetadata, modDevFolder, modDevFile, modDevMetadataFile, config, IsaacModFolderPath

async function watchMod() {
    await fileResolve(`${IsaacModFolderPath}\\${modName}`, 'main.lua', '')
    await fileResolve(`${IsaacModFolderPath}\\${modName}`, 'metadata.xml', '')
    watch(modDevFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'main.lua', false)
            await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'main.lua', newContent, false)
            console.log("Mod file updated")
        }
    })
    watch(modDevMetadataFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'metadata.xml', false)
            await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'metadata.xml', newContent, false)
            console.log("Mod metadata file updated")
        }
    })
}

async function checkMod() {
    console.log("Checking mod...")
    if(!dirExist(`${IsaacModFolderPath}\\${modName}`)) {
        console.log("Mod does not exist, create files...")
        console.log(modMetadata)
        await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'main.lua', modFile)
        await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'metadata.xml', modMetadata)
        await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'disable.it', '')
        console.log("Mod files created")
        return
    }
    const currentModMetadataFile = await readFileAsync(`${IsaacModFolderPath}\\${modName}`, `metadata.xml`)
    const currentModVersion = JSON.parse(convert.xml2json(currentModMetadataFile, {compact: true, spaces: 4})).metadata.version._text
    const appModVersion = JSON.parse(convert.xml2json(modMetadata, {compact: true, spaces: 4})).metadata.version._text
    if(compareVersions(currentModVersion, appModVersion) === -1) {
        console.log("Current mod version is older, update...")
        await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'main.lua', modFile)
        await writeFileAsync(`${IsaacModFolderPath}\\${modName}`, 'metadata.xml', modMetadata)
        console.log("Mod updated")
    }
}

module.exports = {
    startModWatch: async function(window, isDevelopment, modFileContent, modeMetadataContent) {
        const loadConfig = await fileResolve(dataFolder, 'config.json', '{}')
        config = JSON.parse(fs.readFileSync(loadConfig))
        if(isDevelopment && config.isaacModFolderPath && config.isaacModFolderPath != "") {
            IsaacModFolderPath = config.isaacModFolderPath
            modDevFolder = `${__dirname}/../src/background/mod-watcher/mod`
            modDevFile = `${__dirname}/../src/background/mod-watcher/mod/main.lua`
            modDevMetadataFile = `${__dirname}/../src/background/mod-watcher/mod/metadata.xml`
            watchMod()
        } else if (modFileContent && modeMetadataContent && config.isaacModFolderPath && config.isaacModFolderPath != "") {
            IsaacModFolderPath = config.isaacModFolderPath
            modFile = modFileContent
            modMetadata = modeMetadataContent
            checkMod()
        }
    }
}
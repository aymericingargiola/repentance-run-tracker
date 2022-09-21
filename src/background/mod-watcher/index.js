const { watch } = require('fs')
const log = require('electron-log')
const compareVersions = require('compare-versions')
const convert = require('xml-js')
const { dirExist, fileResolve, writeFileAsync, readFileAsync } = require('../tools/fileSystem')
const path = require('path')
const modName = 'Repentance_Run_Tracker_Extended'
let modFile, modMetadata, modDevFolder, modDevFile, modDevMetadataFile, config, isaacModFolderPath

async function watchMod() {
    const ourModFolder = path.join(isaacModFolderPath, modName)
    await fileResolve(ourModFolder, 'main.lua', '')
    await fileResolve(ourModFolder, 'metadata.xml', '')
    watch(modDevFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'main.lua', false)
            await writeFileAsync(ourModFolder, 'main.lua', newContent, false)
            console.log("Mod file updated")
        }
    })
    watch(modDevMetadataFile, async (eventType, filename) => {
        if (eventType === 'change') {
            let newContent = await readFileAsync(modDevFolder, 'metadata.xml', false)
            await writeFileAsync(ourModFolder, 'metadata.xml', newContent, false)
            console.log("Mod metadata file updated")
        }
    })
}

async function checkMod() {
    console.log("Checking mod...")
    const ourModFolder = path.join(isaacModFolderPath, modName)
    if(!dirExist(ourModFolder)) {
        console.log("Mod does not exist, create files...")
        console.log(modMetadata)
        await writeFileAsync(ourModFolder, 'main.lua', modFile)
        await writeFileAsync(ourModFolder, 'metadata.xml', modMetadata)
        await writeFileAsync(ourModFolder, 'disable.it', '')
        console.log("Mod files created")
        log.info(`Extended logs mod's files was missing, created in ${ourModFolder}`)
        return
    }
    const currentModMetadataFile = await readFileAsync(ourModFolder, `metadata.xml`)
    const currentModVersion = JSON.parse(convert.xml2json(currentModMetadataFile, {compact: true, spaces: 4})).metadata.version._text
    const appModVersion = JSON.parse(convert.xml2json(modMetadata, {compact: true, spaces: 4})).metadata.version._text
    if(compareVersions(currentModVersion, appModVersion) === -1) {
        console.log("Current mod version is older, update...")
        await writeFileAsync(ourModFolder, 'main.lua', modFile)
        await writeFileAsync(ourModFolder, 'metadata.xml', modMetadata)
        console.log("Mod updated")
        log.info(`Extended logs mod version is different ! [current = ${currentModVersion} | new = ${appModVersion}], updated in ${ourModFolder}`)
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
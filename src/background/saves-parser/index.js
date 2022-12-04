const fs = require("fs")
const { app } = require('electron')
const path = require('path')
const fsPromises = fs.promises
const isLinux = process.platform === "linux"
const { asyncForEach } = require('../tools/methods')
const { readFileAsync } = require('../tools/fileSystem')
const { IsaacSaveFile } = require('./IsaacSaveFile')
const KaitaiStream = require('kaitai-struct/KaitaiStream')
const achievements = require('./data/achievments.json')
const easterEggs = require('./data/easterEggs.json')
const itemPools = require('./data/itempools.json')
const items = require('./data/items.json')
const { itemPoolNameMap } = require('./ItemPoolNameMap')
// const repentanceFolderPath = !isLinux ? path.join(app.getPath('home'), 'Documents', 'My Games', 'Binding of Isaac Repentance')
// : path.join(app.getPath('home') + "/.steam/steam/steamapps/compatdata/#ISAAC#/pfx/drive_c/users/steamuser/Documents/My Games/Binding of Isaac Repentance")
const saves = [];
const repentanceFolderPath = path.join("C:/Users/aymer_qlaf78t/Documents/my games/Binding of Isaac Repentance")
const HEADER_LENGTH = 16;
// Persistent files are ones that contain data for the entire save file.
// e.g. persistentgamedata1.dat
const AFTERBIRTH_PLUS_AND_REPENTANCE_PERSISTENT_HEADER = "ISAACNGSAVE09R";
const NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS = 404;

function removeNullCharacters(string) {
    return string.replace(/\0/g, "");
}

function arrayBufferToString(arrayBuffer) {
    const textDecoder = new TextDecoder("utf-8");
    const string = textDecoder.decode(arrayBuffer).trim();
    return removeNullCharacters(string).trim();
}

function verifyHeader(arrayBuffer) {
    // Before we invoke the real parser, we manually extract the header (for the purposes of showing a
    // better error message).
    const headerBytes = arrayBuffer.slice(0, HEADER_LENGTH);
    const header = arrayBufferToString(headerBytes);
    if (header !== AFTERBIRTH_PLUS_AND_REPENTANCE_PERSISTENT_HEADER) {
        console.log(`${header} is not matching Repentance`);
        return false
    }
    return true
}

function verifyNotAfterbirthPlus(isaacSaveFile) {
    // Since Afterbirth+ has the same save file header as Repentance, we must use some other save file
    // property to tell the difference.
    var chunk = isaacSaveFile.chunks[1 - 1];
    if (chunk === undefined) {
        console.log("Failed to get the achievements chunk.")
        return false
    }
    if (chunk.len === NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS) {
        console.log("Afterbirth+ save")
        return false
    }
    return true
}

function AddAchievements(isaacSaveFile) {
    let unlocked = 0
    const chunk = isaacSaveFile.chunks[1 - 1];
    if (chunk === undefined) {
        console.log("Failed to get the achievements chunk.")
        return false
    }
    const achievementChunk = chunk.body;
    const ourAchievements = achievementChunk.achievements;
    const numAchievements = achievementChunk.count - 1; // Account for the 0th element
    console.log(ourAchievements, numAchievements, isaacSaveFile.saveNumber)
    ourAchievements.forEach(binary => {
        if (binary !== 0) unlocked++
    });
}

async function parseSaveFile(saves) {
    await asyncForEach(saves, async (save, index) => {
        const saveFileBuffer = await readFileAsync(repentanceFolderPath, save)
        if (verifyHeader(saveFileBuffer)) {
            // The format of the save file was reversed by Blade using: https://ide.kaitai.io/
            // It produces a JavaScript decoder that we leverage here.
            const kaitaiStream = new KaitaiStream(saveFileBuffer)
            const isaacSaveFile = new IsaacSaveFile(kaitaiStream)
            isaacSaveFile.saveNumber = parseInt(save.split(".")[1].replace(/[^0-9\.]/g, ''))
            AddAchievements(isaacSaveFile)
            if (verifyNotAfterbirthPlus(isaacSaveFile)) return isaacSaveFile
        }
    })
}

async function getSaves() {
    let files, saveFiles
    try {
        files = await fsPromises.readdir(repentanceFolderPath)
      } catch (err) {
        elog.error(`There is no backups in ${dataFolder}/backups/`)
        return false
      }
    if (files && files.length > 0) {
        saveFiles = files.filter(file => file.includes('rep_persistentgamedata'))
    } else {
        return
    }
    const save1 = saveFiles.filter(file => file.includes('rep_persistentgamedata1')).slice(-1)
    const save2 = saveFiles.filter(file => file.includes('rep_persistentgamedata2')).slice(-1)
    const save3 = saveFiles.filter(file => file.includes('rep_persistentgamedata3')).slice(-1)
    const saves = [
        ...save1, ...save2, ...save3
    ]
    if (saves.length > 0) {
        parseSaveFile(saves)
    }
}

getSaves()
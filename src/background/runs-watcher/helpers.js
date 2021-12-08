const fs = require('fs')
const path = require('path')
const { cloneFrom } = require('../tools/methods')
const { syncApp } = require('../helpers/sync')
const characters = require('../jsons/characters.json')
const entities = require('../jsons/entitiesFiltered.json')
const items = require('../jsons/items.json')
const floors = require('../jsons/floors.json')
const { DateTime, Duration } = require('luxon')
const log = require('electron-log')
module.exports = {
    getOptions: (path, splitFormat) => {
        const options = fs.readFileSync(path, "utf8")
        const optionsArray = options.split(splitFormat)
        return {
            EnableDebugConsole: optionsArray.find(option => option.includes("EnableDebugConsole")).split("=")[1] === "0" ? false : true,
            EnableMods: optionsArray.find(option => option.includes("EnableMods")).split("=")[1] === "0" ? false : true
        }
    },
    getModPath: (string) => {
        const modPath = string.replace("[INFO] - Running Lua Script: ", "")
        const modPathIndex = modPath.indexOf("/mods/")
        return path.normalize(`${modPath.slice(0,modPathIndex)}\\mods`)
    },
    getCharater: (string) => {
        //Return matching character from logs
        const splitValue = string.includes("Pool") ? 19 : 9
        const character = characters.find(character => character.id === string.split(" ")[splitValue])
        if (character) return cloneFrom(character)
        log.error(`Character was not found, undefined character returned. [log string : ${string} | split value : ${splitValue}]`)
        return cloneFrom(characters.find(character => character.id === "999999999999"))
    },
    getEntity: (string) => {
        //Return matching entity from logs
        const entityId = string.split(" ")[5].match(/(\d+)/)[0]
        const entityVariant = string.split(" ")[6].match(/(\d+)/)[0]
        const entity = entities.find(entity => entity.id.startsWith(`${entityId}.${entityVariant}`))
        if (entity) return cloneFrom(entity)
        const logMessage = `Entity was not found. [log string : ${string} | split value : ID-${entityId}-${5} Variant-${entityVariant}-${6}]`
        console.log(logMessage)
        log.warn(logMessage)
        return null
    },
    getCharaterStats: (string) => {
        //Return character stats from RRTE mod converted to json
        let playerStats = string.split(" ")[9].replaceAll("=", ":")
        playerStats.replace(/(\w+)\s*:\s*('[^']*'|"[^"]*"|)/gi, (match, match2) => playerStats = playerStats.replace(match2, `"${match2}"`))
        return JSON.parse(playerStats)
    },
    getSeed: (string) => {
        const splitValuePart1 = string.includes("Pool") ? 15 : 5
        const splitValuePart2 = string.includes("Pool") ? 16 : 6
        return {
            'seed': `${string.split(" ")[splitValuePart1]} ${string.split(" ")[splitValuePart2]}`
        }
    },
    getFloor: (string, mode, id) => {
        if (id) return cloneFrom(floors[mode === "greed" ? "stagesGreedMode" : "stages"].find(floor => floor.id === id))
        const match1 = string.split(" ")[4].match(/\d+/)[0]
        const match2 = string.split(" ")[6]
        return cloneFrom(floors[mode === "greed" ? "stagesGreedMode" : "stages"].find(floor => floor.id === `${match1}.${match2}`))
    },
    getFloorById: (id, mode) => {
        return cloneFrom(floors[mode === "greed" ? "stagesGreedMode" : "stages"].find(floor => floor.id === id))
    },
    getGameState: function(string) {
        //Return game save state from logs
        return string.split(" ")[4]
    },
    getPlayer: (string) => {
        //Return player from logs
        return string.split(" ")[string.split(" ").findIndex(value => value === "player") + 1]
    },
    getCollectible: (string, splitValue) => {
        //Return matching collectible from logs
        const id = parseInt(string.split(" ")[splitValue])
        if (id < 0) {
            return {
                id: id,
                title: "Glitched item",
                itemType: "unknow type",
                category: "unknow category",
                type: "item",
                player: module.exports.getPlayer(string),
                removed: false
            }
        }
        const matchingItem = items.collectibles.find(collectible => collectible.itemID === id)
        if (matchingItem) {
            return {
                id: id,
                title: matchingItem.title,
                itemType: matchingItem.itemType,
                category: matchingItem.category,
                type: "item",
                player: module.exports.getPlayer(string),
                removed: false
            }
        }
        log.warn(`Item with id ${id} was not found [log string : ${string} | split value : ${splitValue}]`)
        return {
            id: id,
            title: "unknow item",
            itemType: "unknow type",
            category: "unknow category",
            type: "item",
            player: module.exports.getPlayer(string),
            removed: false
        }
    },
    getTrinket: (string, splitValue) => {
        //Return matching trinket from logs
        const smelted = string.includes("smelted") ? true : false
        const id = parseInt(string.split(" ")[splitValue])
        const matchingTrinket = items.trinkets.find(trinket => trinket.trinketID === id)
        if (matchingTrinket) {
            return {
                id: id,
                title: matchingTrinket.title,
                category: matchingTrinket.category,
                type: "trinket",
                player: module.exports.getPlayer(string),
                removed: false,
                smelted: smelted
            }
        }
        log.warn(`Trinket with id ${id} was not found [log string : ${string} | split value : ${splitValue}]`)
        return {
            id: id,
            title: "unknow trinket",
            category: "unknow category",
            type: "trinket",
            player: module.exports.getPlayer(string),
            removed: false,
            smelted: smelted
        }
    },
    getRunEnd: (string) => {
        //Return game over from logs
        return {
            date: DateTime.now().toSeconds(),
            win: string.includes("Game Over") ? false : true,
            killedBy: string.includes("Game Over") ? string.split(" ")[6].slice(1,-1) : null,
            spawnedBy: string.includes("Game Over") ? string.split(" ")[9].slice(1,-1) : null,
            damageFlags: string.includes("Game Over") ? string.split(" ")[12].slice(1,-1) : null
        }
    },
    getRunDuration: (end, start) => {
        const diff = end.diff(start, ["seconds"])
        const duration = Duration.fromObject(diff.toObject())
        return duration.toFormat('hh:mm:ss')
    },
    getRealRunDuration: (string) => {
        const s = parseInt(string.split(" ")[9])
        const duration = Duration.fromObject({seconds:s})
        return duration.toFormat('hh:mm:ss')
    },
    saveFileToDisk: (path, datas) => {
        //Update file
        fs.writeFile(path, datas, 'utf8', (err) => {if (err) throw err})
    },
    removeRun: (runId, runs, runsJsonPath, window, windowTracker, saveIntrash, trash, trashJsonPath) => {
        //From user action, if the runid is found remove a run on frontend and backend
        console.log(`Removing run : ${runId}...`)
        const runIndex = runs.findIndex(run => run.id === runId)
        if (runIndex != -1) {
            if (saveIntrash) {
                const run = runs.find(run => run.id === runId)
                syncApp(window,{trigger: "add run to trash", run: run})
                if(windowTracker) syncApp(windowTracker,{trigger: "add run to trash", run: run})
                trash.push(run)
                module.exports.saveFileToDisk(trashJsonPath, JSON.stringify(trash))
                console.log(`Run : ${runId} was save in trash bin`)
            }
            syncApp(window,{trigger: "remove run", run: runs[runIndex].id}) //Remove matching run on frontend
            if(windowTracker) { syncApp(windowTracker,{trigger: "remove run", run: runs[runIndex].id}) }
            runs.splice(runIndex, 1) //Remove matching run on saved runs json file
            console.log(`Run : ${runId} was removed`)
            module.exports.saveFileToDisk(runsJsonPath, JSON.stringify(runs))
            return true
        } else {
            log.warn(`Impossible to find : ${runId}, this run doesn't exist on the backend ! (Sync issue ?)`)
            return false
        }
    },
    removeRunsFromTrash: (runsToRemove, window, windowTracker, trash, trashJsonPath) => {
        const removedRuns = []
        runsToRemove.forEach(run => {
            const runId = run
            const runIndex = trash.findIndex(run => run.id === runId)
            if (runIndex != -1) {
                trash.splice(runIndex, 1)
                removedRuns.push(runId)
            } else {
                log.warn(`Impossible to find : ${runId}, this run doesn't exist on the backend ! (Sync issue ?)`)
            }
        })
        if (removedRuns.length > 0) {
            module.exports.saveFileToDisk(trashJsonPath, JSON.stringify(trash))
            syncApp(window,{trigger: "remove runs from trash", runs: removedRuns})
            if(windowTracker) { syncApp(windowTracker,{trigger: "remove runs from trash", runs: removedRuns}) }
            log.info(`Runs : ${removedRuns} was removed from trash`)
        }
    },
    addRuns: (runsToAdd, window, windowTracker, runs, runsJsonPath) => {
        const addedRuns = []
        runsToAdd.forEach(run => {
            addedRuns.push(run.id)
            runs.push(run)
            syncApp(window,{trigger: "create run", run: run})
            if(windowTracker) { syncApp(windowTracker,{trigger: "create run", runs: run}) }
        })
        module.exports.saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        console.log(`Runs : ${addedRuns} was added`)
    },
    restoreRunsFromTrash: (runsToRestore, runs, runsJsonPath, win, winTracker, trash, trashJsonPath) => {
        const restoredRuns = []
        const restoredRunsItems = []
        runsToRestore.forEach(run => {
            const runId = run
            const runIndex = trash.findIndex(run => run.id === runId)
            if (runIndex != -1) {
                const runToRestore = trash.find(run => run.id === runId)
                restoredRuns.push(runToRestore.id)
                restoredRunsItems.push(runToRestore)
            } else {
                log.warn(`Impossible to find : ${runId}, this run doesn't exist on the backend ! (Sync issue ?)`)
            }
        })
        if (restoredRuns.length > 0) {
            module.exports.removeRunsFromTrash(restoredRuns, win, winTracker, trash, trashJsonPath)
            module.exports.addRuns(restoredRunsItems, win, winTracker, runs, runsJsonPath)
        }
    }
}
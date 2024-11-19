const fs = require('fs')
const path = require('path')
const { cloneFrom } = require('../tools/methods')
const { syncApp } = require('../helpers/sync')
const characters = require('../jsons/characters.json')
const charactersFiendFolio = require('../jsons/characters_fiendfolio-reheated.json')
const entities = require('../jsons/entitiesFiltered.json')
const entitiesFiendFolio = require('../jsons/entitiesFiltered_fiendfolio-reheated.json')
const items = require('../jsons/items.json')
const itemsCustom = require('../jsons/itemsCustom.json')
const itemsFiendFolio = require('../jsons/items_fiendfolio-reheated.json')
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
        return path.join(modPath.slice(0, modPathIndex), 'mods')
    },
    getCharater: (string, otherModsLoaded) => {
        //Return matching character from logs
        const splitValue = string.includes("Pool") ? 19 : 9
        let character = null
        if (otherModsLoaded.length > 0) { // Supported custom items
            character = charactersFiendFolio.find(character => character.id === string.split(" ")[splitValue])
        }
        if (!character) character = characters.find(character => character.id === string.split(" ")[splitValue])
        if (character) return cloneFrom(character)
        log.error(`Character was not found, undefined character returned. [log string : ${string} | split value : ${splitValue}]`)
        return cloneFrom(characters.find(character => character.id === "999999999999"))
    },
    getEntity: (string, otherModsLoaded) => {
        //Return matching entity from logs
        console.log(string, otherModsLoaded)
        const splitString = string.split(" ")
        const entityIdIdx = splitString.findIndex(str => str.includes("Type"))
        const entityId = splitString[entityIdIdx].match(/(\d+)/)[0]
        const entityVariantIdIdx = splitString.findIndex(str => str.includes("Variant"))
        const entityVariant = splitString[entityVariantIdIdx].match(/(\d+)/)[0]
        let entity = null
        if (otherModsLoaded.length > 0) { // Supported custom items
            entity = otherModsLoaded.includes("fiendfolio-reheated") ? entitiesFiendFolio.find(entity => entity.id.startsWith(`${entityId}.${entityVariant}`)) : null
        }
        if (!entity) entity = entities.find(entity => entity.id.startsWith(`${entityId}.${entityVariant}`))
        if (entity) return cloneFrom(entity)
        const logMessage = `Entity was not found. [log string : ${string} | split value : ID-${entityId}-${5} Variant-${entityVariant}-${6}]`
        console.log(logMessage)
        return null
    },
    getCharaterStats: (string) => {
        //Return character stats from RRTE mod converted to json
        try {
            const stats = JSON.parse(string.split(" ")[9])
            if (stats.KeyGhostData) stats.KeyGhostData = undefined
            return stats
        } catch (error) {
            log.error("Impossible to parse character datas and stats", string.split(" ")[9], error)
            return {}
        }
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
    getRoom: (string, ext, previousRoom) => {
        if (ext) {
            if (!previousRoom) return null
            const s = parseInt(string.split(" ")[9])
            const duration = Duration.fromObject({seconds:s})
            const thisRoomEnter = parseInt(string.split(" ")[11])
            const thisRoomLeave = parseInt(string.split(" ")[12])
            return {
                type: string.split(" ")[8],
                enterIgTime: {formatedTime: duration.toFormat('hh:mm:ss'), time: s},
                shape: string.split(" ")[10],
                doorsSlots: [{
                    thisRoomEnter: thisRoomEnter,
                    previousRoomLeave: thisRoomLeave,
                    linkedRoom: previousRoom.id
                }]
            }
        }
        const roomId = parseFloat(string.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0])
        const roomType = string.match(/\(([^\)]+\)*)\)/) ? string.match(/\(([^\)]+\)*)\)/)[1].replace("(copy)", "").toLowerCase().split(" ").join("_").trim() : "room"
        const roomEnterDate = DateTime.now().toSeconds()
        return {
            id: roomId,
            type: roomId === 1 ? "start_room" : roomType !== "" && roomType !== "new_room" ? roomType : "room",
            enterDate: roomEnterDate,
            enterIgTime: null,
            shape: null,
            doorsSlots: null
        }
    },
    getGameState: function(string) {
        //Return game save state from logs
        return string.split(" ")[4]
    },
    getPlayer: (string) => {
        //Return player from logs
        return string.split(" ")[string.split(" ").findIndex(value => value === "player") + 1]
    },
    getCollectible: (string, splitValue, otherModsLoaded, currentRoom) => {
        //Return matching collectible from logs
        const collectibleName = string.match(/\(([^\)]+\)*)\)/)[1] // Regex by Dylan aka lMiniD aka Odilon le crack
        const id = parseInt(string.split(" ")[splitValue])
        if (id < 0) { // Glitched items
            return {
                id: id,
                title: "Glitched item",
                itemType: "unknow type",
                category: "unknow category",
                type: "item",
                player: module.exports.getPlayer(string),
                room: currentRoom ? currentRoom.id : -1,
                removed: false
            }
        }
        if (otherModsLoaded.length > 0) { // Supported custom items
            let matchingCustomItem = otherModsLoaded.includes("fiendfolio-reheated") ? itemsFiendFolio.collectibles.find(collectible => collectible.title === collectibleName && otherModsLoaded.includes(collectible.category)) : null
            if (!matchingCustomItem) matchingCustomItem = itemsCustom.collectibles.find(collectible => collectible.title === collectibleName && otherModsLoaded.includes(collectible.category))
            if (matchingCustomItem && !matchingCustomItem.hidden) {
                return {
                    id: matchingCustomItem.itemID,
                    originalItemID: matchingCustomItem.originalItemID,
                    title: matchingCustomItem.title,
                    itemType: matchingCustomItem.itemType,
                    category: matchingCustomItem.category,
                    type: "item",
                    player: module.exports.getPlayer(string),
                    room: currentRoom ? currentRoom.id : -1,
                    gfx: matchingCustomItem.gfx,
                    removed: false,
                    custom: true
                }
            } else if (matchingCustomItem) return log.info(`Matching custom item "${collectibleName}" is hidden and was not added`)
        }
        const matchingItem = items.collectibles.find(collectible => collectible.itemID === id)
        if (matchingItem) { // Default items
            return {
                id: id,
                title: matchingItem.title,
                itemType: matchingItem.itemType,
                category: matchingItem.category,
                type: "item",
                player: module.exports.getPlayer(string),
                room: currentRoom ? currentRoom.id : -1,
                removed: false
            }
        }
        log.warn(`Item with id ${id} was not found [log string : ${string} | split value : ${splitValue}]`)
        return {
            id: id,
            title: collectibleName,
            itemType: "unknow type",
            category: "unknow category",
            type: "item",
            player: module.exports.getPlayer(string),
            room: currentRoom ? currentRoom.id : -1,
            removed: false,
            unknow: true
        }
    },
    getTrinket: (string, splitValue, currentRoom) => {
        //Return matching trinket from logs
        const goldenVar = 32768
        const smelted = string.includes("smelted") ? true : false
        const trinketName = string.match(/\(([^\)]+\)*)\)/)[1] // Regex by Dylan aka lMiniD aka Odilon le crack
        const id = parseInt(string.split(" ")[splitValue])
        const matchingTrinket = items.trinkets.find(trinket => trinket.trinketID === id)
        if (matchingTrinket) {
            return {
                id: id,
                title: matchingTrinket.title,
                category: matchingTrinket.category,
                type: "trinket",
                player: module.exports.getPlayer(string),
                room: currentRoom ? currentRoom.id : -1,
                removed: false,
                golden: false,
                smelted: smelted
            }
        }
        const matchingGoldenTrinket = items.trinkets.find(trinket => trinket.trinketID + goldenVar === id)
        if (matchingGoldenTrinket) {
            return {
                id: id,
                title: matchingGoldenTrinket.title,
                category: matchingGoldenTrinket.category,
                type: "trinket",
                player: module.exports.getPlayer(string),
                room: currentRoom ? currentRoom.id : -1,
                removed: false,
                golden: true,
                smelted: smelted
            }
        }
        log.warn(`Trinket with id ${id} was not found [log string : ${string} | split value : ${splitValue}]`)
        return {
            id: id,
            title: trinketName,
            category: "unknow category",
            type: "trinket",
            player: module.exports.getPlayer(string),
            room: currentRoom ? currentRoom.id : -1,
            removed: false,
            smelted: smelted,
            unknow: true
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
    removeRun: async (runId, runs, runsJsonPath, window, windowTracker, saveIntrash, trash, trashJsonPath) => {
        //From user action, if the runid is found remove a run on frontend and backend
        console.log(`Removing run : ${runId}...`)
        const runsItems = await runs
        const matchingRun = runsItems.find({id: runId}).value()
        console.log("matchingRun", matchingRun)
        if (matchingRun) {
            if (saveIntrash) {
                syncApp(window,{trigger: "add run to trash", run: matchingRun})
                if(windowTracker) syncApp(windowTracker,{trigger: "add run to trash", run: matchingRun})
                trash.push(matchingRun)
                module.exports.saveFileToDisk(trashJsonPath, JSON.stringify(trash))
                console.log(`Run : ${runId} was save in trash bin`)
            }
            syncApp(window,{trigger: "remove run", run: matchingRun.id}) //Remove matching run on frontend
            if(windowTracker) { syncApp(windowTracker,{trigger: "remove run", run: matchingRun.id}) }
            await runsItems.remove({id: matchingRun.id}).write()
            console.log(`Run : ${runId} was removed`)
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
    addRuns: async (runsToAdd, window, windowTracker, runs, runsJsonPath) => {
        const addedRunsId = []
        const addedRuns = []
        const runsItems = await runs
        runsToAdd.forEach(run => {
            addedRunsId.push(run.id)
            addedRuns.push(run)
            syncApp(window,{trigger: "create run", run: run})
            if(windowTracker) { syncApp(windowTracker,{trigger: "create run", runs: run}) }
        })
        await runsItems.push(...addedRuns).write()
        console.log(`Runs : ${addedRunsId} was added`)
        return true
    },
    restoreRunsFromTrash: async (runsToRestore, runs, runsJsonPath, win, winTracker, trash, trashJsonPath) => {
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
            await module.exports.addRuns(restoredRunsItems, win, winTracker, runs, runsJsonPath)
            return true
        }
        return false
    }
}
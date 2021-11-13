const fs = require('fs')
const { app } = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
const { getOptions, getModPath, getCharater, getEntity, getCharaterStats, getSeed, getFloor, getGameState, getCollectible, getTrinket, getRunEnd, getRunDuration, getRealRunDuration, saveFileToDisk, removeRun, removeRunsFromTrash, restoreRunsFromTrash } = require('./helpers')
const { fileResolve } = require('../tools/fileSystem')
const { isRunning, findLastIndex } = require('../tools/methods')
const { syncApp } = require('../helpers/sync')
const configTemplate = require('../jsons/configTemplate.json')
const dataFolder = app.getPath("userData")
const moment = require('moment')
const log = require('electron-log')
const splitFormat = /[\r\n]+/g
const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`
const repentanceLogsFile = `${repentanceFolderPath}\\log.txt`
const repentanceOptionsFile = `${repentanceFolderPath}\\options.ini`
const runsJsonPath = `${dataFolder}\\runs.json`
const trashJsonPath = `${dataFolder}\\trash.json`
const configJsonPath = `${dataFolder}\\config.json`
let watchingLogs, config, runs, trash, repentanceLogs, repentanceOptions, currentRun, continueRun, newRun, currentRunInit, currentCharater, currentCharater2, currentFloor, currentCurse, currentGameState, currentGameMode, logsLastReadLines, win, winTracker
let repentanceIsLaunched = false
let inRun = false
let firstInit = false
// let backToMenu = false
let extendedSaveMode = false //This variable can be used later to save more informations (Stats, bombs, coins, time...), with the help of a mod or game memory reading
let otherModLoaded = false

function checkPreviousRuns() {
    let deleted = false
    let sameGameStateAlreadyChecked = false
    const repentanceLogs = fs.readFileSync(repentanceLogsFile, "utf8")
    const repentanceLogsArray = repentanceLogs.split(splitFormat)
    let seedsList = repentanceLogsArray.filter(v=>v.includes("RNG Start Seed"))
    const currentRunIndex = repentanceLogsArray.findIndex(line => line === seedsList[seedsList.length - 1])
    if ((runs[1] != undefined && runs[1].runEnd.date === null && runs[1].toRemove.checkedByUser === false)) {
        console.log("Unfinished directly previous run found, check if the current run was generated by a direct reset...")
        if (repentanceLogsArray[currentRunIndex - 2].includes("CPU time")) {
            console.log("Current run was generated from a direct reset, remove previous run")
            syncApp(win,{trigger: "remove run", run: runs[1].id})
            if(winTracker) syncApp(winTracker,{trigger: "remove run", run: runs[1].id})
            runs.splice(1, 1)
            currentCharater = null
            currentFloor = null
            currentCurse = null
            deleted = true
        } else console.log("Run was not directly generated, check if same game state...")
        if (!deleted && runs[1].gameState === currentGameState) {
            console.log("Current run was generated over an unfinished run on the same game state, ask user if he wants to remove it")
            runs[1].toRemove.status = true
            sameGameStateAlreadyChecked = true
            syncApp(win,{trigger: "ask remove run", run: runs[1]})
        } else console.log("Previous run is not from the same game state")
        if (!sameGameStateAlreadyChecked) {
            console.log("Check saved runs matching the current game state...")
            let unfinishedRuns = runs.filter(run => {
                if(run.id != runs[0].id && run.runEnd.date === null && run.gameState === currentGameState && run.toRemove.checkedByUser === false) return run
            })
            if (unfinishedRuns != undefined && unfinishedRuns.length > 0) {
                console.log("Unfinished runs found on the current game state, ask user if he wants to remove them")
                unfinishedRuns.forEach(run => run.toRemove.status = true)
                syncApp(win,{trigger: "ask remove run", run: unfinishedRuns})
            }
        }
    }
}

function isSameRun(seed) {
    if (!inRun) inRun = true
    return runs.filter(run => run.runEnd.date === null).find(function(run, i) {
        if (currentRun.id) {
            console.log(`compare run ${run.seed} id with current ${seed} id : compare run ${run.id} with current ${currentRun.id}`)
            if (currentRun.id === run.id) {
                return true
            }
        } else {
            console.log(`compare run ${run.seed} with current ${seed} : [${run.gameState} <-> ${currentGameState}]`)
            if (
                run.seed === seed &&
                run.gameState === currentGameState
                ) {
                    console.log("Possible same run")
                    return true
                }
            return false
        }
    })
}

function collectiblesManager(sameRun, collectible, status) {
    if (!sameRun.floors[sameRun.floors.length - 1]) return

    const playerContext = collectible.player

    // add itemsCollected key on last floor if doesn't exist
    if (!sameRun.floors[sameRun.floors.length - 1].itemsCollected) sameRun.floors[sameRun.floors.length - 1].itemsCollected = []

    // add activables key to context player if doesn't exist and if current collectible is an activable
    if (collectible.itemType === "Active" && !sameRun.characters[playerContext].activables) sameRun.characters[playerContext].activables = []

    // return a filtered array with matching item
    const foundItem = sameRun.floors.map((floor, index) => {
        const itemIndex = floor.itemsCollected ? floor.itemsCollected.findIndex(item => item.id === collectible.id) : -1
        return {
            floorIndex: index,
            itemIndex: itemIndex,
            itemPlayer: itemIndex > -1 ? floor.itemsCollected[itemIndex].player : null,
            itemType: itemIndex > -1 ? floor.itemsCollected[itemIndex].itemType : null,
            itemRemoved: itemIndex > -1 ? floor.itemsCollected[itemIndex].removed : null,
            itemsNumber: itemIndex > -1 ? floor.itemsCollected[itemIndex].number : 0
        }
    }).filter(item => item.itemIndex > -1)

    // check if at least one item is matching
    if (foundItem.length > 0) {
        const lastFoundItem = foundItem[foundItem.length - 1]
        switch (status) {
            case 'add':
                if (lastFoundItem.itemRemoved === true) {
                    sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex].number = 1
                    sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex].removed = false
                } else {
                    sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex].number += 1
                }
                if (lastFoundItem.itemType === "Active") {
                    sameRun.characters[playerContext].activables.push(sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex])
                }
            case 'remove':
                if (lastFoundItem.itemRemoved === false && lastFoundItem.itemsNumber > 0) {
                    if(lastFoundItem.itemsNumber === 1) {
                        sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex].number = 0
                        sameRun.floors[lastFoundItem.floorIndex].itemsCollected[lastFoundItem.itemIndex].removed = true
                    } else if (lastFoundItem.itemsNumber > 1) {
                        sameRun.floors[foundItem[foundItem.length - 1].floorIndex].itemsCollected[foundItem[foundItem.length - 1].itemIndex].number += -1
                    }
                    if (lastFoundItem.itemType === "Active") {
                        const itemToRemoveIndex = sameRun.characters[playerContext].activables.findIndex(item => item.id === collectible.id)
                        sameRun.characters[playerContext].activables.splice(itemToRemoveIndex, 1)
                    }
                }
        }
    }

    // if no item found, create a new one if the status is on "add"
    else if (status === 'add') {
        collectible.number = 1
        sameRun.floors[sameRun.floors.length - 1].itemsCollected.push(collectible)
        if (collectible.itemType === "Active") sameRun.characters[playerContext].activables.push(collectible)
    }
}

function entitiesManager(sameRun, entity) {
    entity.number = 1
    const sameRunLastFloor = sameRun.floors[sameRun.floors.length - 1]

    // add entities key on last floor if doesn't exist
    if (!sameRunLastFloor.entities) sameRunLastFloor.entities = []

    const sameRunSameEntity = sameRunLastFloor.entities[sameRunLastFloor.entities.findIndex(ent => ent.name === entity.name)]

    if (!sameRunSameEntity) sameRunLastFloor.entities.push(entity)
    else sameRunSameEntity.number += 1
}

function updateOrCreateRun(params = {}) {
    if (currentRun === null) return console.warn("Current seed empty !")
    if (!currentRunInit) return console.warn("Current seed is not init !")
    const sameRun = isSameRun(currentRun.seed)
    if (sameRun) {
        console.log('Seed exists, check...')
        if(sameRun.runEnd.date === null) {
            console.log('Update current run...')
            if(currentRun.id === undefined) currentRun.id = sameRun.id
            switch (params.trigger) {
                case 'level init':
                    sameRun.floors.push(currentFloor)
                    break
                case 'game mode':
                    if (!sameRun.gameMode) {
                        const gameMode = params.log.includes("copy") ? "greed" : "normal"
                        sameRun.gameMode = gameMode
                    }
                    currentGameMode = sameRun.gameMode
                    break
                case 'init other player':
                    if (params.character && !params.character.ignore) sameRun.characters.push(params.character)
                    break
                case 'spawn entity':
                    if(params.entity) {
                        console.log("Entity : ",params.entity)
                        entitiesManager(sameRun, params.entity)
                    }
                    break
                case 'adding collectible':
                    if (params.collectible) collectiblesManager(sameRun, params.collectible, "add")
                    break
                case 'removing collectible':
                    if (params.collectible) collectiblesManager(sameRun, params.collectible, "remove")
                    break
                case 'run end':
                    if (sameRun.runEnd.date === null) {
                        const runEndInfo = getRunEnd(params.log)
                        sameRun.runEnd.date = !extendedSaveMode ? runEndInfo.date : null
                        sameRun.runEnd.win = runEndInfo.win
                        sameRun.runEnd.killedBy = runEndInfo.killedBy
                        sameRun.runEnd.spawnedBy = runEndInfo.spawnedBy
                        sameRun.runEnd.damageFlags = runEndInfo.damageFlags
                        sameRun.runDuration = getRunDuration(moment.unix(runEndInfo.date), moment.unix(sameRun.runStart))
                        if (!sameRun.runEnd.win) sameRun.floors[sameRun.floors.length - 1].death = true
                        log.info(`Run ${sameRun.id} is over. [win : ${runEndInfo.win}]`)
                    }
                    break
                case 'run end ext':
                    sameRun.runDuration = params.runDuration ? params.runDuration : sameRun.runDuration
                    sameRun.runEnd.date = moment().unix()
                break
                case 'player updated':
                    const playerStats = params.stats
                    // Special case where player control 2 characters with différent stats like Jacob & Essau (Essau is subtype 20)
                    if(playerStats.infos.subtype === 20) sameRun.characters[playerStats.infos.index].statsSecondary = playerStats
                    // Default case
                    else sameRun.characters[playerStats.infos.index].stats = playerStats
                    if(!sameRun.extendedSaveMode) sameRun.extendedSaveMode = true
                    break
                default:
                    return false
            }
            sameRun.runUpdate = moment().unix()
            runs[sameRun.id] = sameRun
            syncApp(win,{trigger: "update run", run: sameRun})
            if(winTracker) syncApp(winTracker,{trigger: "update run", run: sameRun})
        } else {
            console.log('Run is over')
        }
    }
    else {
        console.log('Create a run...')
        if(!currentFloor) {
            const errorMessage = "Can't generate a run if the run is not new and was not started with the app launched ! Please start a new run."
            console.log(errorMessage)
            log.error(errorMessage)
            return
        }
        currentRun.id = `${currentRun.seed} ${moment().unix()}`
        const run = {
            id: currentRun.id,
            customName: '',
            videoLink: '',
            videoHighlights: [],
            tags: [],
            seed: currentRun.seed,
            gameState: currentGameState,
            gameMode: currentGameMode,
            runStart: moment().unix(),
            runUpdate: moment().unix(),
            runUserUpdate: null,
            runEnd: {
                date: null,
                win: null,
                killedBy: null,
                spawnedBy: null,
                damageFlags: null
            },
            runDuration: '',
            characters: [currentCharater],
            floors: [currentFloor],
            extendedSaveMode: extendedSaveMode,
            otherModLoaded: otherModLoaded,
            gameOptions: repentanceOptions,
            toRemove: {
                status: false,
                checkedByUser: false
            },
            backup: {
                status: false,
                date: null
            }
        }
        console.log(`Run ${run.id} created`)
        log.info(`Run ${run.id} created`)
        runs.unshift(run)
        syncApp(win,{trigger: "create run", run: run})
        if(winTracker) syncApp(winTracker,{trigger: "create run", run: run})
        console.log("New run generated checking previous runs...")
        checkPreviousRuns()
    }
}

//Parse Repentance logs file
function parseLogs(newLogs, logArray) {
    newLogs.forEach(log => {
        if(log.includes("Loading GameState")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            currentGameState = getGameState(log)
        }
        if(log.includes("Initialized player")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            if(!currentCharater) currentCharater = getCharater(log)
            else if (currentRunInit) {
                updateOrCreateRun({trigger: "init other player", character: getCharater(log)})
            }
        }
        if(log.includes("Start Seed")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            currentRunInit = false
            currentCharater = null
            currentFloor = null
            currentCurse = null
            currentGameMode = null
            currentRun = getSeed(log)
            continueRun = log.includes("Continue")
            newRun = log.includes("New")
        }
        if(log.includes("Level::Init")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            currentCurse = logArray[logArray.lastIndexOf(log) + 1].includes("Curse") ? logArray[logArray.lastIndexOf(log) + 1].split(" ").slice(2).join(" ") : null
            currentFloor = getFloor(log)
            if (currentCurse) currentFloor.curse = currentCurse
            updateOrCreateRun({trigger: "level init"})
        }
        if(log.includes("generated rooms")) {
            if (!currentRunInit) {
                console.log("\x1b[35m", log, "\x1b[0m")
                currentRunInit = true
                updateOrCreateRun({trigger: "generated rooms"})
            }
        }
        if(log.includes("Spawn Entity")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "spawn entity", entity: getEntity(log)})
        }
        if(log.split(' ')[2] === "Room") {
            console.log("\x1b[35m", log, "\x1b[0m")
            if (!currentGameMode) {
                updateOrCreateRun({trigger: "game mode", log: log})
            }
        }
        if(log.includes("Adding collectible")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "adding collectible", collectible: getCollectible(log, 4)})
            saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
        if(log.includes("Removing voided collectible") || log.includes("Removing collectible")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "removing collectible", collectible: getCollectible(log, log.includes("Removing voided collectible") ? 5 : 4)})
            saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
        if(log.includes("Adding trinket")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            //updateOrCreateRun({trigger: "adding trinket", trinket: getTrinket(log, 4)})
            //saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
        if(log.includes("Adding smelted trinket")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            //updateOrCreateRun({trigger: "adding smelted trinket", trinket: getTrinket(log, 4)})
            //saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
        if(log.includes("Game Over") || (log.includes("playing cutscene") && !log.includes("Intro") && !log.includes("Credits") && !log.includes("Dogma"))) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "run end", log: log})
            saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
        if(log.includes("Menu Game Init")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            inRun = false
            backToMenu = true
        }
        //If "Repentance Run Tracker Extended" mod is loaded, parse extra logs lines
        if(log.includes("Lua is resetting!")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            extendedSaveMode = false
            otherModLoaded = false
        }
        if(log.includes("Running Lua Script") && !log.includes("resources/scripts/")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            const modPath = getModPath(log)
            const field = config.filter(field => field.id === "isaacModFolderPath")[0]
            if (!field || field.value != modPath) {
                if (!field) {
                    let isaacModFolderPathTemplate = configTemplate.filter(field => field.id === "isaacModFolderPath")[0]
                    isaacModFolderPathTemplate.value = modPath
                    config.push(isaacModFolderPathTemplate)
                }
                else if (field.value != modPath) field.value = modPath
                saveFileToDisk(configJsonPath, JSON.stringify(config))
            }
            if (log.includes("/mods/repentance_run_tracker_extended")) {
                extendedSaveMode = true
            } else {
                otherModLoaded = true
                if (currentRun && currentRun.otherModLoaded === false) currentRun.otherModLoaded = true
            }
        }
        if(log.includes("[RRTEEXTENDLOGS] Player updated")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "player updated", stats: getCharaterStats(log)})
            if (!extendedSaveMode) extendedSaveMode = true
        }
        if(log.includes("[RRTEEXTENDLOGS] Run End")) {
            console.log("\x1b[35m", log, "\x1b[0m")
            updateOrCreateRun({trigger: "run end ext", runDuration: log.includes("[time]") ? getRealRunDuration(log) : null})
            if (!extendedSaveMode) extendedSaveMode = true
            saveFileToDisk(runsJsonPath, JSON.stringify(runs))
        }
    })
}

setInterval(() => {
    // avoid writing errors if multiple writings happens
    if (watchingLogs && runsJsonPath && runs) saveFileToDisk(runsJsonPath, JSON.stringify(runs))
}, 5000);

function watchRepentanceLogs() {
    fs.watchFile(repentanceLogsFile,{interval: 500},
        () => {
            const log = fs.readFileSync(repentanceLogsFile, "utf8")
            const logArray = log.split(splitFormat)
            const lines = logArray.filter(v=>v!='').length
            const diff = lines - logsLastReadLines
            if (diff <= 0) return
            const newLogs = logArray.filter(v=>v!='').splice(- diff)
            parseLogs(newLogs, logArray)
            //console.log(diff,logsLastReadLines,lines)
            logsLastReadLines = lines
        }
    )
}

function unWatchRepentanceLogs() {
    fs.unwatchFile(repentanceLogsFile)
}

async function init() {
    if (!runs) {
        const loadRuns = await fileResolve(dataFolder, 'runs.json', '[]')
        runs = JSON.parse(fs.readFileSync(loadRuns))
    }
    if (!trash) {
        const loadTrash = await fileResolve(dataFolder, 'trash.json', '[]')
        trash = JSON.parse(fs.readFileSync(loadTrash))
    }
    currentRunInit = false //Lock update possibilities until a run is launched
    repentanceLogs = fs.readFileSync(repentanceLogsFile, "utf8") //Set "repentanceLogs" variable filled with current Repentance logs
    repentanceLogsArray = repentanceLogs.split(splitFormat) //Split line by line
    extendedSaveMode = repentanceLogsArray.filter(v=>v.includes("RRTEEXTENDLOGS")).length > 0 //Check if the "Repentance Run Tracker Extended" mod was loaded (more logs infos)
    let gameStatesList = repentanceLogsArray.filter(v=>v.includes("Loading GameState"))
    currentGameState = gameStatesList[gameStatesList.length - 1] != undefined ? getGameState(gameStatesList[gameStatesList.length - 1]) : null
    let seedsList = repentanceLogsArray.filter(v=>v.includes("RNG Start Seed"))
    // let gameInit = repentanceLogsArray.filter(v=>v.includes("Menu Game Init"))
    let isShutdown = repentanceLogsArray.filter(v=>v.includes("Isaac has shut down successfully")).length > 0
    if (seedsList[seedsList.length - 1] != undefined && !isShutdown) {
        console.log("Seeds exist in current logs, checking...")
        const lastLogs = repentanceLogsArray.slice(findLastIndex(repentanceLogsArray, seedsList[seedsList.length - 1]), repentanceLogsArray.length - 1)
        inRun = lastLogs.filter(v=>v.includes("Menu Game Init")).length < 1 && lastLogs.filter(v=>v.includes("Game Over")).length < 1 && lastLogs.filter(v=>v.includes("playing cutscene")).length < 1
        console.log("Currently in run :", inRun)
        if (inRun) {
            parseLogs(lastLogs.filter(v=>v.includes("Start Seed") || v.includes("generated rooms")), repentanceLogsArray)
        }
        // else {
        //     const lastLogsOver = repentanceLogsArray.slice(findLastIndex(repentanceLogsArray, gameInit[gameInit.length - 1]), repentanceLogsArray.length - 1)
        //     parseLogs(lastLogsOver, repentanceLogsArray)
        // }
    } else if (!isShutdown) {
        parseLogs(repentanceLogsArray, repentanceLogsArray)
    }
    
    logsLastReadLines = repentanceLogsArray.filter(v=>v!='').length
    if(!firstInit) firstInit = true
}


ipcMain.on('IS_APP_READY', (event, payload) => {
    syncApp(win,{trigger: "logs watch status", watching: watchingLogs})
})

//Frontend event, trigger if a run is edited by user
ipcMain.on('USER_UPDATE_RUN', async (event, payload) => {
    runs.find(run => run.id === payload.id)[payload.property] = payload.value
    saveFileToDisk(runsJsonPath, JSON.stringify(runs))
})

//Frontend event, trigger if a run is removed by user
ipcMain.on('USER_REMOVE_RUN', (event, payload) => {
    console.log(`User wants to remove run : ${payload}`)
    removeRun(payload, runs, runsJsonPath, win, winTracker, true, trash, trashJsonPath)
})

ipcMain.on('USER_REMOVE_RUNS_FROM_TRASH', (event, payload) => {
    console.log(`User wants to remove runs from trash : ${payload}`)
    removeRunsFromTrash(payload, win, winTracker, trash, trashJsonPath)
})

ipcMain.on('USER_RESTORE_RUNS_FROM_TRASH', (event, payload) => {
    console.log(`User wants to restore runs from trash : ${payload}`)
    restoreRunsFromTrash(payload, runs, runsJsonPath, win, winTracker, trash, trashJsonPath)
})

ipcMain.on('USER_EMPTY_TRASH', (event) => {
    console.log(`User wants to empty trash`)
    trash = []
    syncApp(win,{trigger: "empty trash"})
    if(winTracker) syncApp(winTracker,{trigger: "empty trash"})
    saveFileToDisk(trashJsonPath, JSON.stringify(trash))
})

module.exports = {
    startLogsWatch: function(window, conf, rns, trsh) {
        win = window
        config = conf
        runs = rns
        trash = trsh
        let wait = false
        setInterval(() => {
            if(!wait) {
                wait = true
                isRunning('isaac-ng.exe', (status) => {
                    if (!status && repentanceIsLaunched) {
                        console.log("unwatch logs")
                        watchingLogs = false
                        repentanceIsLaunched = false
                        unWatchRepentanceLogs()
                        saveFileToDisk(runsJsonPath, JSON.stringify(runs))
                        syncApp(win,{trigger: "logs watch status", watching: false})
                        wait = false
                    } else if (status && !repentanceIsLaunched) {
                        console.log("Waiting for logs...")
                        repentanceIsLaunched = true
                        setTimeout(() => {
                            console.log("Watching logs")
                            watchingLogs = true
                            watchRepentanceLogs()
                            init()
                            repentanceOptions = getOptions(repentanceOptionsFile, splitFormat)
                            console.log(repentanceOptions)
                            syncApp(win,{trigger: "logs watch status", watching: true})
                            wait = false
                        }, 10000)
                    } else {
                        wait = false
                    }
                })
            }
        }, 1000)
    },
    itemTrackerWindowState: function (window) {
        winTracker = window
    }
}
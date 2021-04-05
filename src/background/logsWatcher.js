const fs = require('fs')
const path = require('path')
const { ipcMain } = require('electron')
const {isRunning, cloneFrom, findLastIndex } = require('./tools/methods')
const syncApp = require('./sync').syncApp
const dataFolder = path.resolve(process.cwd(), 'datas')
const moment = require('moment')
const characters = require('./jsons/characters.json')
const items = require('./jsons/items.json')
const floors = require('./jsons/floors.json')
const splitLines = /[\r\n]+/g
const repentanceFolderPath = `${process.env.USERPROFILE}\\Documents\\My Games\\Binding of Isaac Repentance`
const repentanceLogsFile = `${repentanceFolderPath}\\log.txt`
const runsJsonPath = `${dataFolder}\\runs.json`
let runs = JSON.parse(fs.readFileSync(runsJsonPath))
let repentanceLogs, currentRun, currentRunInit, currentCharater, currentFloor, currentCurse, currentGameState, logsLastReadLines, win
let repentanceIsLaunched = false
let inRun = false
// let backToMenu = false
// let firstInit = false

function getCharater(string) {
    return cloneFrom(characters.find(character => character.id === string.split(" ")[9]))
}

function getSeed(string) {
    return {
        seed: `${string.split(" ")[5]} ${string.split(" ")[6]}`
    }
}

function getFloor(string) {
    return cloneFrom(floors.stages.find(floor => floor.id === `${string.split(" ")[4].match(/\d+/)[0]}.${string.split(" ")[6]}`))
}

function getGameState(string) {
    return string.split(" ")[4]
}

function getCollectible(string) {
    return {
        id: parseInt(string.split(" ")[4]),
        title: items.collectibles.find(collectible => collectible.itemID === parseInt(string.split(" ")[4])).title,
        itemType: items.collectibles.find(collectible => collectible.itemID === parseInt(string.split(" ")[4])).itemType,
        category: items.collectibles.find(collectible => collectible.itemID === parseInt(string.split(" ")[4])).category,
        removed: false
    }
}

function getRunEnd(string) {
    return {
        date: moment().unix(),
        win: string.includes("Game Over") ? false : true,
        killedBy: string.includes("Game Over") ? string.split(" ")[6].slice(1,-1) : null,
        spawnedBy: string.includes("Game Over") ? string.split(" ")[9].slice(1,-1) : null,
        damageFlags: string.includes("Game Over") ? string.split(" ")[12].slice(1,-1) : null
    }
}

function checkPreviousRuns() {
    let deleted = false
    let sameGameStateAlreadyChecked = false
    const repentanceLogs = fs.readFileSync(repentanceLogsFile, "utf8")
    const repentanceLogsArray = repentanceLogs.split(splitLines)
    let seedsList = repentanceLogsArray.filter(v=>v.includes("RNG Start Seed"))
    const currentRunIndex = repentanceLogsArray.findIndex(line => line === seedsList[seedsList.length - 1])
    if ((runs[1] != undefined && runs[1].runEnd.date === null)) {
        console.log("Unfinished directly previous run found, check if the current run was generated by a direct reset...")
        if (repentanceLogsArray[currentRunIndex - 2].includes("CPU time")) {
            console.log("Current run was generated from a direct reset, remove previous run")
            syncApp(win,{trigger: "remove run", run: runs[1]})
            runs.splice(1, 1)
            deleted = true
        } else console.log("Run was not directly generated, check if same game state...")
        if (!deleted && runs[1].gameState === currentGameState) {
            console.log("Current run was generated over an unfinished run on the same game state, ask user if he wants to remove it")
            syncApp(win,{trigger: "ask remove run", run: [runs[1]]})
            sameGameStateAlreadyChecked = true
        } else console.log("Previous run is not from the same game state")
        if (!sameGameStateAlreadyChecked) {
            console.log("Check saved runs matching the current game state...")
            let unfinishedRuns = runs.filter(run => {
                if(run.id != runs[0].id && run.runEnd.date === null && run.gameState === currentGameState) return run
            })
            console.log("UNFINISHED RUNS :",unfinishedRuns)
            if (unfinishedRuns != undefined && unfinishedRuns.length > 0) {
                console.log("Unfinished runs found on the current game state, ask user if he wants to remove them")
                syncApp(win,{trigger: "ask remove run", run: unfinishedRuns})
            }
        }
    }
}

function isSameRun(seed) {
    if (!inRun) inRun = true
    //if (!firstInit) firstInit = true
    //if (backToMenu) backToMenu = false
    return runs.find(function(run, i) {
        console.log(`compare run ${run.seed} with current ${seed} : [${run.gameState} <-> ${currentGameState}] -> [${run.floors[0].name} <-> ${currentFloor.name}] -> [${run.floors[0].curse} <-> ${currentFloor.curse}] -> [compare ${run.character.name} <-> ${currentCharater.name}], run end: ${run.runEnd.date}`)
        if (
            run.runEnd.date === null &&
            run.seed === seed &&
            run.gameState === currentGameState &&
            run.floors[0].name === currentFloor.name &&
            run.floors[0].curse === currentFloor.curse &&
            run.character.name === currentCharater.name
            ) {
                console.log("Same run")
                return true
            }
        return false
    })
}

async function updateRun(params = {}) { 
    if (currentRun === null) return console.warn("Current seed empty !")
    if (!currentRunInit) return console.warn("Current seed is not init !")
    const sameRun = isSameRun(currentRun.seed)
    if (sameRun) {
        console.log('Seed exists, check...')
        if(sameRun.runEnd.date === null) {
            console.log('Update current run...')
            switch (params.trigger) {
                case 'level init':
                    sameRun.floors.push(currentFloor)
                    break
                case 'adding collectible':
                    if (sameRun.floors[sameRun.floors.length - 1].itemsCollected === undefined) {
                        sameRun.floors[sameRun.floors.length - 1].itemsCollected = []
                        sameRun.floors[sameRun.floors.length - 1].itemsCollected.push(params.collectible)
                    } 
                    else {
                        let itemExist = sameRun.floors[sameRun.floors.length - 1].itemsCollected.findIndex(item => item.id === params.collectible.id)
                        if (itemExist != -1) sameRun.floors[sameRun.floors.length - 1].itemsCollected[itemExist].removed = false
                        else if (itemExist == -1) sameRun.floors[sameRun.floors.length - 1].itemsCollected.push(params.collectible)
                    }
                    break
                case 'removing collectible':
                    let itemExist = sameRun.floors[sameRun.floors.length - 1].itemsCollected.findIndex(item => item.id === params.collectible)
                    console.log(itemExist)
                    if (itemExist != -1) sameRun.floors[sameRun.floors.length - 1].itemsCollected[itemExist].removed = true
                    // sameRun.floors[sameRun.floors.length - 1].itemsCollected[sameRun.floors[sameRun.floors.length - 1].itemsCollected.findIndex(item => {item.id === params.collectible;console.log(item.id, params.collectible)})].removed = true
                    break
                case 'run end':
                    if (sameRun.runEnd.date === null) {
                        const runEnd = getRunEnd(params.log)
                        sameRun.runEnd.date = runEnd.date
                        sameRun.runEnd.win = runEnd.win
                        sameRun.runEnd.killedBy = runEnd.killedBy
                        sameRun.runEnd.spawnedBy = runEnd.spawnedBy
                        sameRun.runEnd.damageFlags = runEnd.damageFlags
                        if (!sameRun.runEnd.win) sameRun.floors[sameRun.floors.length - 1].death = true
                    }
                    break
                default:
                    return false
            }
            sameRun.runUpdate = moment().unix()
            runs[sameRun.id] = sameRun
            syncApp(win,{trigger: "update run", run: sameRun})
        } else {
            console.log('Run is over')
        }
    }

    else {
        console.log('Create a run...')
        const run = {
            id:`${currentRun.seed} ${moment().unix()}`,
            customName: null,
            seed: currentRun.seed,
            gameState: currentGameState,
            runStart: moment().unix(),
            runUpdate: moment().unix(),
            runEnd: {
                date: null,
                win: null,
                killedBy: null,
                spawnedBy: null,
                damageFlags: null
            },
            character: currentCharater,
            floors: [currentFloor]
        }
        console.log(run)
        runs.unshift(run)
        syncApp(win,{trigger: "create run", run: run})
        console.log("New run generated checking previous runs...")
        checkPreviousRuns()
    }
}

function parseLogs(newLogs, logArray) {
    newLogs.forEach(log => {
        if(log.includes("Loading GameState")) {
            console.log(log)
            currentGameState = getGameState(log)
        }
        if(log.includes("Initialized player")) {
            console.log(log)
            currentCharater = getCharater(log)
        }
        if(log.includes("RNG Start Seed")) {
            console.log(log)
            currentRunInit = false
            currentRun = getSeed(log)
        }
        if(log.includes("Level::Init")) {
            console.log(log)
            currentCurse = logArray[logArray.lastIndexOf(log) + 1].includes("Curse") ? logArray[logArray.lastIndexOf(log) + 1].split(" ").slice(2).join(" ") : null
            currentFloor = getFloor(log)
            if (currentCurse != null) currentFloor.curse = currentCurse
            updateRun({trigger: "level init"})
        }
        if(log.includes("generated rooms")) {
            if (!currentRunInit) {
                console.log(log)
                currentRunInit = true
                updateRun({trigger: "generated rooms"})
            }
        }
        if(log.includes("Adding collectible")) {
            console.log(log)
            updateRun({trigger: "adding collectible", collectible: getCollectible(log)})
            fs.writeFile(runsJsonPath, JSON.stringify(runs), 'utf8', (err) => {if (err) throw err})
        }
        if(log.includes("Removing voided collectible")) {
            console.log(log)
            updateRun({trigger: "removing collectible", collectible: parseInt(log.split(" ")[5])})
            fs.writeFile(runsJsonPath, JSON.stringify(runs), 'utf8', (err) => {if (err) throw err})
        }
        if(log.includes("Game Over") || (log.includes("playing cutscene") && !log.includes("Intro") && !log.includes("Credits") && !log.includes("Dogma"))) {
            console.log(log)
            updateRun({trigger: "run end", log: log})
            currentRunInit = false
            currentRun = null
            currentCharater = null
            currentFloor = null
            currentCurse = null
            fs.writeFile(runsJsonPath, JSON.stringify(runs), 'utf8', (err) => {if (err) throw err})
        }
        if(log.includes("Menu Game Init")) {
            console.log(log)
            inRun = false
            //backToMenu = true
            currentRunInit = false
            currentRun = null
            currentCharater = null
            currentFloor = null
            currentCurse = null
        }
    })
}

function watchRepentanceLogs() {
    fs.watchFile(repentanceLogsFile,{interval: 500},
        () => {
            const log = fs.readFileSync(repentanceLogsFile, "utf8")
            const logArray = log.split(splitLines)
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

function init() {
    currentRunInit = false
    repentanceLogs = fs.readFileSync(repentanceLogsFile, "utf8")
    repentanceLogsArray = repentanceLogs.split(splitLines)
    let gameStatesList = repentanceLogsArray.filter(v=>v.includes("Loading GameState"))
    currentGameState = gameStatesList[gameStatesList.length - 1] != undefined ? getGameState(gameStatesList[gameStatesList.length - 1]) : null
    let seedsList = repentanceLogsArray.filter(v=>v.includes("RNG Start Seed"))
    if (seedsList[seedsList.length - 1] != undefined) {
        console.log("Seeds exist in current logs, checking...")
        const lastLogs = repentanceLogsArray.slice(findLastIndex(repentanceLogsArray, seedsList[seedsList.length - 1]), repentanceLogsArray.length - 1)
        console.log(lastLogs)
        inRun = lastLogs.filter(v=>v.includes("Menu Game Init")).length < 1 && lastLogs.filter(v=>v.includes("Game Over")).length < 1 && lastLogs.filter(v=>v.includes("playing cutscene")).length < 1
        console.log("Currently in run :", inRun)
        if (inRun) {
            parseLogs(lastLogs, repentanceLogsArray)
            // const checkRun = isSameRun(getSeed(seedsList[seedsList.length - 1]).seed)
            // if (checkRun) currentRun = {seed: checkRun.seed, runId: checkRun.id }
        }
    }
    
    logsLastReadLines = repentanceLogsArray.filter(v=>v!='').length
    
    //console.log('init values : ', currentRun, currentCharater, currentFloor)
}

ipcMain.on('USER_EDIT_RUN', (event, payload) => {
    console.log(payload)
})

ipcMain.on('USER_REMOVE_RUN', (event, payload) => {
    console.log(payload)
})

module.exports = {
    startLogsWatch: function(window) {
        win = window
        setInterval(() => {
            isRunning('isaac-ng.exe', (status) => {
                if (!status && repentanceIsLaunched) {
                    console.log("unwatch logs")
                    repentanceIsLaunched = false
                    unWatchRepentanceLogs()
                    syncApp(win,{trigger: "logs watch status", watching: false})
                } else if (status && !repentanceIsLaunched) {
                    console.log("Waiting for logs...")
                    repentanceIsLaunched = true
                    setTimeout(() => {
                        console.log("Watching logs")
                        init()
                        watchRepentanceLogs()
                        syncApp(win,{trigger: "logs watch status", watching: true})
                    }, 10000)
                }
            })
        }, 1000)
    }
}
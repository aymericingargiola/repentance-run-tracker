const fs = require('fs')
const { cloneFrom } = require('../tools/methods')
const { syncApp } = require('../sync')
const characters = require('../jsons/characters.json')
const items = require('../jsons/items.json')
const floors = require('../jsons/floors.json')
const moment = require('moment')
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
        return string.split(" ")[5].replace("The", "The Binding of Isaac Rebirth\\mods");
    },
    getCharater: (string) => {
        //Return matching character from logs
        return cloneFrom(characters.find(character => character.id === string.split(" ")[9]))
    },
    getCharaterStats: (string) => {
        //Return character stats from RRTE mod converted to json
        let playerStats = string.split(" ")[9].replaceAll("=", ":")
        playerStats.replace(/(\w+)\s*:\s*('[^']*'|"[^"]*"|)/gi, (match, match2) => playerStats = playerStats.replace(match2, `"${match2}"`))
        return JSON.parse(playerStats)
    },
    getSeed: (string) => {
        //Return seed from logs
        return {
            seed: `${string.split(" ")[5]} ${string.split(" ")[6]}`
        }
    },
    getFloor: (string) => {
        //Return matching floor from logs
        return cloneFrom(floors.stages.find(floor => floor.id === `${string.split(" ")[4].match(/\d+/)[0]}.${string.split(" ")[6]}`))
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
        const matchingItem = items.collectibles.find(collectible => collectible.itemID === id)
        return {
            id: id,
            title: matchingItem.title,
            itemType: matchingItem.itemType,
            category: matchingItem.category,
            player: module.exports.getPlayer(string),
            removed: false
        }
    },
    getTrinket: (string, splitValue) => {
        //Return matching trinket from logs
        const id = parseInt(string.split(" ")[splitValue])
        const matchingTrinket = items.trinkets.find(trinket => trinket.trinketID === id)
        return {
            id: id,
            title: matchingTrinket.title,
            category: matchingTrinket.category,
            player: module.exports.getPlayer(string),
            removed: false,
            smelted: false
        }
    },
    getRunEnd: (string) => {
        //Return game over from logs
        return {
            date: moment().unix(),
            win: string.includes("Game Over") ? false : true,
            killedBy: string.includes("Game Over") ? string.split(" ")[6].slice(1,-1) : null,
            spawnedBy: string.includes("Game Over") ? string.split(" ")[9].slice(1,-1) : null,
            damageFlags: string.includes("Game Over") ? string.split(" ")[12].slice(1,-1) : null
        }
    },
    getRunDuration: (end, start) => {
        const ms = moment(end,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"))
        const duration = moment.duration(ms)
        return `${Math.floor(duration.asHours()) < 10 ? `0${Math.floor(duration.asHours())}` : Math.floor(duration.asHours())}${moment.utc(ms).format(":mm:ss")}`
    },
    saveFileToDisk: (path, datas) => {
        //Update file
        fs.writeFile(path, datas, 'utf8', (err) => {if (err) throw err})
    },
    removeRun: (runId, runs, runsJsonPath, window) => {
        //From user action, if the runid is found remove a run on frontend and backend
        console.log(`Removing run : ${runId}...`)
        runIndex = runs.findIndex(run => run.id === runId)
        if(runIndex != -1) {
            syncApp(window,{trigger: "remove run", run: runs[runIndex].id}) //Remove matching run on frontend
            runs.splice(runIndex, 1) //Remove matching run on saved runs json file
            console.log(`Run : ${runId} was removed`)
            module.exports.saveFileToDisk(runsJsonPath, JSON.stringify(runs))
            return true
        } else {
            console.log(`Impossible to find : ${runId}, this run doesn't exist on the backend ! (Sync issue ?)`)
            return false
        }
    }
}
const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const isLinux = process.platform === "linux"
const { ipcMain } = require('electron')
const { syncApp } = require('./sync')
const { app } = require('electron')
const dataFolder = app.getPath("userData")
const { writeFileAsync, fileResolve, dirExist } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const { restoreDatas } = require('./backupDatas')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const characters = require('../jsons/characters.json')
const charactersFiendFolio = require('../jsons/characters_fiendfolio-reheated.json')
const entities = require('../jsons/entitiesFiltered.json')
const floors = require('../jsons/floors.json')
const configTemplate = require('../jsons/configTemplate.json')
const log = require('electron-log')
const repentanceFolderPath = !isLinux ? path.join(app.getPath('home'), 'Documents', 'My Games', 'Binding of Isaac Repentance')
: path.join(app.getPath('home') + "/.steam/steam/steamapps/compatdata/#ISAAC#/pfx/drive_c/users/steamuser/Documents/My Games/Binding of Isaac Repentance")
let repentanceLogsFile = path.join(repentanceFolderPath, 'log.txt')
let repentanceOptionsFile = path.join(repentanceFolderPath, 'options.ini')
let win, trackerWin, config, winStreaks, tags, runs, trash

ipcMain.on('ASK_CONFIG', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!config) config = await module.exports.initConfig()
	syncApp(window, { trigger: 'send config', config: config })
});

ipcMain.on('USER_UPDATE_CONFIG', async (event, payload) => {
	if (!config) config = await module.exports.initConfig()
	config.find((configItem) => configItem.id === payload.id).value = payload.value
	await writeFileAsync(dataFolder, 'config.json', JSON.stringify(config))
});

ipcMain.on('ASK_ENTITIES', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	syncApp(window, { trigger: 'send entities', entities: entities })
});

ipcMain.on('ASK_FLOORS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	syncApp(window, { trigger: 'send floors', floors: floors.stages })
});

ipcMain.on('ASK_CHARACTERS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	syncApp(window, { trigger: 'send characters', characters: [...characters, ...charactersFiendFolio] })
});

ipcMain.on('ASK_WINSTREAKS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks()
	syncApp(window, { trigger: 'send winstreaks', winStreaks: winStreaks })
});

ipcMain.on('USER_CREATE_WINSTREAK', async (event, payload) => {
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks()
	winStreaks.push(payload)
	await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks))
});

ipcMain.on('USER_REMOVE_WINSTREAK', async (event, payload) => {
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks()
	const winStreaksIndex = winStreaks.findIndex((winStreaksItem) => winStreaksItem.id === payload);
	if (winStreaksIndex != -1) {
		winStreaks.splice(winStreaksIndex, 1)
		await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks))
	} else {
		console.log(`Impossible to find : ${payload}, this winStreaks doesn't exist on the backend ! (Sync issue ?)`)
	}
});

ipcMain.on('USER_UPDATE_WINSTREAK', async (event, payload) => {
	if (!winStreaks) winStreaks = await initwinStreaks()
	winStreaks[winStreaks.findIndex((winStreaksItem) => winStreaksItem.id === payload.id)] = payload.value
	await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks))
});

ipcMain.on('ASK_TAGS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!tags) tags = await module.exports.initTags()
	syncApp(window, { trigger: 'send tags', tags: tags })
});

ipcMain.on('USER_CREATE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags()
	tags.push(payload)
	await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
});

ipcMain.on('USER_REMOVE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags()
	const tagsIndex = tags.findIndex((tag) => tag.value === payload)
	if (tagsIndex != -1) {
		tags.splice(tagsIndex, 1)
		await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
	} else {
		console.log(`Impossible to find : ${payload}, this tag doesn't exist on the backend ! (Sync issue ?)`)
	}
});

ipcMain.on('USER_UPDATE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags()
	tags.find((tag) => tag.id === payload.id)[payload.property] = payload.value
	await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags))
});

ipcMain.on('ASK_RUNS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!runs) runs = await module.exports.initRuns()
	const runsItems = await runs
	syncApp(window, { trigger: 'send runs', runs: runsItems.value() })
});

ipcMain.on('ASK_TRASH', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!trash) trash = await module.exports.initTrash()
	syncApp(window, { trigger: 'send trash', trash: trash })
});

ipcMain.on('CHECK_LINUX_PATHS', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	await module.exports.checkLinuxPaths()
});



module.exports = {
	checkRuns: async function() {
		console.time('Checking runs done in')
		log.info('Checking runs...')
		const runsItems = await runs
		const corruptedRuns = []
		await asyncForEach(runsItems.value(), async (run) => {
			// Check for corrupted characters
			const characters = !run.characters || run.characters.length < 1 ? true : run.characters.includes(null)
			if (characters) {
				corruptedRuns.push(run.id)
				await runsItems.remove({id: run.id}).write()
			}
		})
		if (corruptedRuns.length > 0) log.info(`Corrupted runs removed : ${corruptedRuns.toString()}`)
		log.info('Checking runs done')
		console.timeEnd('Checking runs done in')
	},
	checkJson: async function(dataFolder, file, fileName, defaultContent) {
		let thisFile = file
		try{
			return JSON.parse(fs.readFileSync(thisFile))
		} catch (err) {
			log.error(`${fileName} file is corrupted!`)
		    const fileRestored = await restoreDatas(dataFolder, [`${fileName}`])
			if (fileRestored) {
				thisFile = await fileResolve(dataFolder, fileName, defaultContent)
				return JSON.parse(fs.readFileSync(thisFile))
			} else {
				log.error(`Impossible to restore ${fileName}! Create empty ${fileName}`)
				await writeFileAsync(dataFolder, fileName, defaultContent)
				return JSON.parse(defaultContent)
			}
		}
	},
	checkLinuxPaths: async function() {
		log.info(`Resolving linux paths...`)
		const loadConfig = await fileResolve(dataFolder, 'config.json', '[]')
		cf = JSON.parse(fs.readFileSync(loadConfig))
		const isaacLinuxDatasPath = cf.filter(field => field.id === "isaacLinuxDatasPath")[0]
		if (!isaacLinuxDatasPath || isaacLinuxDatasPath.value === "") {
			log.error(`Linux Path Doesn't Exist : ${repentanceLogsFile, repentanceOptionsFile}`)
			const message = "Game data's name is missing (linux), please open the settings and add the game folder name (numbers), you can find it at '/home/deck/.steam/steam/steamapps/compatdata/' then restart the app"
			const stack = `${message} \nActual data path (#ISAAC# should be replaced with the folder name you enter in the settings) : ${repentanceFolderPath.replace("#ISAAC#", isaacLinuxDatasPath.value)}`
			syncApp(win, { trigger: 'send app error', error: {message:message,stack:stack,chan:"isaacLinuxDatasPath"} })
			return false
		}
		try {
			repentanceLogsFile = path.join(repentanceFolderPath.replace("#ISAAC#", isaacLinuxDatasPath.value), 'log.txt')
			repentanceOptionsFile = path.join(repentanceFolderPath.replace("#ISAAC#", isaacLinuxDatasPath.value), 'options.ini')
			if (fs.existsSync(repentanceLogsFile) && fs.existsSync(repentanceOptionsFile)) {
				log.info(`Linux Paths Exist : ${repentanceLogsFile, repentanceOptionsFile}`)
			} else {
				log.error(`Linux Path Doesn't Exist : ${repentanceLogsFile, repentanceOptionsFile}`)
				const message = "Game data's name is wrong (linux), please open the settings and add the game folder name (numbers), you can find it at '/home/deck/.steam/steam/steamapps/compatdata/' then restart the app"
				const stack = `${message} \nActual data path : ${repentanceFolderPath.replace("#ISAAC#", isaacLinuxDatasPath.value)}`
				syncApp(win, { trigger: 'send app error', error: {message:message,stack:stack,chan:"isaacLinuxDatasPath"} })
				return false 
			}
		} catch(err) {
			log.error(`Linux Path Doesn't Exist : ${repentanceLogsFile, repentanceOptionsFile}`, err)
			const message = "Game data's name is wrong (linux), please open the settings and add the game folder name (numbers), you can find it at '/home/deck/.steam/steam/steamapps/compatdata/' then restart the app"
			const stack = `${message} \nActual data path : ${repentanceFolderPath.replace("#ISAAC#", isaacLinuxDatasPath.value)}`
			syncApp(win, { trigger: 'send app error', error: {message:message,stack:stack,chan:"isaacLinuxDatasPath"} })
			return false
		}
		return {repentanceLogsFile:repentanceLogsFile,repentanceOptionsFile:repentanceOptionsFile}
	},
	checkOldFolder: async function(oldFolderPath, dataFolder) {
	},
	readyToSync: function(window, trackerWindow) {
		win = window ? window : win
		trackerWin = trackerWindow ? trackerWindow : trackerWin
	},
    initConfig: async function() {
        const loadConfig = await fileResolve(dataFolder, 'config.json', JSON.stringify(configTemplate));
        let tempConfig = await module.exports.checkJson(dataFolder, loadConfig, 'config.json', JSON.stringify(configTemplate))
        configTemplate.forEach((field) => {
            const tempConfigField = tempConfig.find((configItem) => configItem.id === field.id)
            if (!tempConfigField) tempConfig.push(field)
            if (tempConfigField && field.choices && tempConfigField.choices != field.choices) tempConfigField.choices = field.choices
			if (tempConfigField && field.choices && (!tempConfigField.value || !field.choices.map(choice => choice.value).includes(tempConfigField.value))) tempConfigField.value = field.choices[0].value
            if (tempConfigField && tempConfigField.name != field.name) tempConfigField.name = field.name
            if (tempConfigField && tempConfigField.hint != field.hint) tempConfigField.hint = field.hint
            if (tempConfigField && tempConfigField.type != field.type) tempConfigField.type = field.type
			if (tempConfigField && tempConfigField.order != field.order) tempConfigField.order = field.order
            if (tempConfigField && tempConfigField.disabled != field.disabled) tempConfigField.disabled = field.disabled
        })
        await writeFileAsync(dataFolder, 'config.json', JSON.stringify(tempConfig))
        return tempConfig
    },
    initwinStreaks: async function() {
        const loadwinStreaks = await fileResolve(dataFolder, 'winStreaks.json', '[]')
		return await module.exports.checkJson(dataFolder, loadwinStreaks, 'tags.json', '[]')
    },
    initTags: async function() {
        const loadTags = await fileResolve(dataFolder, 'tags.json', '[]')
		return await module.exports.checkJson(dataFolder, loadTags, 'tags.json', '[]')
    },
    initRuns: async function() {
        const loadRuns = await fileResolve(dataFolder, 'runs.json', '[]')
		await module.exports.checkJson(dataFolder, loadRuns, 'runs.json', '[]')
		const adapter = new FileAsync(path.join(dataFolder, 'runs.json'))
		runs = low(adapter)
		await module.exports.checkRuns()
		return runs
    },
	initTrash: async function() {
        const loadTrash = await fileResolve(dataFolder, 'trash.json', '[]')
		return await module.exports.checkJson(dataFolder, loadTrash, 'trash.json', '[]')
    }
}

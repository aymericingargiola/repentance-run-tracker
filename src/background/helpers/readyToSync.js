const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const { ipcMain } = require('electron')
const { syncApp } = require('./sync')
const { app } = require('electron')
const dataFolder = app.getPath("userData")
const { writeFileAsync, fileResolve, dirExist } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const { restoreDatas } = require('./backupDatas')
const characters = require('../jsons/characters.json')
const entities = require('../jsons/entitiesFiltered.json')
const floors = require('../jsons/floors.json')
const configTemplate = require('../jsons/configTemplate.json')
const log = require('electron-log')
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
	syncApp(window, { trigger: 'send characters', characters: characters })
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
	winStreaks.find((winStreaksItem) => winStreaksItem.id === payload.id)[payload.property] = payload.value
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
	syncApp(window, { trigger: 'send runs', runs: runs })
});

ipcMain.on('ASK_TRASH', async (event, payload) => {
	const window = payload && payload.window === 'itemTracker' ? trackerWin : win
	if (!trash) trash = await module.exports.initTrash()
	syncApp(window, { trigger: 'send trash', trash: trash })
});

module.exports = {
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
	checkOldFolder: async function(oldFolderPath, dataFolder) {
		console.log(`Old folder check...`)
		console.time('Old folder check')
		const filesToRestore = ["runs.json", "tags.json", "trash.json", "winStreaks.json", "config.json"]
		if (dirExist(oldFolderPath)) {
			await asyncForEach(filesToRestore, async (file) => {
				const sourceFilePath = path.normalize(`${oldFolderPath}\\${file}`)
				const destFilePath = path.normalize(`${dataFolder}\\${file}`)
				try {
					await fsPromises.copyFile(sourceFilePath, destFilePath)
				} catch (err) {
					log.warn(`Issue to restore ${oldFolderPath}! Empty file will be created : ${err}`)
					return
				}
				log.info(`${file} was restored from ${oldFolderPath}`)
				return
			})
			try {
				await fsPromises.rename(oldFolderPath, `${oldFolderPath}-backup`)
			} catch (err) {
				log.error(`Issue to rename ${oldFolderPath}! ${err}`)
				return console.timeEnd('Old folder check')
			}
			log.info(`${oldFolderPath} was renamed ${oldFolderPath}-backup`)
		}
		return console.timeEnd('Old folder check')
	},
	readyToSync: function(window, trackerWindow) {
		win = window ? window : win
		trackerWin = trackerWindow ? trackerWindow : trackerWin
	},
    initConfig: async function() {
        const loadConfig = await fileResolve(dataFolder, 'config.json', JSON.stringify(configTemplate));
        let tempConfig = await module.exports.checkJson(dataFolder, loadConfig, 'config.json', JSON.stringify(configTemplate))
        configTemplate.forEach((field) => {
            const tempConfigField = tempConfig.find((configItem) => configItem.id === field.id);
            if (!tempConfigField) tempConfig.push(field);
            if (tempConfigField && field.choices && tempConfigField.choices != field.choices) tempConfigField.choices = field.choices;
			if (tempConfigField && field.choices && !field.choices.map(choice => choice.value).includes(tempConfigField.value)) tempConfigField.value = field.choices[0].value
            if (tempConfigField && tempConfigField.name != field.name) tempConfigField.name = field.name;
            if (tempConfigField && tempConfigField.hint != field.hint) tempConfigField.hint = field.hint;
            if (tempConfigField && tempConfigField.type != field.type) tempConfigField.type = field.type;
            if (tempConfigField && tempConfigField.disabled != field.disabled) tempConfigField.disabled = field.disabled;
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
        let loadRuns = await fileResolve(dataFolder, 'runs.json', '[]')
		return await module.exports.checkJson(dataFolder, loadRuns, 'runs.json', '[]')
    },
	initTrash: async function() {
        const loadTrash = await fileResolve(dataFolder, 'trash.json', '[]')
		return await module.exports.checkJson(dataFolder, loadTrash, 'trash.json', '[]')
    }
}

const fs = require('fs')
const { ipcMain } = require('electron')
const { syncApp } = require('./sync')
const { app } = require('electron')
const dataFolder = app.getPath("userData")
const { writeFileAsync, fileResolve } = require('../tools/fileSystem')
const characters = require('../jsons/characters.json')
const entities = require('../jsons/entitiesFiltered.json')
const floors = require('../jsons/floors.json')
const configTemplate = require('../jsons/configTemplate.json')
let win, trackerWin, config, winStreaks, tags, runs

ipcMain.on('ASK_CONFIG', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	if (!config) config = await module.exports.initConfig();
	syncApp(window, { trigger: 'send config', config: config });
});

ipcMain.on('USER_UPDATE_CONFIG', async (event, payload) => {
	if (!config) config = await module.exports.initConfig();
	config.find((configItem) => configItem.id === payload.id).value = payload.value;
	await writeFileAsync(dataFolder, 'config.json', JSON.stringify(config));
});

ipcMain.on('ASK_ENTITIES', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	syncApp(window, { trigger: 'send entities', entities: entities });
});

ipcMain.on('ASK_FLOORS', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	syncApp(window, { trigger: 'send floors', floors: floors.stages });
});

ipcMain.on('ASK_CHARACTERS', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	syncApp(window, { trigger: 'send characters', characters: characters });
});

ipcMain.on('ASK_WINSTREAKS', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks();
	syncApp(window, { trigger: 'send winstreaks', winStreaks: winStreaks });
});

ipcMain.on('USER_CREATE_WINSTREAKS', async (event, payload) => {
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks();
	winStreaks.push(payload);
	await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks));
});

ipcMain.on('USER_REMOVE_WINSTREAKS', async (event, payload) => {
	if (!winStreaks) winStreaks = await module.exports.initwinStreaks();
	const winStreaksIndex = winStreaks.findIndex((winStreaksItem) => winStreaksItem.id === payload);
	if (winStreaksIndex != -1) {
		winStreaks.splice(winStreaksIndex, 1);
		await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks));
	} else {
		console.log(`Impossible to find : ${payload}, this winStreaks doesn't exist on the backend ! (Sync issue ?)`);
	}
});

ipcMain.on('USER_UPDATE_WINSTREAKS', async (event, payload) => {
	if (!winStreaks) winStreaks = await initwinStreaks();
	winStreaks.find((winStreaksItem) => winStreaksItem.id === payload.id)[payload.property] = payload.value;
	await writeFileAsync(dataFolder, 'winStreaks.json', JSON.stringify(winStreaks));
});

ipcMain.on('ASK_TAGS', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	if (!tags) tags = await module.exports.initTags();
	syncApp(window, { trigger: 'send tags', tags: tags });
});

ipcMain.on('USER_CREATE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags();
	tags.push(payload);
	await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags));
});

ipcMain.on('USER_REMOVE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags();
	const tagsIndex = tags.findIndex((tag) => tag.value === payload);
	if (tagsIndex != -1) {
		tags.splice(tagsIndex, 1);
		await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags));
	} else {
		console.log(`Impossible to find : ${payload}, this tag doesn't exist on the backend ! (Sync issue ?)`);
	}
});

ipcMain.on('USER_UPDATE_TAGS', async (event, payload) => {
	if (!tags) tags = await module.exports.initTags();
	tags.find((tag) => tag.id === payload.id)[payload.property] = payload.value;
	await writeFileAsync(dataFolder, 'tags.json', JSON.stringify(tags));
});

ipcMain.on('ASK_RUNS', async (event, payload) => {
	const window = payload && payload.window === 'liveTracker' ? trackerWin : win;
	if (!runs) runs = await module.exports.initRuns();
	syncApp(window, { trigger: 'send runs', runs: runs });
});

module.exports = {
	readyToSync: function(window, trackerWindow) {
		win = window ? window : win;
		trackerWin = trackerWindow ? trackerWindow : trackerWin;
	},
    initConfig: async function() {
        const loadConfig = await fileResolve(dataFolder, 'config.json', JSON.stringify(configTemplate));
        let tempConfig = JSON.parse(fs.readFileSync(loadConfig));
        configTemplate.forEach((field) => {
            const tempConfigField = tempConfig.find((configItem) => configItem.id === field.id);
            if (!tempConfigField) tempConfig.push(field);
            if (tempConfigField && tempConfigField.choices != field.choices) tempConfigField.choices = field.choices;
            if (tempConfigField && tempConfigField.name != field.name) tempConfigField.name = field.name;
            if (tempConfigField && tempConfigField.hint != field.hint) tempConfigField.hint = field.hint;
            if (tempConfigField && tempConfigField.type != field.type) tempConfigField.type = field.type;
            if (tempConfigField && tempConfigField.disabled != field.disabled) tempConfigField.disabled = field.disabled;
        });
        await writeFileAsync(dataFolder, 'config.json', JSON.stringify(tempConfig));
        return tempConfig;
    },
    initwinStreaks: async function() {
        const loadwinStreaks = await fileResolve(dataFolder, 'winStreaks.json', '[]');
        return JSON.parse(fs.readFileSync(loadwinStreaks));
    },
    initTags: async function() {
        const loadTags = await fileResolve(dataFolder, 'tags.json', '[]');
        return JSON.parse(fs.readFileSync(loadTags));
    },
    initRuns: async function() {
        const loadRuns = await fileResolve(dataFolder, 'runs.json', '[]');
        return JSON.parse(fs.readFileSync(loadRuns));
    }
};

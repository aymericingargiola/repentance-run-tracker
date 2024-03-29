const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises
const { writeFileAsync } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const convert = require('xml-js')
//const entitiesXml = require('!raw-loader!../jsons/entities2.xml')
const i18nFolder = './src/renderer/i18n'
const xmlsFolders = './src/background/jsons/languages'
const stringTable = [{index: 0, language: "en-US"}, {index: 1, language: "ja-JP"}, {index: 2, language: "ko-KR"}, {index: 3, language: "zh-ZH"}, {index: 4, language: "ru-RU"}, {index: 5, language: "de-DE"}, {index: 6, language: "es-ES"}, {index: 7, language: "fr-FR"}]
const stringTablePath = './src/background/jsons/languages/stringtable.sta'
let stringTableFile

module.exports = {
    convertToJson: async function(xml) {
        return JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}))
    },
    removeXmlComments: async function(xml) {
        return xml.replace(/<!--.*?-->/sg, "")
    },
    entitiesJson: async function() {
        console.time('Entities json done in ')
        let xml
        try {
            xml = await fsPromises.readFile('./src/background/jsons/entities2.xml')
        } catch (err) {
            console.log(err)
            return
        }
        const lastBosses = [{id:"951.0.0",floors_ids:["13.0"]},{id:"912.0.0",floors_ids:["8.4"]},{id:"274.0.0",floors_ids:["11.0","11.1","12.0"]},{id:"273.0.0",floors_ids:["11.0","12.0"]},{id:"102.1.0",floors_ids:["11.1", "12.0"]},{id:"412.0.0",floors_ids:["12.0"]},{id:"406.0.0",floors_ids:["7.0", "7.1", "7.2"]}]
        const ignoreEntities = ["951.42.0","951.41.0","951.31.0","951.23.0","951.21.0","951.11.0","951.3.0","951.2.0","951.1.0","950.10.0","950.2.0","950.1.0","921.1.0","919.1.0","915.1.0","912.100.2","912.100.1","912.100.0","912.10.0","911.2.0","911.1.0","910.2.0","910.1.0","909.10.0","906.1.0","903.20.0","903.10.0","903.1.0","835.10.0","831.10.0","830.10.0","818.2.3","818.2.2","818.2.1","818.1.3","818.1.2","818.1.1","818.0.3","818.0.2","818.0.1","811.0.1","811.0.2","811.0.3","811.0.4","811.0.5","811.0.6","33.0.0","33.1.0","33.2.0","33.10.0","33.11.3","33.11.2","33.11.1","33.12.0","38.2.0","244.2.1","25.3.1","10.3.5","10.3.4","10.3.3","10.3.2","10.3.1","409.1.1","409.1.2","3.217.0","3.216.0","405.1.0","404.1.0","311.10.0","310.1.0","275.2.0","275.1.0","275.0.0","274.2.0","274.1.0","273.10.0","266.2.0","266.1.0","251.10.0","84.10.0","79.11.0","79.10.0","73.1.0","73.0.0","72.1.0","72.0.0","76.0.0","75.0.0","66.10.0","66.20.0","66.30.0","65.10.0","51.31.0","51.21.0","51.11.0","51.30.0","51.20.0","51.10.0","45.10.0","39.22.0","38.2.0","35.10.0","35.3.0","5.1.0","887.0.0","274.2.0"]
        const cleanEntitiesXml = await module.exports.removeXmlComments(xml.toString())
        const convertEntitiesXml = await module.exports.convertToJson(cleanEntitiesXml)
        const entitiesJson = convertEntitiesXml.entities.entity.map(entity => {
            const entityId = `${entity._attributes.id}.${entity._attributes.variant ? entity._attributes.variant : 0}.${entity._attributes.subtype ? entity._attributes.subtype : 0}`
            if (!ignoreEntities.includes(entityId) && entity._attributes.baseHP && parseInt(entity._attributes.baseHP) > 0 && entity._attributes.collisionDamage && parseInt(entity._attributes.collisionDamage) > 0 || entity._attributes.boss === "1") {
                return {
                    id: entityId,
                    name: entity._attributes.name,
                    champion: entity._attributes.champion,
                    boss: entity._attributes.boss === "1" ? true : false,
                    bossId: entity._attributes.bossID,
                    lastBoss: lastBosses.findIndex(boss => boss.id === entityId) > -1 ? true : false,
                    floors_ids: lastBosses.findIndex(boss => boss.id === entityId) > -1 ? lastBosses.find(boss => boss.id === entityId).floors_ids : null,
                    portrait: entity._attributes.portrait
                }
            }
        }).filter(entity => entity)
        await writeFileAsync('./src/background/jsons', 'entitiesFiltered.json', JSON.stringify(entitiesJson))
        return console.timeEnd('Entities json done in ')
    },
    entitiesCustomJson: async function() {
        console.time('Entities Custom json done in ')
        // Fiend Folio Reheated
        let xml
        try {
            xml = await fsPromises.readFile('./src/background/jsons/entities2_fiendfolio-reheated.xml')
        } catch (err) {
            console.log(err)
            return
        }
        const cleanEntitiesXml = await module.exports.removeXmlComments(xml.toString())
        const convertEntitiesXml = await module.exports.convertToJson(cleanEntitiesXml)
        const ignoreEntities = ["180.212.0", "180.211.0", "150.2.0"]
        const entitiesJson = convertEntitiesXml.entities.entity.map((entity, index) => {
            const entityId = `${entity._attributes.id}.${entity._attributes.variant ? entity._attributes.variant : 0}.${entity._attributes.subtype ? entity._attributes.subtype : 0}`
            if (!ignoreEntities.includes(entityId) && entity._attributes.baseHP && parseInt(entity._attributes.baseHP) > 0 && entity._attributes.collisionDamage && parseInt(entity._attributes.collisionDamage) > 0 || entity._attributes.boss === "1") {
                return {
                    id: entityId,
                    name: entity._attributes.name,
                    champion: entity._attributes.champion,
                    boss: entity._attributes.boss === "1" ? true : false,
                    portrait: entity._attributes.portrait,
                    category: "fiendfolio-reheated"
                }
            }
        }).filter(entity => entity)
        await writeFileAsync('./src/background/jsons', 'entitiesFiltered_fiendfolio-reheated.json', JSON.stringify(entitiesJson))
        return console.timeEnd('Entities Custom json done in ')
    },
    itemsCustomJson: async function() {
        console.time('Items Custom json done in ')
        // Fiend Folio Reheated
        let xml
        try {
            xml = await fsPromises.readFile('./src/background/jsons/items_fiendfolio-reheated.xml')
        } catch (err) {
            console.log(err)
            return
        }
        const cleanItemsXml = await module.exports.removeXmlComments(xml.toString())
        const convertItemsXml = await module.exports.convertToJson(cleanItemsXml)
        const itemsPassive = [...convertItemsXml.items.passive].map(item => {
            if (item._attributes.gfx && item._attributes.gfx !== "") {
                return {
                    title: item._attributes.name,
                    pickup: item._attributes.description,
                    gfx: item._attributes.gfx,
                    tags: item._attributes.tags,
                    itemType: "Passive",
                    category: "fiendfolio-reheated"
                }
            }
        }).filter(item => item)
        const itemsActive = [...convertItemsXml.items.active].map(item => {
            if (item._attributes.gfx && item._attributes.gfx !== "") {
                return {
                    title: item._attributes.name,
                    pickup: item._attributes.description,
                    gfx: item._attributes.gfx,
                    tags: item._attributes.tags,
                    itemType: "Active",
                    category: "fiendfolio-reheated"
                }
            }
        }).filter(item => item)
        const itemsFamiliar = [...convertItemsXml.items.familiar].map(item => {
            if (item._attributes.gfx && item._attributes.gfx !== "") {
                return {
                    title: item._attributes.name,
                    pickup: item._attributes.description,
                    gfx: item._attributes.gfx,
                    tags: item._attributes.tags,
                    itemType: "Familiar",
                    category: "fiendfolio-reheated"
                }
            }
        }).filter(item => item)
        const itemsTrinket = [...convertItemsXml.items.trinket].map(item => {
            if (item._attributes.gfx && item._attributes.gfx !== "") {
                return {
                    title: item._attributes.name,
                    pickup: item._attributes.description,
                    gfx: item._attributes.gfx,
                    tags: item._attributes.tags,
                    itemType: "Trinket",
                    category: "fiendfolio-reheated"
                }
            }
        }).filter(item => item)
        const itemsJson = [...itemsPassive, ...itemsActive, ...itemsFamiliar, ...itemsTrinket]
        const reduceItemsJson = itemsJson.reduce((arr, item, index) => {
            if(!arr['collectibles']) arr['collectibles'] = []
            if(!arr['trinkets']) arr['trinkets'] = []
            if(item.itemType === "Trinket") {
                arr['trinkets'].push({
                    itemID: 2000 + index,
                    title: item.title,
                    pickup: item.pickup,
                    gfx: item.gfx,
                    itemType: item.itemType,
                    category: item.category,
                    tags: item.tags
                })
            } else {
                arr['collectibles'].push({
                    itemID: 2000 + index,
                    title: item.title,
                    pickup: item.pickup,
                    gfx: item.gfx,
                    itemType: item.itemType,
                    category: item.category,
                    tags: item.tags
                })
            }
            return arr
        }, {})
        await writeFileAsync('./src/background/jsons', 'items_fiendfolio-reheated.json', JSON.stringify(reduceItemsJson))
        return console.timeEnd('Items Custom json done in ')
    },
    playersLocalization: async function(language) {
        console.time(`Players localization for ${language} json done in `)
        const fromStringTable = stringTable.find(item => item.language === language)
        const playersXmlPath = !fromStringTable ? `${xmlsFolders}/${language}/players.xml` : `${xmlsFolders}/en-US/players.xml`
        let playersXml
        try {
            playersXml = await fsPromises.readFile(playersXmlPath)
        } catch (err) {
            console.log(err)
            console.timeEnd(`Players localization for ${language} json done in `)
            return {}
        }
        const cleanPlayersXml = await module.exports.removeXmlComments(playersXml.toString())
        const convertPlayersXml = await module.exports.convertToJson(cleanPlayersXml)
        if (fromStringTable) {
            const playersIndex = stringTableFile.stringtable.category.findIndex(item => item._attributes.name === 'Players')
            const playersJson = stringTableFile.stringtable.category[playersIndex].key.reduce((t, obj) => {
                const matchingPlayer = convertPlayersXml.players.player.filter(player => `${player._attributes.name.replace(' ', '_').toUpperCase()}_NAME` === obj._attributes.name || `${player._attributes.costumeSuffix && player._attributes.costumeSuffix.replace(' ', '_').toUpperCase()}_NAME` === obj._attributes.name)
                if (matchingPlayer.length < 1) return t
                matchingPlayer.forEach((player) => {
                    if (!t[player._attributes.id]) t[player._attributes.id] = {}
                    t[player._attributes.id].name = obj.string[fromStringTable.index]._text
                })
                return t
            }, {})
            console.timeEnd(`Players localization for ${language} json done in `)
            return playersJson
        }
        const playersJson = convertPlayersXml.players.player.reduce((t, obj) => {
                t[obj._attributes.id] = {}
                t[obj._attributes.id].name = obj._attributes.name
                return t
        }, {})
        console.timeEnd(`Players localization for ${language} json done in `)
        return playersJson
    },
    itemsLocalization: async function(language) {
        console.time(`Items localization for ${language} json done in `)
        const fromStringTable = stringTable.find(item => item.language === language)
        const itemsXmlPath = !fromStringTable ? `${xmlsFolders}/${language}/items.xml` : `${xmlsFolders}/en-US/items.xml`
        let itemsXml
        try {
            itemsXml = await fsPromises.readFile(itemsXmlPath)
        } catch (err) {
            console.log(err)
            return console.timeEnd(`Items localization for ${language} json done in `)
        }
        const cleanItemsXml = await module.exports.removeXmlComments(itemsXml.toString())
        const convertItemsXml = await module.exports.convertToJson(cleanItemsXml)
        const convertItemsXmlItems = [...convertItemsXml.items.passive, ...convertItemsXml.items.active, ...convertItemsXml.items.familiar]
        const convertItemsXmlTrinkets = [...convertItemsXml.items.trinket]
        if (fromStringTable) {
            const itemsIndex = stringTableFile.stringtable.category.findIndex(item => item._attributes.name === 'Items')
            const itemsJson = stringTableFile.stringtable.category[itemsIndex].key.reduce((t, obj) => {
                const matchingItemName = convertItemsXmlItems.find(item => item._attributes.hidden !== "true" && item._attributes.name === `#${obj._attributes.name}`)
                const matchingItemDescription = convertItemsXmlItems.find(item => item._attributes.hidden !== "true" && item._attributes.description === `#${obj._attributes.name}`)
                if (matchingItemName) {
                    if (!t[matchingItemName._attributes.id]) t[matchingItemName._attributes.id] = {}
                    t[matchingItemName._attributes.id].name = obj.string[fromStringTable.index]._text
                }
                if (matchingItemDescription) {
                    if (!t[matchingItemDescription._attributes.id]) t[matchingItemDescription._attributes.id] = {}
                    t[matchingItemDescription._attributes.id].description = obj.string[fromStringTable.index]._text
                }
                return t
            }, {})
            const trinketsJson = stringTableFile.stringtable.category[itemsIndex].key.reduce((t, obj) => {
                const matchingTrinketName = convertItemsXmlTrinkets.find(item => item._attributes.hidden !== "true" && item._attributes.name === `#${obj._attributes.name}`)
                const matchingTrinketDescription = convertItemsXmlTrinkets.find(item => item._attributes.hidden !== "true" && item._attributes.description === `#${obj._attributes.name}`)
                if (matchingTrinketName) {
                    if (!t[matchingTrinketName._attributes.id]) t[matchingTrinketName._attributes.id] = {}
                    t[matchingTrinketName._attributes.id].name = obj.string[fromStringTable.index]._text
                }
                if (matchingTrinketDescription) {
                    if (!t[matchingTrinketDescription._attributes.id]) t[matchingTrinketDescription._attributes.id] = {}
                    t[matchingTrinketDescription._attributes.id].description = obj.string[fromStringTable.index]._text
                }
                return t
            }, {})
            console.timeEnd(`Items localization for ${language} json done in `)
            return {items: itemsJson, trinkets: trinketsJson}
        }
        const itemsJson = convertItemsXmlItems.reduce((t, obj) => {
            t[obj._attributes.id] = {}
            t[obj._attributes.id].name = obj._attributes.name
            t[obj._attributes.id].description = obj._attributes.description
            return t
        }, {})
        const trinketsJson = convertItemsXmlTrinkets.reduce((t, obj) => {
            t[obj._attributes.id] = {}
            t[obj._attributes.id].name = obj._attributes.name
            t[obj._attributes.id].description = obj._attributes.description
            return t
        }, {})
        console.timeEnd(`Items localization for ${language} json done in `)
        return {items: itemsJson, trinkets: trinketsJson}
    },
    stagesLocalization: async function(language) {
        console.time(`Stages localization for ${language} json done in `)
        const fromStringTable = stringTable.find(item => item.language === language)
        const stagesXmlPath = !fromStringTable ? `${xmlsFolders}/${language}/stages.xml` : `${xmlsFolders}/en-US/stages.xml`
        let stagesXml
        try {
            stagesXml = await fsPromises.readFile(stagesXmlPath)
        } catch (err) {
            console.log(err)
            return console.timeEnd(`Stages localization for ${language} json done in `)
        }
        const cleanStagesXml = await module.exports.removeXmlComments(stagesXml.toString())
        const convertStagesXml = await module.exports.convertToJson(cleanStagesXml)
        if (fromStringTable) {
            const stageIndex = stringTableFile.stringtable.category.findIndex(stage => stage._attributes.name === 'Stages')
            const stagesJson = stringTableFile.stringtable.category[stageIndex].key.reduce((t, obj) => {
                const matchingStage = convertStagesXml.stages.stage.find(stage => `${stage._attributes.name.replace(' ', '_').toUpperCase()}_NAME` === obj._attributes.name || `${stage._attributes.path.split('.')[1].replace(' ', '_').toUpperCase()}_NAME` === obj._attributes.name)
                if (!matchingStage) return t
                const key = matchingStage._attributes.id === '26' ? 'The Void' : matchingStage._attributes.path.split('.')[1]
                t[key] = {}
                t[key].name = obj.string[fromStringTable.index]._text
                return t
            }, {})
            console.timeEnd(`Stages localization for ${language} json done in `)
            return stagesJson
        }
        const stagesJson = convertStagesXml.stages.stage.reduce((t, obj) => {
            const key = obj._attributes.id === '26' ? 'The Void' : obj._attributes.path.split('.')[1]
            t[key] = {}
            t[key].name = obj._attributes.name
            return t
        }, {})
        console.timeEnd(`Stages localization for ${language} json done in `)
        return stagesJson
    },
    entitiesLocalization: async function(language) {
        console.time(`Entities localization for ${language} json done in `)
        const fromStringTable = stringTable.find(item => item.language === language)
        const entitiesXmlPath = !fromStringTable ? `${xmlsFolders}/${language}/entities2.xml` : `${xmlsFolders}/en-US/entities2.xml`
        let entitiesXml
        try {
            entitiesXml = await fsPromises.readFile(entitiesXmlPath)
        } catch (err) {
            console.log(err)
            console.timeEnd(`Entities localization for ${language} json done in `)
            return {}
        }
        const cleanEntitiesXml = await module.exports.removeXmlComments(entitiesXml.toString())
        const convertEntitiesXml = await module.exports.convertToJson(cleanEntitiesXml)
        if (fromStringTable) {
            const entitiesIndex = stringTableFile.stringtable.category.findIndex(item => item._attributes.name === 'Entities')
            const entitiesJson = stringTableFile.stringtable.category[entitiesIndex].key.reduce((t, obj) => {
                const matchingEntity = convertEntitiesXml.entities.entity.filter(entity => `${entity._attributes.name.replace(' ', '_').toUpperCase()}` === obj._attributes.name || (entity._attributes.id === "102" && obj._attributes.name === "BLUEBABY"))
                if (matchingEntity.length < 1) return t
                matchingEntity.forEach((entity) => {
                    const entityId = `${entity._attributes.id}-${entity._attributes.variant ? entity._attributes.variant : 0}-${entity._attributes.subtype ? entity._attributes.subtype : 0}`
                    if (!t[entityId]) t[entityId] = {}
                    t[entityId].name = obj.string[fromStringTable.index]._text
                })
                return t
            }, {})
            console.timeEnd(`Entities localization for ${language} json done in `)
            return entitiesJson
        }
        const entitiesJson = convertEntitiesXml.entities.entity.reduce((t, obj) => {
                const entityId = `${obj._attributes.id}-${obj._attributes.variant ? obj._attributes.variant : 0}-${obj._attributes.subtype ? obj._attributes.subtype : 0}`
                t[entityId] = {}
                t[entityId].name = obj._attributes.name
                return t
        }, {})
        console.timeEnd(`Entities localization for ${language} json done in `)
        return entitiesJson
    },
    updateLocalizationJsons: async function() {
        console.time('Localization json done in ')
        let languageJsons = []
        try {
            languageJsons = await fsPromises.readdir(i18nFolder)
            stringTableFile = await fsPromises.readFile(stringTablePath)
            stringTableFile = await module.exports.removeXmlComments(stringTableFile.toString())
            stringTableFile = await module.exports.convertToJson(stringTableFile)
        } catch (err) {
            console.log(err)
            return console.timeEnd('Localization jsons done in ')
        }
        languageJsons = languageJsons.filter(item => path.extname(item) === '.json')
        if (languageJsons.length === 0) return console.timeEnd('Localization json done in ')
        await asyncForEach(languageJsons, async (languageJson) => {
            const languageJsonName = path.parse(languageJson).name
            const languageJsonPath = `${i18nFolder}/${languageJson}`
            let languageJsonFile
            try {
                languageJsonFile = await fsPromises.readFile(languageJsonPath)
            } catch (err) {
                console.log(err)
                return
            }
            languageJsonFile = JSON.parse(languageJsonFile.toString())
            languageJsonFile.players = await module.exports.playersLocalization(languageJsonName)
            languageJsonFile.items = await module.exports.itemsLocalization(languageJsonName)
            languageJsonFile.stages = await module.exports.stagesLocalization(languageJsonName)
            languageJsonFile.entities = await module.exports.entitiesLocalization(languageJsonName)
            await writeFileAsync(i18nFolder, languageJson, JSON.stringify(languageJsonFile, null, 4))
        })
        return console.timeEnd('Localization jsons done in ')
    },
	buildJsons: async function() {
        console.log('Building jsons...')
        console.time('Jsons builder done in ')
        await module.exports.entitiesJson()
        await module.exports.updateLocalizationJsons()
        return console.timeEnd('Jsons builder done in ')
	},
    buildEntitiesJson: async function() {
        console.log('Building entities json...')
        await module.exports.entitiesJson()
        await module.exports.entitiesCustomJson()
    },
    buildItemsJson: async function() {
        console.log('Building items json...')
        await module.exports.itemsCustomJson()
    },
    buildLocalesJsons: async function() {
        console.log('Building locales jsons...')
        console.time('Locales jsons done in ')
        await module.exports.updateLocalizationJsons()
        return console.timeEnd('Locales jsons done in ')
    }
}

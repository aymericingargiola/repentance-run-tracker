const fs = require('fs')
const { ipcMain } = require('electron')
const { syncApp } = require('./sync')
const isDevelopment = process.env.NODE_ENV !== 'production'
const { app } = require('electron')
const { writeFileAsync, fileResolve } = require('../tools/fileSystem')
const entitiesXml = require('!raw-loader!../jsons/entities2.xml')

const convert = require('xml-js')

module.exports = {
    convertToJson: async function(xml) {
        return JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}))
    },
    removeXmlComments: async function(xml) {
        return xml.replace(/<!--.*?-->/sg, "")
    },
    buildEntitiesJson: async function(xml) {
        console.time('Entities json done in ')
        const cleanEntitiesXml = await module.exports.removeXmlComments(xml.default)
        const convertEntitiesXml = await module.exports.convertToJson(cleanEntitiesXml)
        const entitiesJson = convertEntitiesXml.entities.entity.map(entity => {
            if (entity._attributes.baseHP && parseInt(entity._attributes.baseHP) > 0 && entity._attributes.collisionDamage && parseInt(entity._attributes.collisionDamage) > 0) {
                return {
                    id: `${entity._attributes.id}.${entity._attributes.variant ? entity._attributes.variant : 0}.${entity._attributes.subtype ? entity._attributes.subtype : 0}`,
                    name: entity._attributes.name,
                    champion: entity._attributes.champion,
                    boss: entity._attributes.boss,
                    bossId: entity._attributes.bossID,
                    portrait: entity._attributes.portrait
                }
            }
        }).filter(entity => entity)
        await writeFileAsync('./src/background/jsons', 'entitiesFiltered.json', JSON.stringify(entitiesJson))
        return console.timeEnd('Entities json done in ')
    },
	buildJsons: async function() {
        console.log('Building jsons...')
        console.time('Jsons builder done in ')
        await module.exports.buildEntitiesJson(entitiesXml)
        return console.timeEnd('Jsons builder done in ')
	}
}

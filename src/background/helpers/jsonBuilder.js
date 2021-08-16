const { writeFileAsync } = require('../tools/fileSystem')
const convert = require('xml-js')
const entitiesXml = require('!raw-loader!../jsons/entities2.xml')

module.exports = {
    convertToJson: async function(xml) {
        return JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}))
    },
    removeXmlComments: async function(xml) {
        return xml.replace(/<!--.*?-->/sg, "")
    },
    buildEntitiesJson: async function(xml) {
        console.time('Entities json done in ')
        const lastBosses = ["951.0.0","912.0.0","274.0.0","273.0.0","102.1.0"]
        const ignoreEntities = ["951.42.0","951.41.0","951.31.0","U951.23.0","951.21.0","951.11.0","951.3.0","951.2.0","951.1.0","950.10.0","950.2.0","950.1.0","921.1.0","919.1.0","915.1.0","912.100.2","912.100.1","912.100.0","912.10.0","911.2.0","911.1.0","910.2.0","910.1.0","909.10.0","906.1.0","903.20.0","903.10.0","903.1.0","835.10.0","831.10.0","830.10.0","818.2.3","818.2.2","818.2.1","818.1.3","818.1.2","818.1.1","818.0.3","818.0.2","818.0.1","811.0.1","811.0.2","811.0.3","811.0.4","811.0.5","811.0.6","33.11.3","33.11.2","33.11.1","244.2.1","25.3.1","10.3.5","10.3.4","10.3.3","10.3.2","10.3.1","409.1.1","409.1.2","3.217.0","3.216.0","405.1.0","404.1.0","311.10.0","310.1.0","275.2.0","275.1.0","275.0.0","274.2.0","274.1.0","273.10.0","266.2.0","266.1.0","251.10.0","102.2.0","84.10.0","79.11.0","79.10.0","73.1.0","73.0.0","72.1.0","72.0.0","76.0.0","75.0.0","66.10.0","66.20.0","66.30.0","65.10.0","51.31.0","51.21.0","51.11.0","51.30.0","51.20.0","51.10.0","45.10.0","39.22.0","38.2.0","35.10.0","35.3.0","5.1.0","887.0.0"]
        const cleanEntitiesXml = await module.exports.removeXmlComments(xml.default)
        const convertEntitiesXml = await module.exports.convertToJson(cleanEntitiesXml)
        const entitiesJson = convertEntitiesXml.entities.entity.map(entity => {
            const entityId = `${entity._attributes.id}.${entity._attributes.variant ? entity._attributes.variant : 0}.${entity._attributes.subtype ? entity._attributes.subtype : 0}`
            if (!ignoreEntities.includes(entityId) && entity._attributes.baseHP && parseInt(entity._attributes.baseHP) > 0 && entity._attributes.collisionDamage && parseInt(entity._attributes.collisionDamage) > 0) {
                return {
                    id: entityId,
                    name: entity._attributes.name,
                    champion: entity._attributes.champion,
                    boss: entity._attributes.boss,
                    bossId: entity._attributes.bossID,
                    lastBoss: lastBosses.includes(entityId) ? true : false,
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

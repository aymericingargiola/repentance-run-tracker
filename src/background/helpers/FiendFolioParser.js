const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const cheerio = require('cheerio')
const { writeFileAsync } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const mainUrl = 'https://fiendfolio.wiki.gg/'
const baseUrl = `${mainUrl}/wiki`
const entitiesUrl = `${baseUrl}/Enemies`
const bossesUrl = `${baseUrl}/Bosses`
const entitiesImagesFolder = './public/img/entities/fiendfolio-reheated'

module.exports = {
    downloadImage: async function(fileName, ext, url) {
      const image = await axios({method: "GET", url: url, responseType: "stream", })
      .then(response => {
        return response.data
      })
      .catch(error => {
        console.log(error)
        return false
      })
      if (image) {
        try {
          await writeFileAsync(entitiesImagesFolder, `${fileName}${ext}`, image)
        } catch (err) {
          console.log(err)
          return false
        }
      }
      return true
    },
    getPage: async function(url) {
      return await axios.get(url)
      .then(response => {
        return response.data
      })
      .catch(error => {
        console.log(error)
        return false
      })
    },
    buildMonstersImages: async function() {
      const monstersHtml = await module.exports.getPage(entitiesUrl)
      const $ = cheerio.load(monstersHtml)
      const ennemies = $("a[title]")
      await asyncForEach(ennemies, async (ennemy) => {
        const parentTable = $(ennemy).parents("tr").first()
        if (parentTable.find("td").length === 3) {
          const img = parentTable.find("img").first()
          if (img && img.length > 0) {
            const url = $(img).attr("src")
            if (url && url != "") {
              const nameSplited = url.split("/")[4]
              const name = nameSplited.substring(0, nameSplited.indexOf(".")).replaceAll("_", "").replaceAll("NEW", "").replace(/[0-9]/g, "")
              await module.exports.downloadImage(name, ".png", `${mainUrl}/${url}`)
            }
            else console.log("\x1b[31m", `Issue to download image`, "\x1b[0m")
          }
        }
        return
      })
    },
    buildBossesImages: async function() {
      const bossesHtml = await module.exports.getPage(bossesUrl)
      const $ = cheerio.load(bossesHtml)
      const images = $(".floatnone").find("img")
      await asyncForEach(images, async (image) => {
        const url = $(image).attr("src")
        if (url && url != "") {
          const nameSplited = url.split("/").includes("thumb") ? url.split("/")[5] : url.split("/")[4]
          const name = nameSplited.substring(0, nameSplited.indexOf(".")).replaceAll("_", "").replaceAll("NEW", "").replace(/[0-9]/g, "")
          await module.exports.downloadImage(name, ".png", `${mainUrl}/${url}`)
        }
        else console.log("\x1b[31m", `Issue to download image`, "\x1b[0m")
        return
      })
    },
    buildEntitiesImages: async function() {
      await module.exports.buildMonstersImages()
      await module.exports.buildBossesImages()
    }
}

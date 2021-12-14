const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const cheerio = require('cheerio')
const { writeFileAsync } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const mainUrl = 'https://bindingofisaacrebirth.fandom.com'
const baseUrl = `${mainUrl}/wiki`
const entitiesUrl = `${baseUrl}/Monsters`
const bossesUrl = `${baseUrl}/All_Bosses_(Bosses)`
const entitiesImagesFolder = './public/img/entities'

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
      const table = $("table").first()
      const trs = table.find("tbody > tr")
      await asyncForEach(trs, async (tr) => {
        const tds = $(tr).find("td")
        const id = $(tds[1]).text().split(".").length < 3 ? `${$(tds[1]).text().trim()}.0` : $(tds[1]).text().trim()
        const imageUrl = $(tds[0]).find("img").first().data("src")
        await module.exports.downloadImage(id, ".png", imageUrl)
      })
    },
    buildBossesImages: async function() {
      const bossesHtml = await module.exports.getPage(bossesUrl)
      const $ = cheerio.load(bossesHtml)
      const images = $("img[data-image-name*='Boss']")
      await asyncForEach(images, async (image) => {
        const bossPageUrl = $(image).parent().attr("href")
        const bossDataImageName = $(image).data("image-name")
        if (bossPageUrl.includes("/wiki/")) {
          const bossPageHtml = await module.exports.getPage(`${mainUrl}${bossPageUrl}`)
          const $2 = cheerio.load(bossPageHtml)
          const codetest = $2("code").first().text()
          // const image2 = $2(`img[data-image-name='${bossDataImageName}']`)
          // const imageUrl = $2(image2).data("src")
          // const matchingCodeId = $2(image2).parentsUntil("[role='region']").find("code").first().text().trim()
          // const id = matchingCodeId.split(".").length < 3 ? `${matchingCodeId}.0` : matchingCodeId
          console.log(codetest)
          //await module.exports.downloadImage(id, ".png", imageUrl)
        }
      })
    },
    buildEntitiesImages: async function() {
      //await module.exports.buildMonstersImages()
      await module.exports.buildBossesImages()
    }
}

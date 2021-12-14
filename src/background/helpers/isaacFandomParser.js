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
const miniBossesUrl = `${baseUrl}/All_Mini-Bosses_(Bosses)`
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
        const imageUrl = !$(tds[0]).find("img").first().data("src") ? $(tds[0]).find("img").first().attr("src") : $(tds[0]).find("img").first().data("src")
        if (imageUrl) await module.exports.downloadImage(id, ".png", imageUrl)
        else console.log("\x1b[31m", `Issue to download image for id ${id}`, "\x1b[0m")
        return
      })
    },
    buildBossesImages: async function() {
      const bossesHtml = await module.exports.getPage(bossesUrl)
      const $ = cheerio.load(bossesHtml)
      const images = $("img[data-image-name*='Boss']")
      await asyncForEach(images, async (image) => {
        const bossPageUrl = $(image).parent().attr("href")
        if (!bossPageUrl.includes("/wiki/")) return
        const bossPageHtml = await module.exports.getPage(`${mainUrl}${bossPageUrl}`)
        const $2 = cheerio.load(bossPageHtml)
        const role = $2("[role='region']")
        const context = bossPageUrl.includes("Ultra_Greedier") ? $2(role[1]) : $2(role[0])
        const codeId = $2(context).find("code").first().text().trim()
        const id = codeId.split(".").length < 3 ? `${codeId}.0` : codeId
        const inGameImages = $2(context).find(`[title='In-game appearance']`).first()
        const imageUrl = !$2(inGameImages[0]).data("src") ? $2(inGameImages[0]).attr("src") : $2(inGameImages[0]).data("src") 
        if (imageUrl) await module.exports.downloadImage(id, ".png", imageUrl)
        else console.log("\x1b[31m", `Issue to download image for id ${id}`, "\x1b[0m")
        return
      })
    },
    buildMiniBossesImages: async function() {
      const miniBossesHtml = await module.exports.getPage(miniBossesUrl)
      const $ = cheerio.load(miniBossesHtml)
      const links = $(".floatnone a[title]")
      await asyncForEach(links, async (link) => {
        const miniBossesPageUrl = $(link).attr("href")
        if (!miniBossesPageUrl.includes("/wiki/")) return
        const miniBossesPageHtml = await module.exports.getPage(`${mainUrl}${miniBossesPageUrl}`)
        const $2 = cheerio.load(miniBossesPageHtml)
        const role = $2("[role='region']")
        const context = $2(link).attr("title").includes("Gabriel") ? $2(role[1]) : $2(role[0])
        const codeId = $2(context).find("code").first().text().trim()
        const id = codeId.split(".").length < 3 ? `${codeId}.0` : codeId
        const entityImages = $2(context).find(`[alt='Entity image']`).first()
        const imageUrl = !$2(entityImages[0]).data("src") ? $2(entityImages[0]).attr("src") : $2(entityImages[0]).data("src")
        if (imageUrl) await module.exports.downloadImage(id, ".png", imageUrl)
        else console.log("\x1b[31m", `Issue to download image for id ${id}`, "\x1b[0m")
        return
      })
    },
    buildEntitiesImages: async function() {
      // await module.exports.buildMonstersImages()
      // await module.exports.buildBossesImages()
      await module.exports.buildMiniBossesImages()
    }
}

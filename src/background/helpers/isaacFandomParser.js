const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const cheerio = require('cheerio')
const { writeFileAsync } = require('../tools/fileSystem')
const { asyncForEach } = require('../tools/methods')
const baseUrl = "https://bindingofisaacrebirth.fandom.com/wiki"
const entitiesUrl = `${baseUrl}/Monsters`
const entitiesImagesFolder = './public/img/entities'

async function init() {
  await module.exports.getPage(entitiesUrl)
}



module.exports = {
    getPage: async function(url) {
      return await axios.get(url)
      .then(response => {
        console.log(response)
        return response
      })
      .catch(error => {
        console.log(error)
        return false
      })
    },
    buildEntitiesImages: async function() {
      await module.exports.getPage(entitiesUrl)
    }
}

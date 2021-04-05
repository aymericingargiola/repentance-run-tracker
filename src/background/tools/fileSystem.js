const util = require("util");
const fs = require('fs').promises;
const fsSync = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const path = require('path');
module.exports = {
  dirExist: function(dir) {
    if (!fsSync.existsSync(dir)) return false
    else return true
  },
  dirResolve: function(dir) {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, {
        recursive: true
      });
    }
  },
  writeFileAsync: async function(dir, fileName, datas) {
    console.time(`Write "${dir}\\${fileName}" in `)
    module.exports.dirResolve(dir)
    try {
      await fs.writeFile(`${dir}\\${fileName}`, datas, function(error) {if(error) console.log(error)});
    } catch (error) {
      console.log(error)
      return false
    }
    console.timeEnd(`Write "${dir}\\${fileName}" in `)
    return true
  },
  readFileAsync: async function(dir, fileName) {
    console.time(`Read "${dir}\\${fileName}" in `)
    module.exports.dirExist(dir)
    try {
      file = await readFile(`${dir}\\${fileName}`, function(error) {if(error) console.log(error)})
    } catch (error) {
      console.log(error)
      return false
    }
    console.timeEnd(`Read "${dir}\\${fileName}" in `)
    return file;
  }
}
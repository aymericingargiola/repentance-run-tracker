const exec = require('child_process').exec
module.exports = {
  asyncForEach: async function(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  },
  findLastIndex: function(array, searchValue) {
    let index = array.slice().reverse().findIndex(x => x === searchValue)
    let count = array.length - 1
    let finalIndex = index >= 0 ? count - index : index
    return finalIndex
  },
  findLastIndexObj: function(array, searchKey, searchValue) {
    if (!array || !searchValue) return -1
    var index = array.slice().reverse().findIndex(x => x[searchKey] === searchValue);
    var count = array.length - 1
    var finalIndex = index >= 0 ? count - index : index
    return finalIndex
  },
  isRunning: function(query, cb) {
    let platform = process.platform
    let cmd = ''
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break
        case 'linux' : cmd = `ps -A`; break
        default: break
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1)
    })
  },
  cloneFrom: function(source) {
    var result = source, i, len;
    if (!source
        || source instanceof Number
        || source instanceof String
        || source instanceof Boolean) {
        return result
    } else if (Object.prototype.toString.call(source).slice(8,-1) === 'Array') {
        result = []
        var resultLen = 0
        for (i = 0, len = source.length; i < len; i++) {
            result[resultLen++] = module.exports.cloneFrom(source[i])
        }
    } else if (typeof source == 'object') {
        result = {}
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                result[i] = module.exports.cloneFrom(source[i])
            }
        }
    }
    return result
  }
}
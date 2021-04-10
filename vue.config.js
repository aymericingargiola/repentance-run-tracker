const fs = require('fs')
const path = require('path')
const rawLoader = require('raw-loader')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
module.exports = {
    configureWebpack: config => {
        config.entry.app = '/src/renderer/main.js'
        
    },
    chainWebpack: config => {
        config
        .plugin('define')
          .tap(args => {
            let v = JSON.stringify(require('./package.json').version)
            args[0]['process.env']['VERSION'] = v
            return args
          })
    },
    // module: {
    //     rules: [
    //         {
    //             resourceQuery: /raw/,
    //             type: 'asset/source',
    //         }
    //     ]
    // },
    // plugins: [
    //     new webpack.DefinePlugin({
    //         'process.env': {
    //             PACKAGE_VERSION: '"' + version + '"'
    //         }
    //     })
    // ],
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/background/main.js',
            rendererProcessFile: 'src/renderer/main.js',
        }
    },
    css: {
        loaderOptions: {
            sass: {
                implementation: require('sass')
            }
        }
    }
}
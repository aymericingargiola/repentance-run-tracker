const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
module.exports = {
    configureWebpack: config => {
        config.entry.app = '/src/renderer/main.js'
    },
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
    },
}
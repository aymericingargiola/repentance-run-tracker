const fs = require('fs')
const path = require('path')
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
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/background/main.js',
            rendererProcessFile: 'src/renderer/main.js',
            builderOptions: {
                appId: "com.repentanceruntracker.app",
                productName: "Repentance Run Tracker",
                win: {
                    target: [
                        "nsis",
                        "appx"
                    ]
                },
                publish: [
                  {
                    provider: "github",
                    owner: "aymericingargiola",
                    repo: "repentance-run-tracker",
                    releaseType: "draft"
                  }
                ]
            }
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
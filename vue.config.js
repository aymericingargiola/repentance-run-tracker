module.exports = {
    configureWebpack: config => {
        config.entry.app = '/src/renderer/main.js'
    },
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
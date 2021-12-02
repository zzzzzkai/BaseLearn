const webpack = require('webpack')

module.exports = {

    lintOnSave: false,
    publicPath: process.env.BASE_URL||'./',
    runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
    productionSourceMap:false, // 生产环境的 source map
    parallel: require("os").cpus().length > 1,
    pwa: {},
    // outputDir: 'dist', // 运行时生成的生产环境构建文件的目录(默认''dist''，构建之前会被清除)
    configureWebpack: {
        module: {
            // Fix for flot resize
            rules: [{
                test: /jquery\.flot\.resize\.js$/,
                use: 'imports-loader?this=>window'
            }]
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jquery: 'jquery',
                'window.jQuery': 'jquery',
                jQuery: 'jquery'
            })
        ]
    },
    transpileDependencies: [
        'resize-detector' // vue-echarts
    ],

    devServer: {
        overlay: { // 让浏览器 overlay 同时显示警告和错误
          warnings: true,
          errors: true
        },
        open: true, // 是否打开浏览器
        // host: "localhost",
        // port: "8080", //  
        https: false,
        hotOnly: true, // 热更新
        // proxy: {
        //   "/api": {
        //     target:
        //       "https://xxxx", // 目标代理接口地址
        //     secure: false,
        //     changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        //     // ws: true, // 是否启用websockets
        //     pathRewrite: {
        //       "^/api": "/"
        //     }
        //   }
        // }
      }
}
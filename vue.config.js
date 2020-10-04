const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    configureWebpack: {
        plugins: [
            // new CompressionPlugin({
            //     filename: "[path][base].br",
            //     algorithm: "brotliCompress",
            //     test: /\.(js|css|html|svg)$/,
            //     compressionOptions: {
            //         level: 11,
            //     },
            //     threshold: 10240,
            //     minRatio: 0.8,
            //     deleteOriginalAssets: false,
            // }),
            new CompressionPlugin({
                filename: "[path][base].gz[query]",
                algorithm: "gzip",
                test: /\.(js|css|html|svg)$/,
                compressionOptions: {
                    level: 9
                },
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false
            }),
        ]
    }
};
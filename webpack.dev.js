var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://0.0.0.0:3000',
        'webpack/hot/only-dev-server',
        './src/app.tsx'
    ],
    output: {
        path: __dirname + '/dev',
        filename: "bundle.js",
        sourcePrefix: ''
    },
    externals: {
    },
    debug: true,
    devtool: 'source-map',
    devServer: {
        contentBase: './dev',
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".ts", ".tsx", ".js"]
    },
    module: {
        unknownContextCritical: false,
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, loader: 'file-loader' },
            { test: /\.ts$/, loaders: [ 'babel', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, loaders: [ 'react-hot', 'babel', 'ts-loader'], exclude: /node_modules/ }
        ]

    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};

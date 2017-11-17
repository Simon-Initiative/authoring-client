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
        historyApiFallback: {
          index: 'index.html'
        }
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".ts", ".tsx", ".js"],
        // Add webpack aliases for top level imports
        alias: {
            actions: path.resolve(__dirname, 'src/actions'),
            components: path.resolve(__dirname, 'src/components'),
            data: path.resolve(__dirname, 'src/data'),
            editors: path.resolve(__dirname, 'src/editors'),
            reducers: path.resolve(__dirname, 'src/reducers'),
            stylesheets: path.resolve(__dirname, 'src/stylesheets'),
            types: path.resolve(__dirname, 'src/types'),
            utils: path.resolve(__dirname, 'src/utils'),
        },
    },
    module: {
        unknownContextCritical: false,
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader?sourceMap=true" },
            {
              test: /\.scss$/,
              loaders: ["style-loader", "css-loader?sourceMap=true", "sass-loader"]
            },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, loader: 'file-loader' },
            { test: /\.ts$/, loaders: [ 'babel', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, loaders: [ 'react-hot', 'babel', 'ts-loader'], exclude: /node_modules/ }
        ]

    },
    sassLoader: {
        includePaths: [
            path.join(__dirname, 'src/stylesheets'),
        ],
        sourceMap: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};

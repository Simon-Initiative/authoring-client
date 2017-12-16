var path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: "./src/app.tsx",
    output: {
        path: __dirname + '/dist',
        filename: "bundle.js",
        sourcePrefix: ''
    },
    externals: {
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"],

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
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify("production")
        }
      })
    ],
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            {
              test: /\.scss$/,
              use: [
                  { loader: "style-loader"},
                  { loader: "css-loader"},
                  { loader: "sass-loader",
                    options: {
                        includePaths: [
                            path.join(__dirname, 'src/stylesheets'),
                        ],
                        sourceMap: true
                    }
                }]
            },
            { test: /\.json$/, use: 'json-loader' },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, use: 'file-loader' },
            { test: /\.ts$/, use: [ 'babel-loader', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, use: ['babel-loader','ts-loader'], exclude: /node_modules/ }
        ]

    }
};

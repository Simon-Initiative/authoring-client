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
        extensions: ["", ".ts", ".tsx", ".js"],
        extensions: ["", ".ts", ".tsx", ".js"],
        // Add webpack aliases for top level imports
        alias: {
            app: path.resolve(__dirname, 'src'),
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
        unknownContextCritical: false,
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            {
              test: /\.scss$/,
              loaders: ["style-loader", "css-loader", "sass-loader"]
            },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, loader: 'file-loader' },
            { test: /\.ts$/, loaders: [ 'babel', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, loaders: [ 'babel', 'ts-loader'], exclude: /node_modules/ }
        ],

    }
};

var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const pathsToClean = ['dist'];
const cleanOptions = {};

module.exports = {
    mode: 'production',
    entry: {
        app: './src/app.tsx',
        vendor: [
            'draft-js',
            'history',
            'immutable',
            'json-beautify',
            'keycloak-js',
            'react',
            'react-addons-css-transition-group',
            'react-addons-shallow-compare',
            'react-bootstrap-typeahead',
            'react-dnd',
            'react-dnd-html5-backend',
            'react-dom',
            'react-redux',
            'redux',
            'redux-logger',
            'redux-thunk',
            'tsmonad',
            'whatwg-fetch'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].js'
    },
    externals: {
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.jss'],

        // Add webpack aliases for top level imports
        alias: {
            actions: path.resolve(__dirname, 'src/actions'),
            components: path.resolve(__dirname, 'src/components'),
            data: path.resolve(__dirname, 'src/data'),
            editors: path.resolve(__dirname, 'src/editors'),
            reducers: path.resolve(__dirname, 'src/reducers'),
            styles: path.resolve(__dirname, 'src/styles'),
            stylesheets: path.resolve(__dirname, 'src/stylesheets'),
            types: path.resolve(__dirname, 'src/types'),
            utils: path.resolve(__dirname, 'src/utils'),
        },
    },
    optimization: {
        namedModules: true,
        splitChunks: {
            name: 'vendor',
        },
        noEmitOnErrors: true,
        concatenateModules: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
      }),
      new CleanWebpackPlugin(pathsToClean, cleanOptions),
      new HtmlWebpackPlugin({
         template: '!!underscore-template-loader!./index.html',
         inject: false
      }),
      new webpack.HashedModuleIdsPlugin(),
      new UglifyJsPlugin()
    ],
    module: {
        rules: [
            { test: /\.html$/, loader: 'underscore-template-loader' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            {
              test: /\.scss$/,
              use: [
                  { loader: 'style-loader'},
                  { loader: 'css-loader'},
                  { loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.join(__dirname, 'src/stylesheets'),
                        ],
                        sourceMap: true
                    }
                }]
            },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, use: 'file-loader' },
            { test: /\.ts$/, use: [ 'babel-loader', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, use: ['babel-loader','ts-loader'], exclude: /node_modules/ }
        ]

    }
};

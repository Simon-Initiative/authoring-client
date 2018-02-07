var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: ['react-hot-loader/patch', './src/app.tsx'],
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
        path: path.resolve(__dirname, 'dev'),
        filename: '[name].[hash].js'
    },
    externals: {
    },
    devtool: 'source-map',
    devServer: {
        contentBase: __dirname,
        historyApiFallback: true,
        hot: true,
        disableHostCheck: true,
        port: 9000,
        host: '0.0.0.0',
        stats: {
            colors: true
        }
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js'],
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
            { test: /\.json$/, use: 'json-loader' },
            { test: /\.(png|gif|jpg|jpeg|svg)$/, use: 'file-loader' },
            { test: /\.ts$/, use: [ 'babel-loader', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.tsx$/, use: [
                { loader: 'babel-loader',
                    options: {
                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: true,
                        plugins: [
                        'react-hot-loader/babel'
                        ]
                    },
                },
                { loader: 'ts-loader'}
            ], exclude: /node_modules/ }
        ]

    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: '!!underscore-template-loader!./index.html',
            inject: false
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest'
        })
    ]
};

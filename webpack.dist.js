var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const pathsToClean = ['dist'];
const cleanOptions = {};

const uglifyOptions = {
    compress: {
      arrows: false,
      booleans: false,
      collapse_vars: false,
      comparisons: false,
      computed_props: false,
      hoist_funs: false,
      hoist_props: false,
      hoist_vars: false,
      if_return: false,
      inline: false,
      join_vars: false,
      keep_infinity: true,
      loops: false,
      negate_iife: false,
      properties: false,
      reduce_funcs: false,
      reduce_vars: false,
      sequences: false,
      side_effects: false,
      switches: false,
      top_retain: false,
      toplevel: false,
      typeofs: false,
      unused: false,

      // Switch off all types of compression except those needed to convince
      // react-devtools that we're using a production build
      conditionals: true,
      dead_code: true,
      evaluate: true,
      },
      mangle: true,
  };

module.exports = {
    entry: {
        app: './src/app.tsx',
        vendor: [
            'react', 'immutable', 'tsmonad', 'draft-js', 'react-addons-css-transition-group',
            'react-dom', 'react-addons-shallow-compare', 'react-dnd', 'react-dnd-html5-backend',
            'react-hot-loader', 'react-redux', 'redux', 'redux-logger', 'redux-thunk'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].[hash].js"
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
      }),
      new CleanWebpackPlugin(pathsToClean, cleanOptions),
      new HtmlWebpackPlugin({
         template: '!!underscore-template-loader!./index.html'
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest'
      }),
      new UglifyJsPlugin({ uglifyOptions })
    ],
    module: {
        rules: [
            { test: /\.html$/, loader: "underscore-template-loader" },
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

// webpack.config.js
const webpack = require('webpack');
const path = require('path');

// Detect if the builtin webpack -p flag is in use.
const minimize =
  process.argv.indexOf('--optimize-minimize') !== -1 ||
  process.argv.indexOf('-p') !== -1;

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: minimize ? 'aframe-tilemap.min.js' : 'aframe-tilemap.js',
    library: 'aframeTilemap',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    aframe: {
      commonjs: 'aframe',
      amd: 'aframe',
      root: 'AFRAME', // global variable
    },
    three: {
      commonjs: 'three',
      amd: 'three',
      root: 'THREE', // global variable
    },
  },
};

// webpack.config.js
import webpack from 'webpack';
import path from 'path';

const library = 'aframeTilemap';
const filename = 'aframe-tilemap.js';

const config = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/lib',
    filename,
    library,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js'],
  },
  externals: {
    three: {
      root: 'THREE',
    },
    aframe: {
      root: 'AFRAME',
    },
  },
};

export default config;

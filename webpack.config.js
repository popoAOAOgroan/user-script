const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ROOT_DIR = path.resolve(__dirname);
module.exports = {
  mode: 'production',
  entry: {
    trans: './src/index.js'
  },
  output: {
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        exclude: /\.js/i,
      })
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { root: ROOT_DIR }),
  ]
}
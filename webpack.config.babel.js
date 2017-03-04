/* eslint no-console:"off" */
const {resolve} = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const {getIfUtils, removeEmpty} = require('webpack-config-utils')
const OfflinePlugin = require('offline-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = env => {
  const {ifProd, ifNotProd} = getIfUtils(env)
  const config = {
    context: resolve('src'),
    entry: {
      app: './index.js',
      vendor: ['./vendor.js'],
    },
    output: {
      filename: ifProd('bundle.[name].[chunkhash].js', 'bundle.[name].js'),
      path: resolve('dist'),
      pathinfo: ifNotProd(),
    },
    devtool: ifProd('source-map', 'eval'),
    module: {
      loaders: [
        {
          test: /\.js$/, 
          loaders: ['babel-loader'], 
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader',
          })
        },
      ],
    },
    // removeEmpty will remove empty plugins (e.g. ifProd(...))
    plugins: removeEmpty([
      new ProgressBarPlugin(),
      new ExtractTextPlugin(ifProd('styles.[name].[chunkhash].css', 'styles.[name].css')),
      ifProd(new InlineManifestWebpackPlugin()),
      ifProd(new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
      })),
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'head',
      }),
      new OfflinePlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),
    ]),
  }

  // @todo - Uncomment to enable debugging your webpack configuration!
  // if (env.debug) {
  //   console.log('Debugging enabled')
  //   debugger
  // }
  
  return config
}

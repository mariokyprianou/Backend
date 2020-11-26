/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal
    ? 'eval-cheap-module-source-map'
    : 'source-map',
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
    alias: {
      '@lib/common': path.resolve(__dirname, 'libs/common/src'),
      '@lib/database': path.resolve(__dirname, 'libs/database/src'),
    },
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      // all files with a `.gql` or `.graphql` extension will be handled by `graphql-tag`
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  optimization: {
    // Minification causes issues with NestJS class resolution
    minimize: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: ['./**/*.graphql'],
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
};

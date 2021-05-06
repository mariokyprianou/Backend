/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isDevelopment = ['development', 'qa'].includes(
  slsw.lib.serverless.service.provider.stage,
);

module.exports = {
  context: __dirname,
  mode: isDevelopment ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
    alias: {
      '@lib/common': path.resolve(__dirname, 'libs/common/src'),
      '@lib/database': path.resolve(__dirname, 'libs/database/src'),
      '@lib/power': path.resolve(__dirname, 'libs/power/src'),
      '@lib/taxonomy': path.resolve(__dirname, 'libs/taxonomy/src'),
      '@td/auth-provider': path.resolve(__dirname, 'libs/auth-provider/src'),
      '@td/generate-csv-report': path.resolve(
        __dirname,
        'libs/generate-csv-report/src',
      ),
      '@td/subscriptions': path.resolve(__dirname, 'libs/subscriptions/src'),
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

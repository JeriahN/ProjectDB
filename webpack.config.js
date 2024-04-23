const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  plugins: [
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: "localhost",
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // through BrowserSync
        proxy: "http://localhost:3030/",
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false,
        injectCss: true,
        files: ["Public/**/*.css", "Public/**/*.js", "Public/**/*.html"],
      }
    ),
    new MiniCssExtractPlugin(),
    new NodePolyfillPlugin()
  ],
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "Public/Javascript"),
    filename: "main.js",
  },
  mode: "development", // Change mode to "production" for optimized builds
  module: {
    rules: [
      {
        test: /\.js$/, // Target JavaScript files
        exclude: /node_modules/, // Exclude libraries
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  optimization: {
    minimize: true, // Enable minification for smaller bundle size
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
    usedExports: true, // Enable tree shaking for unused code
    sideEffects: true, // Enable tree shaking for unused code
  },
};

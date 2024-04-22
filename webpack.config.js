const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  plugins: [],
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
    ],
  },
  optimization: {
    minimize: true, // Enable minification for smaller bundle size
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
    usedExports: true, // Enable tree shaking for unused code
    sideEffects: true, // Enable tree shaking for unused code
  },
};

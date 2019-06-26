const webpack = require('webpack');
const path = require("path");

const plugins = {
  development: [],
  production: [
    // compressing
    new webpack.optimize.OccurrenceOrderPlugin(),
    // compressing
    new webpack.optimize.AggressiveMergingPlugin()
  ],
};


module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || process.env.WEBPACK_ENV || argv.mode || 'development';

  return {
    entry: {
      index: path.join(__dirname, "src", "index.ts"),
    },
    output: {
      path: path.join(__dirname, "lib"),
      filename: (mode === 'production')
        ? 'scene-graph-pixi-fittext-rt.min.js'
        : 'scene-graph-pixi-fittext-rt.js',
      library: 'scene-graph-pixi-fittext-rt',
      libraryTarget: "umd",
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
      ],
    },
    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        "node_modules"
      ],
      extensions: [".ts", ".js"],
    },
    plugins: (mode === 'production') ? plugins.production : plugins.development,
    devtool: (mode === 'production') ? false : 'source-map',
    devServer: {
      contentBase: ["dist", "assets"],
    }
  };
};

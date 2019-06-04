const webpack = require('webpack');
const path    = require('path');

const plugins = [
  // compressing
  new webpack.optimize.OccurrenceOrderPlugin(),
  // compressing
  new webpack.optimize.AggressiveMergingPlugin()
];

module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || process.env.WEBPACK_ENV || argv.mode || 'development';

  return {
    mode: mode,
    entry: {
      index: path.join(__dirname, 'src', 'index.ts'),
    },

    output: {
      path: path.join(__dirname, 'lib'),
      filename: (mode === 'production')
        ? 'scene-graph-three-rt.min.js'
        : 'scene-graph-three-rt.js',
      library: 'scene-graph-three-rt',
      libraryTarget: 'umd'
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            { loader: 'ts-loader' }
          ]
        }
      ]
    },

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [
        "node_modules"
      ]
    },

    node: {
      fs: 'empty'
    },

    devtool: (mode === 'production') ? false : 'source-map',
    plugins: plugins
  }
};

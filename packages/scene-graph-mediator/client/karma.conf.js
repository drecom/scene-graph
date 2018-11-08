const path     = require('path');
const tsconfig = require('./tsconfig');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [
      'mocha',
      'karma-typescript'
    ],
    files: [
      './src/*.ts',
      './src/**/*.ts',
      './test/*.test.ts',
      './test/**/*.test.ts'
    ],
    preprocessors: {
      './src/*.ts': ['karma-typescript'],
      './src/**/*.ts': ['karma-typescript'],
      './test/*.ts': ['karma-typescript'],
      './test/**/*.ts': ['karma-typescript']
    },
    reporters: [
      'mocha'
    ],
    autoWatch: false,
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    browsers: [
      'ChromeHeadless'
    ],
    singleRun: true,

    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
      include: [
        './test/*.test.ts',
        './test/**/*.test.ts'
      ]
    }
  });
};

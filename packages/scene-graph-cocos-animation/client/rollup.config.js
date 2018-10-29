import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    file: './lib/scene-graph-cocos-animation-cli.js',
    format: 'cjs'
  },
  external: [
    'fs'
  ],
  plugins: [
    typescript()
  ]
}

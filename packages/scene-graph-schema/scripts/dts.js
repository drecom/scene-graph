// node
const fs           = require('fs');
const path         = require('path');
const childProcess = require('child_process');

// modules
// TODO: js2ts can not resolve oneOf property assigning restriction
const js2ts = require('json-schema-to-typescript');

// directories and namespaces
const rootDir = path.resolve(__dirname, '..');
const destDir = process.env.DEST ? process.env.DEST : path.resolve(rootDir, 'types');
const definitionsDirNameSpace = 'definitions';
const schemaExtRegExp = /\.json$/;
const dtsExt = '.d.ts';

/**
 * execute native CLI
 */
function cmd(line) {
  // TODO: unix only
  console.log(line);
  childProcess.execSync(line);
}

/**
 * compile single jsons chema to typescript definition
 */
function compile(file) {
  const dest   = file.replace(schemaExtRegExp, dtsExt).replace(rootDir, destDir);
  const option = { cwd: path.dirname(file), unreachableDefinitions: true };

  js2ts.compileFromFile(file, option).then(content => {
    fs.writeFile(dest, content, e => {
      if (e) {
        console.log(e);
      }
    });
  });
}

/**
 * compile json schema to typescript recursively.
 */
function compileRecursive(baseDir) {
  const list = fs.readdirSync(baseDir);

  for (var i = 0; i < list.length; i++) {
    const target = path.resolve(baseDir, list[i]);

    if (fs.statSync(target).isDirectory()) {
      const subdir = path.dirname(target.replace(rootDir, destDir));
      if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
      }
      compileRecursive(target);
    } else {
      if (schemaExtRegExp.test(target)) {
        compile(target);
      }
    }
  }
}

/**
 * entry point
 */
function dts() {
  if (fs.existsSync(destDir)) {
    cmd('rm -rf ' + destDir);
  }

  fs.mkdirSync(destDir);
  fs.mkdirSync(path.resolve(destDir, definitionsDirNameSpace));

  compile(path.resolve(rootDir, 'Schema.json'));
  compileRecursive(path.resolve(rootDir, definitionsDirNameSpace));
}

if (process.argv.length >= 2) {
  // run immediately if this script is executed from CLI
  dts();
} else {
  // or export it
  module.exports = dts;
}

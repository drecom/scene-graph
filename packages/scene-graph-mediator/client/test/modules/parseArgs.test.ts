import * as path from 'path';
import { assert, expect } from 'chai';
import { describe, it } from 'mocha';

import * as commander from 'commander';

import parseArgs from '../../src/modules/parseArgs';


commander.option(
  '-r, --runtime [value]',
  "-r option duplicates with test command"
);

describe('parseArgs',  () => {
  describe('define via environmental variables [deprecated]',  () => {
    before(() => {
      process.env.RUNTIME          = 'myRuntime';
      process.env.ASSET_ROOT       = '/path/to/asset/root';
      process.env.SCENE_FILE       = `${__filename} ${__filename}`;
      process.env.DEST             = '/path/to/dest';
      process.env.ASSET_DEST       = '/path/to/asset/dest';
      process.env.ASSET_NAME_SPACE = 'myAssetName';
      process.env.PLUGINS          = `${__filename} ${__filename}`;

      commander.parse(process.argv);
    });

    after(() => {
      delete process.env.RUNTIME;
      delete process.env.ASSET_ROOT;
      delete process.env.SCENE_FILE;
      delete process.env.DEST;
      delete process.env.ASSET_DEST;
      delete process.env.ASSET_NAME_SPACE;
      delete process.env.PLUGINS;
    });

    it('should accept environmental variables', () => {
      const parsed = parseArgs();

      const expectedSceneFiles = process.env.SCENE_FILE ? process.env.SCENE_FILE.split(' ')
        .map((item) => path.resolve(process.cwd(), item)) : assert.fail();

      expect(parsed.runtime).to.equal(commander.runtime || process.env.RUNTIME);
      expect(parsed.assetRoot).to.equal(process.env.ASSET_ROOT);
      expect(parsed.sceneFiles).to.deep.equal(expectedSceneFiles);
      expect(parsed.destDir).to.equal(process.env.DEST);
      expect(parsed.assetDestDir).to.equal(process.env.ASSET_DEST);
      expect(parsed.assetNameSpace).to.equal(process.env.ASSET_NAME_SPACE);
      expect(parsed.plugins).to.deep.equal((process.env.PLUGINS ? process.env.PLUGINS.split(' ') : assert.fail()));
    });
  });

  describe('define via CLI options variables',  () => {
    let testArgv = [];
    const testValue = {
      runtime:        'cc2',
      assetRoot:      '/path/to/asset/root',
      sceneFiles:     `${__filename} ${__filename}`,
      destDir:        '/path/to/dest',
      assetDestDir:   '/path/to/asset/dest',
      assetNameSpace: 'myassetnamespace',
      plugins:        `${__filename} ${__filename}`
    };

    before(() => {
      testArgv = [
        'node', 'sgmed',
        '--runtime',        testValue.runtime,
        '--assetRoot',      testValue.assetRoot,
        '--sceneFiles',     testValue.sceneFiles,
        '--destDir',        testValue.destDir,
        '--assetDestDir',   testValue.assetDestDir,
        '--assetNameSpace', testValue.assetNameSpace,
        '--plugins',        testValue.plugins
      ];

      process.argv = testArgv;
    });

    after(() => {
      process.argv = [];
    });

    it('should accept CLI option values', () => {
      const parsed = parseArgs();

      expect(parsed.runtime).to.equal(testValue.runtime);
      expect(parsed.assetRoot).to.equal(testValue.assetRoot);
      expect(parsed.sceneFiles).to.deep.equal(testValue.sceneFiles.split(' '));
      expect(parsed.destDir).to.equal(testValue.destDir);
      expect(parsed.assetDestDir).to.equal(testValue.assetDestDir);
      expect(parsed.assetNameSpace).to.equal(testValue.assetNameSpace);
      expect(parsed.plugins).to.deep.equal(testValue.plugins.split(' '));
    });
  });

  describe('when both environmental variables and CLI options are passed',  () => {
    let testArgv = [];
    const testValue = {
      runtime:        'cliopt_cc2',
      assetRoot:      '/cliopt/path/to/asset/root',
      sceneFiles:     `${__filename} ${__filename}`,
      destDir:        '/cliopt/path/to/dest',
      assetDestDir:   '/cliopt/path/to/asset/dest',
      assetNameSpace: 'clioptmyassetnamespace',
      plugins:        `${__filename} ${__filename}`
    };

    before(() => {
      process.env.RUNTIME          = 'env_myRuntime';
      process.env.ASSET_ROOT       = '/env/path/to/asset/root';
      process.env.SCENE_FILE       = '/env/scene1.scene /env/scene2.scene';
      process.env.DEST             = '/env/path/to/dest';
      process.env.ASSET_DEST       = '/env/path/to/asset/dest';
      process.env.ASSET_NAME_SPACE = 'envmyAssetName';
      process.env.PLUGINS          = '/env/plugin1 /env/plugin2';

      testArgv = [
        'node', 'sgmed',
        '--runtime',        testValue.runtime,
        '--assetRoot',      testValue.assetRoot,
        '--sceneFiles',     testValue.sceneFiles,
        '--destDir',        testValue.destDir,
        '--assetDestDir',   testValue.assetDestDir,
        '--assetNameSpace', testValue.assetNameSpace,
        '--plugins',        testValue.plugins
      ];

      process.argv = testArgv;
    });

    after(() => {
      delete process.env.RUNTIME;
      delete process.env.ASSET_ROOT;
      delete process.env.SCENE_FILE;
      delete process.env.DEST;
      delete process.env.ASSET_DEST;
      delete process.env.ASSET_NAME_SPACE;
      delete process.env.PLUGINS;

      process.argv = [];
    });

    it('should give CLI option proprity', () => {
      const parsed = parseArgs();

      expect(parsed.runtime).to.equal(testValue.runtime);
      expect(parsed.assetRoot).to.equal(testValue.assetRoot);
      expect(parsed.sceneFiles).to.deep.equal(testValue.sceneFiles.split(' '));
      expect(parsed.destDir).to.equal(testValue.destDir);
      expect(parsed.assetDestDir).to.equal(testValue.assetDestDir);
      expect(parsed.assetNameSpace).to.equal(testValue.assetNameSpace);
      expect(parsed.plugins).to.deep.equal(testValue.plugins.split(' '));
    });
  });
});

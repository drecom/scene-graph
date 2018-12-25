import * as path from 'path';
import * as parseCliOption from 'command-line-args';
import Args from '../interface/Args';

/**
 * Parses CLI argument via process.env and convert to Args type.
 */
export default function parseArgs(): Args {
  const argsDefinitions = [
    { name: 'config',         alias: 'c', type: String },
    { name: 'runtime',        alias: 'r', type: String },
    { name: 'assetRoot',      alias: 'a', type: String },
    { name: 'sceneFiles',     alias: 's', type: String, multiple: true },
    { name: 'destDir',        alias: 'd', type: String },
    { name: 'assetDestDir',   alias: 'g', type: String },
    { name: 'assetNameSpace', alias: 'n', type: String },
    { name: 'plugins',        alias: 'p', type: String, multiple: true },
  ];

  const nodeOptions = parseCliOption(argsDefinitions);

  // passing option via process.env is deprecated

  let config: {
    runtime?: string;
    assetRoot?: string;
    sceneFiles?: string | string[];
    destDir?: string;
    assetDestDir?: string;
    assetNameSpace?: string;
    plugins?: string | string[];
  } = {};

  if (nodeOptions.config) {
    const userConfigFactory = require(path.resolve(process.cwd(), nodeOptions.config));
    config = userConfigFactory();
    if (config.sceneFiles && !Array.isArray(config.sceneFiles)) {
      config.sceneFiles = [config.sceneFiles];
    }
    if (config.plugins && !Array.isArray(config.plugins)) {
      config.plugins = [config.plugins];
    }
  }

  // priority
  // cli option > user config > env
  const args: Args = {
    runtime:        nodeOptions.runtime        || config.runtime        || process.env.RUNTIME || '',
    assetRoot:      nodeOptions.assetRoot      || config.assetRoot      || process.env.ASSET_ROOT || '',
    sceneFiles:     nodeOptions.sceneFiles     || config.sceneFiles     || (process.env.SCENE_FILE ? process.env.SCENE_FILE.split(' ') : []),
    destDir:        nodeOptions.destDir        || config.destDir        || process.env.DEST       || path.resolve(process.cwd(), 'scene-graph'),
    assetDestDir:   nodeOptions.assetDestDir   || config.assetDestDir   || process.env.ASSET_DEST || '',
    assetNameSpace: nodeOptions.assetNameSpace || config.assetNameSpace || process.env.ASSET_NAME_SPACE || 'assets',
    plugins:        nodeOptions.plugins        || config.plugins        || (process.env.PLUGINS ? process.env.PLUGINS.split(' ') : [])
  };

  args.assetDestDir = args.assetDestDir || path.resolve(args.destDir, args.assetNameSpace);

  if (!args.runtime) {
    throw new Error('runtime option is required');
  }
  if (!args.assetRoot) {
    throw new Error('assetRoot option is required');
  }
  if (args.sceneFiles.length === 0) {
    throw new Error('sceneFiles option is required');
  }

  if (!path.isAbsolute(args.assetRoot)) {
    args.assetRoot = path.resolve(process.cwd(), args.assetRoot);
  }

  if (!path.isAbsolute(args.destDir)) {
    args.destDir = path.resolve(process.cwd(), args.destDir);
  }

  for (let i = 0; i < args.sceneFiles.length; i++) {
    const sceneFile = args.sceneFiles[i];
    if (!path.isAbsolute(sceneFile)) {
      args.sceneFiles[i] = path.resolve(process.cwd(), sceneFile);
    }
  }

  args.assetRoot = args.assetRoot.replace(/\/$/, '');

  return args;
}

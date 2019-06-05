import * as fs from 'fs';
import * as path from 'path';
import * as commander from 'commander';
import Args from '../interface/Args';
import SceneExporterPlugin from '../interface/SceneExporterPlugin';
import AssetExporterPlugin from '../interface/AssetExporterPlugin';

/**
 * Parses CLI argument via process.env and convert to Args type.
 */
export default function parseArgs(): Args {
  const packageJson = require('../../package.json');

  const spaceSeparatedPaths = (value: string): string[] => {
    const parts = [];
    const frags = value.split(' ');
    for (let i = 0; i < frags.length; i++) {
      const frag = frags[i];
      if (fs.existsSync(frag)) {
        parts.push(frag);
      } else {
        const nextFrag = frags[i + 1];
        if (!nextFrag) {
          break;
        }
        frags[i + 1] = `${frag} ${nextFrag}`;
      }
    }

    return parts;
  };

  commander
    .version(packageJson.version)
    .option(
      '-c, --config [value]',
      'config file path'
    )
    .option(
      '-r, --runtime [value]',
      "runtime identifier, currently supports only 'cc'"
    )
    .option(
      '-ar, --assetRoot [value]',
      'root directory for assets'
    )
    .option(
      '-s, --sceneFiles [value]',
      'exporting scene files (space separated)',
      spaceSeparatedPaths
    )
    .option(
      '-d, --destDir [value]',
      "destination directory;                          default './scene-graph'"
    )
    .option(
      '-ad, --assetDestDir [value]',
      'asset destination directory;                    default \${DEST}/\${ASSET_NAME_SPACE}'
    )
    .option(
      '-an, --assetNameSpace [value]',
      "asset directory name;                           default 'assets'"
    )
    .option(
      '-p, --plugins [value]',
      "space separated plugin names (space separated); default ''",
      spaceSeparatedPaths
    )
    .parse(process.argv);

  // passing option via process.env is deprecated

  let config: {
    runtime?: string;
    assetRoot?: string;
    sceneFiles?: string | string[];
    destDir?: string;
    assetDestDir?: string;
    assetNameSpace?: string;
    plugins?: string | SceneExporterPlugin | AssetExporterPlugin |
    string[] | SceneExporterPlugin[] | AssetExporterPlugin[];
  } = {};

  let configFilePath = '';

  // using -c option
  if (commander.config) {
    const userConfigFactory = require(path.resolve(process.cwd(), commander.config));
    config = userConfigFactory();
    if (config.sceneFiles && !Array.isArray(config.sceneFiles)) {
      config.sceneFiles = [config.sceneFiles];
    }
    if (config.plugins && !Array.isArray(config.plugins)) {
      const plugin = config.plugins as string | SceneExporterPlugin | AssetExporterPlugin;
      config.plugins = [plugin] as string[] | SceneExporterPlugin[] | AssetExporterPlugin[];
    }

    configFilePath = path.dirname(commander.config);
  }

  // priority
  // cli option > user config > env
  const args: Args = {
    runtime:
      commander.runtime
      || config.runtime
      || process.env.RUNTIME
      || '',
    assetRoot:
      commander.assetRoot
      || config.assetRoot
      || process.env.ASSET_ROOT
      || '',
    sceneFiles:
      commander.sceneFiles
      || config.sceneFiles
      || (process.env.SCENE_FILE ? spaceSeparatedPaths(process.env.SCENE_FILE) : []),
    destDir:
      commander.destDir
      || config.destDir
      || process.env.DEST
      || path.resolve(process.cwd(), 'scene-graph'),
    assetDestDir:
      commander.assetDestDir
      || config.assetDestDir
      || process.env.ASSET_DEST
      || '',
    assetNameSpace:
      commander.assetNameSpace
      || config.assetNameSpace
      || process.env.ASSET_NAME_SPACE
      || 'assets',
    plugins:
      commander.plugins
      || config.plugins
      || (process.env.PLUGINS ? spaceSeparatedPaths(process.env.PLUGINS) : [])
  };

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
    args.assetRoot = path.resolve(process.cwd(), configFilePath, args.assetRoot);
  }

  if (!path.isAbsolute(args.destDir)) {
    args.destDir = path.resolve(process.cwd(), args.destDir);
  }

  if (args.assetDestDir) {
    if (!path.isAbsolute(args.assetDestDir)) {
      args.assetDestDir = path.resolve(args.destDir, args.assetNameSpace, args.assetDestDir);
    }
  }
  else {
    args.assetDestDir = path.resolve(args.destDir, args.assetNameSpace);
  }

  for (let i = 0; i < args.sceneFiles.length; i++) {
    const sceneFile = args.sceneFiles[i];
    if (!path.isAbsolute(sceneFile)) {
      args.sceneFiles[i] = path.resolve(process.cwd(), configFilePath, sceneFile);
    }
  }

  args.assetRoot = args.assetRoot.replace(/\/$/, '');

  return args;
}

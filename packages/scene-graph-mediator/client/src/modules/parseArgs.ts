import * as path from 'path';
import Args from '../interface/Args';

/**
 * Parses CLI argument via process.env and convert to Args type.
 */
export default function parseArgs(): Args {
  const args: Args = {
    runtime:        process.env.RUNTIME    || '',
    assetRoot:      process.env.ASSET_ROOT || '',
    sceneFiles:     process.env.SCENE_FILE ? process.env.SCENE_FILE.split(' ') : [],
    destDir:        process.env.DEST       || path.resolve(process.cwd(), 'scene-graph'),
    assetDestDir:   process.env.ASSET_DEST || '',
    assetNameSpace: process.env.ASSET_NAME_SPACE || 'assets',
    graphFileName:  process.env.GRAPH_FILE_NAME  || 'graph.json',
    plugins:        process.env.PLUGINS ? process.env.PLUGINS.split(' ') : []
  };

  args.assetDestDir = args.assetDestDir || path.resolve(args.destDir, args.assetNameSpace);

  if (!args.runtime) {
    throw new Error();
  }
  if (!args.assetRoot) {
    throw new Error();
  }
  if (args.sceneFiles.length === 0) {
    throw new Error();
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

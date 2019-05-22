import * as fs from 'fs';
import * as path from 'path';

import Args from './interface/Args';
import ExportManager from './exporter/ExportManager';
import parseArgs from './modules/parseArgs';
import mkdirp from './modules/mkdirp';
import { CliHelptext } from './constants';

/**
 * entry point for export CLI
 */
export default function cli(): void {
  let args: Args;
  try {
    args = parseArgs();
  } catch (e) {
    console.log(e);
    console.log(CliHelptext);
    return;
  }

  /**
   * Instantiate exporter implement
   */
  const manager = new ExportManager();
  manager.loadPlugins(args.plugins);

  /**
   * Execute export
   */
  const sceneGraphs = manager.exportScene(args.runtime, args.sceneFiles, args.assetRoot);

  // scene graph file manages assets
  const assetExportMap = manager.exportAsset(
    sceneGraphs,
    args.runtime,
    args.assetRoot,
    args.assetDestDir,
    args.assetNameSpace
  );

  const newDirRoot = args.assetDestDir;

  mkdirp(newDirRoot);

  // write scene graph file
  sceneGraphs.forEach((sceneGraph, sceneFilePath) => {
    const destFileName = `${path.basename(sceneFilePath)}.json`;
    const dest = path.join(args.assetDestDir, destFileName);
    // if (debug) {
    fs.writeFile(dest, JSON.stringify(sceneGraph, null, 2), () => {});
    // } else {
    //   fs.writeFile(dest, JSON.stringify(sceneGraph), () => {});
    // }
  });

  // copy assets
  assetExportMap.forEach((entity) => {
    const targetDir = path.dirname(entity.localDestPath);
    mkdirp(targetDir);
    fs.copyFile(entity.localSrcPath, entity.localDestPath, () => {});
  });
}

import * as fs from 'fs';
import * as path from 'path';

import Args from './interface/Args';
import ExportManager from './exporter/ExportManager';
import parseArgs from './modules/parseArgs';
import { CliHelptext } from './constants';

/**
 * entry point for export CLI
 */
export default function cli(): void {
  let args: Args;
  try {
    args = parseArgs();
  } catch (e) {
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
  const exportExportMap = manager.exportAsset(
    sceneGraphs,
    args.runtime,
    args.assetRoot,
    args.assetDestDir,
    args.assetNameSpace
  );

  let newDirRoot = args.assetDestDir;
  const directories: string[] = newDirRoot.split(path.sep);
  const makingDirectories: string[] = [];

  // create dest directory recursively
  while (!fs.existsSync(newDirRoot)) {
    const dir = directories.pop();
    if (!dir) break;
    makingDirectories.push(dir);
    newDirRoot = directories.join(path.sep);
  }

  while (makingDirectories.length > 0) {
    const dir = makingDirectories.pop();
    if (!dir) break;
    newDirRoot = path.join(newDirRoot, dir);
    fs.mkdirSync(newDirRoot);
  }

  // write scene graph file
  sceneGraphs.forEach((sceneGraph, sceneFilePath) => {
    const destFileName = path.basename(sceneFilePath) + '.json';
    const dest = path.join(args.assetDestDir, destFileName);
    // if (debug) {
    fs.writeFile(dest, JSON.stringify(sceneGraph, null, 2), () => {});
    // } else {
    //   fs.writeFile(dest, JSON.stringify(sceneGraph), () => {});
    // }
  });

  // copy assets
  exportExportMap.forEach((entity) => {
    const targetDir = path.dirname(entity.localDestPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    fs.copyFile(entity.localSrcPath, entity.localDestPath, () => {});
  });
}

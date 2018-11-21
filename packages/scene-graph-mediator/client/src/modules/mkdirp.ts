import * as fs from 'fs';
import * as path from 'path';

export default function mkdirp(target: string) {
  const directories: string[] = target.split(path.sep);
  const makingDirectories: string[] = [];

  let tempRoot = target;

  while (!fs.existsSync(tempRoot)) {
    const dir = directories.pop();
    if (!dir) break;
    makingDirectories.push(dir);
    tempRoot = directories.join(path.sep);
  }

  while (makingDirectories.length > 0) {
    const dir = makingDirectories.pop();
    if (!dir) break;
    tempRoot = path.join(tempRoot, dir);
    fs.mkdirSync(tempRoot);
  }
}

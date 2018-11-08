import * as path from 'path';

/**
 * Elements of AssetFileMap.
 * It contains file path and some modification methods.
 */
export default class AssetFileEntity {
  /**
   * Absolute file path
   */
  public readonly filePath!: string;

  /**
   * Returns file extension including period (.).
   */
  get extension(): string {
    return path.extname(this.filePath);
  }

  /**
   * Constructor throws exception when given path is invalid as absolute path.
   */
  constructor(absolutePath: string) {
    if (!path.isAbsolute(absolutePath)) {
      throw new Error('AssetFileEntity only accepts absolute path as constructor argument');
    }
    this.filePath = absolutePath;
  }

  /**
   * Change absolute path to relative path based on given path.
   */
  public relativeLocalPath(basePath: string): string {
    return this.filePath.replace(basePath, '').replace(/^\//, '');
  }
}

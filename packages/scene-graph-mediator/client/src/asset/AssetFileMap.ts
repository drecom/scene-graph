import * as fs from 'fs';
import * as path from 'path';

import AssetFileEntity from './AssetFileEntity';

/**
 * AssetFileMap handles file path based asset list.
 */
export default class AssetFileMap {
  /**
   * Asset root path.
   */
  private assetRoot!: string;
  /**
   * Map of AssetFileEntity related to absolute path.
   */
  private entities!: Map<string, AssetFileEntity>;

  /**
   * Constructor throws exception when given path is invalid as absolute path.
   */
  constructor(assetRoot: string) {
    if (!path.isAbsolute(assetRoot)) {
      throw new Error('AssetFileMap accepts only absolute asset root.');
    }
    this.assetRoot = assetRoot;
    this.entities = new Map<string, AssetFileEntity>();
  }

  /**
   * Clear AssetFileEntity map.
   */
  public clear(): void {
    this.entities.clear();
  }

  /**
   * Wrapper for entities.get() to keep it readonly.
   */
  public get(key: string): AssetFileEntity | undefined {
    return this.entities.get(key);
  }

  /**
   * Wrapper for entities.forEach() to keep it readonly.
   */
  public forEach(proc: (entity: AssetFileEntity, key: string) => void): void {
    this.entities.forEach(proc);
  }

  /**
   * Scan given path and set entities.
   */
  public scan(targetPath: string = this.assetRoot): void {
    const entities = fs.readdirSync(targetPath);

    for (let i = 0; i < entities.length; i++) {
      const absPath = path.resolve(targetPath, entities[i]);

      if (fs.statSync(absPath).isDirectory()) {
        this.scan(absPath);
      } else {
        this.entities.set(absPath, new AssetFileEntity(absPath));
      }
    }
  }
}

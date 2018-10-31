import AssetFileEntity from './AssetFileEntity';
/**
 * AssetFileMap handles file path based asset list.
 */
export default class AssetFileMap {
    /**
     * Asset root path.
     */
    private assetRoot;
    /**
     * Map of AssetFileEntity related to absolute path.
     */
    private entities;
    /**
     * Constructor throws exception when given path is invalid as absolute path.
     */
    constructor(assetRoot: string);
    /**
     * Clear AssetFileEntity map.
     */
    clear(): void;
    /**
     * Wrapper for entities.get() to keep it readonly.
     */
    get(key: string): AssetFileEntity | undefined;
    /**
     * Wrapper for entities.forEach() to keep it readonly.
     */
    forEach(proc: (entity: AssetFileEntity, key: string) => void): void;
    /**
     * Scan given path and set entities.
     */
    scan(targetPath?: string): void;
}

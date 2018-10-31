/**
 * Elements of AssetFileMap.
 * It contains file path and some modification methods.
 */
export default class AssetFileEntity {
    /**
     * Absolute file path
     */
    readonly filePath: string;
    /**
     * Returns file extension including period (.).
     */
    readonly extension: string;
    /**
     * Constructor throws exception when given path is invalid as absolute path.
     */
    constructor(absolutePath: string);
    /**
     * Change absolute path to relative path based on given path.
     */
    relativeLocalPath(basePath: string): string;
}

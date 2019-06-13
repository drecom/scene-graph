export default class UnityAssetFile {
    static readonly metaExt: string;
    static readonly metaRegex: RegExp;
    static createWithMetaFile(metaFile: string): UnityAssetFile;
    static createWithAssetFile(assetFile: string): UnityAssetFile;
    static isMetaFile(file: string): boolean;
    asset: string;
    meta: string;
    constructor(assetFile: string, metaFile: string);
}

export default class UnityAssetFile {
  public static readonly metaExt: string = 'meta';
  public static readonly metaRegex: RegExp = new RegExp(`\.${UnityAssetFile.metaExt}$`);

  public static createWithMetaFile(metaFile: string): UnityAssetFile {
    return new UnityAssetFile(metaFile.replace(UnityAssetFile.metaRegex, ''), metaFile);
  }
  public static createWithAssetFile(assetFile: string): UnityAssetFile {
    return new UnityAssetFile(assetFile, `${assetFile}.${UnityAssetFile.metaExt}`);
  }

  public static isMetaFile(file: string): boolean {
    return UnityAssetFile.metaRegex.test(file);
  }

  public asset: string = '';
  public meta: string = '';

  constructor(assetFile: string, metaFile: string) {
    this.asset = assetFile;
    this.meta = metaFile;
  }
}

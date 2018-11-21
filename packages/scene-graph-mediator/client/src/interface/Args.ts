/**
 * CLI argument place holder
 */
export default interface Args {
  runtime:        string;
  assetRoot:      string;
  sceneFiles:     string[];
  destDir:        string;
  assetDestDir:   string;
  assetNameSpace: string;
  plugins:        string[];
}

/**
 * CLI argument place holder
 */
export default interface Args {
  runtime:        string;
  assetRoot:      string;
  sceneFiles:     string[];
  graphFileName:  string;
  destDir:        string;
  assetDestDir:   string;
  assetNameSpace: string;
  plugins:        string[];
}

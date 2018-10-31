import AssetExporter from './AssetExporter';

/**
 * Interface for assets exporter constructor
 */
export default interface AssetExporterConstructor {
  new(): AssetExporter;
}

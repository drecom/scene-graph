import { SchemaJson } from '@drecom/scene-graph-schema';
/**
 * Importer interface<br />
 * It is instantiated by factory<br />
 * Constructor is defined as ImporterConstructor<br />
 */
export interface Importer {
    import(schema: SchemaJson, args: any): any;
}
/**
 * Importers' constructor signature for factory.
 */
export interface ImporterConstructor {
    new (): any;
}

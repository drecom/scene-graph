import { Importer, ImportOption } from 'importer/Importer';
import Pixi from 'importer/Pixi';
import Three from 'importer/Three';
declare const Importers: {
    Pixi: typeof Pixi;
    Three: typeof Three;
    Abstract: typeof Importer;
};
export { Importers, ImportOption };

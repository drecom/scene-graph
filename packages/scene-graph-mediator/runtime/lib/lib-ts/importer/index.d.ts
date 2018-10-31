import { Importer, ImportOption } from 'importer/Importer';
import Pixi from 'importer/Pixi';
declare const Importers: {
    Pixi: typeof Pixi;
    Abstract: typeof Importer;
};
export { Importers, ImportOption };

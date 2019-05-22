import { Importer, ImportOption } from 'importer/Importer';
import Pixi from 'importer/Pixi';
import Three from 'importer/Three';

const Importers = {
  Pixi,
  Three,
  Abstract: Importer
};

export { Importers, ImportOption };

import Exporter from 'exporter/Exporter';
import Pixi from 'exporter/Pixi';
declare const Exporters: {
    Pixi: typeof Pixi;
    Abstract: typeof Exporter;
};
export { Exporters };

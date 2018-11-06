import PropertyConverter from '../interface/PropertyConverter';
export declare type ConvertedObject = {
    position: {
        x: number;
        y: number;
    };
    scale: {
        x: number;
        y: number;
    };
    anchor: {
        x: number;
        y: number;
    };
    rotation: number;
};
export declare const Pixi: PropertyConverter.Interface;

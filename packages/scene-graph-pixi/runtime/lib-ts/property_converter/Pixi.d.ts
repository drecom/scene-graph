import { PropertyConverter } from '@drecom/scene-graph-mediator-rt';
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

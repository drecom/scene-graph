import * as THREE from 'three';
import ThreeLoader from 'runtime/three/interface/ThreeLoader';
export default class TgaLoader implements ThreeLoader {
    static readonly TGA_TYPE_NO_DATA: number;
    static readonly TGA_TYPE_INDEXED: number;
    static readonly TGA_TYPE_RGB: number;
    static readonly TGA_TYPE_GREY: number;
    static readonly TGA_TYPE_RLE_INDEXED: number;
    static readonly TGA_TYPE_RLE_RGB: number;
    static readonly TGA_TYPE_RLE_GREY: number;
    static readonly TGA_ORIGIN_MASK: number;
    static readonly TGA_ORIGIN_SHIFT: number;
    static readonly TGA_ORIGIN_BL: number;
    static readonly TGA_ORIGIN_BR: number;
    static readonly TGA_ORIGIN_UL: number;
    static readonly TGA_ORIGIN_UR: number;
    path: any;
    manager: any;
    constructor(manager?: any);
    load(url: string, onLoad?: any, onProgress?: any, onError?: any): THREE.Texture;
    parse(buffer: any): any;
    setPath(value: any): this;
    tgaCheckHeader(header: any): void;
    tgaParse(use_rle: boolean, use_pal: boolean, header: any, offset: number, data: any): {
        pixel_data: any;
        palettes: any;
    };
    tgaGetImageData8bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any, palettes: any): any;
    tgaGetImageData16bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any): any;
    tgaGetImageData24bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any): any;
    tgaGetImageData32bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any): any;
    tgaGetImageDataGrey8bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any): any;
    tgaGetImageDataGrey16bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any): any;
    getTgaRGBA(header: any, use_grey: boolean, data: any, width: number, height: number, image: any, palette: any): any;
}

import * as THREE from 'three';
import ThreeLoader from 'runtime/three/interface/ThreeLoader';

/* tslint:disable */

interface OffscreenCanvas extends HTMLCanvasElement {
}
declare var OffscreenCanvas: {
    new (width: number, height: number): OffscreenCanvas;
}

/*
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 * @author mrdoob / http://mrdoob.com/
 * @author takahirox / https://github.com/takahirox/
 */

export default class TgaLoader implements ThreeLoader {
  // TGA constants

    public static readonly TGA_TYPE_NO_DATA: number = 0;
    public static readonly TGA_TYPE_INDEXED: number = 1;
    public static readonly TGA_TYPE_RGB: number = 2;
    public static readonly TGA_TYPE_GREY: number = 3;
    public static readonly TGA_TYPE_RLE_INDEXED: number = 9;
    public static readonly TGA_TYPE_RLE_RGB: number = 10;
    public static readonly TGA_TYPE_RLE_GREY: number = 11;

    public static readonly TGA_ORIGIN_MASK: number = 0x30;
    public static readonly TGA_ORIGIN_SHIFT: number = 0x04;
    public static readonly TGA_ORIGIN_BL: number = 0x00;
    public static readonly TGA_ORIGIN_BR: number = 0x01;
    public static readonly TGA_ORIGIN_UL: number = 0x02;
    public static readonly TGA_ORIGIN_UR: number = 0x03;

    public path: any;
    public manager!: any;

    constructor(manager?: any) {
        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    }
    load(url: string, onLoad?: any, onProgress?: any, onError?: any) {
        var scope = this;

        var texture = new THREE.Texture();

        var loader = new THREE.FileLoader( this.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.setPath( this.path );

        loader.load( url, function (buffer: any) {
            texture.image = scope.parse( buffer );
            texture.needsUpdate = true;

            if ( onLoad !== undefined ) {
                onLoad( texture );
            }
        }, onProgress, onError );

        return texture;
    }

    parse(buffer: any) {
        if ( buffer.length < 19 ) console.error( 'THREE.TgaLoader: Not enough data to contain header.' );

        var content = new Uint8Array( buffer ),
            offset = 0,
            header = {
                id_length: content[ offset ++ ],
                colormap_type: content[ offset ++ ],
                image_type: content[ offset ++ ],
                colormap_index: content[ offset ++ ] | content[ offset ++ ] << 8,
                colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
                colormap_size: content[ offset ++ ],
                origin: [
                    content[ offset ++ ] | content[ offset ++ ] << 8,
                    content[ offset ++ ] | content[ offset ++ ] << 8
                ],
                width: content[ offset ++ ] | content[ offset ++ ] << 8,
                height: content[ offset ++ ] | content[ offset ++ ] << 8,
                pixel_size: content[ offset ++ ],
                flags: content[ offset ++ ]
            };

            // check tga if it is valid format

        this.tgaCheckHeader( header );

        if ( header.id_length + offset > buffer.length ) {

            console.error( 'THREE.TgaLoader: No data.' );

        }

        // skip the needn't data

        offset += header.id_length;

        // get targa information about RLE compression and palette

        var use_rle = false,
            use_pal = false,
            use_grey = false;

        switch ( header.image_type ) {

            case TgaLoader.TGA_TYPE_RLE_INDEXED:
                use_rle = true;
                use_pal = true;
                break;

            case TgaLoader.TGA_TYPE_INDEXED:
                use_pal = true;
                break;

            case TgaLoader.TGA_TYPE_RLE_RGB:
                use_rle = true;
                break;

            case TgaLoader.TGA_TYPE_RGB:
                break;

            case TgaLoader.TGA_TYPE_RLE_GREY:
                use_rle = true;
                use_grey = true;
                break;

            case TgaLoader.TGA_TYPE_GREY:
                use_grey = true;
                break;

        }

        //

        var useOffscreen = typeof OffscreenCanvas !== 'undefined';

        var canvas = useOffscreen ? new OffscreenCanvas( header.width, header.height ) : document.createElement( 'canvas' );
        canvas.width = header.width;
        canvas.height = header.height;

        var context = canvas.getContext( '2d' );
        var imageData = context!.createImageData( header.width, header.height );

        var result = this.tgaParse(use_rle, use_pal, header, offset, content);
        /*var rgbaData = */this.getTgaRGBA(header, use_grey, imageData.data, header.width, header.height, result.pixel_data, result.palettes );

        context!.putImageData( imageData, 0, 0 );

        return useOffscreen ? (canvas as any).transferToImageBitmap() : canvas;

    }

    setPath(value: any) {
        this.path = value;
        return this;
    }

    tgaCheckHeader(header: any) {
        switch ( header.image_type ) {
            // check indexed type
            case TgaLoader.TGA_TYPE_INDEXED:
            case TgaLoader.TGA_TYPE_RLE_INDEXED:
                if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {
                    console.error( 'THREE.TgaLoader: Invalid type colormap data for indexed type.' );
                }
                break;
            // check colormap type
            case TgaLoader.TGA_TYPE_RGB:
            case TgaLoader.TGA_TYPE_GREY:
            case TgaLoader.TGA_TYPE_RLE_RGB:
            case TgaLoader.TGA_TYPE_RLE_GREY:
                if ( header.colormap_type ) {
                    console.error( 'THREE.TgaLoader: Invalid type colormap data for colormap type.' );
                }
                break;
            // What the need of a file without data ?
            case TgaLoader.TGA_TYPE_NO_DATA:
                console.error( 'THREE.TgaLoader: No data.' );
            // Invalid type ?
            default:
                console.error( 'THREE.TgaLoader: Invalid type "%s".', header.image_type );
        }

        // check image width and height
        if ( header.width <= 0 || header.height <= 0 ) {
            console.error( 'THREE.TgaLoader: Invalid image size.' );
        }

        // check image pixel size
        if ( header.pixel_size !== 8 && header.pixel_size !== 16 &&
            header.pixel_size !== 24 && header.pixel_size !== 32 ) {
            console.error( 'THREE.TgaLoader: Invalid pixel size "%s".', header.pixel_size );
        }
    }

    // parse tga image buffer

    tgaParse(use_rle: boolean, use_pal: boolean, header: any, offset: number, data: any) {
        var pixel_data,
            pixel_size,
            pixel_total,
            palettes;

        pixel_size = header.pixel_size >> 3;
        pixel_total = header.width * header.height * pixel_size;

        // read palettes
        if ( use_pal ) {
            palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );
        }

        // read RLE
        if ( use_rle ) {
            pixel_data = new Uint8Array( pixel_total );

            var c, count, i;
            var shift = 0;
            var pixels = new Uint8Array( pixel_size );

            while ( shift < pixel_total ) {
                c = data[ offset ++ ];
                count = ( c & 0x7f ) + 1;

                // RLE pixels
                if ( c & 0x80 ) {
                    // bind pixel tmp array

                    for ( i = 0; i < pixel_size; ++ i ) {
                        pixels[ i ] = data[ offset ++ ];
                    }

                    // copy pixel array
                    for ( i = 0; i < count; ++ i ) {
                        pixel_data.set( pixels, shift + i * pixel_size );
                    }

                    shift += pixel_size * count;
                } else {
                    // raw pixels
                    count *= pixel_size;
                    for ( i = 0; i < count; ++ i ) {
                        pixel_data[ shift + i ] = data[ offset ++ ];
                    }
                    shift += count;
                }
            }
         } else {
            // raw pixels
            pixel_data = data.subarray(
                 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
            );
         }

         return {
            pixel_data: pixel_data,
            palettes: palettes
         };
    }

    tgaGetImageData8bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any, palettes: any) {
        var colormap = palettes;
        var color, i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i ++ ) {
                color = image[ i ];
                imageData[ ( x + width * y ) * 4 + 3 ] = 255;
                imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
                imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
                imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];
            }
        }

        return imageData;
    }

    tgaGetImageData16bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any) {
        var color, i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {
                color = image[ i + 0 ] + ( image[ i + 1 ] << 8 ); // Inversed ?
                imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
                imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
                imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) >> 3;
                imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;
            }
        }

        return imageData;
    }

    tgaGetImageData24bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any) {
        var i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {
                imageData[ ( x + width * y ) * 4 + 3 ] = 255;
                imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
                imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
                imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
            }
        }

        return imageData;
    }

    tgaGetImageData32bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any) {
        var i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {
                imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
                imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
                imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
                imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];
            }
        }

        return imageData;
    }

    tgaGetImageDataGrey8bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any) {
        var color, i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i ++ ) {
                color = image[ i ];
                imageData[ ( x + width * y ) * 4 + 0 ] = color;
                imageData[ ( x + width * y ) * 4 + 1 ] = color;
                imageData[ ( x + width * y ) * 4 + 2 ] = color;
                imageData[ ( x + width * y ) * 4 + 3 ] = 255;
            }
        }

        return imageData;
    }

    tgaGetImageDataGrey16bits(header: any, imageData: any, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number, image: any) {
        var i = 0, x, y;
        var width = header.width;

        for ( y = y_start; y !== y_end; y += y_step ) {
            for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {
                imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
                imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
                imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
                imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];
            }
        }

        return imageData;
    }

    getTgaRGBA(header: any, use_grey: boolean, data: any, width: number, height: number, image: any, palette: any) {
        var x_start,
            y_start,
            x_step,
            y_step,
            x_end,
            y_end;

        switch ((header.flags & TgaLoader.TGA_ORIGIN_MASK) >> TgaLoader.TGA_ORIGIN_SHIFT) {
            default:
            case TgaLoader.TGA_ORIGIN_UL:
                x_start = 0;
                x_step = 1;
                x_end = width;
                y_start = 0;
                y_step = 1;
                y_end = height;
                break;
            case TgaLoader.TGA_ORIGIN_BL:
                x_start = 0;
                x_step = 1;
                x_end = width;
                y_start = height - 1;
                y_step = - 1;
                y_end = - 1;
                break;
            case TgaLoader.TGA_ORIGIN_UR:
                x_start = width - 1;
                x_step = - 1;
                x_end = - 1;
                y_start = 0;
                y_step = 1;
                y_end = height;
                break;
            case TgaLoader.TGA_ORIGIN_BR:
                x_start = width - 1;
                x_step = - 1;
                x_end = - 1;
                y_start = height - 1;
                y_step = - 1;
                y_end = - 1;
                break;
        }

        if ( use_grey ) {
            switch ( header.pixel_size ) {
                case 8:
                    this.tgaGetImageDataGrey8bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                    break;
                case 16:
                    this.tgaGetImageDataGrey16bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                    break;
                default:
                    console.error( 'THREE.TgaLoader: Format not supported.' );
                    break;
            }
        } else {
            switch ( header.pixel_size ) {
                case 8:
                    this.tgaGetImageData8bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
                    break;
                case 16:
                    this.tgaGetImageData16bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                    break;
                case 24:
                    this.tgaGetImageData24bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                    break;
                case 32:
                    this.tgaGetImageData32bits(header, data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                    break;
                default:
                    console.error( 'THREE.TgaLoader: Format not supported.' );
                    break;
            }
        }

        // Load image data according to specific method
        // var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
        // func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
        return data;
    }
}

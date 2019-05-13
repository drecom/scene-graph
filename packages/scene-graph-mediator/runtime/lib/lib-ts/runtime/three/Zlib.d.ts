declare function buildHuffmanTable(lengths: any): (number | any[] | Uint32Array)[];
declare class RawInflate {
    static readonly BufferType: {
        BLOCK: number;
        ADAPTIVE: number;
    };
    static readonly MaxBackwardLength: number;
    static readonly MaxCopyLength: number;
    static readonly Order: any;
    static readonly LengthCodeTable: any;
    static readonly LengthExtraTable: any;
    static readonly DistCodeTable: any;
    static readonly DistExtraTable: any;
    static readonly FixedLiteralLengthTable: any;
    static readonly FixedDistanceTable: any;
    buffer: any;
    blocks: any;
    bufferSize: any;
    totalpos: any;
    ip: any;
    bitsbuf: any;
    bitsbuflen: any;
    input: any;
    output: any;
    op: any;
    bfinal: any;
    bufferType: any;
    resize: any;
    currentLitlenTable: any;
    constructor(input: any, opt_params: any);
    decompress(): any;
    parseBlock(): void;
    readBits(length: number): number;
    readCodeByTable(table: any): number;
    parseUncompressedBlock(): void;
    parseFixedHuffmanBlock(): void;
    parseDynamicHuffmanBlock(): void;
    decodeHuffmanBlock(litlen: any, dist: any): void;
    decodeHuffmanAdaptive(litlen: any, dist: any): void;
    expandBufferBlock(_opt_param?: any): any;
    expandBufferAdaptive(opt_param?: any): any;
    concatBufferBlock(): any;
    concatBufferDynamic(): any;
}
declare class Inflate {
    static readonly BufferType: {
        BLOCK: number;
        ADAPTIVE: number;
    };
    input: any;
    ip: number;
    rawinflate: any;
    verify: any;
    method: any;
    constructor(input: any, opt_params?: any);
    decompress(): any;
}
declare const Zip: {
    CompressionMethod: {
        STORE: number;
        DEFLATE: number;
    };
};
declare const Huffman: {
    buildHuffmanTable: typeof buildHuffmanTable;
};
export { Zip, Huffman, RawInflate, Inflate };

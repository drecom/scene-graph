import ThreeLoader from 'runtime/three/interface/ThreeLoader';
declare class UnityFBXLoader implements ThreeLoader {
    manager: any;
    fbxTree: any;
    crossOrigin: string;
    path: any;
    resourcePath: any;
    constructor(manager?: any);
    load(url: any, onLoad: any, onProgress?: any, onError?: any): void;
    setPath(value: any): this;
    setResourcePath(value: any): this;
    setCrossOrigin(value: any): this;
    parse(FBXBuffer: any, path: any): any;
}
export default UnityFBXLoader;

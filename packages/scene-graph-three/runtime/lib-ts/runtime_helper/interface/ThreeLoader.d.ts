export default interface ThreeLoader {
    load(url: string, onLoad?: any, onProgress?: any, onError?: any): void;
}

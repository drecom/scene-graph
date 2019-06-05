export {};
declare global {
    interface String {
        fillRight(word: string, count: number): string;
        fillLeft(word: string, count: number): string;
    }
}
export default function dummy(): void;

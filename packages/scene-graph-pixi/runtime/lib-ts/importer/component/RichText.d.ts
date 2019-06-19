/// <reference types="pixi.js" />
/**
 * RichText extension
 * It allows
 */
export declare class RichText {
    static readonly PARSER_TAG_NAME: string;
    /**
     * Create container contains styled texts
     */
    static createContainer(input: string, defaultParams?: PIXI.TextStyleOptions): PIXI.Container;
    /**
     * Parse HTMLDocumentNode and generate intermediate style data
     */
    private static parseNodeStyle;
    /**
     *
     */
    private static collectChildNodes;
    private static parseBBCode;
    private static pixiTextStyleOptionsByFragment;
    private static createRichTextContainer;
}

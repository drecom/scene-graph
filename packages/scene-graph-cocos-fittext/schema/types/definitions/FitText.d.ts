/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This interface was referenced by `DefinitionsFitTextJson`'s JSON-Schema
 * via the `definition` "fitText".
 */
export type FitText = Text & {
  fitText?: {
    requiredWidth: number;
    [k: string]: any;
  };
  [k: string]: any;
};

export interface DefinitionsFitTextJson {
  [k: string]: any;
}
export interface Text {
  text: string;
  style: {
    size?: number;
    horizontalAlign?: number;
    color?: string;
    [k: string]: any;
  };
  [k: string]: any;
}

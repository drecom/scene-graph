import { SchemaJson, Node, Transform } from '@drecom/scene-graph-schema';
declare namespace PropertyConverter {
    type Interface = {
        createConvertedObject: (schema: SchemaJson, transform: Transform) => any;
        fixCoordinate: (target: any, convertedObject: any, node: Node, parentNode?: Node) => void;
        applyConvertedObject: (target: any, convertedObject: any) => void;
    };
}
export default PropertyConverter;

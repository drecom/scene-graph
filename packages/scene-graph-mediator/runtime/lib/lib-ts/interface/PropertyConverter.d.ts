import { SchemaJson, Node, Transform } from '@drecom/scene-graph-schema';
declare namespace PropertyConverter {
    type Interface = {
        createConvertedObject: (schema: SchemaJson, transform: Transform) => any;
        fixCoordinate: (schema: SchemaJson, convertedObject: any, node: Node) => void;
        shouldNodeCoordinateFixed: (node: Node) => boolean;
        applyConvertedObject: (target: any, convertedObject: any) => void;
    };
}
export default PropertyConverter;

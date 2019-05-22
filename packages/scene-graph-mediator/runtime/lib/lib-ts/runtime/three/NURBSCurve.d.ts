import * as THREE from 'three';
/**
 * @author renej
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/
/**************************************************************
 *    NURBS curve
 **************************************************************/
export default class NURBSCurve extends THREE.Curve<THREE.Vector3> {
    degree: any;
    knots: any;
    controlPoints: any[];
    startKnot: any;
    endKnot: any;
    constructor(degree: any, knots: any[], // array of reals
    controlPoints: any[], // array of Vector(2|3|4)
    startKnot?: number, // index in knots
    endKnot?: number);
    getPoint(t: number): THREE.Vector3;
    getTangent(t: number): THREE.Vector3;
}

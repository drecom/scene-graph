import * as THREE from 'three';
import Three from '../importer/Three';
import NURBSUtils from './NURBSUtils';

/* tslint:disable */

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
  /*
    // Used by periodic NURBS to remove hidden spans
    public startKnot = startKnot || 0;
    public endKnot = endKnot || ( this.knots.length - 1 );
  */
    public degree: any;
    public knots: any;
    public controlPoints: any[] = [];
    public startKnot: any;
    public endKnot: any;

    constructor(
      degree: any,
      knots: any[], // array of reals
      controlPoints: any[], // array of Vector(2|3|4)
      startKnot?: number, // index in knots
      endKnot?: number // index in knots
    ) {
        super();

        this.degree = degree;
        this.knots = knots;
        this.controlPoints = [];
        // Used by periodic NURBS to remove hidden spans
        this.startKnot = startKnot || 0;
        this.endKnot = endKnot || ( this.knots.length - 1 );
        for ( var i = 0; i < controlPoints.length; ++ i ) {
            // ensure Vector4 for control points
            var point = controlPoints[ i ];
            this.controlPoints[ i ] = new Three.threeRef.Vector4(point.x, point.y, point.z, point.w);
        }
    }

    getPoint(t: number) {
        var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]); // linear mapping t->u
        // following results in (wx, wy, wz, w) homogeneous point
        var hpoint = NURBSUtils.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);

        if ( hpoint.w != 1.0 ) {
            // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
            hpoint.divideScalar(hpoint.w);
        }
        return new Three.threeRef.Vector3(hpoint.x, hpoint.y, hpoint.z);
    }


    getTangent(t: number) {
        var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);
        var ders = NURBSUtils.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);
        var tangent = ders[1].clone();
        tangent.normalize();

        return tangent;
    }
}

/**
 * @author renej
 * NURBS utils
 *
 * See NURBSCurve and NURBSSurface.
 *
 **/
/**************************************************************
 *    NURBS Utils
 **************************************************************/
export default class NURBSUtils {
    static findSpan(p: number, u: number, U: any): number;
    static calcBasisFunctions(span: number, u: number, p: number, U: any): number[];
    static calcBSplinePoint(p: number, U: any, P: any, u: any): any;
    static calcBasisFunctionDerivatives(span: any, u: number, p: number, n: number, U: any): number[][];
    static calcBSplineDerivatives(p: number, U: any, P: any, u: any, nd: number): any[];
    static calcKoverI(k: number, i: number): number;
    static calcRationalCurveDerivatives(Pders: any): any[];
    static calcNURBSDerivatives(p: number, U: any, P: any, u: any, nd: any): any[];
    static calcSurfacePoint(p: number, q: number, U: any, V: any, P: any, u: any, v: any, target: any): void;
}

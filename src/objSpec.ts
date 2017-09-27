import {parseObj} from "./obj";
import {Coordinates3D, CoordinatesUV, MeshTriangle} from "./types/mesh";

describe('parseObj', () => {

    it('should parse vertex coordinates', () => {

        const source = `
            v 0.123 0.234 0.345
            v -0.678 0.901 0.234
        `;

        const expected: Coordinates3D[] = [
            { x: 0.123, y: 0.234, z: 0.345 },
            { x: -0.678, y: 0.901, z: 0.234 }
        ];

        const retval = parseObj(source);
        expect(retval.vertexCoords).toEqual(expected);
    });

    it('should parse normal vectors', () => {

        const source = `
            vn -0.921355 0.161035 -0.353797
            vn 0.388724 0.381687 -0.838575
        `;

        const expected: Coordinates3D[] = [
            { x: -0.921355, y: 0.161035, z: -0.353797 },
            { x: 0.388724, y: 0.381687, z: -0.838575 }
        ];

        const retval = parseObj(source);
        expect(retval.normalVectors).toEqual(expected);
    });

    it('should parse UV coordinates', () => {

        const source = `
            vt 0.358599 0.279001
            vt 0.368819 0.279002
        `;

        const expected: CoordinatesUV[] = [
            { u: 0.358599, v: 0.279001 },
            { u: 0.368819, v: 0.279002 },
        ];

        const retval = parseObj(source);
        expect(retval.uvCoords).toEqual(expected);
    });

    it('should parse triangles', () => {

        const source = `
            f 1/85/1 12/86/2 3/1/3
        `;

        const expected: MeshTriangle[] = [
            {
                vertexAttributes: [
                    { vertexCoordsIdx: 0, uvCoordsIdx: 84, normalVectorsIdx: 0 },
                    { vertexCoordsIdx: 11, uvCoordsIdx: 85, normalVectorsIdx: 1 },
                    { vertexCoordsIdx: 2, uvCoordsIdx: 0, normalVectorsIdx: 2 }
                ]
            }
        ];

        const retval = parseObj(source);
        expect(retval.triangles).toEqual(expected);
    });

});
import {Coordinates3D, CoordinatesUV, Mesh, MeshTriangle} from "./types/mesh";

export function parseObj(objSource: string): Mesh {

    const lines = objSource.split("\n").map(v => v.trim());

    const vertexCoords: Coordinates3D[] =
        lines.filter(l=>l.match(/^v [\-0-9.]+ [\-0-9.]+ [\-0-9.]+$/)).map((l) => {
            const args = l.split(' ');
            return {
                x: parseFloat(args[1]),
                y: parseFloat(args[2]),
                z: parseFloat(args[3])
            }
        });

    const uvCoords: CoordinatesUV[] =
        lines.filter(l=>l.match(/^vt [\-0-9.]+ [\-0-9.]+$/)).map((l) => {
            const args = l.split(' ');
            return {
                u: parseFloat(args[1]),
                v: parseFloat(args[2])
            }
        });

    const normalVectors: Coordinates3D[] =
        lines.filter(l=>l.match(/^vn [\-0-9.]+ [\-0-9.]+ [\-0-9.]+$/)).map((l) => {
            const args = l.split(' ');
            return {
                x: parseFloat(args[1]),
                y: parseFloat(args[2]),
                z: parseFloat(args[3])
            }
        });

    const triangles: MeshTriangle[] =
        lines.filter(
            l=>l.match(/^f [0-9]+\/[0-9]+\/[0-9]+ [0-9]+\/[0-9]+\/[0-9]+ [0-9]+\/[0-9]+\/[0-9]+$/))
            .map((l) => {
                const args = l.split(/[\s\/]+/);
                return {
                    vertexAttributes: [
                        {
                            vertexCoordsIdx: parseInt(args[1])-1,
                            uvCoordsIdx: parseInt(args[2])-1,
                            normalVectorsIdx: parseInt(args[3])-1
                        },
                        {
                            vertexCoordsIdx: parseInt(args[4])-1,
                            uvCoordsIdx: parseInt(args[5])-1,
                            normalVectorsIdx: parseInt(args[6])-1
                        },
                        {
                            vertexCoordsIdx: parseInt(args[7])-1,
                            uvCoordsIdx: parseInt(args[8])-1,
                            normalVectorsIdx: parseInt(args[9])-1
                        }
                    ]
                }
        });

    return {
        vertexCoords: vertexCoords,
        uvCoords: uvCoords,
        normalVectors: normalVectors,
        triangles: triangles
    };
}
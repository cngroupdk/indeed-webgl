export interface Coordinates3D {
    x: any;
    y: any;
    z: any;
}

export interface CoordinatesUV {
    u: any;
    v: any;
}

export interface MeshVertexAttributes {
    vertexCoordsIdx: number;
    normalVectorsIdx: number;
    uvCoordsIdx: number;
}

export interface MeshTriangle {
    vertexAttributes: MeshVertexAttributes[];
}

export interface Mesh {
    vertexCoords: Coordinates3D[];
    normalVectors: Coordinates3D[];
    uvCoords: CoordinatesUV[];
    triangles: MeshTriangle[];
}
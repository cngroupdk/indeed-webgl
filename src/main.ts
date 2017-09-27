import {parseObj} from "./obj";

async function main() {
    const eViewport = document.getElementById('viewport');
    if(!(eViewport instanceof HTMLCanvasElement))
        throw "Canvas not found";
    const gl = eViewport.getContext('webgl');
    if(!(gl instanceof WebGLRenderingContext))
        throw "Cannot initialize WebGL context";

    const objData = await fetch("./cube.obj").then(response => response.text()).then(text => parseObj(text));
    console.log(objData.vertexCoords);

    const shaderVtx = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shaderVtx, `
        attribute vec3 aVertexCoord;
    
        void main(void)
        {
            gl_Position = vec4(aVertexCoord, 1.0);
        }
    `);
    gl.compileShader(shaderVtx);
    if(!gl.getShaderParameter(shaderVtx, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shaderVtx));
        throw null;
    }

    const shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shaderFrag, `    
        void main(void)
        {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `);
    gl.compileShader(shaderFrag);
    if(!gl.getShaderParameter(shaderFrag, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shaderFrag));
        throw null;
    }

    const program = gl.createProgram();
    if(!(program instanceof WebGLProgram)) throw "Cannot create program";
    gl.attachShader(program, shaderVtx);
    gl.attachShader(program, shaderFrag);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        throw null;
    }

    const vabCoords = gl.createBuffer();
    if(!(vabCoords instanceof WebGLBuffer)) throw "Cannot create buffer";
    gl.bindBuffer(gl.ARRAY_BUFFER, vabCoords);

    const afVtxCoords = new Float32Array(objData.triangles.length*9);

    objData.triangles.map((triangle, index) => {
        for(let i=0; i<3; i++) {
           afVtxCoords[(index*9)+(i*3)] =
            objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].x;
            afVtxCoords[(index*9)+(i*3)+1] =
                objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].y;
            afVtxCoords[(index*9)+(i*3)+2] =
                objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].z;
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, afVtxCoords, gl.STATIC_DRAW);
    const nAttrVertexCoord = gl.getAttribLocation(program, "aVertexCoord");
    gl.useProgram(program);
    gl.enableVertexAttribArray(nAttrVertexCoord);
    gl.vertexAttribPointer(nAttrVertexCoord, 3, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, objData.triangles.length*3);




}

main().then(() => {
    console.log('main() finished successfully.');
});
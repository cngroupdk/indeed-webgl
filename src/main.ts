import {parseObj} from "./obj";

async function main() {

    const eViewport = document.getElementById('viewport');
    if(!(eViewport instanceof HTMLCanvasElement)) {
        throw "Canvas not found.";
    }
    const gl = eViewport.getContext("webgl");
    if(!(gl instanceof WebGLRenderingContext)) {
        throw "Cannot initialize WebGL context.";
    }


    const objData = await fetch("./table.obj")
        .then(response => response.text())
        .then(text => parseObj(text));

    console.log('Loaded obj with '+objData.triangles.length+' polygons.');

    const noVertices = objData.triangles.length * 3;
    const afVtxCoords = new Float32Array(noVertices*3);

    const afVtxUVs = new Float32Array(noVertices*2);

    const afVtxNormals = new Float32Array(noVertices*3);

    objData.triangles.map((triangle, index) => {
        for(let i=0; i<3; i++) {
            afVtxCoords[(index*9)+(i*3)] =
                objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].x;
            afVtxCoords[(index*9)+(i*3)+1] =
                objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].y;
            afVtxCoords[(index*9)+(i*3)+2] =
                objData.vertexCoords[triangle.vertexAttributes[i].vertexCoordsIdx].z;

            afVtxUVs[(index*6)+(i*2)] =
                objData.uvCoords[triangle.vertexAttributes[i].uvCoordsIdx].u;
            afVtxUVs[(index*6)+(i*2)+1] =
                objData.uvCoords[triangle.vertexAttributes[i].uvCoordsIdx].v;

            afVtxNormals[(index*9)+(i*3)] =
                objData.normalVectors[triangle.vertexAttributes[i].normalVectorsIdx].x;
            afVtxNormals[(index*9)+(i*3)+1] =
                objData.normalVectors[triangle.vertexAttributes[i].normalVectorsIdx].y;
            afVtxNormals[(index*9)+(i*3)+2] =
                objData.normalVectors[triangle.vertexAttributes[i].normalVectorsIdx].z;
        }
    });

    const shaderVtx = gl.createShader(gl.VERTEX_SHADER);
    // language=GLSL
    gl.shaderSource(shaderVtx, `
        attribute vec3 aVertexCoord;
        attribute vec2 aVertexUVs;
        attribute vec3 aVertexNormal;
        
        varying vec3 normal;
        varying vec2 uv;
        
        void main(void)
        {
            gl_Position = vec4(aVertexCoord, 1.0);
            gl_Position.z *= -1.0;
            normal = aVertexNormal;
            uv = aVertexUVs;
        }
    `);
    gl.compileShader(shaderVtx);
    if(!gl.getShaderParameter(shaderVtx, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shaderVtx));
        throw null;
    }

    const shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);
    // language=GLSL
    gl.shaderSource(shaderFrag, `
        precision mediump float;
        varying vec3 normal;
        varying vec2 uv;
        
        uniform vec3 lDirection;
        uniform sampler2D sampler1;

        void main(void)
        {
            
            vec3 lDirection = normalize(lDirection);
            vec3 lAmbient = vec3(0.4, 0.4, 0.4);
            
            vec3 lDiffuse = vec3(0.8, 0.8, 0.8) * max(dot(normal, lDirection), 0.0);
                        
            vec3 light = lAmbient + lDiffuse;
            gl_FragColor = texture2D(sampler1, vec2(uv.x, (uv.y)*-1.0));
            
            
        }
    `);
    gl.compileShader(shaderFrag);
    if(!gl.getShaderParameter(shaderFrag, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shaderFrag));
        throw null;
    }

    const program = gl.createProgram();
    if(!(program instanceof WebGLProgram)) throw "Could not create program";

    gl.attachShader(program, shaderVtx);
    gl.attachShader(program, shaderFrag);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        throw null;
    }
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    const attrNoVtxCoord = gl.getAttribLocation(program, "aVertexCoord");
    const attrNoVtxUVs = gl.getAttribLocation(program, "aVertexUVs");
    const attrNoVtxNormal = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(attrNoVtxCoord);
    gl.enableVertexAttribArray(attrNoVtxUVs);
    gl.enableVertexAttribArray(attrNoVtxNormal);


    const vabCoords = gl.createBuffer();
    if(!(vabCoords instanceof WebGLBuffer)) throw "Could not create buffer";
    gl.bindBuffer(gl.ARRAY_BUFFER, vabCoords);
    gl.bufferData(gl.ARRAY_BUFFER, afVtxCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrNoVtxCoord, 3, gl.FLOAT, false, 0, 0);

    const vabUVs = gl.createBuffer();
    if(!(vabUVs instanceof WebGLBuffer)) throw "Could not create buffer";
    gl.bindBuffer(gl.ARRAY_BUFFER, vabUVs);
    gl.bufferData(gl.ARRAY_BUFFER, afVtxUVs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrNoVtxUVs, 2, gl.FLOAT, false, 0, 0);

    const vabNormals = gl.createBuffer();
    if(!(vabNormals instanceof WebGLBuffer)) throw "Could not create buffer";
    gl.bindBuffer(gl.ARRAY_BUFFER, vabNormals);
    gl.bufferData(gl.ARRAY_BUFFER, afVtxNormals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrNoVtxNormal, 3, gl.FLOAT, false, 0, 0);

    const image = new Image();
    image.src = "./table.png";
    const promiseImage = new Promise((resolve) => {
        image.onload = function() {
            resolve(image);
        };
    });
    await promiseImage;
    console.log('Loaded texture '+image.width+'x'+image.height+' pixels');

    const texture = gl.createTexture();
    if(!(texture instanceof WebGLTexture)) throw 'Cannot create texture';
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    const nUniformlDirection = gl.getUniformLocation(program, 'lDirection');
    if(!(nUniformlDirection instanceof WebGLUniformLocation)) throw 'Cannot find uniform';

    (function(gl, noVertices, nUniformlDirection) {
        let prevTime = performance.now();
        let lightY = 0;
        let ascending = true;

        function renderFrame() {
            const now = performance.now();
            const deltaTime = now - prevTime;
            prevTime = now;

            if(ascending) {
                lightY += deltaTime/1000;
            } else {
                lightY -= deltaTime/1000;
            }

            if(lightY > 1.925) {
                ascending = false;
            } else if(lightY < -1) {
                ascending = true;
            }


            gl.uniform3fv(nUniformlDirection, [1.925, lightY, 1.22]);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, noVertices);
            requestAnimationFrame(renderFrame);
        }
        requestAnimationFrame(renderFrame);
    })(gl, noVertices, nUniformlDirection);
}

main().then(() => {
    console.log('main() finished successfully.');
});
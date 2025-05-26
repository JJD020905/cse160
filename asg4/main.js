// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aNormal;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vEyePosition;
    
    void main() {
        vNormal = mat3(uNormalMatrix) * aNormal;
        vPosition = vec3(uModelViewMatrix * aVertexPosition);
        vEyePosition = vec3(uModelViewMatrix[3]); // Get camera position
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// Fragment shader program
const fsSource = `
    precision mediump float;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vEyePosition;
    
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform vec3 uAmbientColor;
    uniform bool uPointLightEnabled;
    uniform bool uSpotlightEnabled;
    uniform vec3 uSpotDirection;
    uniform float uSpotCutoff;
    uniform float uSpotExponent;
    uniform vec3 uViewPosition;
    uniform float uShininess;
    uniform vec3 uSpecularColor;
    uniform bool uShowNormals;
    
    void main() {
        if (uShowNormals) {
            gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
            return;
        }
        
        // Ambient light
        vec3 ambient = uAmbientColor;
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);
        
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(uViewPosition - vPosition);
        
        // Point light calculation
        if (uPointLightEnabled) {
            vec3 lightDir = normalize(uLightPosition - vPosition);
            float diff = max(dot(normal, lightDir), 0.0);
            diffuse += diff * uLightColor;
            
            // Point light specular reflection
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
            specular += spec * uSpecularColor * uLightColor;
            
            // Point light distance attenuation
            float distance = length(uLightPosition - vPosition);
            float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
            diffuse *= attenuation;
            specular *= attenuation;
        }
        
        // Spotlight calculation
        if (uSpotlightEnabled) {
            vec3 lightDir = normalize(uLightPosition - vPosition);
            vec3 spotDir = normalize(uSpotDirection);
            float spotCosine = dot(lightDir, spotDir);
            
            if (spotCosine > uSpotCutoff) {
                float spotFactor = smoothstep(uSpotCutoff, 1.0, spotCosine);
                float spotIntensity = pow(spotFactor, uSpotExponent);
                
                float diff = max(dot(normal, lightDir), 0.0);
                diffuse += diff * uLightColor * spotIntensity;
                
                // Spotlight specular reflection
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
                specular += spec * uSpecularColor * uLightColor * spotIntensity;
                
                // Spotlight distance attenuation
                float distance = length(uLightPosition - vPosition);
                float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
                diffuse *= attenuation;
                specular *= attenuation;
            }
        }
        
        // Final color
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Initialize shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Create shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Generate sphere vertices
function generateSphere(radius, segments) {
    const positions = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const lat = Math.PI * (-0.5 + (i / segments));
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);

        for (let j = 0; j <= segments; j++) {
            const lng = 2 * Math.PI * (j / segments);
            const cosLng = Math.cos(lng);
            const sinLng = Math.sin(lng);

            const x = cosLng * cosLat;
            const y = sinLat;
            const z = sinLng * cosLat;

            positions.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
        }
    }

    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const first = i * (segments + 1) + j;
            const second = first + segments + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return { positions, normals, indices };
}

// Generate Minecraft-style scene
function generateMinecraftScene() {
    const positions = [];
    const normals = [];
    const indices = [];
    let indexOffset = 0;

    // Generate ground (10x10 plane)
    for (let x = -5; x < 5; x++) {
        for (let z = -5; z < 5; z++) {
            // Each block's position
            const blockPositions = [
                // Front face
                x, 0, z + 1,
                x + 1, 0, z + 1,
                x + 1, 1, z + 1,
                x, 1, z + 1,

                // Back face
                x, 0, z,
                x, 1, z,
                x + 1, 1, z,
                x + 1, 0, z,

                // Top face
                x, 1, z,
                x, 1, z + 1,
                x + 1, 1, z + 1,
                x + 1, 1, z,

                // Bottom face
                x, 0, z,
                x + 1, 0, z,
                x + 1, 0, z + 1,
                x, 0, z + 1,

                // Right face
                x + 1, 0, z,
                x + 1, 1, z,
                x + 1, 1, z + 1,
                x + 1, 0, z + 1,

                // Left face
                x, 0, z,
                x, 0, z + 1,
                x, 1, z + 1,
                x, 1, z,
            ];

            // Each face's normal
            const blockNormals = [
                // Front face
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,

                // Back face
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,

                // Top face
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,

                // Bottom face
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,

                // Right face
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,

                // Left face
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0,
            ];

            // Add vertices and normals
            positions.push(...blockPositions);
            normals.push(...blockNormals);

            // Add indices
            for (let i = 0; i < 6; i++) {
                const baseIndex = i * 4 + indexOffset;
                indices.push(
                    baseIndex, baseIndex + 1, baseIndex + 2,
                    baseIndex, baseIndex + 2, baseIndex + 3
                );
            }

            indexOffset += 24; // Each block has 24 vertices (6 faces, 4 vertices per face)
        }
    }

    // Add some random blocks as decorations
    const decorations = [
        {x: -3, y: 1, z: -3},
        {x: -2, y: 1, z: -3},
        {x: -3, y: 1, z: -2},
        {x: 2, y: 1, z: 2},
        {x: 3, y: 1, z: 2},
        {x: 2, y: 1, z: 3},
    ];

    decorations.forEach(dec => {
        const blockPositions = [
            // Front face
            dec.x, dec.y, dec.z + 1,
            dec.x + 1, dec.y, dec.z + 1,
            dec.x + 1, dec.y + 1, dec.z + 1,
            dec.x, dec.y + 1, dec.z + 1,

            // Back face
            dec.x, dec.y, dec.z,
            dec.x, dec.y + 1, dec.z,
            dec.x + 1, dec.y + 1, dec.z,
            dec.x + 1, dec.y, dec.z,

            // Top face
            dec.x, dec.y + 1, dec.z,
            dec.x, dec.y + 1, dec.z + 1,
            dec.x + 1, dec.y + 1, dec.z + 1,
            dec.x + 1, dec.y + 1, dec.z,

            // Bottom face
            dec.x, dec.y, dec.z,
            dec.x + 1, dec.y, dec.z,
            dec.x + 1, dec.y, dec.z + 1,
            dec.x, dec.y, dec.z + 1,

            // Right face
            dec.x + 1, dec.y, dec.z,
            dec.x + 1, dec.y + 1, dec.z,
            dec.x + 1, dec.y + 1, dec.z + 1,
            dec.x + 1, dec.y, dec.z + 1,

            // Left face
            dec.x, dec.y, dec.z,
            dec.x, dec.y, dec.z + 1,
            dec.x, dec.y + 1, dec.z + 1,
            dec.x, dec.y + 1, dec.z,
        ];

        const blockNormals = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ];

        positions.push(...blockPositions);
        normals.push(...blockNormals);

        for (let i = 0; i < 6; i++) {
            const baseIndex = i * 4 + indexOffset;
            indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            );
        }

        indexOffset += 24;
    });

    return { positions, normals, indices };
}

// Initialize buffers
function initBuffers(gl) {
    // Create cube buffers
    const cubeBuffers = initCubeBuffers(gl);
    
    // Create sphere buffers
    const sphereData = generateSphere(1.0, 32);
    const sphereBuffers = initSphereBuffers(gl, sphereData);

    // Create Minecraft scene buffers
    const minecraftData = generateMinecraftScene();
    const minecraftBuffers = initMinecraftBuffers(gl, minecraftData);

    return {
        cube: cubeBuffers,
        sphere: sphereBuffers,
        minecraft: minecraftBuffers
    };
}

// Initialize cube buffers
function initCubeBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create cube vertices
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const normals = [
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Build element array to draw triangles
    const indices = [
        0,  1,  2,    0,  2,  3,    // Front
        4,  5,  6,    4,  6,  7,    // Back
        8,  9,  10,   8,  10, 11,   // Top
        12, 13, 14,   12, 14, 15,   // Bottom
        16, 17, 18,   16, 18, 19,   // Right
        20, 21, 22,   20, 22, 23,   // Left
    ];

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        indices: indexBuffer,
    };
}

// Initialize sphere buffers
function initSphereBuffers(gl, sphereData) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        indices: indexBuffer,
        vertexCount: sphereData.indices.length
    };
}

// Initialize Minecraft scene buffers
function initMinecraftBuffers(gl, minecraftData) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(minecraftData.positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(minecraftData.normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(minecraftData.indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        indices: indexBuffer,
        vertexCount: minecraftData.indices.length
    };
}

// Camera control
let cameraRotation = { x: 0, y: 0 };
let cameraDistance = 6.0;

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

// Draw scene
function drawScene(gl, programInfo, buffers, rotation, lighting) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create perspective matrix
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
                    fieldOfView,
                    aspect,
                    zNear,
                    zFar);

    // Set camera position
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -cameraDistance]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cameraRotation.x, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cameraRotation.y, [0, 1, 0]);

    // Draw Minecraft scene (render first)
    drawMinecraftScene(gl, programInfo, buffers.minecraft, modelViewMatrix, projectionMatrix, lighting);
    
    // Draw cube
    drawCube(gl, programInfo, buffers.cube, modelViewMatrix, projectionMatrix, rotation, lighting);
    
    // Draw sphere
    drawSphere(gl, programInfo, buffers.sphere, modelViewMatrix, projectionMatrix, rotation, lighting);
    
    // Draw light marker
    drawLightMarker(gl, programInfo, buffers.cube, modelViewMatrix, projectionMatrix, lighting);
}

// Draw Minecraft scene
function drawMinecraftScene(gl, programInfo, buffers, modelViewMatrix, projectionMatrix, lighting) {
    const minecraftMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(minecraftMatrix, minecraftMatrix, [0.0, -2.0, 0.0]); // Move scene down
    
    drawObject(gl, programInfo, buffers, minecraftMatrix, projectionMatrix, lighting);
}

// Draw cube
function drawCube(gl, programInfo, buffers, modelViewMatrix, projectionMatrix, rotation, lighting) {
    const cubeMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(cubeMatrix, cubeMatrix, [-2.0, 0.0, 0.0]);
    mat4.rotate(cubeMatrix, cubeMatrix, rotation, [0.5, 1, 0]);
    
    drawObject(gl, programInfo, buffers, cubeMatrix, projectionMatrix, lighting);
}

// Draw sphere
function drawSphere(gl, programInfo, buffers, modelViewMatrix, projectionMatrix, rotation, lighting) {
    const sphereMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(sphereMatrix, sphereMatrix, [2.0, 0.0, 0.0]);
    mat4.rotate(sphereMatrix, sphereMatrix, rotation, [0.5, 1, 0]);
    
    drawObject(gl, programInfo, buffers, sphereMatrix, projectionMatrix, lighting);
}

// Draw light marker
function drawLightMarker(gl, programInfo, buffers, modelViewMatrix, projectionMatrix, lighting) {
    const markerMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(markerMatrix, markerMatrix, lighting.lightPosition);
    mat4.scale(markerMatrix, markerMatrix, [0.1, 0.1, 0.1]);
    
    drawObject(gl, programInfo, buffers, markerMatrix, projectionMatrix, { ...lighting, lightingEnabled: false });
}

// Draw object
function drawObject(gl, programInfo, buffers, modelViewMatrix, projectionMatrix, lighting) {
    // Set vertex position
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Set normal
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Use shader program
    gl.useProgram(programInfo.program);

    // Set shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    // Calculate normal matrix
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Set lighting parameters
    gl.uniform1i(programInfo.uniformLocations.pointLightEnabled, lighting.pointLightEnabled);
    gl.uniform3fv(programInfo.uniformLocations.lightPosition, lighting.lightPosition);
    gl.uniform3fv(programInfo.uniformLocations.lightColor, lighting.lightColor);
    gl.uniform3fv(programInfo.uniformLocations.ambientColor, [0.2, 0.2, 0.2]);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);

    // Set spotlight parameters
    gl.uniform1i(programInfo.uniformLocations.spotlightEnabled, lighting.spotlightEnabled);
    gl.uniform3fv(programInfo.uniformLocations.spotDirection, lighting.spotDirection);
    gl.uniform1f(programInfo.uniformLocations.spotCutoff, lighting.spotCutoff);
    gl.uniform1f(programInfo.uniformLocations.spotExponent, lighting.spotExponent);

    // Set material parameters
    gl.uniform1f(programInfo.uniformLocations.shininess, lighting.shininess);
    gl.uniform3fv(programInfo.uniformLocations.specularColor, lighting.specularColor);
    
    // Set view position
    gl.uniform3fv(programInfo.uniformLocations.viewPosition, lighting.viewPosition);
    
    // Set normal visualization
    gl.uniform1i(programInfo.uniformLocations.showNormals, lighting.showNormals);

    // Draw
    {
        const vertexCount = buffers.vertexCount || 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

// Main function
function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        handleWebGLError(new Error('Unable to initialize WebGL. Your browser or machine may not support it.'));
        return;
    }

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            lightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
            lightColor: gl.getUniformLocation(shaderProgram, 'uLightColor'),
            ambientColor: gl.getUniformLocation(shaderProgram, 'uAmbientColor'),
            pointLightEnabled: gl.getUniformLocation(shaderProgram, 'uPointLightEnabled'),
            spotlightEnabled: gl.getUniformLocation(shaderProgram, 'uSpotlightEnabled'),
            spotDirection: gl.getUniformLocation(shaderProgram, 'uSpotDirection'),
            spotCutoff: gl.getUniformLocation(shaderProgram, 'uSpotCutoff'),
            spotExponent: gl.getUniformLocation(shaderProgram, 'uSpotExponent'),
            viewPosition: gl.getUniformLocation(shaderProgram, 'uViewPosition'),
            shininess: gl.getUniformLocation(shaderProgram, 'uShininess'),
            specularColor: gl.getUniformLocation(shaderProgram, 'uSpecularColor'),
            showNormals: gl.getUniformLocation(shaderProgram, 'uShowNormals'),
        },
    };

    // Initialize buffers
    const buffers = initBuffers(gl);

    // Get UI controls
    const lightingEnabled = document.getElementById('lightingEnabled');
    const lightX = document.getElementById('lightX');
    const lightY = document.getElementById('lightY');
    const lightZ = document.getElementById('lightZ');
    const lightR = document.getElementById('lightR');
    const lightG = document.getElementById('lightG');
    const lightB = document.getElementById('lightB');

    // Render loop
    let rotation = 0.0;
    function render() {
        // Calculate FPS
        frameCount++;
        const currentTime = performance.now();
        if (currentTime - lastTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            updateFPSDisplay();
        }

        rotation += 0.01;
        
        // Update lighting parameters
        const lightPosition = [
            parseFloat(lightX.value),
            parseFloat(lightY.value),
            parseFloat(lightZ.value)
        ];
        
        const lightColor = [
            parseFloat(lightR.value),
            parseFloat(lightG.value),
            parseFloat(lightB.value)
        ];

        // Get point light and spotlight parameters
        const pointLightEnabled = document.getElementById('pointLightEnabled').checked;
        const spotlightEnabled = document.getElementById('spotlightEnabled').checked;
        
        // Get spotlight direction and normalize
        const spotDirX = parseFloat(document.getElementById('spotDirX').value);
        const spotDirY = parseFloat(document.getElementById('spotDirY').value);
        const spotDirZ = parseFloat(document.getElementById('spotDirZ').value);
        const spotDirLength = Math.sqrt(spotDirX * spotDirX + spotDirY * spotDirY + spotDirZ * spotDirZ);
        const spotDirection = [
            spotDirX / spotDirLength,
            spotDirY / spotDirLength,
            spotDirZ / spotDirLength
        ];
        
        // Convert angle to cosine
        const spotCutoff = Math.cos(parseFloat(document.getElementById('spotCutoff').value) * Math.PI / 180.0);
        const spotExponent = parseFloat(document.getElementById('spotExponent').value);

        // Get material parameters
        const shininess = parseFloat(document.getElementById('shininess').value);
        const specularColor = [
            parseFloat(document.getElementById('specularR').value),
            parseFloat(document.getElementById('specularG').value),
            parseFloat(document.getElementById('specularB').value)
        ];

        // Get normal visualization parameter
        const showNormals = document.getElementById('showNormals').checked;

        // Calculate camera position
        const cameraPosition = [
            cameraDistance * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x),
            cameraDistance * Math.sin(cameraRotation.x),
            cameraDistance * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x)
        ];

        drawScene(gl, programInfo, buffers, rotation, {
            pointLightEnabled,
            lightPosition,
            lightColor,
            spotlightEnabled,
            spotDirection,
            spotCutoff,
            spotExponent,
            shininess,
            specularColor,
            showNormals,
            viewPosition: cameraPosition
        });
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Add keyboard control
    let isMouseOverCanvas = false;
    
    // Add mouse enter and leave event listeners
    canvas.addEventListener('mouseenter', () => {
        isMouseOverCanvas = true;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isMouseOverCanvas = false;
    });

    document.addEventListener('keydown', (event) => {
        const rotationSpeed = 0.1;
        
        // If mouse is not over canvas, handle page scrolling
        if (!isMouseOverCanvas) {
            return;
        }
        
        // Prevent default page scrolling behavior
        event.preventDefault();
        
        switch(event.key) {
            case 'ArrowLeft':
                cameraRotation.y -= rotationSpeed;
                break;
            case 'ArrowRight':
                cameraRotation.y += rotationSpeed;
                break;
            case 'ArrowUp':
                cameraRotation.x -= rotationSpeed;
                break;
            case 'ArrowDown':
                cameraRotation.x += rotationSpeed;
                break;
            case '9':
                cameraDistance = Math.max(2, cameraDistance - 0.5);
                break;
            case '0':
                cameraDistance = Math.min(10, cameraDistance + 0.5);
                break;
        }
    });

    // Add scene reset function
    function resetScene() {
        // Reset camera
        cameraRotation = { x: 0, y: 0 };
        cameraDistance = 6.0;
        
        // Reset lighting parameters
        document.getElementById('lightX').value = 2;
        document.getElementById('lightY').value = 2;
        document.getElementById('lightZ').value = 2;
        document.getElementById('lightR').value = 1;
        document.getElementById('lightG').value = 1;
        document.getElementById('lightB').value = 1;
        
        // Reset spotlight parameters
        document.getElementById('spotDirX').value = 0;
        document.getElementById('spotDirY').value = -1;
        document.getElementById('spotDirZ').value = 0;
        document.getElementById('spotCutoff').value = 45;
        document.getElementById('spotExponent').value = 32;
        
        // Reset material parameters
        document.getElementById('shininess').value = 32;
        document.getElementById('specularR').value = 1;
        document.getElementById('specularG').value = 1;
        document.getElementById('specularB').value = 1;
        
        // Update display values
        document.getElementById('spotCutoffValue').textContent = '45°';
        document.getElementById('spotExponentValue').textContent = '32';
        document.getElementById('shininessValue').textContent = '32';
    }

    // Update FPS display
    function updateFPSDisplay() {
        const fpsDisplay = document.getElementById('fpsDisplay');
        if (fpsDisplay) {
            fpsDisplay.textContent = `FPS: ${fps}`;
        }
    }

    // Add error handling
    function handleWebGLError(error) {
        console.error('WebGL Error:', error);
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.textContent = `Error: ${error.message}`;
            errorDisplay.style.display = 'block';
        }
    }

    // Add reset button event listener
    document.getElementById('resetScene').addEventListener('click', resetScene);
}

// Add matrix library
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js';
script.onload = main;
document.head.appendChild(script); 
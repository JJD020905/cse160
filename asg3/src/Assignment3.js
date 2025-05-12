// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'varying vec4 vPosition;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
    '  vPosition = u_ModelMatrix * vec4(a_Position, 1.0);\n' +
    '  vTexCoord = a_TexCoord;\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * vPosition;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform vec4 u_BlendColor;\n' +
    'uniform float u_texColorWeight;\n' +
    'uniform sampler2D u_texDiff;\n' +
    'varying vec4 vPosition;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
    '  vec4 texColor = texture2D(u_texDiff, vTexCoord);\n' +
    //'  gl_FragColor = vec4(vTexCoord, 1.0, 1.0);' +
    //'  float t = u_texColorWeight;\n' +
    //'  gl_FragColor = (1 - t) * u_FragColor + t * texColor;\n' +
    //'  gl_FragColor = u_FragColor * mix(u_FragColor, texColor, u_texColorWeight);\n' +
    '  gl_FragColor = u_FragColor * u_BlendColor * vec4(texColor.rgb, 1.0);' +
    //'  gl_FragColor = u_FragColor;' +
    '}\n';

// Note that you can use u_texColorWeight=0 if you want only base color (for the sky box) and u_baseColorWeight=1 if you want only texture colors (for the walls).

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;

let lastX;
let lastY;
let keys = {};

var g_startTime = performance.now() / 1000.0;
var g_lastTime = g_startTime;
var g_deltaTime = 0.0;

var g_shapeLists = [];

let a_Position;
let a_TexCoord;

let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

let u_FragColor;
let u_BlendColor;
let u_texDiff;
let u_texColorWeight;

let camera;
let textureArray = {};
// let walls = [];

const WORLD_SIZE = 32;
let g_World = []; // size = WORLD_SIZE * WORLD_SIZE * WORLD_SIZE
let g_cubeModel;

// draw modes
const DRAW_MODE_DEFAULT = 0;
const DRAW_MODE_TOP_SIDE = 1;
const DRAW_MODE_SKYBOX = 2;

// tools
const TOOL_NONE = 0;

const TOOL_PICKAXE = 1;

const TOOL_DIRT = 10;
const TOOL_GRASS = 11;
const TOOL_SAND = 12;
const TOOL_BRICK = 13;
const TOOL_IRON = 14;
const TOOL_GOLD = 15;
const TOOL_METAL_SHEET = 16;
const TOOL_LOG_ACACIA = 17;

const TEX_SKYBOX = 99;

let g_tool = TOOL_NONE;


function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true
    });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.5, 1.0, 1.0);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    /*
    var objs = {};
    objs[0] = { type: 1, top: "bbb", side: "ccc" };
    objs[4] = { type: 1, top: "ccc", side: "ddd" };
    console.log(objs[0]);
    console.log(objs[4]);
    //*/
}

function getAttribLocation(name) {
    let value = gl.getAttribLocation(gl.program, name);
    if (value < 0) {
        console.log('Failed to get the storage location of ' + name);
        return -1;
    }
    return value;
}

function getUniformLocation(name) {
    let value = gl.getUniformLocation(gl.program, name);
    if (value < 0) {
        console.log('Failed to get the storage location of ' + name);
        return -1;
    }
    return value;
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage locations
    a_Position = getAttribLocation('a_Position');
    a_TexCoord = getAttribLocation('a_TexCoord');

    u_ModelMatrix = getUniformLocation('u_ModelMatrix');
    u_ViewMatrix = getUniformLocation('u_ViewMatrix');
    u_ProjectionMatrix = getUniformLocation('u_ProjectionMatrix');

    u_FragColor = getUniformLocation('u_FragColor');
    u_BlendColor = getUniformLocation('u_BlendColor');
    u_texDiff = getUniformLocation('u_texDiff');
    u_texColorWeight = getUniformLocation('u_texColorWeight');

    // console.log("a_TexCoord: " + a_TexCoord);

    // setup the projection matrix
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    // setup fragment shader uniforms
    gl.uniform1i(u_texDiff, 0);
    gl.uniform1f(u_texColorWeight, 1.0);
}

function addActionsFromHtmlUI() {
    document.getElementById("hand").onclick = function() { g_tool = TOOL_NONE; };
    document.getElementById("pickaxe").onclick = function() { g_tool = TOOL_PICKAXE; };
    document.getElementById("dirt").onclick = function() { g_tool = TOOL_DIRT; };
    document.getElementById("grass").onclick = function() { g_tool = TOOL_GRASS; };
    document.getElementById("sand").onclick = function() { g_tool = TOOL_SAND; };
    document.getElementById("brick").onclick = function() { g_tool = TOOL_BRICK; };
    document.getElementById("iron").onclick = function() { g_tool = TOOL_IRON; };
    document.getElementById("gold").onclick = function() { g_tool = TOOL_GOLD; };
    document.getElementById("metal_sheet").onclick = function() { g_tool = TOOL_METAL_SHEET; };
    document.getElementById("log_acacia").onclick = function() { g_tool = TOOL_LOG_ACACIA; };

    // save
    document.getElementById("save").onclick = function() {
        let str = JSON.stringify(g_World, (key, value) => {
            if (key === "matrix") return undefined;
            return value;
        });
        saveFile(str, "world.json");
    };

    // load
    document.getElementById("load").onclick = function() {
        pickFile();
    };
}

/*
function initWorld4x4() {
    let map = [
        [1, 0, 0, 1],
        [1, 1, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
    ];
    let x, z;

    for (x = 1; x < 4; ++x) {
        for (z = 1; z < 4; ++z) {
            if (map[z][x] == 1) {
                let w = new Cube();
                w.color = [1.0, 1.0, 1.0, 1.0];
                w.matrix = new Matrix4();
                w.matrix.translate(x, 0, z);
                w.matrix.scale(0.5, 0.5, 0.5);
                walls.push(w);
            }
        }
    }
    console.log("cubes: " + walls.length);
}
*/

function initWorld() {
    g_cubeModel = new Cube();

    let x, y, z;
    for (z = 0; z < WORLD_SIZE; ++z) {
        g_World[z] = [];
        for (y = 0; y < WORLD_SIZE; ++y) {
            g_World[z][y] = [];
            for (x = 0; x < WORLD_SIZE; ++x) {
                let t = new Tile();
                t.matrix.translate(x, y, z);
                t.matrix.scale(0.5, 0.5, 0.5);
                if (y == 0) {
                    t.type = TOOL_DIRT;
                } else {}
                g_World[z][y].push(t);
            }
        }
    }


}

function main() {
    setupWebGL();

    camera = new Camera();
    camera.lookAt(0.0, 2.0, 5.0, 0.0, 0.0, 0.0);
    // camera.log();

    connectVariablesToGLSL();

    addActionsFromHtmlUI();

    initTextures();

    initWorld();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(event) {
        lastX = event.x;
        lastY = event.y;

        // Get the tile in front of the player
        if (g_tool != TOOL_NONE) {
            let dir = camera.direction();
            dir.mul(1.5);
            dir.add(camera.eye);
            let tx = Math.round(dir.elements[0]);
            let ty = Math.round(dir.elements[1]);
            let tz = Math.round(dir.elements[2]);

            if (tx >= 0 && tx < WORLD_SIZE && ty >= 0 && ty < WORLD_SIZE && tz >= 0 && tz < WORLD_SIZE) {
                if (g_tool == TOOL_PICKAXE) { // dig
                    g_World[tz][ty][tx].type = TOOL_NONE;

                } else { // build
                    console.log("build: " + [tx, ty, tz] + '=' + g_tool + "  draw=" + textureArray[g_tool].drawMode);
                    g_World[tz][ty][tx].type = g_tool;
                    g_World[tz][ty][tx].drawMode = textureArray[g_tool].drawMode;
                }
            }
        }
    };

    canvas.onmousemove = function(event) {
        sendTextToHtml(event.x + "," + event.y, "mouse");
        if (event.buttons === 1) {
            // click(event);
            camera.drag(event.x - lastX, event.y - lastY);
            lastX = event.x;
            lastY = event.y;
        }
    };

    document.addEventListener('keydown', function(event) {
        sendTextToHtml(event.key, "keyboard");

        if (event.key == 'w') {
            // camera.moveForward();
            keys.forward = true;
        } else if (event.key == 's') {
            // camera.moveBackwards();
            keys.backward = true;
        }

        if (event.key == 'a') {
            // camera.moveLeft();
            keys.left = true;
        } else if (event.key == 'd') {
            // camera.moveRight();
            keys.right = true;
        }

        if (event.key == 'q') {
            camera.panLeft();
        } else if (event.key == 'e') {
            camera.panRight();
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key == 'w') {
            keys.forward = false;
        } else if (event.key == 's') {
            keys.backward = false;
        }

        if (event.key == 'a') {
            keys.left = false;
        } else if (event.key == 'd') {
            keys.right = false;
        }
    });

    requestAnimationFrame(tick);
}

function tick() {
    let t = performance.now() / 1000.0;
    g_deltaTime = t - g_lastTime;
    g_lastTime = t;
    // console.log(g_deltaTime);

    // camera moving
    if (keys.forward) {
        camera.moveForward(g_deltaTime);
    } else if (keys.backward) {
        camera.moveBackwards(g_deltaTime);
    }

    if (keys.left) {
        camera.moveLeft(g_deltaTime);
    } else if (keys.right) {
        camera.moveRight(g_deltaTime);
    }

    // render
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    display();

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000 / duration) / 10, "info");

    requestAnimationFrame(tick);
}

function display() {
    camera.compuateMatrix();
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // Get the tile in front of the player
    let dir = camera.direction();
    dir.mul(1.5);
    dir.add(camera.eye);
    let tx = Math.round(dir.elements[0]);
    let ty = Math.round(dir.elements[1]);
    let tz = Math.round(dir.elements[2]);

    for (z = 0; z < WORLD_SIZE; ++z) {
        for (y = 0; y < WORLD_SIZE; ++y) {
            for (x = 0; x < WORLD_SIZE; ++x) {
                if (g_World[z][y][x].type != TOOL_NONE) {
                    if (g_tool == TOOL_PICKAXE && x == tx && y == ty && z == tz) { // dig tips
                        gl.uniform4f(u_BlendColor, 0.5, 0.5, 0.5, 1.0);
                    } else {
                        gl.uniform4f(u_BlendColor, 1.0, 1.0, 1.0, 1.0);
                    }

                    g_World[z][y][x].render();
                }
            }
        }
    }

    // build tips
    if (tx >= 0 && tx < WORLD_SIZE && ty >= 0 && ty < WORLD_SIZE && tz >= 0 && tz < WORLD_SIZE) {
        if (g_tool >= TOOL_DIRT) {
            gl.uniform4f(u_BlendColor, 0.5, 0.5, 1.0, 1.0);

            let t = new Tile();
            t.type = g_tool;
            t.drawMode = textureArray[g_tool].drawMode;
            t.matrix.translate(tx, ty, tz);
            t.matrix.scale(0.5, 0.5, 0.5);
            t.render();
        }
    }

    // skybox
    if (true) {
        let t = new Tile();
        t.type = TEX_SKYBOX;
        t.drawMode = textureArray[TEX_SKYBOX].drawMode;
        t.matrix.translate(0, 0, 0);
        t.matrix.scale(100.0, 100.0, 100.0);

        // remove rotation
        let view = new Matrix4(camera.viewMatrix);
        view.elements[12] = 0.0;
        view.elements[13] = 0.0;
        view.elements[14] = 0.0;

        gl.uniformMatrix4fv(u_ViewMatrix, false, view.elements);
        gl.uniform4f(u_BlendColor, 1.0, 1.0, 1.0, 1.0);

        t.render();
    }
}

function click(ev) {
    let [x, y] = convertCoordinatesEventsToGL(ev);

    let point;

    if (g_selectedType === POINT) {
        point = new Point();
    } else if (g_selectedType === TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegment;
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapeLists.push(point);

    renderAllShapes();
}

function convertCoordinatesEventsToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function sendTextToHtml(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log('Failed to get ' + htmlID + 'from Html!');
        return;
    }
    htmlElm.innerHTML = text;
}

function loadTexture(filename) {
    //create and initalize a webgl texture object.
    var tex = {};
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename;
    tex.isTextureReady = false;
    tex.image.onload = function() {
        // Binds a texture to a target. Target is then used in future calls.
        // Targets:
        // 		TEXTURE_2D           - A two-dimensional texture.
        // 		TEXTURE_CUBE_MAP     - A cube-mapped texture.
        // 		TEXTURE_3D           - A three-dimensional texture.
        // 		TEXTURE_2D_ARRAY     - A two-dimensional array texture.
        gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);

        // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);

        // Generates a set of mipmaps for the texture object.
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents s-coordinate wrapping (repeating)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Prevents t-coordinate wrapping (repeating)

        gl.bindTexture(gl.TEXTURE_2D, null);

        console.log(tex.image.src);

        tex.isTextureReady = true;
    };

    return tex;
}

function initTextures() {
    // textureArray[TOOL_NONE] = { drawMode: DRAW_MODE_DEFAULT };

    textureArray[TOOL_DIRT] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/dirt.png") };
    textureArray[TOOL_SAND] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/sand.png") };
    textureArray[TOOL_BRICK] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/brick.png") };
    textureArray[TOOL_IRON] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/iron_block.png") };
    textureArray[TOOL_GOLD] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/gold_block.png") };
    textureArray[TOOL_METAL_SHEET] = { drawMode: DRAW_MODE_DEFAULT, tex: loadTexture("../textures/metal_sheet.png") };

    textureArray[TOOL_GRASS] = {
        drawMode: DRAW_MODE_TOP_SIDE,
        top: loadTexture("../textures/grass_top.png"),
        side: loadTexture("../textures/grass_side.png")
    };
    textureArray[TOOL_LOG_ACACIA] = {
        drawMode: DRAW_MODE_TOP_SIDE,
        top: loadTexture("../textures/log_acacia_top.png"),
        side: loadTexture("../textures/log_acacia.png")
    };

    textureArray[TEX_SKYBOX] = {
        drawMode: DRAW_MODE_SKYBOX,
        left: loadTexture("../textures/SkyCubemap_NegativeX.png"),
        right: loadTexture("../textures/SkyCubemap_PositiveX.png"),
        front: loadTexture("../textures/SkyCubemap_PositiveZ.png"),
        back: loadTexture("../textures/SkyCubemap_NegativeZ.png"),
        top: loadTexture("../textures/SkyCubemap_PositiveY.png"),
        bottom: loadTexture("../textures/SkyCubemap_NegativeY.png")
    };

}

async function saveFile(content, fileName) {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
                description: 'Text Files',
                accept: { 'text/plain': ['.txt', '.json'] },
            }]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (err) {
        console.error("error:", err);
    }
}

async function pickFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Text Files',
                accept: { 'text/plain': ['.txt', '.json'] },
            }],
            multiple: false,
        });

        const file = await fileHandle.getFile();
        const content = await file.text();
        // console.log(content);
        objs = JSON.parse(content);
        // console.log(objs);

        for (z = 0; z < WORLD_SIZE; ++z) {
            for (y = 0; y < WORLD_SIZE; ++y) {
                for (x = 0; x < WORLD_SIZE; ++x) {
                    g_World[z][y][x].type = objs[z][y][x].type;
                    g_World[z][y][x].drawMode = objs[z][y][x].drawMode;
                }
            }
        }

    } catch (err) {
        if (err.name === 'AbortError') {
            // console.log('cancel');
        } else {
            console.error('error:', err);
        }
    }
}
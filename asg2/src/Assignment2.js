// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    '' +
    '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 5;
let g_globalAngle = 0;
let g_bodyInandOutAngle = 0;
let g_LLP1LRAngle = 0;
let g_LLP2IOAngle = 0;
let g_RLP1LRAngle = 0;
let g_RLP2IOAngle = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;
let g_headAngle = 0;
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;

let g_headAnimation = false;
let g_bodyAnimation = false;
let g_leftArmAnimation = false;
let g_rightArmAnimation = false;
let g_LLP1Animation = false;
let g_LLP2Animation = false;
let g_leftFootAnimation = false;
let g_RLP1Animation = false;
let g_RLP2Animation = false;
let g_rightFootAnimation = false;

let g_explode = false;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsFromHtmlUI() {
    const button = document.getElementById("explosion");
    button.addEventListener('click', function(event) {
        if (event.shiftKey) {
            g_explode = true;  // Trigger explosion
            g_startTime = performance.now() / 1000;  // Reset timer for explosion
        } else {
            g_explode = false; // No explosion if shift not held
        }
    });

    document.getElementById("reset").onclick = function () {g_explode = false; renderAllShapes();};
    document.getElementById("headOff").onclick = function () {g_headAnimation = false;};
    document.getElementById("headOn").onclick = function () {g_headAnimation = true;};
    document.getElementById("bodyOff").onclick = function () {g_bodyAnimation = false;};
    document.getElementById("bodyOn").onclick = function () {g_bodyAnimation = true;};
    document.getElementById("leftArmOff").onclick = function () {g_leftArmAnimation = false;};
    document.getElementById("leftArmOn").onclick = function () {g_leftArmAnimation = true;};
    document.getElementById("rightArmOff").onclick = function () {g_rightArmAnimation = false;};
    document.getElementById("rightArmOn").onclick = function () {g_rightArmAnimation = true;};

    document.getElementById("LLP1Off").onclick = function () {g_LLP1Animation = false;};
    document.getElementById("LLP1On").onclick = function () {g_LLP1Animation = true;};

    document.getElementById("LLP2Off").onclick = function () {g_LLP2Animation = false;};
    document.getElementById("LLP2On").onclick = function () {g_LLP2Animation = true;};

    document.getElementById("leftFootOff").onclick = function () {g_leftFootAnimation = false;};
    document.getElementById("leftFootOn").onclick = function () {g_leftFootAnimation = true;};

    document.getElementById("RLP1Off").onclick = function () {g_RLP1Animation = false;};
    document.getElementById("RLP1On").onclick = function () {g_RLP1Animation = true;};
    document.getElementById("RLP2Off").onclick = function () {g_RLP2Animation = false;};
    document.getElementById("RLP2On").onclick = function () {g_RLP2Animation = true;};
    document.getElementById("rightFootOff").onclick = function () {g_rightFootAnimation = false;};
    document.getElementById("rightFootOn").onclick = function () {g_rightFootAnimation = true;};

    document.getElementById("leftArmSlide").addEventListener('mousemove', function () {g_leftArmAngle = this.value; renderAllShapes();});
    document.getElementById("rightArmSlide").addEventListener('mousemove', function () {g_rightArmAngle = this.value; renderAllShapes();});
    document.getElementById("angleSlide").addEventListener('mousemove', function () {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById("headSlide").addEventListener('mousemove', function () {g_headAngle = this.value; renderAllShapes();});
    document.getElementById("bodyInandOutSlide").addEventListener('mousemove', function () {g_bodyInandOutAngle = this.value; renderAllShapes();});
    document.getElementById("LLP2IOSlide").addEventListener('mousemove', function () {g_LLP2IOAngle = this.value; renderAllShapes();});
    document.getElementById("LLP1LRSlide").addEventListener('mousemove', function () {g_LLP1LRAngle = this.value; renderAllShapes();});
    document.getElementById("RLP2IOSlide").addEventListener('mousemove', function () {g_RLP2IOAngle = this.value; renderAllShapes();});
    document.getElementById("RLP1LRSlide").addEventListener('mousemove', function () {g_RLP1LRAngle = this.value; renderAllShapes();});
    document.getElementById("leftFootSlide").addEventListener('mousemove', function () {g_leftFootAngle = this.value; renderAllShapes();});
    document.getElementById("rightFootSlide").addEventListener('mousemove', function () {g_rightFootAngle = this.value; renderAllShapes();});
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsFromHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    canvas.onmousedown = function(event) {
      if (event.shiftKey) {
          g_explode = true;
          g_startTime = performance.now() / 1000;  // Reset explosion timer
      } else {
          click(event);  // Normal click behavior
      }
    };

    canvas.onmousemove = function (ev) {if (ev.buttons === 1) {click(ev);}};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(tick);
}

function show() {

    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    //console.log(performance.now());
    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_bodyAnimation) {
        g_bodyInandOutAngle = 45 * Math.sin(g_seconds);
    }

    if (g_headAnimation) {
        g_headAngle = 20 * Math.sin(2 * g_seconds);
    }

    if (g_leftArmAnimation) {
        g_leftArmAngle = -45 * Math.sin(g_seconds);
    }

    if (g_rightArmAnimation) {
        g_rightArmAngle = 45 * Math.sin(g_seconds);
    }

    if (g_LLP1Animation) {
        g_LLP1LRAngle = 25 * Math.sin(g_seconds);
    }

    if (g_LLP2Animation) {
        g_LLP2IOAngle = 30 * Math.sin(g_seconds);
    }

    if (g_leftFootAnimation) {
        g_leftFootAngle = 45 * Math.sin(g_seconds);
    }

    if (g_RLP1Animation) {
        g_RLP1LRAngle = -25 * Math.sin(g_seconds);
    }

    if (g_RLP2Animation) {
        g_RLP2IOAngle = -30 * Math.sin(g_seconds);
    }

    if (g_rightFootAnimation) {
        g_rightFootAngle = 45 * Math.sin(g_seconds);
    }
}

var g_shapeLists = [];

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

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderAllShapes() {
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (g_explode) {
      let spread = Math.min(g_seconds * 0.3, 3);  // Max spread = 3 units

      // Body
      var body = new Cylinder();
      body.color = [0.0, 1.0, 0.0, 1.0];
      body.matrix.translate(spread, spread, -spread);
      body.matrix.rotate(90, 1, 0, 0);
      body.matrix.scale(0.7, 0.7, 0.7);
      var bodyCoordMatLLP1 = new Matrix4(body.matrix);
      var bodyCoordMatRLP1 = new Matrix4(body.matrix);
      var bodyCoordMatHead = new Matrix4(body.matrix);
      var bodyCoordMatLA = new Matrix4(body.matrix);
      var bodyCoordMatRA = new Matrix4(body.matrix);
      body.matrix.scale(1.7, 1.7, 1);
      body.render();

      var leftArm = new Cylinder();
      leftArm.matrix = bodyCoordMatRA;
      leftArm.color = [0.25, 0.25, 0.75, 1.0];
      leftArm.matrix.translate(-spread, -spread, spread);
      leftArm.matrix.rotate(45, 0, 1, 0);
      leftArm.matrix.scale(0.5, 0.5, 1);
      leftArm.render();

      var rightArm = new Cylinder();
      rightArm.matrix = bodyCoordMatLA;
      rightArm.color = [0.25, 0.25, 0.75, 1.0];
      rightArm.matrix.translate(spread, -spread, spread);
      rightArm.matrix.rotate(-45, 0, 1, 0);
      rightArm.matrix.scale(0.5, 0.5, 1);
      rightArm.render();

      var head = new Cube();
      head.color = [1.0, 1.0, 0.0, 1.0];
      head.matrix = bodyCoordMatHead;
      head.matrix.scale(0.4, 0.4, 0.4);
      head.matrix.translate(-spread, -spread, -spread);
      head.render();

      var leftLegPart1 = new Cylinder();
      leftLegPart1.matrix = bodyCoordMatLLP1;
      leftLegPart1.color = [0.25, 0.25, 0.75, 1.0];
      leftLegPart1.matrix.translate(-spread, spread, spread);
      leftLegPart1.matrix.rotate(30, 1, 1, 1);
      var leftLegPart1CoordMat = new Matrix4(leftLegPart1.matrix)
      leftLegPart1.matrix.scale(0.5, 0.5, 0.5);
      leftLegPart1.render();

      var leftLegPart2 = new Cylinder();
      leftLegPart2.matrix = leftLegPart1CoordMat;
      leftLegPart2.color = [0.7, 0.7, 0.7, 1.0];
      leftLegPart2.matrix.translate(-spread, spread, -spread);
      leftLegPart2.matrix.rotate(-30, 0, 1, 0);
      var leftLegPart2CoordMat = new Matrix4(leftLegPart2.matrix)
      leftLegPart2.matrix.scale(0.5, 0.5, 0.5);
      leftLegPart2.render();

      var leftFoot = new Cube();
      leftFoot.matrix = leftLegPart2CoordMat;
      leftFoot.color = [1.0, 0.0, 0.0, 1.0];
      leftFoot.matrix.translate(spread, -spread, -spread)
      leftFoot.matrix.rotate(180, 0, 0, 1);
      leftFoot.matrix.scale(0.2, 0.4, 0.2);
      leftFoot.render();

      var rightLegPart1 = new Cylinder();
      rightLegPart1.matrix = bodyCoordMatRLP1;
      rightLegPart1.color = [0.25, 0.25, 0.75, 1.0];
      rightLegPart1.matrix.translate(-spread, -spread, spread);
      rightLegPart1.matrix.rotate(0, 0, 1, 0);
      var rightLegPart1CoordMat = new Matrix4(rightLegPart1.matrix);
      rightLegPart1.matrix.scale(0.5, 0.5, 0.5);
      rightLegPart1.render();

      var rightLegPart2 = new Cylinder();
      rightLegPart2.matrix = rightLegPart1CoordMat;
      rightLegPart2.color = [0.7, 0.7, 0.7, 1.0];
      rightLegPart2.matrix.translate(-spread, spread, -spread);
      rightLegPart2.matrix.rotate(-45, 1, 1, 0);
      var rightLegPart2CoordMat = new Matrix4(rightLegPart2.matrix)
      rightLegPart2.matrix.scale(0.5, 0.5, 0.5);
      rightLegPart2.render();

      var rightFoot = new Cube();
      rightFoot.matrix = rightLegPart2CoordMat;
      rightFoot.color = [1.0, 0.0, 0.0, 1.0];
      rightFoot.matrix.translate(spread, -spread, spread)
      rightFoot.matrix.rotate(180, 0, 0, 1);
      rightFoot.matrix.scale(0.2, 0.4, 0.2);
      rightFoot.render();

      return;
    }

    // Main body
    var body = new Cylinder();
    body.color = [0.0, 1.0, 0.0, 1.0];
    body.segments = 99;
    body.matrix.translate(0, 0.5, -0.25);
    body.matrix.rotate(90, 1, 0, 0);
    body.matrix.rotate(g_bodyInandOutAngle, 1, 0, 0);
    body.matrix.scale(0.7, 0.7, 0.7);
    var bodyCoordMatLLP1 = new Matrix4(body.matrix);
    var bodyCoordMatRLP1 = new Matrix4(body.matrix);
    var bodyCoordMatHead = new Matrix4(body.matrix);
    var bodyCoordMatLA = new Matrix4(body.matrix);
    var bodyCoordMatRA = new Matrix4(body.matrix);
    body.matrix.scale(1.7, 1.7, 1);
    body.render();

    var leftArm = new Cylinder();
    leftArm.segments = 3;
    leftArm.matrix = bodyCoordMatRA;
    leftArm.color = [0.25, 0.25, 0.75, 1.0];
    leftArm.matrix.translate(0, 0, 0);
    leftArm.matrix.rotate(45, 0, 1, 0);
    leftArm.matrix.rotate(g_leftArmAngle, 1, 0, 0);
    leftArm.matrix.scale(0.5, 0.5, 1);
    leftArm.render();

    var rightArm = new Cylinder();
    rightArm.segments = 3;
    rightArm.matrix = bodyCoordMatLA;
    rightArm.color = [0.25, 0.25, 0.75, 1.0];
    rightArm.matrix.translate(0, 0, 0);
    rightArm.matrix.rotate(-45, 0, 1, 0);
    rightArm.matrix.rotate(g_rightArmAngle, 1, 0, 0);
    rightArm.matrix.scale(0.5, 0.5, 1);
    rightArm.render();

    var head = new Cube();
    head.color = [1.0, 1.0, 0.0, 1.0];
    head.matrix = bodyCoordMatHead;
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, -0.5, -1);
    head.matrix.rotate(g_headAngle, 1, 1, 1);
    head.render();

    var leftLegPart1 = new Cylinder();
    leftLegPart1.matrix = bodyCoordMatLLP1;
    leftLegPart1.color = [0.25, 0.25, 0.75, 1.0];
    leftLegPart1.matrix.translate(0.15, 0, 0.95);
    leftLegPart1.matrix.rotate(30, 1, 1, 1);
    leftLegPart1.matrix.rotate(g_LLP1LRAngle, 0, 1, 1);
    var leftLegPart1CoordMat = new Matrix4(leftLegPart1.matrix)
    leftLegPart1.matrix.scale(0.5, 0.5, 0.5);
    leftLegPart1.render();

    var leftLegPart2 = new Cylinder();
    leftLegPart2.matrix = leftLegPart1CoordMat;
    leftLegPart2.color = [0.7, 0.7, 0.7, 1.0];
    leftLegPart2.matrix.translate(0, 0, 0.45);
    leftLegPart2.matrix.rotate(-30, 0, 1, 0);
    leftLegPart2.matrix.rotate(g_LLP2IOAngle, 1, 0, 1);
    var leftLegPart2CoordMat = new Matrix4(leftLegPart2.matrix)
    leftLegPart2.matrix.scale(0.5, 0.5, 0.5);
    leftLegPart2.render();

    var leftFoot = new Cube();
    leftFoot.matrix = leftLegPart2CoordMat;
    leftFoot.color = [1.0, 0.0, 0.0, 1.0];
    leftFoot.matrix.translate(0.1, 0.1, 0.45)
    leftFoot.matrix.rotate(180, 0, 0, 1);
    leftFoot.matrix.rotate(g_leftFootAngle, 0, 0, 1);
    leftFoot.matrix.scale(0.2, 0.4, 0.2);
    leftFoot.render();

    var rightLegPart1 = new Cylinder();
    rightLegPart1.matrix = bodyCoordMatRLP1;
    rightLegPart1.color = [0.25, 0.25, 0.75, 1.0];
    rightLegPart1.matrix.translate(-0.15, 0, 0.95);
    rightLegPart1.matrix.rotate(0, 0, 1, 0);
    rightLegPart1.matrix.rotate(g_RLP1LRAngle, 0, 1, 0);
    var rightLegPart1CoordMat = new Matrix4(rightLegPart1.matrix);
    rightLegPart1.matrix.scale(0.5, 0.5, 0.5);
    rightLegPart1.render();

    var rightLegPart2 = new Cylinder();
    rightLegPart2.matrix = rightLegPart1CoordMat;
    rightLegPart2.color = [0.7, 0.7, 0.7, 1.0];
    rightLegPart2.matrix.translate(0, 0, 0.45);
    rightLegPart2.matrix.rotate(-45, 1, 1, 0);
    rightLegPart2.matrix.rotate(g_RLP2IOAngle, 1, 0, 0);
    var rightLegPart2CoordMat = new Matrix4(rightLegPart2.matrix)
    rightLegPart2.matrix.scale(0.5, 0.5, 0.5);
    rightLegPart2.render();

    var rightFoot = new Cube();
    rightFoot.matrix = rightLegPart2CoordMat;
    rightFoot.color = [1.0, 0.0, 0.0, 1.0];
    rightFoot.matrix.translate(0.1, 0.15, 0.45)
    rightFoot.matrix.rotate(180, 0, 0, 1);
    rightFoot.matrix.rotate(g_rightFootAngle, 0, 0, 1);
    rightFoot.matrix.scale(0.2, 0.4, 0.2);
    rightFoot.render();

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000 / duration) / 10, "info")
}

function sendTextToHtml(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log('Failed to get ' + htmlID + 'from Html!');
        return;
    }
    htmlElm.innerHTML = text;
}

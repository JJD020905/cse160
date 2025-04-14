// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  //'  gl_PointSize = 10.0;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
// Game GV
let g_gameRunning = false;
let g_mouseX = 0;
let g_mouseY = 0;
let g_catX = -0.8;
let g_catY = -0.8;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globa;s related UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize  = 5;
let g_selectedType  = POINT;
let g_selectedSegment = 10;

function addActionsForHtmlUI() {
  // Button Events (Shape Type)
  // document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  // document.getElementById('red').onclick   = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick   = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick   = function() {g_selectedType=CIRCLE};

  document.getElementById('drawArtButton').onclick = drawMyArt;

  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup',   function()  { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value; });

}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Game
  canvas.addEventListener("mousemove", function(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
    g_mouseX = x;
    g_mouseY = y;
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes  = [];
*/
function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segment = g_selectedSegment;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  // g_points.push([x, y]);
  // Store the color to g_colors array
  // g_colors.push(g_selectedColor.slice());
  // Store the size to g_sizes array
  // g_sizes.push(g_selectedSize);

/*
  // Store the coordinates to g_points array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
*/

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of this function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawMyArt() {
  g_shapesList = [];

  // Tree trunk (brown)
  let trunkColor = [0.55, 0.27, 0.07, 1.0]; // brown
  let trunk = [
    [-0.05, -0.7,  0.05, -0.7,  0.05, -0.4],
    [-0.05, -0.7,  0.05, -0.4, -0.05, -0.4],
  ];

  for (let coords of trunk) {
    let tri = new Triangle();
    tri.color = trunkColor;
    tri.position = [coords[0], coords[1]]; // Not used, but required
    tri.render = function() {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, this.size);
      drawTriangle(coords);
    }
    g_shapesList.push(tri);
  }

  // Tree leaves (green)
  let leafColor = [0.0, 0.6, 0.0, 1.0];
  let leaves = [
    [-0.3, -0.4,  0.0,  0.1,   0.3, -0.4],
    [-0.25, -0.2, 0.0,  0.2,   0.25, -0.2],
    [-0.2,  0.0,  0.0,  0.3,   0.2,  0.0],
  ];

  for (let coords of leaves) {
    let tri = new Triangle();
    tri.color = leafColor;
    tri.position = [coords[0], coords[1]];
    tri.render = function() {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, this.size);
      drawTriangle(coords);
    }
    g_shapesList.push(tri);
  }

  let sunColor = [1.0, 0.85, 0.1, 1.0];
  let centerX = 0.6;
  let centerY = 0.6;
  let radius = 0.15;
  let segments = 20;

  for (let i = 0; i < segments; i++) {
    let angle1 = (i / segments) * 2 * Math.PI;
    let angle2 = ((i + 1) / segments) * 2 * Math.PI;

    let x1 = centerX + radius * Math.cos(angle1);
    let y1 = centerY + radius * Math.sin(angle1);
    let x2 = centerX + radius * Math.cos(angle2);
    let y2 = centerY + radius * Math.sin(angle2);

    let tri = new Triangle();
    tri.color = sunColor;
    tri.position = [centerX, centerY]; // not used in render

    tri.render = function () {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, this.size);
      drawTriangle([centerX, centerY, x1, y1, x2, y2]);
    }

    g_shapesList.push(tri);
  }

  // Grassland
  let grassColor = [0.0, 0.8, 0.2, 1.0];
  // Make 3 rectangles (left, center, right), each with 2 triangles
  let grassRects = [
    [-1.0, -1.0, -0.33, -1.0, -0.33, -0.6],
    [-1.0, -1.0, -0.33, -0.6, -1.0, -0.6],

    [-0.33, -1.0, 0.33, -1.0, 0.33, -0.6],
    [-0.33, -1.0, 0.33, -0.6, -0.33, -0.6],

    [0.33, -1.0, 1.0, -1.0, 1.0, -0.6],
    [0.33, -1.0, 1.0, -0.6, 0.33, -0.6],
  ];

  for (let coords of grassRects) {
    let tri = new Triangle();
    tri.color = grassColor;
    tri.position = [coords[0], coords[1]];
    tri.render = function () {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, this.size);
      drawTriangle(coords);
    };
    g_shapesList.push(tri);
  }

  renderAllShapes();
}

// Game
function startMouseEscapeGame() {
  g_gameRunning = false;
  g_catX = -0.8;
  g_catY = -0.8;

  let countdown = [3, 2, 1];
  let index = 0;

  function showNext() {
    if (index < countdown.length) {
      drawCountdownNumber(countdown[index]);
      index++;
      setTimeout(showNext, 1000);
    } else {
      g_gameRunning = true;
      requestAnimationFrame(runMouseEscapeGame);
    }
  }

  showNext();
}

function runMouseEscapeGame() {
  if (!g_gameRunning) return;

  let dx = g_mouseX - g_catX;
  let dy = g_mouseY - g_catY;
  let distance = Math.sqrt(dx*dx + dy*dy);

  if (distance < 0.05) {
    g_gameRunning = false;
    alert("Game Over! The cat caught the mouse!");
    return;
  }

  // Move cat toward mouse
  let speed = 0.01;
  g_catX += dx / distance * speed;
  g_catY += dy / distance * speed;

  drawGameScene();
  requestAnimationFrame(runMouseEscapeGame);
}

function drawGameScene() {
  g_shapesList = [];

  // Draw mouse (red square)
  let mouse = new Point();
  mouse.position = [g_mouseX, g_mouseY];
  mouse.color = [1.0, 0.0, 0.0, 1.0];
  mouse.size = 20;
  g_shapesList.push(mouse);

  // Draw cat (blue square)
  let cat = new Point();
  cat.position = [g_catX, g_catY];
  cat.color = [0.0, 0.0, 1.0, 1.0];
  cat.size = 20;
  g_shapesList.push(cat);

  renderAllShapes();
}

// Count Down
function drawCountdownNumber(number) {
  g_shapesList = [];

  let count = number;
  let spacing = 0.15;
  let startX = -((count - 1) * spacing) / 2;
  let y = 0.0;

  for (let i = 0; i < count; i++) {
    let x = startX + i * spacing;
    let coords = [
      x, y + 0.1,
      x - 0.05, y - 0.1,
      x + 0.05, y - 0.1
    ];

    let tri = new Triangle();
    tri.color = [1.0, 1.0, 0.0, 1.0];
    tri.position = [x, y];
    tri.render = function () {
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, this.size);
      drawTriangle(coords);
    };

    g_shapesList.push(tri);
  }

  renderAllShapes();
}

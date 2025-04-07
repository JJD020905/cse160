// asg0.js
function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Failed to get 2D context for canvas');
        return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element in drawVector');
        return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Failed to get 2D context for canvas in drawVector');
        return;
    }

    var centerX = canvas.width / 2;  // 200
    var centerY = canvas.height / 2; // 200

    var scale = 20;
    var x = v.elements[0] * scale;
    var y = v.elements[1] * scale;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x, centerY - y);
    ctx.stroke();
}

function angleBetween(v1, v2) {
    var dotProduct = Vector3.dot(v1, v2);
    var magV1 = v1.magnitude();
    var magV2 = v2.magnitude();

    if (magV1 === 0 || magV2 === 0) {
        throw "Cannot calculate angle with a zero vector";
    }

    var cosAlpha = dotProduct / (magV1 * magV2);
    if (cosAlpha > 1) cosAlpha = 1;
    if (cosAlpha < -1) cosAlpha = -1;

    var alpha = Math.acos(cosAlpha);
    var alphaDegrees = alpha * (180 / Math.PI);

    return alphaDegrees;
}

function areaTriangle(v1, v2) {
    var cross = Vector3.cross(v1, v2);
    var area = 0.5 * cross.magnitude();
    return area;
}


function handleDrawEvent() {
    if (typeof Vector3 === 'undefined') {
        console.log('Vector3 class is not defined. Ensure cuon-matrix-cse160.js is loaded.');
        return;
    }

    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Failed to get 2D context for canvas');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1xInput = document.getElementById('v1x').value;
    var v1yInput = document.getElementById('v1y').value;

    var v1x = parseFloat(v1xInput);
    var v1y = parseFloat(v1yInput);

    if (isNaN(v1x) || isNaN(v1y)) {
        console.log('Invalid input for v1 coordinates. Please enter valid numbers.');
        return;
    }

    var v1 = new Vector3([v1x, v1y, 0]);
    drawVector(v1, "red");

    var v2xInput = document.getElementById('v2x').value;
    var v2yInput = document.getElementById('v2y').value;

    var v2x = parseFloat(v2xInput);
    var v2y = parseFloat(v2yInput);

    if (isNaN(v2x) || isNaN(v2y)) {
        console.log('Invalid input for v2 coordinates. Please enter valid numbers.');
        return;
    }

    var v2 = new Vector3([v2x, v2y, 0]);
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    if (typeof Vector3 === 'undefined') {
        console.log('Vector3 class is not defined. Ensure cuon-matrix-cse160.js is loaded.');
        return;
    }

    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Failed to get 2D context for canvas');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1xInput = document.getElementById('v1x').value;
    var v1yInput = document.getElementById('v1y').value;
    var v1x = parseFloat(v1xInput);
    var v1y = parseFloat(v1yInput);

    if (isNaN(v1x) || isNaN(v1y)) {
        console.log('Invalid input for v1 coordinates. Please enter valid numbers.');
        return;
    }

    var v1 = new Vector3([v1x, v1y, 0]);
    drawVector(v1, "red");

    var v2xInput = document.getElementById('v2x').value;
    var v2yInput = document.getElementById('v2y').value;
    var v2x = parseFloat(v2xInput);
    var v2y = parseFloat(v2yInput);

    if (isNaN(v2x) || isNaN(v2y)) {
        console.log('Invalid input for v2 coordinates. Please enter valid numbers.');
        return;
    }

    var v2 = new Vector3([v2x, v2y, 0]);
    drawVector(v2, "blue");

    var operation = document.getElementById('operation').value;

    if (!operation) {
        console.log('Please select an operation.');
        return;
    }

    var s;
    if (operation === "mul" || operation === "div") {
        var scalarInput = document.getElementById('scalar').value;
        s = parseFloat(scalarInput);
        if (isNaN(s)) {
            console.log('Invalid scalar value. Please enter a valid number.');
            return;
        }
    }

    if (operation === "add") {
        var v3 = new Vector3([v1x, v1y, 0]);
        v3.add(v2);
        drawVector(v3, "green");
    } else if (operation === "sub") {
        var v3 = new Vector3([v1x, v1y, 0]);
        v3.sub(v2);
        drawVector(v3, "green");
    } else if (operation === "mul") {
        var v3 = new Vector3([v1x, v1y, 0]);
        var v4 = new Vector3([v2x, v2y, 0]);
        v3.mul(s);
        v4.mul(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "div") {
        if (s === 0) {
            console.log('Division by zero is not allowed.');
            return;
        }
        var v3 = new Vector3([v1x, v1y, 0]);
        var v4 = new Vector3([v2x, v2y, 0]);
        v3.div(s);
        v4.div(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "magnitude") {
        var magV1 = v1.magnitude();
        var magV2 = v2.magnitude();
        console.log("Magnitude v1: " + magV1);
        console.log("Magnitude v2: " + magV2);
    } else if (operation === "normalize") {
        var v1Norm = new Vector3([v1x, v1y, 0]);
        var v2Norm = new Vector3([v2x, v2y, 0]);
        if (v1Norm.magnitude() === 0 || v2Norm.magnitude() === 0) {
            console.log('Cannot normalize a zero vector.');
            return;
        }
        v1Norm.normalize();
        v2Norm.normalize();
        drawVector(v1Norm, "green");
        drawVector(v2Norm, "green");
    } else if (operation === "angle") {
        try {
            var angle = angleBetween(v1, v2);
            console.log("Angle: " + angle);
        } catch (e) {
            console.log(e);
        }
    } else if (operation === "area") {
        var area = areaTriangle(v1, v2);
        console.log("Area of the triangle: " + area);
    }
}

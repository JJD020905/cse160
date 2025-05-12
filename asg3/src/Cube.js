class Cube {
    constructor() {
        this.type = 'cube';
        // this.color = (color == null) ? [1.0, 1.0, 1.0, 1.0] : color;
        // this.color = [1.0, 1.0, 1.0, 1.0];
        // this.matrix = new Matrix4();
        // this.vertexBuffer = 0;
        // this.texcoordBuffer = 0;
        // this.indexBuffer = 0;
        // this.indexCount = 0;

        this.init();
    }

    init() {
        let positions = [
            // top
            -1.0, 1.0, 1.0, //
            1.0, 1.0, 1.0, //
            1.0, 1.0, -1.0, //
            -1.0, 1.0, -1.0, //

            // bottom
            -1.0, -1.0, -1.0, //
            1.0, -1.0, -1.0, //
            1.0, -1.0, 1.0, //
            -1.0, -1.0, 1.0, //

            // left
            -1.0, -1.0, -1.0, //
            -1.0, -1.0, 1.0, //
            -1.0, 1.0, 1.0, //
            -1.0, 1.0, -1.0, //

            // right
            1.0, -1.0, 1.0, //
            1.0, -1.0, -1.0, //
            1.0, 1.0, -1.0, //
            1.0, 1.0, 1.0, //

            // front
            -1.0, -1.0, 1.0, //
            1.0, -1.0, 1.0, //
            1.0, 1.0, 1.0, //
            -1.0, 1.0, 1.0, //

            // back
            1.0, -1.0, -1.0, //
            -1.0, -1.0, -1.0, //
            -1.0, 1.0, -1.0, //
            1.0, 1.0, -1.0, //
        ];

        let texcoords = [
            //u   v    u    v    u    v    u    v
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];

        let indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23
        ];

        this.vertexBuffer = createVertexBuffer(positions);
        this.texcoordBuffer = createVertexBuffer(texcoords);
        this.indexBuffer = createIndexBuffer(indices);
        this.indexCount = indices.length;
    }

    render() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        // reset states
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_TexCoord);
    }

    renderTopSide(texTop, texSide) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // top
        gl.bindTexture(gl.TEXTURE_2D, texTop.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 0);

        // side
        gl.bindTexture(gl.TEXTURE_2D, texSide.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT, 2 * 6); // sizeof(short) * 6

        // reset states
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_TexCoord);
    }

    renderSkybox(texLeft, texRight, texFront, texBack, texTop, texBottom) {
        gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // top
        gl.bindTexture(gl.TEXTURE_2D, texTop.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 0);

        // bottom
        gl.bindTexture(gl.TEXTURE_2D, texBottom.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 6);

        // left
        gl.bindTexture(gl.TEXTURE_2D, texLeft.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 12);

        // right
        gl.bindTexture(gl.TEXTURE_2D, texRight.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 18);

        // front
        gl.bindTexture(gl.TEXTURE_2D, texFront.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 24);

        // back
        gl.bindTexture(gl.TEXTURE_2D, texBack.textureWebGL);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 2 * 30);

        // reset states
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_TexCoord);
    }
}

class Tile {
    constructor() {
        this.type = TOOL_NONE;
        this.drawMode = DRAW_MODE_DEFAULT;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        if (this.type == TOOL_NONE) {
            return;
        }

        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.drawMode == DRAW_MODE_DEFAULT) { // normal
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[this.type].tex.textureWebGL);

            g_cubeModel.render();

        } else if (this.drawMode == DRAW_MODE_TOP_SIDE) { // top side
            let texTop = textureArray[this.type].top;
            let texSide = textureArray[this.type].side;
            g_cubeModel.renderTopSide(texTop, texSide);
        } else if (this.drawMode == DRAW_MODE_SKYBOX) { // skybox
            let tex = textureArray[this.type];
            g_cubeModel.renderSkybox(tex.left, tex.right, tex.front, tex.back, tex.top, tex.bottom);
        }
    }
}
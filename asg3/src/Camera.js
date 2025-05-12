// import { Vector3 } from "../lib/cuon-matrix-cse160.js";

class Camera {
    constructor() {
        this.type = 'camera';
        this.fov = 60.0;
        this.eye = new Vector3([0.0, 0.0, 0.0]);
        this.at = new Vector3([0.0, 0.0, -1.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
        this.speed = 1.0;
        this.viewMatrix = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);

        this.log();
    }

    log() {
        console.log('camera:');
        console.log('eye:' + this.eye.elements);
        console.log('at:' + this.at.elements);
        console.log('up:' + this.up.elements);
    }

    compuateMatrix() {
        this.viewMatrix = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    lookAt(eyeX, eyeY, eyeZ, atX, atY, atZ) {
        this.eye.elements[0] = eyeX;
        this.eye.elements[1] = eyeY;
        this.eye.elements[2] = eyeZ;
        this.at.elements[0] = atX;
        this.at.elements[1] = atY;
        this.at.elements[2] = atZ;
    }

    direction() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        return f;
    }

    moveForward(dt) {
        let f = this.direction();

        if (dt == null) dt = 1.0;
        f.mul(this.speed * dt);

        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards(dt) {
        let f = this.direction();

        if (dt == null) dt = 1.0;
        f.mul(this.speed * dt);

        this.eye.sub(f);
        this.at.sub(f);
    }

    moveLeft(dt) {
        let f = this.direction();
        let s = Vector3.cross(f, this.up);

        if (dt == null) dt = 1.0;
        s.mul(this.speed * dt);

        this.eye.sub(s);
        this.at.sub(s);
    }

    moveRight(dt) {
        let f = this.direction();
        let s = Vector3.cross(f, this.up);

        if (dt == null) dt = 1.0;
        s.mul(this.speed * dt);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let mat = new Matrix4();
        mat.setRotate(5.0, 0.0, 1.0, 0.0);
        let f_prime = mat.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let mat = new Matrix4();
        mat.setRotate(-5.0, 0.0, 1.0, 0.0);
        let f_prime = mat.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    drag(x, y) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();

        let scale = 0.05;
        let mat = new Matrix4();
        mat.setIdentity();
        mat.rotate(-x * scale, 0.0, 1.0, 0.0);
        mat.rotate(-y * scale, s.elements[0], s.elements[1], s.elements[2]);
        let f_prime = mat.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }
}
class Camera {
    constructor() {
        this.pos = createVector(0,0,0)
        this.rot = createVector(0,0,0)
    }

    process() {
        this.processMovement()
        this.processRotation()
    }
    
    processMovement() {
        const speed = 1
        let velocity = createVector(0,0,0)
        let yaw = cam.rot.y;
        let pitch = cam.rot.x;

        let forward = createVector(
            sin(yaw) * cos(pitch),
            sin(pitch),
            cos(yaw) * cos(pitch)
        );

let right = createVector(
    cos(yaw),
    0,
    -sin(yaw)
);
            
        if (keyIsDown(87)) this.pos.add(p5.Vector.mult(forward, speed)); // W
        if (keyIsDown(83)) this.pos.add(p5.Vector.mult(forward, -speed)); // S
        if (keyIsDown(68)) this.pos.add(p5.Vector.mult(right, speed)); // D
        if (keyIsDown(65)) this.pos.add(p5.Vector.mult(right, -speed)); // A

        this.pos.add(velocity)
    }

    processRotation() {
        cam.rot.y += movedX/width
        cam.rot.x += movedY/width
        cam.rot.x = constrain(cam.rot.x, -HALF_PI, HALF_PI);
    }
}
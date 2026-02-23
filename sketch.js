const vertexes = []

let cam

function setup() {
  createCanvas(1000, 600);
  vertexes.push(createVector(0,0,50))
  vertexes.push(createVector(0,50,50))
  vertexes.push(createVector(50,50,50))
  vertexes.push(createVector(50,0,50))

  vertexes.push(createVector(0,0,100))
  vertexes.push(createVector(0,50,100))
  vertexes.push(createVector(50,50,100))
  vertexes.push(createVector(50,0,100))
  cam = new Camera()
}

function draw() {
  background(220);
  translate(width / 2, height / 2)

  cam.process()

  render()
}

function render() {
  for (let v of vertexes) {
    // Vector from camera to point
    let p = p5.Vector.sub(v, cam.pos);

    // Build camera rotation matrix
    let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
    let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);

    // Camera axes
    let right = createVector(cosY, 0, -sinY);
    let up = createVector(sinY*sinX, cosX, cosY*sinX);
    let forward = createVector(sinY*cosX, -sinX, cosX*cosY);

    // Transform point into camera space
    let camX = p.dot(right);
    let camY = p.dot(up);
    let camZ = p.dot(forward);

    if (camZ <= 1) continue;

    let focalLength = 300;
    let scale = focalLength / camZ;

    let x2d = camX * scale;
    let y2d = camY * scale;

    strokeWeight(scale);
    point(x2d, -y2d);
  }
}

function rotateAroundX(v, angle) {
  let cosA = cos(angle);
  let sinA = sin(angle);

  return createVector(
    v.x,
    v.y * cosA - v.z * sinA,
    v.y * sinA + v.z * cosA
  );
}

function rotateAroundY(v, angle) {
  let cosA = cos(angle);
  let sinA = sin(angle);

  return createVector(
    v.x * cosA + v.z * sinA,
    v.y,
    -v.x * sinA + v.z * cosA
  );
}

function rotateAroundZ(v, angle) {
  let cosA = cos(angle);
  let sinA = sin(angle);

  return createVector(
    v.x * cosA - v.y * sinA,
    v.x * sinA + v.y * cosA,
    v.z
  );
}

function doubleClicked() {
  requestPointerLock();
}
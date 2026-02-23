let vertexes = [];
let tris = [];
let cam;

function setup() {
  createCanvas(1000, 600);

  // Create cube vertices
  vertexes.push(createVector(0,0,50))   // 0
  vertexes.push(createVector(0,50,50))  // 1
  vertexes.push(createVector(50,50,50)) // 2
  vertexes.push(createVector(50,0,50))  // 3
  vertexes.push(createVector(0,0,100))  // 4
  vertexes.push(createVector(0,50,100)) // 5
  vertexes.push(createVector(50,50,100))// 6
  vertexes.push(createVector(50,0,100)) // 7

  // Create triangles (each face = 2 triangles)
  tris.push(new Tri(0,1,2))
  tris.push(new Tri(0,2,3))
  
  tris.push(new Tri(4,5,6))
  tris.push(new Tri(4,6,7))
  
  tris.push(new Tri(0,1,5))
  tris.push(new Tri(0,5,4))
  
  tris.push(new Tri(3,2,6))
  tris.push(new Tri(3,6,7))
  
  tris.push(new Tri(1,2,6))
  tris.push(new Tri(1,6,5))
  
  tris.push(new Tri(0,3,7))
  tris.push(new Tri(0,7,4))

  cam = new Camera();
}

function draw() {
  background(220);
  translate(width / 2, height / 2);
  cam.process();
  render();
}

// Triangle class stores indices of 3 vertices
class Tri {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

function render() {
  let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
  let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);

  let right = createVector(cosY, 0, -sinY);
  let up = createVector(sinY*sinX, cosX, cosY*sinX);
  let forward = createVector(sinY*cosX, -sinX, cosX*cosY);

  let focalLength = 250;

  // Prepare triangles with depth
  let trisToDraw = [];

  for (let t of tris) {
    let verts = [vertexes[t.a], vertexes[t.b], vertexes[t.c]];
    let projected = [];
    let camZs = [];

    // Project each vertex
    for (let v of verts) {
      let p = p5.Vector.sub(v, cam.pos);
      let camX = p.dot(right);
      let camY = p.dot(up);
      let camZ = p.dot(forward);
      if (camZ <= 0) continue; // clip
      let scale = focalLength / camZ;
      projected.push(createVector(camX * scale, -camY * scale));
      camZs.push(camZ);
    }

    if (projected.length === 3) {
      // Use average Z as depth
      let depth = (camZs[0] + camZs[1] + camZs[2]) / 3;
      trisToDraw.push({ projected, verts, depth });
    }
  }

  // Sort back-to-front (larger Z = further away)
  trisToDraw.sort((a, b) => b.depth - a.depth);

  // Draw triangles
  for (let t of trisToDraw) {
    stroke(0);
    fill(t.verts[0].x * 2, t.verts[1].x * 2, t.verts[2].z * 2); // simple color
    triangle(
      t.projected[0].x, t.projected[0].y,
      t.projected[1].x, t.projected[1].y,
      t.projected[2].x, t.projected[2].y
    );

    // Draw lines connecting all vertices of the triangle

  }
}

function doubleClicked() {
  requestPointerLock();
}
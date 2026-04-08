let vertexes = [];
let tris = [];
let chosenVertexes = [];
let chosenMode = "Line";
let building = true
let cam;
let zBuffer;
let lines = [];

function setup() {
  let myCanvas = createCanvas(1000, 600);
  myCanvas.parent('canvas')
  zBuffer = new Float32Array(width * height);
  pixelDensity(1);
  colorMode(HSB)

  // Create cube vertices
  vertexes.push(createVector(0,0,50))   // 0
  vertexes.push(createVector(0,50,50))  // 1
  vertexes.push(createVector(50,50,50)) // 2
  vertexes.push(createVector(50,0,50))  // 3
  vertexes.push(createVector(0,0,100))  // 4
  vertexes.push(createVector(0,50,100)) // 5
  vertexes.push(createVector(50,50,100))// 6
  vertexes.push(createVector(50,0,100)) // 7


  vertexes.push(createVector(200,200,225))
  vertexes.push(createVector(250,200,200))
  vertexes.push(createVector(250,200,250))
  vertexes.push(createVector(225,250,225))
  
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

  tris.push(new Tri(8,9,10))
  tris.push(new Tri(8,9,11))
  tris.push(new Tri(8,10,11))
  tris.push(new Tri(9,10,11))

  cam = new Camera();
}

function draw() {
  background(0,0,50);
  loadPixels();
  push()
  translate(width / 2, height / 2);
  cam.process();
  zBuffer.fill(Infinity);
  render();

  updatePixels();
  pop()
  push()
  drawLineLabels()
  pop()
  textSize(20)
  text(round(frameRate(),2),50,50)
  text(chosenMode, 50,75)
  push()
  strokeWeight(12)
  point(width / 2, height / 2)
  pop()
  
}

function drawLineLabels() {
  let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
  let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);
  let right   = createVector(cosY, 0, -sinY);
  let up      = createVector(sinY*sinX, cosX, cosY*sinX);
  let forward = createVector(sinY*cosX, -sinX, cosX*cosY);

  textSize(13);
  textAlign(CENTER);
  fill(60, 255, 255);
  noStroke();

  for (let l of lines) {
    let mid = l.midpoint();
    let p = p5.Vector.sub(mid, cam.pos);
    let camX = p.dot(right);
    let camY = p.dot(up);
    let camZ = p.dot(forward);

    if (camZ < 0.1) continue;

    let scale = 300 / camZ;
    let sx = camX * scale + width / 2;
    let sy = -camY * scale + height / 2;

     let px = floor(sx);
    let py = floor(sy - 12); // same offset as text
    if (px >= 0 && px < width && py >= 0 && py < height) {
      let zAtLabel = zBuffer[px + py * width];
      if (camZ > zAtLabel) continue; // something closer is in the way
    }
    fill(60, 255, 255);
    text(l.equation(), sx, sy - 12);
  }
}

window.addEventListener("keydown",(e)=>{
    if(e.code==="KeyF"){
      requestPointerLock()
    }
    if(e.code==="KeyL"){
      building = false
      lineMode()
    }
    if(e.code==="Enter"){
      if (building) createVertex()
      else chooseVertex()
    }
    if(e.code==="KeyQ"){
      building = true
      chosenMode = "Building"
    }
    if(e.code==="KeyT"){
      building = false
      trekantMode()
    }
  })

  window.addEventListener("wheel", (e)=>{
    let slider = document.getElementById("dybde")
    if(e.deltaY < 0){
      slider.valueAsNumber += 1
    } else {
      slider.value -= 1
    }
  })

// Triangle class stores indices of 3 vertices
class Tri {
  constructor(a, b, c, col = color(random(360),255,255)) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.color = col
  }
}

function render() {
  let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
  let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);

  let right = createVector(cosY, 0, -sinY);
  let up = createVector(sinY*sinX, cosX, cosY*sinX);
  let forward = createVector(sinY*cosX, -sinX, cosX*cosY);

  let focalLength = 300;

  // Prepare triangles with depth

  for (let t of tris) {
    let verts = [vertexes[t.a], vertexes[t.b], vertexes[t.c]];
    let projected = [];
    let camZs = [];
    let camVerts = [];

    // Project each vertex
    for (let v of verts) {
  
      let p = p5.Vector.sub(v, cam.pos);

      let camX = p.dot(right);
      let camY = p.dot(up);
      let camZ = p.dot(forward);

      camVerts.push({x:camX, y:camY, z:camZ});

    }

      let clipped = clipTriangle(
      camVerts[0],
      camVerts[1],
      camVerts[2],
      0.1
    );

    for (let tri of clipped){
    
      let projected = [];
      let camZs = [];
    
      for (let v of tri){
      
        let scale = focalLength / v.z;
      
        projected.push({x: v.x*scale, y: -v.y*scale});
      
        camZs.push(v.z);
      
      }

      rasterizeTriangle(
        projected[0],
        projected[1],
        projected[2],
        camZs[0],
        camZs[1],
        camZs[2],
        t.color
      );
    }
  }
 for (let l of lines) {
  let verts = [vertexes[l.a], vertexes[l.b]];
  let camVerts = verts.map(v => {
    let p = p5.Vector.sub(v, cam.pos);
    return { x: p.dot(right), y: p.dot(up), z: p.dot(forward) };
  });

  let cv0 = camVerts[0], cv1 = camVerts[1];
  if (cv0.z < 0.1 && cv1.z < 0.1) continue;

  // Clip to near plane
  if (cv0.z < 0.1) {
    let t = (0.1 - cv0.z) / (cv1.z - cv0.z);
    cv0 = { x: cv0.x + (cv1.x - cv0.x) * t, y: cv0.y + (cv1.y - cv0.y) * t, z: 0.1 };
  }
  if (cv1.z < 0.1) {
    let t = (0.1 - cv1.z) / (cv0.z - cv1.z);
    cv1 = { x: cv1.x + (cv0.x - cv1.x) * t, y: cv1.y + (cv0.y - cv1.y) * t, z: 0.1 };
  }

  let s0 = focalLength / cv0.z;
  let s1 = focalLength / cv1.z;

  let p0 = { x: cv0.x * s0, y: -cv0.y * s0 };
  let p1 = { x: cv1.x * s1, y: -cv1.y * s1 };

  rasterizeLine(p0, p1, cv0.z, cv1.z, color(60, 255, 255));
}

// Collect used vertex indices
let usedVertexes = new Set();
for (let t of tris) {
  usedVertexes.add(t.a);
  usedVertexes.add(t.b);
  usedVertexes.add(t.c);
}
for (let l of lines) {
  usedVertexes.add(l.a);
  usedVertexes.add(l.b);
}

for (let i = 0; i < vertexes.length; i++) {
  if (usedVertexes.has(i)) continue;
  let p = p5.Vector.sub(vertexes[i], cam.pos);
  let camX = p.dot(right);
  let camY = p.dot(up);
  let camZ = p.dot(forward);

  if (camZ < 0.1) continue;

  let scale = focalLength / camZ;
  let sx = floor(camX * scale + width / 2);
  let sy = floor(-camY * scale + height / 2);
  let size = Math.max(1, Math.floor(0.8 * (focalLength / camZ))); 

  // Draw a small square dot (3x3 pixels)
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      let px = sx + dx;
      let py = sy + dy;
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      let index = px + py * width;
      if (camZ < zBuffer[index]) {
        zBuffer[index] = camZ;
        let indi = index * 4;
        if (chosenVertexes.includes(i)){
        pixels[indi]     = 123;    
        pixels[indi + 1] = 255;
        pixels[indi + 2] = 255;
        pixels[indi + 3] = 255;
        } else {
        pixels[indi]     = 0;    // white in HSB
        pixels[indi + 1] = 0;
        pixels[indi + 2] = 255;
        pixels[indi + 3] = 255;
        }
        
      }
    }
  }
}
// Preview vertex placement in building mode
if (building) {
  let t = Number(document.getElementById("dybde").value);
  let previewPos = p5.Vector.add(cam.pos, p5.Vector.mult(forward, t));

  let p = p5.Vector.sub(previewPos, cam.pos);
  let camX = p.dot(right);
  let camY = p.dot(up);
  let camZ = p.dot(forward);

  if (camZ >= 0.1) {
    let scale = focalLength / camZ;
    let sx = floor(camX * scale + width / 2);
    let sy = floor(-camY * scale + height / 2);
    let size = Math.max(1, Math.floor(0.8 * (focalLength / camZ)));

    // Draw a larger distinct preview dot (cross shape)
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        if (abs(dx) > 1 && abs(dy) > 1) continue; // cross shape
        let px = sx + dx;
        let py = sy + dy;
        if (px < 0 || px >= width || py < 0 || py >= height) continue;
        let index = px + py * width;
        let i = index * 4;
        pixels[i]     = 30;   // green-yellow in HSB
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
    }
  }
}


}

function clipTriangle(v0,v1,v2,near) {

  let inside = [];
  let outside = [];

  for (let v of [v0,v1,v2]) {
    if (v.z > near) inside.push(v);
    else outside.push(v);
  }

  if (inside.length == 3) return [[v0,v1,v2]];
  if (inside.length == 0) return [];

  function intersect(a,b){
    let t = (near - a.z) / (b.z - a.z);

    return {
      x: a.x + (b.x-a.x)*t,
      y: a.y + (b.y-a.y)*t,
      z: near
    };
  }

  if (inside.length == 1){

    let a = inside[0];
    let b = intersect(a,outside[0]);
    let c = intersect(a,outside[1]);

    return [[a,b,c]];

  }

  if (inside.length == 2){

    let a = inside[0];
    let b = inside[1];

    let c = intersect(a,outside[0]);
    let d = intersect(b,outside[0]);

    return [
      [a,b,c],
      [b,d,c]
    ];

  }

}

function rasterizeTriangle(p0, p1, p2, z0, z1, z2, color) {

  let minX = floor(min(p0.x, p1.x, p2.x));
  let maxX = ceil(max(p0.x, p1.x, p2.x));
  let minY = floor(min(p0.y, p1.y, p2.y));
  let maxY = ceil(max(p0.y, p1.y, p2.y));
  minX = max(minX, -width/2);
  maxX = min(maxX, width/2);
  minY = max(minY, -height/2);
  maxY = min(maxY, height/2);

  let area = edge(p0, p1, p2.x, p2.y);
  let dx01 = p1.x - p0.x;
  let dy01 = p1.y - p0.y;

  let dx12 = p2.x - p1.x;
  let dy12 = p2.y - p1.y;

  let dx20 = p0.x - p2.x;
  let dy20 = p0.y - p2.y;
  let c0 = p1.y*p2.x - p1.x*p2.y; 
  let c1 = p2.y*p0.x - p2.x*p0.y; 
  let c2 = p0.y*p1.x - p0.x*p1.y; 

  let z0_ = 1/z0;
  let z1_ = 1/z1;
  let z2_ = 1/z2;

  let w0_row = (minX * dy12 - minY * dx12) + c0;
  let w1_row = (minX * dy20 - minY * dx20) + c1;
  let w2_row = (minX * dy01 - minY * dx01) + c2;

  let r = red(color);
  let g = green(color);
  let b = blue(color);
  for (let y = minY; y <= maxY; y++) {
    let w0 = w0_row;
    let w1 = w1_row;
    let w2 = w2_row;
    for (let x = minX; x <= maxX; x++) {

      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {

        let bw0 = w0 / area;
        let bw1 = w1 / area;
        let bw2 = w2 / area;

        let invZ = bw0 * z0_ + bw1 * z1_ + bw2 * z2_;

        let z = 1 / invZ

        let sx = floor(x + width/2);
        let sy = floor(y + height/2);

        let index = sx + sy * width

        if (z < zBuffer[index]) {

          zBuffer[index] = z;

          let i = index * 4;
          pixels[i] = r;
          pixels[i+1] = g;
          pixels[i+2] = b;
          pixels[i+3] = 100;

        }
      }
      w0 += dy12;
      w1 += dy20;
      w2 += dy01;
    }
    w0_row -= dx12;
    w1_row -= dx20;
    w2_row -= dx01;
  }
}

function edge(a, b, x, y) {
  return (x - a.x) * (b.y - a.y) - (y - a.y) * (b.x - a.x);
}


function doubleClicked() {
  requestPointerLock();
}


function mouseClicked() {
  // if (building) createVertex()
    // else chooseVertex()
  
}

function createVertex(){
 let t = Number(document.getElementById("dybde").value)

  let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
  let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);

  let forward = createVector(sinY*cosX, -sinX, cosX*cosY);

  let vertex = p5.Vector.add(cam.pos, p5.Vector.mult(forward, t));

  let v0 = vertex.copy();

  vertexes.push(v0);
  
  // chooseVertex()
}


function lineMode() {
  if (chosenMode == "Line") return
  chosenVertexes = []
  chosenMode = "Line"
}

function trekantMode() {
  if (chosenMode == "Trekant") return
  chosenVertexes = []
  chosenMode = "Trekant" 
}

function vertexMode() {
  building = true
}

function chooseMode(){
  building = false
}

function chooseVertex() {
  let cosY = cos(cam.rot.y), sinY = sin(cam.rot.y);
  let cosX = cos(cam.rot.x), sinX = sin(cam.rot.x);
  let forward = createVector(sinY * cosX, -sinX, cosX * cosY);

  let closestIndex = -1;
  let closestDist = Infinity;
  let threshold = 5; // world-space units tolerance

  for (let i = 0; i < vertexes.length; i++) {
    // Vector from camera to vertex
    let toVertex = p5.Vector.sub(vertexes[i], cam.pos);

    // Project onto forward ray
    let t = toVertex.dot(forward);
    if (t < 0) continue; // Behind the camera

    // Closest point on ray to this vertex
    let closestPointOnRay = p5.Vector.add(cam.pos, p5.Vector.mult(forward, t));

    // Perpendicular distance from vertex to ray
    let dist = p5.Vector.dist(vertexes[i], closestPointOnRay);

    if (dist < threshold && dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }

  if (closestIndex !== -1) {
    chosenVertexes.push(closestIndex)
    console.log('Selected vertex index:', closestIndex);
    // console.log(chosenVertexes)
  }

  switch (chosenMode) {
    case "Line":
      if (chosenVertexes.length < 2) {
        return;
      } else {
      let l = new Line(chosenVertexes[0], chosenVertexes[1]);
      lines.push(l);
      console.log('Line equation:', l.equation());
      chosenVertexes = [];
  }
      break;
    case "Trekant":
      if (chosenVertexes.length < 3){
        return
      } else {
        let t = new Tri(chosenVertexes[0],chosenVertexes[1],chosenVertexes[2]);
        tris.push(t)
        chosenVertexes = []
      }
      break;
    case null:
      alert("Choose a mode before selecting vertexes!")
      chosenVertexes = []
      break;
    default:
      console.log("Something went wrong :/")
  }
  
}
function rasterizeLine(p0, p1, z0, z1, col) {
  let r = red(col), g = green(col), b = blue(col);

  let x0 = floor(p0.x), y0 = floor(p0.y);
  let x1 = floor(p1.x), y1 = floor(p1.y);

  let dx = abs(x1 - x0), dy = abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let totalSteps = max(dx, dy);

  for (let step = 0; step <= totalSteps; step++) {
    // t along the line (0 at p0, 1 at p1)
    let t = totalSteps === 0 ? 0 : step / totalSteps;

    // Perspective-correct depth interpolation
    let invZ = (1 - t) / z0 + t / z1;
    let z = 1 / invZ;

    let sx_ = floor(x0 + width / 2);
    let sy_ = floor(y0 + height / 2);

    if (sx_ >= 0 && sx_ < width && sy_ >= 0 && sy_ < height) {
      let index = sx_ + sy_ * width;

      if (z < zBuffer[index]) {
        zBuffer[index] = z;
        let i = index * 4;
        pixels[i]     = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
      }
    }

    // Bresenham step
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 <  dx) { err += dx; y0 += sy; }
  }
}
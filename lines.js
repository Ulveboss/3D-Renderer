class Line {
  constructor(a, b) {
    this.a = a; // vertex index
    this.b = b;
    // Compute and store the equation for display
    let A = vertexes[a];
    let B = vertexes[b];
    this.d = p5.Vector.sub(B, A); // direction vector
  }
  equation() {
    let A = vertexes[this.a];
    let d = this.d;
    return `P(t) = (${nf(A.x,1,1)}, ${nf(A.y,1,1)}, ${nf(A.z,1,1)}) + t·(${nf(d.x,1,1)}, ${nf(d.y,1,1)}, ${nf(d.z,1,1)})`;
  }
  midpoint() {
    let v0 = vertexes[this.a]
    let v1 = vertexes[this.b]
    return p5.Vector.add(v0,v1).mult(0.5)
  }
}
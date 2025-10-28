// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {
  const MAX = 800;

  p.setup = function () {
    p.createCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
    p.noStroke();
  };

  p.draw = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    if (p.width !== w || p.height !== h) p.resizeCanvas(w, h);

    p.background(220);

    const cx = p.width / 2;
    const cy = p.height / 2;
    const R_outer = Math.min(p.width, p.height) * 0.38; 
    const laneW   = R_outer * 0.18;                     
    const R_inner = R_outer - laneW;                   
    const dashR   = (R_outer + R_inner) / 2;           

    p.push();
    p.translate(cx, cy);

    p.fill(205);
    p.circle(0, 0, R_inner * 2);

    p.fill(45);
    p.circle(0, 0, R_outer * 2);  
    p.fill(220);
    p.circle(0, 0, R_inner * 2); 
    
    const curbW = laneW * 0.12;
    drawCurbRing(R_outer + curbW * 0.5, curbW, 30);
    drawCurbRing(R_inner - curbW * 0.5, curbW, 30);

    drawDashedRing(dashR, laneW * 0.08, 64);
    drawStartFinish(-p.HALF_PI, R_inner, R_outer, laneW);

    p.pop();
  };

  function drawDashedRing(radius, dashLen, count) {
    p.noStroke();
    p.fill(245);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * p.TWO_PI;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;

      p.push();
      p.translate(x, y);
      p.rotate(a + p.HALF_PI);
      p.rectMode(p.CENTER);
      p.rect(0, 0, dashLen * 1.5, dashLen * 0.35, dashLen * 0.15);
      p.pop();
    }
  }

  function drawCurbRing(radius, thickness, segments) {
    const segAngle = p.TWO_PI / segments;
    for (let i = 0; i < segments; i++) {
      const a = i * segAngle;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;

      p.push();
      p.translate(x, y);
      p.rotate(a + p.HALF_PI);
      p.fill(i % 2 === 0 ? '#d53434' : '#f4f4f4');
      const length = radius * segAngle * 0.95; 
      p.rectMode(p.CENTER);
      p.rect(0, 0, length, thickness, thickness * 0.25);
      p.pop();
    }
  }

  function drawStartFinish(angle, rInner, rOuter, laneW) {
    const rMid = (rOuter + rInner) / 2;

    const bandThickness = (rOuter - rInner) * 1; 
    const bandLength    = laneW * 0.8;          

    const cx = Math.cos(angle) * rMid;
    const cy = Math.sin(angle) * rMid;

    const rows = 18;     
    const cols = 6;       
    const sq   = Math.min(bandThickness / rows, bandLength / cols);
    const w    = cols * sq;
    const h    = rows * sq;

    p.push();
    p.translate(cx, cy);
    p.rotate(angle + p.HALF_PI);
    p.rectMode(p.CORNER);

    const ox = -w / 2;
    const oy = -h / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        p.fill((r + c) % 2 === 0 ? 255 : 30);
        p.rect(ox + c * sq, oy + r * sq, sq, sq);
      }
    }
    p.pop();
}

  p.windowResized = function () {
    p.resizeCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
  };
});
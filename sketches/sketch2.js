// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const MAX = 800;

  p.setup = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.createCanvas(w, h);
    p.noStroke();
    p.fill('#a56b39'); // wood color
    p.rectMode(p.CENTER);
  };

  p.draw = function () {
    const newW = Math.min(p.windowWidth, MAX);
    const newH = Math.min(p.windowHeight, MAX);
    if (p.width !== newW || p.height !== newH) p.resizeCanvas(newW, newH);

    p.background(255);

    // position and size — made smaller and shifted left
    const cx = p.width * 0.25; // move further left
    const cy = p.height * 0.5;
    const w = p.width * 0.35;  // smaller width than before
    const h = p.height * 0.22; // smaller height

    drawTrapezoidStockFacingRight(cx, cy, w, h);
  };

  // trapezoid that faces right: wide on left, narrow on right
  function drawTrapezoidStockFacingRight(x, y, w, h) {
    p.push();
    p.translate(x, y);

    // wide left (butt), narrow right (tip)
    p.beginShape();
    p.vertex(-w * 0.5, -h * 0.22); // left top (butt)
    p.vertex(w * 0.4, -h * 0.25);  // right top (tip)
    p.vertex(w * 0.3, h * 0.06);   // right bottom (tip)
    p.vertex(-w * 0.5, h * 0.25);  // left bottom (butt)
    p.endShape(p.CLOSE);

    p.pop();
  }

  p.windowResized = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.resizeCanvas(w, h);
  };
});

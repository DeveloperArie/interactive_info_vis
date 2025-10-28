// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const MAX = 800;

  p.setup = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.createCanvas(w, h);
    p.noStroke();
    p.fill('#a56b39'); 
    p.rectMode(p.CENTER);
  };

  p.draw = function () {
    const newW = Math.min(p.windowWidth, MAX);
    const newH = Math.min(p.windowHeight, MAX);
    if (p.width !== newW || p.height !== newH) p.resizeCanvas(newW, newH);

    p.background(255);

    
    const cx = p.width * 0.25; 
    const cy = p.height * 0.5;
    const w = p.width * 0.35; 
    const h = p.height * 0.22; 

    drawTrapezoidStockFacingRight(cx, cy, w, h);
  };

  function drawTrapezoidStockFacingRight(x, y, w, h) {
    p.push();
    p.translate(x, y);

   
    p.beginShape();
    p.vertex(-w * 0.5, -h * 0.22);
    p.vertex(w * 0.4, -h * 0.25); 
    p.vertex(w * 0.3, h * 0.06); 
    p.vertex(-w * 0.5, h * 0.25); 
    p.endShape(p.CLOSE);

    p.pop();
  }

  p.windowResized = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.resizeCanvas(w, h);
  };
});

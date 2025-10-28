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

    
    const cx = p.width * 0.18; 
    const cy = p.height * 0.5;
    const w = p.width * 0.35; 
    const h = p.height * 0.22; 

    const cx1 = p.width * 0.34; 
    const cy1 = p.height * 0.49;
    const w1 = p.width * 0.05; 
    const h1 = p.height * 0.1; 

    const cx2 = p.width * .53; 
    const cy2 = p.height * .37;
    const w2 = p.width * .2; 
    const h2 = p.height * .2;
      

    drawTrapezoidStockFacingRight(cx, cy, w, h);
    drawHandle(cx1, cy1, w1, h1);
    drawBarrel(cx2, cy2, w2, h2);
  };

  function drawTrapezoidStockFacingRight(x, y, w, h) {
    p.push();
    p.translate(x, y);

   
    p.beginShape();
    p.vertex(-w * 0.4, -h * 0.22); // left top
    p.vertex(w * 0.4, -h * 0.25); // right top
    p.vertex(w * 0.3, h * 0.06); // right bottom
    p.vertex(-w * 0.5, h * 0.25); // left bottom
    p.endShape(p.CLOSE);

    p.pop();
  }

  function drawHandle(x, y, w, h) {
    p.push();
    p.translate(x, y);

   
    p.beginShape();
    p.vertex(-w * .22, -h * 0.7); // left top
    p.vertex(w * 1.5, -h * 0.77); // right top
    p.vertex(w * .18, h * 0.2); // right bottom
    p.vertex(-w * 1.2, h * 0.25); // left bottom
    p.endShape(p.CLOSE);

    p.pop();
  }

  function drawBarrel(x, y, w, h) {
    p.push();
    p.translate(x, y);

   
    p.beginShape();
    p.vertex(-w * .7, -h * .01); // left top
    p.vertex(w * 2.4, -h * 0.02); // right top
    p.vertex(w * 2.4, h * 0.08); // right bottom
    p.vertex(-w * 1, h * 0.25); // left bottom
    p.endShape(p.CLOSE);

    p.pop();
  }
  

  p.windowResized = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.resizeCanvas(w, h);
  };
});

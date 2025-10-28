// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const MAX = 800;
  let lastSec = -1;
  let flashUntil = 0;
  let muzzleX = 0, muzzleY = 0;

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

    p.background(220, 225, 230);
    
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
      
    p.fill('#a56b39');
    drawTrapezoidStockFacingRight(cx, cy, w, h);
    
    drawHandle(cx1, cy1, w1, h1);

    p.fill('#a56b39');
    drawBarrel(cx2, cy2, w2, h2);

    muzzleX = cx2 + 2.4 * w2;
    muzzleY = cy2 + 0.03 * h2;

    const HH = p.nf(p.hour(),   2);
    const MM = p.nf(p.minute(), 2);
    const SS = p.nf(p.second(), 2);

    // center horizontally between stock center (cx) and muzzle tip
    const clockX = (cx + muzzleX) / 2;
    // place above the stock
    const clockY = cy - h * 1.2;

    // responsive font sizes
    const baseSize = Math.min(56, Math.round(p.width * 0.05));


    // draw HH:MM:
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(baseSize);
    p.fill(30);
    p.text(HH + ":" + MM + ":", clockX - baseSize, clockY);

    // draw SS in color, slightly larger
    p.textSize(baseSize);
    p.fill(220, 60, 40);                      // highlight color for seconds
    p.text(SS, clockX + baseSize, clockY);

    const sNow = p.second();
    if (sNow !== lastSec) {
      lastSec = sNow;
      flashUntil = p.millis() + 110; 
    }
    if (p.millis() < flashUntil) {
      drawMuzzleFlash(muzzleX, muzzleY, h2 * 0.7); 
}
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

  function drawMuzzleFlash(x, y, size) {
    p.push(); p.translate(x, y); p.noStroke();

    // soft glow
    p.fill(255, 225, 120, 220);
    p.ellipse(0, 0, size * 1.2, size * 0.8);

    // spikes
    p.fill(255, 180, 60, 240);
    const n = 7, rOuter = size * 1.0, rInner = size * 0.35;
    for (let i = 0; i < n; i++) {
      const a  = (i / n) * p.TWO_PI;
      const a2 = a + p.TWO_PI / (2 * n);
      p.triangle(
        0, 0,
        Math.cos(a) * rOuter,  Math.sin(a) * rOuter,
        Math.cos(a2) * rInner, Math.sin(a2) * rInner
      );
    }

    // hot core
    p.fill(255, 255, 255, 245);
    p.ellipse(0, 0, size * 0.35, size * 0.35);
    p.pop();
  }
  

  p.windowResized = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    p.resizeCanvas(w, h);
  };
});

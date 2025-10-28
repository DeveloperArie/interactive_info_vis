// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const MAX = 800;

  p.setup = function () {
    p.createCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
    p.noStroke();
    p.rectMode(p.CORNER);
    p.textFont('system-ui, -apple-system, Segoe UI, Roboto, Arial');
  };

  p.draw = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    if (p.width !== w || p.height !== h) p.resizeCanvas(w, h);

    p.background(230); 

    const boardSize = Math.min(p.width, p.height) * 0.9; 
    const cell = boardSize / 8;
    const ox = (p.width - boardSize) / 2; 
    const oy = (p.height - boardSize) / 2; 

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dark = (r + c) % 2 === 1;
        p.fill(dark ? 100 : 240); 
        p.rect(ox + c * cell, oy + r * cell, cell, cell);
      }
    }

    p.noFill();
    p.stroke(60);
    p.strokeWeight(Math.max(2, cell * 0.04));
    p.rect(ox, oy, boardSize, boardSize);
    p.noStroke();

    p.fill(50);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(10, cell * 0.22));
    const files = ['a','b','c','d','e','f','g','h'];

    for (let c = 0; c < 8; c++) {
      p.text(files[c], ox + (c + 0.5) * cell, oy + boardSize + cell * 0.20);
    }
    for (let r = 0; r < 8; r++) {
      p.text(8 - r, ox - cell * 0.20, oy + (r + 0.5) * cell);
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
  };
});

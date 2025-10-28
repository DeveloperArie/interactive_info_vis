// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const MAX = 800;
  let path = [];
  let step = 0;
  let lastSec = -1;

  p.setup = function () {
    p.createCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
    buildPath();
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

    const sNow = p.second();
    if (sNow !== lastSec) {
      lastSec = sNow;
      step = (step + 1) % path.length;
    }

    const { r, c } = path[step];
    const px = ox + (c + 0.5) * cell;
    const py = oy + (r + 0.5) * cell;

    // piece
    p.push();
    p.fill(200, 30, 50);
    p.circle(px, py, cell * 0.65);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(cell * 0.35);
    p.text('♞', px, py + cell * 0.02);
    p.pop();
    
  };

  function buildPath() {
    // snake-pattern path across board
    let squares = [];
    for (let r = 0; r < 8; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < 8; c++) squares.push({ r, c });
      } else {
        for (let c = 7; c >= 0; c--) squares.push({ r, c });
      }
    }
    path = squares.slice(0, 64); // first 60 of 64
  }

  p.windowResized = function () {
    p.resizeCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
  };
});

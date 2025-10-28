// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {
  const MAX = 800;

  p.setup = function () {
    p.createCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
    p.noStroke();
    p.rectMode(p.CENTER);
  };

  p.draw = function () {
    const w = Math.min(p.windowWidth, MAX);
    const h = Math.min(p.windowHeight, MAX);
    if (p.width !== w || p.height !== h) p.resizeCanvas(w, h);

    p.background('#dff3c4');

    const cx = p.width / 2;
    const cy = p.height / 2;
    const R_outer = Math.min(p.width, p.height) * 0.38; 
    const laneW   = R_outer * 0.18;                     
    const R_inner = R_outer - laneW;
    const margin      = laneW * 0.5; 
    const R_outerExp  = R_outer + margin; 
    const inner  = R_inner + laneW * 0.5; 
    const out  = R_inner + laneW * 1;                   
          

    p.push();
    p.translate(cx, cy);

    p.fill(205);
    p.circle(0, 0, R_inner * 2);

    p.fill(45);
    p.circle(0, 0, R_outerExp * 2);  
    p.fill(220);
    p.circle(0, 0, R_inner * 2); 
    
    const curbW = laneW * 0.12;
    drawCurbRing(R_outerExp + curbW * 0.5, curbW, 30);
    drawCurbRing(R_inner - curbW * 0.5, curbW, 30);

    drawDashedRing(inner, laneW * 0.08, 64);

    drawDashedRing(out, laneW * 0.08, 64);

    drawStartFinish(-p.HALF_PI, R_inner, R_outerExp, laneW);

    p.pop()

    const t = (p.millis() % 60000) / 60000;
    const theta = -p.HALF_PI + t * p.TWO_PI;
    const rSec = R_inner + laneW * 0.25;

    const carLen = laneW * 0.35;
    const carWid = laneW * 0.22;

    drawCarRect(
      cx, cy,     
      rSec, theta,  
      carLen, carWid,
      '#a56b39', 'S'
    );

    const now = new Date();
    const msIntoHour = now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
    const minFrac = msIntoHour / 3600000;               
    const thetaMin = -p.HALF_PI + minFrac * p.TWO_PI;

    const rMin = R_inner + laneW * 0.75; 
    const mLen = laneW * 0.35;
    const mWid = laneW * 0.22;

    drawCarRect(cx, cy, rMin, thetaMin, mLen, mWid, '#2ecc71', 'M');

    const nowH        = new Date();
    const msIntoHourH = nowH.getMinutes() * 60000 + nowH.getSeconds() * 1000 + nowH.getMilliseconds();
    const msInto12h   = (nowH.getHours() % 12) * 3600000 + msIntoHourH;
    const hourFrac    = msInto12h / (12 * 3600000);       
    const thetaHour   = -p.HALF_PI + hourFrac * p.TWO_PI;

    const rHour = R_inner + laneW * 1.25; 
    const hLen  = laneW * 0.35;            
    const hWid  = laneW * 0.22;

    drawCarRect(cx, cy, rHour, thetaHour, hLen, hWid, '#0077ff', 'H');

    const HH = p.nf(((p.hour() % 12) || 12), 2);   // 12-hour
    const MM = p.nf(p.minute(), 2);
    const SS = p.nf(p.second(), 2);

    const sep = ":";

    // size & position
    const clockSize = Math.min(64, Math.round(p.width * 0.06));
    p.textSize(clockSize);
    p.textAlign(p.LEFT, p.BASELINE);

    // measure to center precisely
    const wHH  = p.textWidth(HH);
    const wMM  = p.textWidth(MM);
    const wSS  = p.textWidth(SS);
    const wSep = p.textWidth(sep);
    const totalW = wHH + wSep + wMM + wSep + wSS;

    // put it just above the track
    const yTop = cy * 1;   // tweak the 0.55 if needed
    let x = cx - totalW / 2;

    // draw colored segments
    p.fill('#0077ff');  p.text(HH, x, yTop);      x += wHH;
    p.fill(30);         p.text(sep, x, yTop);     x += wSep;
    p.fill('#2ecc71');  p.text(MM, x, yTop);      x += wMM;
    p.fill(30);         p.text(sep, x, yTop);     x += wSep;
    p.fill('#e74c3c');  p.text(SS, x, yTop);

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

  function drawCarRect(cx, cy, radius, angle, len, wid, colorHex, label) {
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    p.push();
    p.translate(x, y);
    p.rotate(angle + p.HALF_PI);

    p.noStroke();
    p.fill(colorHex);
    p.rect(0, 0, len, wid, wid * 0.25);

    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(wid * 0.9);
    p.text(label, 0, 0.5);
    p.pop();
  }

  p.windowResized = function () {
    p.resizeCanvas(Math.min(p.windowWidth, MAX), Math.min(p.windowHeight, MAX));
  };
});
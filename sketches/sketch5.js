registerSketch('sk5', function (p) {
  const GEO_PATH = 'data/custom.geo.json';
  const CSV_PATH = 'data/global_energy_consumption.csv';
  const COLS = {
    country: 'Country',
    year: 'Year',
    energy_twh: 'Total Energy Consumption (TWh)',
    co2_mt: 'Carbon Emissions (Million Tons)'
  };

  let geojson = null, table = null;
  let projection = null, path = null;
  let years = [], yearToIndex = new Map();
  let dataByCountry = new Map();
  let slider = null;
  let hovered = null;  
  let locked  = null; 

  const domain = [0, 2, 4, 6, 8, 10, 12, 14];
  const HEX = ['#1a9850','#5ab769','#a6d96a','#d9ef8b','#fee08b','#fdae61','#f46d43','#d73027'];
  let COLORS = null;

  const NAME_FIX = new Map([
    ['UK', 'United Kingdom'],
    ['U.K.', 'United Kingdom'],
    ['USA', 'United States of America'],
    ['U.S.A.', 'United States of America'],
    ['Russia', 'Russia'], 
    ['South Korea', 'Republic of Korea'],
    ['North Korea', "Dem. Rep. Korea"],
    ['Czech Republic', 'Czechia'],
    ['Vietnam', 'Viet Nam'],
    ['Türkiye', 'Turkey'],
    ['Côte d’Ivoire', "Côte d'Ivoire"]
  ]);

  p.preload = function () {
    geojson = p.loadJSON(GEO_PATH);
    table   = p.loadTable(CSV_PATH, 'csv', 'header');
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    if (!window.d3 || !d3.geoMercator) {
      console.error('d3-geo missing — include d3 (or d3-geo) before this sketch.');
      return;
    }

    COLORS = HEX.map(h => p.color(h));

    const yearSet = new Set();
    for (let r = 0; r < table.getRowCount(); r++) {
      let c = (table.getString(r, COLS.country) || '').trim();
      const y = +table.getString(r, COLS.year);
      const e = +table.getString(r, COLS.energy_twh); 
      const co2 = +table.getString(r, COLS.co2_mt);
      if (NAME_FIX.has(c)) c = NAME_FIX.get(c);
      if (!c || !Number.isFinite(y) || !Number.isFinite(e) || !Number.isFinite(co2) || e <= 0) continue;

      const intensity = co2 / e; 
      if (!dataByCountry.has(c)) dataByCountry.set(c, new Map());
      dataByCountry.get(c).set(y, intensity);
      yearSet.add(y);
    }
    years = Array.from(yearSet).sort((a, b) => a - b);
    years.forEach((yy, i) => yearToIndex.set(yy, i));

    if (years.length) {
      slider = p.createSlider(years[0], years[years.length - 1], years[0], 1);
      slider.position(120, p.height - 48);
      slider.size(Math.min(1000, p.width - 200));
    }

    initProjection();
  };

  function initProjection() {
    if (!geojson) return;
    const padR = 110, pad = 30;
    projection = d3.geoMercator();
    projection.fitSize([p.width - padR - pad * 2, p.height - 140], geojson);
    path = d3.geoPath(projection);
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (slider) {
      slider.position(120, p.height - 48);
      slider.size(Math.min(1000, p.width - 200));
    }
    initProjection();
  };

  p.mousePressed = function () {
  const year = +slider.value();
  const hit = pickCountryAtMouse(year);
  if (hit) locked = hit;
};

  p.keyPressed = function () {
    if (p.key === 'Escape') {
      locked = null;
      hovered = null;
    }
  };

  p.draw = function () {
    p.background(255);

    p.noStroke();
    p.fill(30);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(20);
    p.text('How Much CO₂ Is Emitted for Each Unit of Energy?', 28, 20);

    if (!geojson || !projection) {
      drawMsg('Loading map…');
      return;
    }
    if (!years.length) {
      drawMsg('No usable CSV rows — check headers & numeric columns.');
      return;
    }

    const year = +slider.value();
    if (!locked) hovered = pickCountryAtMouse(year);

    drawMap(year, (locked || hovered)?.feature);

    const target = locked || hovered || null;
    drawSidePanel(target, year); 
    drawMap(year);
    drawLegend(p.width - 90, 70, 18, Math.min(420, p.height - 180));
  };

  function drawMap(year, highlightFeature) {
  p.push();
  p.translate(20, 60);

  for (const feature of geojson.features) {
    const nm = countryName(feature);
    const v  = lookupIntensity(nm, year);

    p.fill(v == null ? 240 : colorFor(v));
    p.stroke(60);
    p.strokeWeight(0.5);

    drawFeature(feature);

    if (highlightFeature && feature === highlightFeature) {
      p.noFill();
      p.stroke(0);
      p.strokeWeight(2);
      drawFeature(feature);
    }
  }
  p.pop();
}

  function countryName(f) {
    const props = f.properties || {};
    return props.name || props.ADMIN || props.name_long || props.SOVEREIGNT || '';
  }

  function lookupIntensity(country, year) {
    const m = dataByCountry.get(country);
    if (!m) return null;
    if (m.has(year)) return m.get(year);
    let best = null;
    for (const [y, v] of m) if (y <= year && (best == null || y > best.y)) best = { y, v };
    return best ? best.v : null;
  }

  function colorFor(v) {
    const lo = domain[0], hi = domain[domain.length - 1];
    const x = p.constrain(v, lo, hi);
    let i = 0;
    while (i < domain.length - 1 && x > domain[i + 1]) i++;
    const t = p.map(x, domain[i], domain[i + 1], 0, 1, true);
    return p.lerpColor(COLORS[i], COLORS[i + 1], t);
  }

  function drawFeature(feature) {
    const type = feature.geometry.type;
    const coords = feature.geometry.coordinates;
    if (type === 'Polygon') drawPolygon(coords);
    else if (type === 'MultiPolygon') for (const poly of coords) drawPolygon(poly);
  }
  function drawPolygon(rings) {
    for (const ring of rings) {
      p.beginShape();
      for (const pt of ring) {
        const pr = projection(pt);
        if (!pr) continue;
        p.vertex(pr[0], pr[1]);
      }
      p.endShape(p.CLOSE);
    }
  }

  function drawLegend(x, y, w, h) {
    const hi = domain[domain.length - 1];
    for (let i = 0; i < h; i++) {
      const t = 1 - i / h;
      const v = domain[0] + t * (hi - domain[0]);
      p.stroke(colorFor(v));
      p.line(x, y + i, x + w, y + i);
    }
    p.noStroke();
    p.fill(35);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(12);
    for (const tv of domain) {
      const ty = y + (1 - (tv - domain[0]) / (hi - domain[0])) * h;
      p.stroke(60);
      p.line(x + w + 2, ty, x + w + 8, ty);
      p.noStroke();
      p.text(tv.toFixed(0), x + w + 12, ty);
    }
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(14);
    p.text('Mt CO₂/TWh', x + w / 2, y - 8);
  }

  function drawMsg(t) {
    p.fill(30); p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(16);
    p.text(t, p.width / 2, p.height / 2);
  }

  function pickCountryAtMouse(year) {
    if (!projection || !geojson) return null;
    const lonlat = projection.invert([p.mouseX - 20, p.mouseY - 60]); 
    if (!lonlat) return null;

    for (const f of geojson.features) {
      if (d3.geoContains(f, lonlat)) {
        const nm = countryName(f);
        const v  = lookupIntensity(nm, year); 
        return { feature: f, name: nm, value: v };
      }
    }
    return null;
  }

  function drawCountryKey(sel, year) {
    const pad = 10, w = 260, h = 76;
    let x = p.mouseX + 16, y = p.mouseY + 16;

    if (x + w > p.width - 12) x = p.width - 12 - w;
    if (y + h > p.height - 12) y = p.height - 12 - h;

    p.noStroke();
    p.fill(0, 36); p.rect(x + 2, y + 2, w, h, 10);
    p.fill(255);   p.rect(x, y, w, h, 10);

    const sw = 18, sh = 18;
    const c  = (sel.value == null) ? p.color(240) : colorFor(sel.value);
    p.fill(c); p.stroke(200); p.rect(x + pad, y + pad, sw, sh, 4);

    p.noStroke();
    p.fill(20);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.text(sel.name || 'Unknown', x + pad + sw + 8, y + pad);

    p.fill(70);
    p.textSize(12);
    const vtxt = (sel.value == null) ? 'No data' : (sel.value.toFixed(3) + ' Mt/TWh');
    p.text(`Year: ${year}\nIntensity: ${vtxt}\n(click to lock, Esc to clear)`,
          x + pad, y + pad + sh + 8);
  }

  function drawSidePanel(sel, year) {
    const w = 280, h = 110;
    const x = p.width - w - 140; 
    const y = 80;

    p.noStroke();
    p.fill(0, 36); p.rect(x + 3, y + 3, w, h, 12);
    p.fill(255);   p.rect(x, y, w, h, 12);

    p.fill(20);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.text('Country details', x + 12, y + 10);
    p.textStyle(p.NORMAL);

    if (!sel) {
      p.fill(70); p.textSize(12);
      p.text('Hover a country\nClick to lock • Esc to clear', x + 12, y + 36);
      return;
    }

    const sw = 18, sh = 18;
    const c  = (sel.value == null) ? p.color(240) : colorFor(sel.value);
    p.fill(c); p.stroke(200); p.rect(x + 12, y + 42, sw, sh, 4);

    p.noStroke();
    p.fill(20); p.textSize(13);
    p.text(sel.name || 'Unknown', x + 12 + sw + 8, y + 42);

    p.fill(70); p.textSize(12);
    const vtxt = (sel.value == null) ? 'No data' : `${sel.value.toFixed(3)} Mt/TWh`;
    p.text(`Year: ${year}\nIntensity: ${vtxt}`, x + 12, y + 70);
  }

});
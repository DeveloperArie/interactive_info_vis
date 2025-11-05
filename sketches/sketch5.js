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

  p.draw = function () {
    p.background(255);

    p.noStroke();
    p.fill(30);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(20);
    p.text('Carbon Intensity (Mt CO₂ per TWh) by Country, Over Time', 28, 20);

    if (!geojson || !projection) {
      drawMsg('Loading map…');
      return;
    }
    if (!years.length) {
      drawMsg('No usable CSV rows — check headers & numeric columns.');
      return;
    }

    const year = +slider.value();
    drawMap(year);
    drawLegend(p.width - 90, 70, 18, Math.min(420, p.height - 180));

    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(16);
    p.text(`year=${year}`, 120, p.height - 70);
  };

  function drawMap(year) {
    p.push();
    p.translate(20, 40);

    for (const feature of geojson.features) {
      const nm = countryName(feature);
      const v = lookupIntensity(nm, year); 
      p.fill(v == null ? 240 : colorFor(v));
      p.stroke(40);
      p.strokeWeight(0.5);
      drawFeature(feature);
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
});
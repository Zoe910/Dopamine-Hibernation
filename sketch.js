let BUBBLE_COUNT = 10;
let STAR_COUNT = 360;

let CODE_STREAM_COUNT = 1;
let CENTER_CODE_COUNT = 0;
let MAX_CODE_STREAMS = 36;
let MAX_CENTER_CODE_STREAMS = 16;

let bgLayer;     
let codeLayer;    
let bubbles = [];
let codeStreams = [];
let centerCodeStreams = [];

let touchCounter = 0;
let isExplode = false;
let explodeResetTimer = 0;
const EXPLODE_TRIGGER_COUNT = 8;
const RESET_DELAY_SEC = 8;

const CLICK_EXPAND = 1.7;
const CLICK_PULSE_DURATION = 90;

let socket;
let lastTouchState = 0;

const CODE_CHARS = [
  "0", "1", "eryiueahfbhjhziufhdbf", "}", "[", "]", "sshuiehueuajbjdhuchd",
  "1010010100100111111", "fuaehfjdncjkdhnkj", "*!#%^#%", "::", "=>",
  "AI", "GPU", "DATA", "FLOW", "NODE", "SYS", "CORE", "LINK",
  "VECTOR", "MATRIX", "SYNC", "CLOUD", "INPUT", "OUTPUT",
  "0101", "1100", "0xFF", "API()", "var", "let", "const", "render()"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  smooth();
  colorMode(RGB, 255, 255, 255, 255);

  initBgLayer();
  codeLayer = createGraphics(width, height);
  codeLayer.pixelDensity(1);

  buildBubbles();
  buildCodeStreams();

  textFont("monospace");
  background(0);

  setupWebSocket();
}

function initBgLayer() {
  bgLayer = createGraphics(width, height);
  bgLayer.pixelDensity(1);
  bgLayer.colorMode(RGB, 255, 255, 255, 255);
  randomSeed(42);
  noiseSeed(42);

  bgLayer.background(0);
  bgLayer.noStroke();
  bgLayer.drawingContext.globalCompositeOperation = "lighter";

  for (let i = 0; i < 72; i++) {
    let x = random(bgLayer.width * 0.02, bgLayer.width * 0.47);
    let y = random(bgLayer.height * 0.05, bgLayer.height * 0.95);
    let r = random(60, 180);
    let a = random(3, 10);
    drawMirroredNebulaBlob(bgLayer, x, y, r, a);
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    let x = random(0, bgLayer.width * 0.5);
    let y = random(0, bgLayer.height);
    let s = random(0.45, 1.55);
    let a = random(42, 145);
    bgLayer.fill(126, 205, 255, a);
    bgLayer.circle(x, y, s);
    bgLayer.circle(bgLayer.width - x, y, s);
  }

  bgLayer.fill(160, 230, 255, 110);
  bgLayer.textSize(26);
  bgLayer.textStyle(BOLD);
  bgLayer.textAlign(LEFT, TOP);

  for (let x = 0; x < bgLayer.width; x += 480) {
    for (let y = 0; y < bgLayer.height; y += 380) {
      if (random() > 0.55) {
        let charItem = CODE_CHARS[int(random(CODE_CHARS.length))];
        bgLayer.text(charItem, x, y);
      }
    }
  }
  bgLayer.drawingContext.globalCompositeOperation = "source-over";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initBgLayer();
  codeLayer = createGraphics(width, height);
  buildBubbles();
}

function resetToInitial() {
  touchCounter = 0;
  isExplode = false;
  explodeResetTimer = 0;
  buildCodeStreams();
}

function triggerExplode() {
  console.log("💥 达到8次触摸，代码爆炸！");
  isExplode = true;
  while (codeStreams.length < MAX_CODE_STREAMS) {
    codeStreams.push(makeCodeStream(random(width * 0.035, width * 0.47)));
  }
  while (centerCodeStreams.length < MAX_CENTER_CODE_STREAMS) {
    centerCodeStreams.push(makeCodeStream(random(width * 0.39, width * 0.61)));
  }
  explodeResetTimer = millis();
}

function setupWebSocket() {
  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = function () {
    console.log("🟢 成功连接到 Node.js 中间件服务器");
  };

  socket.onmessage = function (event) {
    let cleanStr = event.data.trim();
    let parts = cleanStr.split(/\s+/);

    if (parts.length >= 2) {
      let touch = parseInt(parts[1], 10);

      if (touch === 100 && lastTouchState === 0 && !isExplode) {
        console.log(`✨touch ${touchCounter + 1}/8`);
        touchCounter++;

        if (touchCounter < EXPLODE_TRIGGER_COUNT) {
          for(let i=0; i<2 && codeStreams.length < MAX_CODE_STREAMS; i++){
            codeStreams.push(makeCodeStream(random(width * 0.035, width * 0.47)));
          }
          for(let i=0; i<1 && centerCodeStreams.length < MAX_CENTER_CODE_STREAMS; i++){
            centerCodeStreams.push(makeCodeStream(random(width * 0.39, width * 0.61)));
          }
        }

        if(touchCounter >= EXPLODE_TRIGGER_COUNT){
          triggerExplode();
        }

        bubbles.forEach(b => {
          b.clickTimer = CLICK_PULSE_DURATION;
          b.clickScale = CLICK_EXPAND;
        });
      }
      lastTouchState = touch;
    }
  };

  socket.onclose = function () {
    setTimeout(setupWebSocket, 3000);
  };

  socket.onerror = function (err) {
    console.error("WebSocket 错误:", err);
  };
}

// ==========================================
// Draw the main loop
// ==========================================
function draw() {
  if(isExplode){
    let elapsedMs = millis() - explodeResetTimer;
    if(elapsedMs >= RESET_DELAY_SEC * 1000){
      resetToInitial();
      console.log("🔄8秒结束，重置回到初始状态");
    }
  }

  background(0);

  // Draw a static background
  blendMode(BLEND);
  image(bgLayer, 0, 0);

  // Clear the dynamic code layers for each frame to eliminate the stacking shadows.
  codeLayer.clear();
  drawCodeStreamsOnCodeLayer();
  blendMode(ADD);
  image(codeLayer,0,0);

  //Draw bubbles and place them on the top layer.
  drawBubbles();
  blendMode(BLEND);
}

// ==========================================
// Flowing code stream
// ==========================================
function drawCodeStreamsOnCodeLayer() {
  const pg = codeLayer;
  pg.textFont("monospace");
  pg.textStyle(BOLD);
  pg.textAlign(CENTER, CENTER);
  pg.drawingContext.globalCompositeOperation = "lighter";

  for (let s of codeStreams) {
    updateCodeStream(s);
    drawOneCodeStreamToPG(s, s.x, pg);
    drawOneCodeStreamToPG(s, width - s.x, pg);
  }
  for (let s of centerCodeStreams) {
    updateCodeStream(s);
    drawOneCodeStreamToPG(s, s.x + sin(frameCount * 0.01 + s.phase) * 12, pg);
  }
}

function drawOneCodeStreamToPG(s, x, pg) {
  pg.textSize(s.size);
  for (let i = 0; i < s.len; i++) {
    let y = s.y - i * s.gap;
    if (y < -50 || y > height + 50) continue;

    let id = abs(floor(i * 3.7 + frameCount * 0.018 + s.phase * 17)) % CODE_CHARS.length;
    let flicker = 1.0; 
    let fade = map(i, 0, s.len - 1, 1, 0.4);
    let dx = sin(frameCount * 0.008 * s.drift + i * 0.7 + s.phase) * 4;

    pg.fill(0, 170, 255, 65 * fade);
    pg.text(CODE_CHARS[id], x + dx + 2, y + 2);
    pg.fill(140, 230, 255, 58 * fade);
    pg.text(CODE_CHARS[id], x + dx, y);
    pg.fill(255, 255, 255, 42 * flicker * fade);
    pg.text(CODE_CHARS[id], x + dx - 1, y - 1);
  }
}

function drawMirroredNebulaBlob(g, x, y, r, a) {
  for (let side of [1, -1]) {
    let px = side === 1 ? x : g.width - x;
    let grad = g.drawingContext.createRadialGradient(px, y, 0, px, y, r);
    grad.addColorStop(0.0, `rgba(18, 105, 255, ${a / 255})`);
    grad.addColorStop(0.5, `rgba(16, 75, 190, ${a * 0.28 / 255})`);
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    g.drawingContext.fillStyle = grad;
    g.ellipse(px, y, r * 1.55, r * random(0.55, 1.1));
  }
}

function buildCodeStreams() {
  codeStreams = [];
  centerCodeStreams = [];
  for (let i = 0; i < CODE_STREAM_COUNT; i++) {
    codeStreams.push(makeCodeStream(random(width * 0.035, width * 0.47)));
  }
  for (let i = 0; i < CENTER_CODE_COUNT; i++) {
    centerCodeStreams.push(makeCodeStream(random(width * 0.39, width * 0.61)));
  }
}

function makeCodeStream(x) {
  return {
    x,
    y: random(-height, height),
    speed: random(0.6, 1.4),
    gap: random(26, 34),
    size: random(22, 30),
    len: floor(random(6, 12)),
    phase: random(TWO_PI),
    drift: random(0.4, 1.8)
  };
}

function updateCodeStream(s) {
  s.y += s.speed;
  if (s.y - s.len * s.gap > height + 50) {
    s.y = random(-320, -60);
  }
}

// ==========================================
// Bubble logic
// ==========================================
function getRandomBubblePos(existingBubbles = []) {
  let x, y;
  let isValid = false;
  let attempts = 0;
  let minDistance = 0.18;

  while (!isValid && attempts < 250) {
    attempts++;
    x = random(0.08, 0.92);
    y = random(0.12, 0.88);
    let inCenter = (x > 0.38 && x < 0.62 && y > 0.35 && y < 0.65);
    if (inCenter) continue;

    let tooClose = false;
    for (let b of existingBubbles) {
      let d = dist(x, y, b.pctX, b.pctY);
      if (d < minDistance) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) isValid = true;
  }
  return { x, y };
}

function buildBubbles() {
  bubbles = [];
  let totalBubbles = BUBBLE_COUNT || 10;
  for (let i = 0; i < totalBubbles; i++) {
    let bubble = createNewBubble(true, bubbles);
    bubbles.push(bubble);
  }
}

function createNewBubble(isInitial = false, currentBubbles = bubbles) {
  let p = getRandomBubblePos(currentBubbles);
  let targetAlpha = random(160, 230);
  return {
    pctX: p.x,
    pctY: p.y,
    r: random(44, 76),
    noiseOffsetX: random(1000),
    noiseOffsetY: random(1000),
    drift: random(TWO_PI),
    pulse: random(0.025, 0.05),
    targetAlpha: targetAlpha,
    currentAlpha: isInitial ? targetAlpha : 0,
    state: isInitial ? "alive" : "appear",
    rot: random(TWO_PI),
    clickTimer: 0,
    clickScale: 1
  };
}

function drawBubbles() {
  if (frameCount % 240 === 0 && bubbles.length > 0) {
    let aliveBubbles = bubbles.filter(b => b.state === "alive");
    if (aliveBubbles.length > 0) {
      let countToReplace = min(floor(random(1, 3)), aliveBubbles.length);
      for (let i = 0; i < countToReplace; i++) {
        let target = random(aliveBubbles);
        target.state = "disappear";
        aliveBubbles = aliveBubbles.filter(b => b !== target);
        bubbles.push(createNewBubble(false, bubbles));
      }
    }
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (b.state === "appear") {
      b.currentAlpha += 3.2;
      if (b.currentAlpha >= b.targetAlpha) {
        b.currentAlpha = b.targetAlpha;
        b.state = "alive";
      }
    } else if (b.state === "disappear") {
      b.currentAlpha -= 2.8;
      if (b.currentAlpha <= 0) {
        bubbles.splice(i, 1);
        continue;
      }
    }

    if (b.clickTimer > 0) {
      b.clickTimer--;
      b.clickScale = lerp(b.clickScale, 1, 0.06);
    }

    let nx = (noise(frameCount * 0.003 + b.noiseOffsetX) - 0.5) * 25;
    let ny = (noise(frameCount * 0.003 + b.noiseOffsetY) - 0.5) * 25;
    let pulse = 1 + sin(frameCount * b.pulse + b.drift) * 0.13;
    let finalScale = pulse * b.clickScale;

    let realX = width * b.pctX + nx;
    let realY = height * b.pctY + ny;
    drawBubble(realX, realY, b.r * finalScale, b.currentAlpha, b.rot);
  }
}

function drawBubble(x, y, r, a, rot) {
  push();
  translate(x, y);
  rotate(rot + sin(frameCount * 0.01) * 0.08);

  let hoverDist = dist(mouseX, mouseY, x, y);
  let hoverFactor = hoverDist < r * 3 ? map(hoverDist, 0, r * 3, 1.6, 1) : 1;
  a = min(255, a * hoverFactor);

  noStroke();
  let grad = drawingContext.createRadialGradient(
    -r * 0.35, -r * 0.42, r * 0.05, 0, 0, r * 1.15
  );
  grad.addColorStop(0.0, `rgba(245, 255, 255, ${a * 0.65 / 255})`);
  grad.addColorStop(0.38, `rgba(90, 185, 255, ${a * 0.40 / 255})`);
  grad.addColorStop(0.75, `rgba(30, 110, 210, ${a * 0.20 / 255})`);
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  drawingContext.fillStyle = grad;
  circle(0, 0, r * 2.0);

  noFill();
  stroke(80, 185, 255, a * 0.45);
  strokeWeight(6.0);
  circle(0, 0, r * 2);
  stroke(170, 235, 255, a * 1.1);
  strokeWeight(7.8);
  circle(0, 0, r * 2);

  stroke(240, 252, 255, a * 1.0);
  strokeWeight(6.5);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  arc(-r * 0.1, -r * 0.14, r * 1.28, r * 1.18, PI * 1.08, PI * 1.82);
  stroke(100, 200, 255, a * 0.7);
  strokeWeight(4.0);
  arc(r * 0.1, r * 0.08, r * 1.35, r * 1.0, PI * 0.72, TWO_PI * 0.92);

  noStroke();
  fill(245, 255, 255, a * 1.0);
  circle(-r * 0.34, -r * 0.36, max(3.0, r * 0.25));
  fill(220, 245, 255, a * 0.65);
  circle(r * 0.28, r * 0.22, max(2.0, r * 0.15));
  pop();
}

function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
}
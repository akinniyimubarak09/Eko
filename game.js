
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const message = document.getElementById("message");

let running = false;
let cash = 25000;
let completed = false;
let cameraX = 0;
let cameraY = 0;
let jump = 0;
let jumpTime = 0;

const keys = {};
const world = { width: 2400, height: 1800 };

const player = {
  x: 1200,
  y: 1100,
  size: 22,
  speed: 3,
  color: "#e9b95e",
  direction: 0
};

const roads = [
  { x: 0, y: 650, w: 2400, h: 150 },
  { x: 0, y: 1050, w: 2400, h: 130 },
  { x: 400, y: 0, w: 130, h: 1800 },
  { x: 1650, y: 0, w: 130, h: 1800 },
  { x: 0, y: 250, w: 2400, h: 100 }
];

const buildings = [];
const stalls = [];
const cars = [];
const trees = [];

function building(x, y, w, h, color, name) {
  buildings.push({ x, y, w, h, color, name });
}

function stall(x, y, color, name) {
  stalls.push({ x, y, w: 62, h: 46, color, name });
}

function tree(x, y) {
  trees.push({ x, y });
}

// Business district
building(180, 390, 170, 190, "#d0b18b", "Mama T's Kitchen");
building(580, 400, 180, 180, "#d7dcdf", "Eko Mart");
building(800, 390, 150, 190, "#b98c6c", "Phone & More");
building(1130, 390, 190, 190, "#94b1a8", "City Pharmacy");
building(1880, 390, 200, 190, "#b4c5c7", "Business Plaza");

// Residential area
building(170, 830, 170, 140, "#d7c2a4", "New Dawn Estate");
building(600, 830, 190, 150, "#b7a18a", "Residential House");
building(850, 830, 160, 145, "#d7c9af", "Family Home");
building(1900, 830, 190, 145, "#c8a17c", "City Offices");

// Waterfront district
building(200, 1320, 220, 150, "#d3bfa2", "Waterfront Cafe");
building(750, 1320, 190, 150, "#b6c8c8", "Harbour View");
building(1900, 1320, 210, 150, "#c9b68d", "Community Centre");

stall(1000, 720, "#168c52", "Fresh Produce");
stall(1130, 720, "#d74c38", "Suya Spot");
stall(1270, 720, "#d4a52d", "Cold Drinks");
stall(1430, 720, "#426c9c", "Local Snacks");

// Plant trees along streets
for (let x = 60; x < world.width; x += 100) {
  trees.push({ x, y: 610 });
  trees.push({ x, y: 830 });
  trees.push({ x, y: 1200 });
}

for (let y = 100; y < world.height; y += 130) {
  trees.push({ x: 365, y });
  trees.push({ x: 1820, y });
}

// Decorative danfo-inspired buses and cars
for (let i = 0; i < 9; i++) {
  cars.push({
    x: 200 + i * 230,
    y: 700,
    w: 64,
    h: 32,
    color: i % 2 ? "#e6c23b" : "#168c52",
    speed: i % 2 ? 0.6 : -0.45
  });
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);

  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function text(str, x, y, size = 12, color = "#ffffff") {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Arial`;
  ctx.fillText(str, x, y);
}

function circle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function intersects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function blocked(x, y) {
  const candidate = {
    x: x - player.size / 2,
    y: y - player.size / 2,
    w: player.size,
    h: player.size
  };

  if (
    candidate.x < 0 ||
    candidate.y < 0 ||
    candidate.x + candidate.w > world.width ||
    candidate.y + candidate.h > world.height
  ) return true;

  return buildings.some(b => intersects(candidate, b));
}

function drawGround() {
  rect(0, 0, world.width, world.height, "#78935b");

  // Roads
  roads.forEach(road => {
    rect(road.x, road.y, road.w, road.h, "#373d3f");

    ctx.strokeStyle = "#e8c66b";
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 22]);

    ctx.beginPath();

    if (road.w > road.h) {
      ctx.moveTo(road.x, road.y + road.h / 2);
      ctx.lineTo(road.x + road.w, road.y + road.h / 2);
    } else {
      ctx.moveTo(road.x + road.w / 2, road.y);
      ctx.lineTo(road.x + road.w / 2, road.y + road.h);
    }

    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Sidewalk edges
  roads.forEach(road => {
    ctx.strokeStyle = "#c2bba7";
    ctx.lineWidth = 7;
    ctx.strokeRect(road.x, road.y, road.w, road.h);
  });

  // Small roadside paving
  for (let x = 0; x < world.width; x += 90) {
    rect(x, 605, 40, 3, "#b9b29f");
    rect(x, 832, 40, 3, "#b9b29f");
  }
}

function drawBuildings() {
  buildings.forEach(b => {
    // Building shadow
    rect(b.x + 9, b.y + 10, b.w, b.h, "#3b483d");

    rect(b.x, b.y, b.w, b.h, b.color);

    // Roof
    rect(b.x - 4, b.y - 7, b.w + 8, 15, "#5e5145");

    // Windows
    const columns = Math.floor(b.w / 43);

    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < 3; row++) {
        const wx = b.x + 13 + col * 43;
        const wy = b.y + 28 + row * 40;

        if (wy < b.y + b.h - 12) {
          rect(wx, wy, 23, 23, "#466a70");
          rect(wx, wy + 20, 23, 3, "#e5d8bf");
        }
      }
    }

    // Door
    rect(b.x + b.w / 2 - 13, b.y + b.h - 38, 26, 38, "#292e2d");

    // Shop sign
    rect(b.x + 6, b.y + 5, b.w - 12, 22, "#172322");
    text(b.name.toUpperCase(), b.x + 12, b.y + 20, 9, "#e9b95e");
  });
}

function drawTrees() {
  trees.forEach(t => {
    circle(t.x + 4, t.y + 7, 17, "#425b3a");
    circle(t.x, t.y, 15, "#347444");
    circle(t.x - 5, t.y - 4, 9, "#4c8b4c");
  });
}

function drawStalls() {
  stalls.forEach(s => {
    rect(s.x + 4, s.y + 5, s.w, s.h, "#344038");
    rect(s.x, s.y, s.w, s.h, "#77583c");

    rect(s.x - 5, s.y - 8, s.w + 10, 15, s.color);

    for (let i = 0; i < 4; i++) {
      rect(s.x + i * 16, s.y - 8, 8, 15, "#f0dfb9");
    }

    text(s.name, s.x - 3, s.y + s.h + 14, 9);
  });
}

function drawCars() {
  cars.forEach(car => {
    rect(car.x, car.y, car.w, car.h, car.color);
    rect(car.x + 12, car.y + 5, 39, 12, "#a8c6c8");

    circle(car.x + 12, car.y + car.h, 6, "#202526");
    circle(car.x + car.w - 12, car.y + car.h, 6, "#202526");

    // Danfo markings
    if (car.color === "#168c52") {
      rect(car.x + 3, car.y + 18, car.w - 6, 4, "#e8c53d");
    }
  });
}

function drawPlayer() {
  const x = player.x;
  const y = player.y - jump;

  // Shadow
  circle(player.x, player.y + 7, 13, "#4d6245");

  // Body
  rect(x - 9, y - 7, 18, 20, "#e9b95e");

  // Legs
  rect(x - 8, y + 12, 6, 10, "#293e51");
  rect(x + 2, y + 12, 6, 10, "#293e51");

  // Head
  circle(x, y - 14, 9, "#875136");

  // Hair
  circle(x, y - 18, 8, "#211b17");

  // Direction marker
  circle(
    x + Math.sin(player.direction) * 14,
    y - 14 + Math.cos(player.direction) * 14,
    3,
    "#ffffff"
  );
}

function drawMinimap() {
  const scaleX = mini.width / world.width;
  const scaleY = mini.height / world.height;

  mctx.fillStyle = "#78935b";
  mctx.fillRect(0, 0, mini.width, mini.height);

  mctx.fillStyle = "#353b3d";

  roads.forEach(r => {
    mctx.fillRect(
      r.x * scaleX,
      r.y * scaleY,
      r.w * scaleX,
      r.h * scaleY
    );
  });

  mctx.fillStyle = "#d6bd94";

  buildings.forEach(b => {
    mctx.fillRect(
      b.x * scaleX,
      b.y * scaleY,
      b.w * scaleX,
      b.h * scaleY
    );
  });

  mctx.fillStyle = "#ffffff";
  mctx.beginPath();
  mctx.arc(
    player.x * scaleX,
    player.y * scaleY,
    4,
    0,
    Math.PI * 2
  );
  mctx.fill();
}

function showMessage(messageText) {
  message.textContent = messageText;
  message.classList.remove("hidden");

  clearTimeout(showMessage.timer);

  showMessage.timer = setTimeout(() => {
    message.classList.add("hidden");
  }, 2800);
}

function interact() {
  const nearbyStall = stalls.find(s =>
    Math.hypot(
      player.x - (s.x + s.w / 2),
      player.y - (s.y + s.h / 2)
    ) < 80
  );

  const nearbyBuilding = buildings.find(b =>
    Math.hypot(
      player.x - (b.x + b.w / 2),
      player.y - (b.y + b.h / 2)
    ) < Math.max(b.w, b.h) / 2 + 45
  );

  if (nearbyStall) {
    showMessage(
      `${nearbyStall.name}: Welcome! Full shopping features are planned for a later milestone.`
    );
  } else if (nearbyBuilding) {
    showMessage(
      `${nearbyBuilding.name}: This location is currently decorative.`
    );
  } else {
    showMessage("Explore the neighbourhood to discover local businesses.");
  }
}

function update(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.KeyW || keys.ArrowUp) dy--;
  if (keys.KeyS || keys.ArrowDown) dy++;
  if (keys.KeyA || keys.ArrowLeft) dx--;
  if (keys.KeyD || keys.ArrowRight) dx++;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    const speed = keys.ShiftLeft || keys.ShiftRight ? 300 : 185;

    const nx = player.x + dx * speed * dt;
    const ny = player.y + dy * speed * dt;

    if (!blocked(nx, player.y)) player.x = nx;
    if (!blocked(player.x, ny)) player.y = ny;

    player.direction = Math.atan2(dx, -dy);
  }

  // Simple jump animation
  if (keys.Space && jump === 0) {
    jumpTime = 0.4;
    keys.Space = false;
  }

  if (jumpTime > 0) {
    jumpTime -= dt;
    jump = Math.sin((0.4 - jumpTime) / 0.4 * Math.PI) * 35;
  } else {
    jump = 0;
  }

  // Decorative traffic movement
  cars.forEach(car => {
    car.x += car.speed * 60 * dt;

    if (car.x > world.width + 80) car.x = -80;
    if (car.x < -80) car.x = world.width + 80;
  });

  cameraX = player.x - innerWidth / 2;
  cameraY = player.y - innerHeight / 2;

  cameraX = Math.max(0, Math.min(world.width - innerWidth, cameraX));
  cameraY = Math.max(0, Math.min(world.height - innerHeight, cameraY));

  if (!completed && Math.hypot(player.x - 1030, player.y - 740) < 100) {
    completed = true;
    cash += 2500;

    document.getElementById("cash").textContent =
      "₦" + cash.toLocaleString("en-NG");

    document.getElementById("mission").textContent =
      "Neighbourhood discovered";

    document.getElementById("hint").textContent =
      "Reward received: ₦2,500";

    showMessage("Exploration complete! You earned ₦2,500.");
  }
}

function render() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  drawGround();
  drawTrees();
  drawBuildings();
  drawStalls();
  drawCars();
  drawPlayer();

  ctx.restore();

  drawMinimap();
}

let previousTime = performance.now();

function loop(now) {
  const dt = Math.min((now - previousTime) / 1000, 0.04);
  previousTime = now;

  if (running) update(dt);

  render();
  requestAnimationFrame(loop);
}

document.getElementById("start").addEventListener("click", () => {
  running = true;
  menu.classList.add("hidden");
  hud.classList.remove("hidden");

  showMessage("Welcome to Eko! Find the green market stall.");
});

document.getElementById("closeMap").addEventListener("click", () => {
  document.getElementById("mapScreen").classList.add("hidden");
});

window.addEventListener("keydown", event => {
  keys[event.code] = true;

  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
  ) {
    event.preventDefault();
  }

  if (event.code === "KeyE" && running) interact();

  if (event.code === "KeyM" && running) {
    document.getElementById("mapScreen").classList.toggle("hidden");
  }
});

window.addEventListener("keyup", event => {
  keys[event.code] = false;
});

// Start rendering immediately so the background is visible before gameplay.
requestAnimationFrame(loop);

let bpDisplays;
const videoW = 640;
const videoH = 360;
const camIndx = 0;
const mirroring = false;
const rotation = 0;
const maxNumHands = 3;

let stars = [];
let nebula = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize hand tracking
  bpDisplays = new BPDisplaysHands(initVideoInteraction, videoW, videoH, camIndx, mirroring, rotation, maxNumHands);

  initStars();
  initNebula();

  textFont('Malibu');
  textAlign(CENTER, TOP);
}

function draw() {
  background(10, 10, 20);

  // Draw dim nebula
  noStroke();
  for (let n of nebula) {
    fill(n.col);
    ellipse(n.x, n.y, n.size);
  }

  // Draw twinkling stars
  noStroke();
  for (let s of stars) {
    s.twinkle += random(-5, 5);
    s.twinkle = constrain(s.twinkle, 100, 255);
    fill(s.twinkle);
    ellipse(s.x, s.y, s.size);
  }

  // Hand interaction
  if (bpDisplays.isCaptureReady()) {
    displayHands();
  }

  // Title text in light pink
  fill(255, 182, 193); // Light pink
  textSize(48);
  text("Interactive Galaxy - Hamnah Aleem", width / 2, 20);

  // --- Soft reset / breathing effect ---
  for (let s of stars) {
    s.x += (s.origX - s.x) * 0.005; // drift slowly back to original position
    s.y += (s.origY - s.y) * 0.005;
  }

  for (let n of nebula) {
    n.x += (n.origX - n.x) * 0.002; // subtle, slower drift
    n.y += (n.origY - n.y) * 0.002;
  }
}

// Initialize stars
function initStars() {
  stars = [];
  for (let i = 0; i < 800; i++) {
    let x = random(width);
    let y = random(height);
    stars.push({
      x: x,
      y: y,
      origX: x,   // original position for soft reset
      origY: y,
      size: random(2, 4.5),
      twinkle: random(50, 255)
    });
  }
}

// Initialize nebula
function initNebula() {
  nebula = [];
  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    nebula.push({
      x: x,
      y: y,
      origX: x, // original position for soft reset
      origY: y,
      size: random(120, 280),
      col: color(random(80, 150), random(40, 100), random(120, 200), 25)
    });
  }
}

function displayHands() {
  if (!bpDisplays.handResults || !bpDisplays.handResults.multiHandLandmarks) return;

  for (const landmarks of bpDisplays.handResults.multiHandLandmarks) {
    let fingertips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

    for (const point of fingertips) {
      let x = point.x * width;
      let y = point.y * height;

      // Move nearby stars gently
      for (let s of stars) {
        let d = dist(x, y, s.x, s.y);
        if (d < 120) {
          let angle = atan2(s.y - y, s.x - x);
          s.x += cos(angle) * 1.5;
          s.y += sin(angle) * 1.5;
        }
      }

      // Subtle nebula motion
      for (let n of nebula) {
        let d = dist(x, y, n.x, n.y);
        if (d < 200) {
          n.x += random(-0.5, 0.5);
          n.y += random(-0.5, 0.5);
        }
      }
    }
  }
}

function initVideoInteraction() {
  bpDisplays.capture.style('opacity', 0); // Hide the camera feed
}

// Responsive resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initStars();
  initNebula();
}

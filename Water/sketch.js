let ripples = [];
let waterImg;
let rippleSound;
let lastHandTime = 0;
let handPresent = false;

const soundCooldown = 100; // ms before re-checking hand presence
const videoW = 640;
const videoH = 360;
const camIndx = 0;
const mirroring = false;
const rotation = 0;
const maxNumHands = 3;

let bpDisplays;

function preload() {
  waterImg = loadImage('Water1.jpg'); // your water background
  rippleSound = loadSound('water_sound.mp3'); // your water ripple sound
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bpDisplays = new BPDisplaysHands(
    initVideoInteraction,
    videoW,
    videoH,
    camIndx,
    mirroring,
    rotation,
    maxNumHands
  );
}

function draw() {

  // Reload browser every 5 minutes to avoid memory leaks
  setInterval(() => location.reload(), 5 * 60 * 1000);

  tint(255, 150);
  image(waterImg, 0, 0, width, height);
  noTint();

  // Title
  fill('darkblue');
  textAlign(CENTER, TOP);
  textSize(35);
  textFont('Malibu');
  text(
  'Water Ripples – Hamnah Aleem\nFace your palm facing down, close to the floor, moving your hand gently above the water.',
  width / 2,
  20
);

  if (!bpDisplays.isCaptureReady()) return;

  const handDetected = displayHands(); // true if hands seen

  // Sound logic
  const now = millis();
  if (handDetected) {
    lastHandTime = now;
    if (!rippleSound.isPlaying()) rippleSound.loop();
  } else {
    if (now - lastHandTime > soundCooldown && rippleSound.isPlaying()) {
      rippleSound.stop();
    }
  }

  // Draw all ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    drawRipple(ripples[i]);

    ripples[i].radius += 0.8;
    ripples[i].alpha -= 1.5;
    ripples[i].thickness = max(1.5, ripples[i].thickness - 0.05);

    if (ripples[i].alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

function drawRipple(ripple) {
  noFill();
  let c = ripple.color;
  stroke(c[0], c[1], c[2], ripple.alpha);
  strokeWeight(ripple.thickness);

  for (let i = 0; i < 2; i++) {
    let rad = ripple.radius + i * 10;
    ellipse(ripple.x, ripple.y, rad * 2);
  }
}

// Returns true if hand is present
function displayHands() {
  if (!bpDisplays.handResults || !bpDisplays.handResults.multiHandLandmarks)
    return false;

  let handSeen = false;

  for (const landmarks of bpDisplays.handResults.multiHandLandmarks) {
    handSeen = true;

    let fingertips = [
      landmarks[4],
      landmarks[8],
      landmarks[12],
      landmarks[16],
      landmarks[20]
    ];

    for (const point of fingertips) {
      let x = point.x * width;
      let y = point.y * height;

      let colorChoice =
        random() > 0.5 ? [255, 255, 255] : [70, 190, 230];

      if (frameCount % 12 === 0) {
        ripples.push({
          x,
          y,
          radius: 5,
          alpha: 220,
          color: colorChoice,
          thickness: 4
        });
      }
    }
  }

  return handSeen;
}

function initVideoInteraction() {
  bpDisplays.capture.style('opacity', 0); // hide camera feed
}

function mousePressed() {
  userStartAudio(); // Needed for autoplay policy
}

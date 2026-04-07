let video;
let poseNet;
let poses = [];

let img1, img2, img3;
let currentState = 0;

let prevX = 0;
let prevY = 0;

// wave tracking
let prevWaveX = 0;
let waveDirection = 0;

// timing
let lastPunchTime = 0;
let punchCooldown = 800;

let lastWaveTime = 0;
let waveCooldown = 800;

let allowWaveTime = 0;
let allowPunchTime = 0;

// shake
let isShaking = false;
let shakeDuration = 20;
let shakeCounter = 0;
let shakeMagnitude = 10;

// font
let gameFont;

function preload() {
  img1 = loadImage("sleep.jpg");
  img2 = loadImage("study.jpg");
  img3 = loadImage("friends.jpg");
  gameFont = loadFont("font2.ttf");
}

function setup() {
  createCanvas(1500, 900);

  video = createCapture(VIDEO);
  video.size(640, 480); // smaller size improves PoseNet stability
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", function(results) {
    poses = results;
  });
}

function modelLoaded() {
  console.log("PoseNet ready");
}

function draw() {
  push();

  // SHAKE EFFECT
  if (isShaking) {
    let shakeX = random(-shakeMagnitude, shakeMagnitude);
    let shakeY = random(-shakeMagnitude, shakeMagnitude);
    translate(shakeX, shakeY);

    shakeCounter++;
    if (shakeCounter > shakeDuration) {
      isShaking = false;
      shakeCounter = 0;
      currentState = 1;       // Sleep → Study
      allowWaveTime = millis() + 1200;

      // Reset gesture trackers
      prevX = 0;
      prevY = 0;
      prevWaveX = 0;
      waveDirection = 0;
    }
  }

  // STATE 0 — Sleep
  if (currentState == 0) {
    image(img1, 0, 0, width, height);

    push();
    textFont(gameFont);
    textAlign(CENTER);

    let pulse = sin(frameCount * 0.05) * 5;

    textSize(70 + pulse);
    stroke(0);
    strokeWeight(8);
    fill(255, 215, 0);

    text("WAKE UP", width / 2, 100);
    text("THE ELEPHANT", width / 2, 170);

    textSize(30);
    strokeWeight(6);
    text("Punch forward to wake him!", width / 2, height - 40);

    pop();
  }

  // STATE 1 — Study
  else if (currentState == 1) {
    image(img2, 0, 0, width, height);

    push();
    textFont(gameFont);
    textAlign(CENTER);

    textSize(30);
    stroke(0);
    strokeWeight(6);
    fill(255, 215, 0);

    text("Study Study Study!!!", width / 2, height - 40);
    text("Wave to take a break!", width / 2, height - 80);

    pop();
  }

  // STATE 2 — Break
  else if (currentState == 2) {
    image(img3, 0, 0, width, height);

    push();
    textFont(gameFont);
    textAlign(CENTER);

    textSize(30);
    stroke(0);
    strokeWeight(6);
    fill(255, 215, 0);

    text("Take a Break!", width / 2, height - 40);
    text("Wave again to sleep!", width / 2, height - 80);

    pop();
  }

  // Camera preview
  image(video, 0, 0, 200, 150);

  pop();

  detectPunch();
  detectWave();
}

// PUNCH DETECTION
function detectPunch() {
  if (poses.length > 0 && !isShaking && currentState == 0 && millis() > allowPunchTime) {
    let wrist = poses[0].pose.rightWrist;
    let confidence = poses[0].pose.keypoints[10].score;

    if (confidence < 0.5) return;

    let dx = wrist.x - prevX;
    let dy = wrist.y - prevY;
    let speed = sqrt(dx * dx + dy * dy);

    if (speed > 50 && millis() - lastPunchTime > punchCooldown) {
      lastPunchTime = millis(); // fixed
      isShaking = true;
      shakeCounter = 0;
    }

    prevX = wrist.x;
    prevY = wrist.y;
  }
}

// WAVE DETECTION
function detectWave() {
  if (poses.length > 0 && !isShaking && currentState != 0 && millis() > allowWaveTime) {
    let wrist = poses[0].pose.rightWrist;
    let confidence = poses[0].pose.keypoints[10].score;

    if (confidence < 0.5) return;

    let dx = wrist.x - prevWaveX;

    if (abs(dx) > 40) {
      let newDirection = dx > 0 ? 1 : -1;

      // Trigger wave on first movement OR direction change
      if (waveDirection === 0 || newDirection != waveDirection) {
        if (millis() - lastWaveTime > waveCooldown) {
          lastWaveTime = millis();

          if (currentState == 1) {
            currentState = 2; // Study → Break
          } else if (currentState == 2) {
            currentState = 0; // Break → Sleep
            allowPunchTime = millis() + 1200;

            // reset gestures
            prevX = 0;
            prevY = 0;
          }
        }
      }

      waveDirection = newDirection;
    }

    prevWaveX = wrist.x;
  }
}
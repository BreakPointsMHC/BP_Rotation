let video;
let poseNet;
let poses = [];

let ball = {
  x: 0,
  y: 0,
  size: 50
};

let hoop = {
  x: 500,
  y: 200,
  width: 120,
  height: 15
};

let score = 0;
let swishTimer = 0;

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });
}

function modelReady() {
  console.log("PoseNet ready!");
}

function draw() {
  // Mirror the video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  drawHoop();
  drawBall();
  drawScore();
  drawInstructions();

  if (swishTimer > 0) {
    drawSwish();
    swishTimer--;
  }
}

function drawBall() {
  if (poses.length > 0) {
    let pose = poses[0].pose;

    let rightIndex = pose.rightWrist; // fallback if index not available

    // If using newer model with finger tracking:
    if (pose.keypoints.find(k => k.part === "rightIndex")) {
      let index = pose.keypoints.find(k => k.part === "rightIndex");
      if (index.score > 0.5) {
        ball.x = lerp(ball.x, width - index.position.x, 0.4);
        ball.y = lerp(ball.y, index.position.y, 0.4);
      }
    } else {
      // fallback to wrist if finger isn't detected
      if (rightIndex.confidence > 0.5) {
        ball.x = lerp(ball.x, width - rightIndex.x, 0.4);
        ball.y = lerp(ball.y, rightIndex.y, 0.4);
      }
    }

    checkScore();
  }

  fill(255, 140, 0);
  stroke(0);
  strokeWeight(2);
  ellipse(ball.x, ball.y, ball.size);
}

function drawHoop() {
  // Backboard
  fill(255);
  rect(hoop.x - 10, hoop.y - 60, 20, 100);

  // Rim
  fill(220, 0, 0);
  rect(hoop.x - hoop.width / 2, hoop.y, hoop.width, hoop.height, 10);

  // Net
  stroke(255);
  for (let i = -50; i <= 50; i += 20) {
    line(hoop.x + i, hoop.y + hoop.height,
         hoop.x + i / 2, hoop.y + hoop.height + 40);
  }
}

function checkScore() {
  if (
    ball.x > hoop.x - hoop.width / 2 &&
    ball.x < hoop.x + hoop.width / 2 &&
    ball.y > hoop.y &&
    ball.y < hoop.y + 20
  ) {
    score++;
    swishTimer = 30;
    ball.y = 0;
  }
}

function drawScore() {
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text("Score: " + score, 20, 40);
}

function drawSwish() {
  fill(255, 255, 0);
  textSize(40);
  textAlign(CENTER);
  text("SWISH!", width / 2, 100);
}

function drawInstructions() {
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text("How to Play:", 20, height - 80);
  text("1. Hold your hand up to the camera.", 20, height - 60);
  text("2. Balance the basketball on your fingertip.", 20, height - 45);
  text("3. Move your finger to guide the ball.", 20, height - 30);
  text("4. Try to score in the hoop!", 20, height - 15);
}
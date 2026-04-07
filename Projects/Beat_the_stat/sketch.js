var W = 640;
var H = 480;
var KEEPER_SAVE = 0.72;
var HOLD_TIME = 90;
var ballImg;

var video, handPose;
var predictions = [];
var phase = "AIM";
var zone = null;
var holdTimer = 0;
var kicksLeft = 5;
var goals = 0;
var lastResult = "";
var restartTimer = 0;

var ZONES = [
  { name: "TOP LEFT",      col: 0, row: 0 },
  { name: "TOP MIDDLE",    col: 1, row: 0 },
  { name: "TOP RIGHT",     col: 2, row: 0 },
  { name: "LEFT",          col: 0, row: 1 },
  { name: "CENTER",        col: 1, row: 1 },
  { name: "RIGHT",         col: 2, row: 1 },
  { name: "BOTTOM LEFT",   col: 0, row: 2 },
  { name: "BOTTOM MIDDLE", col: 1, row: 2 },
  { name: "BOTTOM RIGHT",  col: 2, row: 2 }
];

function preload() {
  ballImg = loadImage("soccer.png");
}

function setup() {
  createCanvas(W, H);
  textFont("monospace");
  video = createCapture(VIDEO);
  video.size(W, H);
  video.hide();
  handPose = ml5.handpose(video, function() {
    console.log("model ready");
    handPose.on("predict", function(results) {
      predictions = results;
    });
  });
}

function draw() {
  push();
  translate(W, 0);
  scale(-1, 1);
  imageMode(CORNER);
  image(video, 0, 0, W, H);
  pop();
  fill(255, 255, 255, 120);
  noStroke();
  rect(0, 0, W, H);

  drawingContext.shadowColor = 'black';
  drawingContext.shadowBlur = 8;

  drawGoal();
  drawHUD();

  if (phase === "AIM") {
    handleAim();
  } else {
    drawResult();
  }
}

function drawGoal() {
  stroke(0, 0, 0, 200);
  strokeWeight(2);
  noFill();
  rect(100, 80, 440, 320);
for (var x = 100; x <= 540; x += 55) {
  line(x, 80, x, 400);
}
for (var y = 80; y <= 400; y += 40) {
  line(100, y, 540, y);
  }
}

function getZone(fx, fy) {
  var col, row;
  if (fx < W / 3)            { col = 0; }
  else if (fx < (W * 2) / 3) { col = 1; }
  else                        { col = 2; }

  if (fy < H / 3)            { row = 0; }
  else if (fy < (H * 2) / 3) { row = 1; }
  else                        { row = 2; }

  for (var i = 0; i < ZONES.length; i++) {
    if (ZONES[i].col === col && ZONES[i].row === row) {
      return ZONES[i].name;
    }
  }
  return "CENTER";
}

function getSavePct(z) {
  if (z === "CENTER")                              { return 0.95; }
  if (z === "LEFT" || z === "RIGHT")               { return 0.50; }
  if (z === "TOP MIDDLE" || z === "BOTTOM MIDDLE") { return 0.55; }
  return 0.25;
}

function handleAim() {
  if (predictions.length === 0) {
    zone = null;
    holdTimer = 0;
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(300);
    drawingContext.strokeStyle = 'black';
    drawingContext.lineWidth = 5;
    drawingContext.strokeText("RAISE YOUR HAND TO AIM", W / 2, H / 2);
    text("RAISE YOUR HAND TO AIM", W / 2, H / 2);
    return;
  }

  var lm = predictions[0].landmarks;
  if (!lm) { return; }

  var fx = W - lm[8][0];
  var fy = lm[8][1];

  var newZone = getZone(fx, fy);

  if (newZone !== zone) {
    zone = newZone;
    holdTimer = 0;
  } else {
    holdTimer++;
  }

  imageMode(CENTER);
  image(ballImg, fx, fy, 40, 40);

  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i];
    var lx = (z.col * W / 3) + W / 6;
    var ly = (z.row * H / 3) + H / 6 - 5;
    var active = z.name === zone;
    textAlign(CENTER, CENTER);
    textSize(active ? 14 : 10);
    fill(active ? color(0, 229, 160) : color(255,255,255));
    drawingContext.strokeStyle = 'black';
    drawingContext.lineWidth = 5;
    drawingContext.strokeText(z.name, lx, ly);
    text(z.name, lx, ly);
  }

  var pct = constrain(holdTimer / HOLD_TIME, 0, 1);
  var bx = W / 2 - 100;
  var by = H - 58;
  noStroke();
  fill(200);
  rect(bx, by, 200, 8, 4);
  fill(0, 229, 160);
  rect(bx, by, 200 * pct, 8, 4);
  textAlign(CENTER);
  textSize(10);
  fill(300);
  drawingContext.strokeStyle = 'black';
  drawingContext.lineWidth = 3;
  drawingContext.strokeText("HOLD TO LOCK AIM", W / 2, by - 5);
  text("HOLD TO LOCK AIM", W / 2, by - 5);

  if (holdTimer >= HOLD_TIME) {
    fireKick(zone);
  }
}

function fireKick(z) {
  var savePct = getSavePct(z);
  if (random(1) < savePct) {
    lastResult = "SAVED";
  } else {
    lastResult = "GOAL";
    goals++;
  }
  kicksLeft--;
  phase = "RESULT";
  holdTimer = 0;
  zone = null;
}

function drawResult() {
  textAlign(CENTER, CENTER);
  textSize(88);
  if (lastResult === "GOAL") {
    fill(0, 229, 160);
  } else {
    fill(255, 70, 70);
  }
  text(lastResult, W / 2, H / 2 - 30);

  textSize(15);
  fill(300);
  text("Keeper saves " + int(KEEPER_SAVE * 100) + "% of penalties", W / 2, H / 2 + 40);

  if (kicksLeft > 0) {
    fill(300);
    textSize(13);
    var kickWord = "kicks";
    if (kicksLeft === 1) { kickWord = "kick"; }
    text(kicksLeft + " " + kickWord + " left - raise hand to continue", W / 2, H / 2 + 72);
    if (predictions.length > 0 && frameCount % 80 === 0) {
      phase = "AIM";
    }
  } else {
    textSize(20);
    fill(255);
    text("You scored " + goals + " out of 5", W / 2, H / 2 + 72);
    restartTimer++;
    var secsLeft = max(0, ceil((150 - restartTimer) / 60));
    textSize(13);
    fill(300);
    text("restarting in " + secsLeft + "...", W / 2, H / 2 + 104);
    if (restartTimer >= 150) {
      goals = 0;
      kicksLeft = 5;
      lastResult = "";
      restartTimer = 0;
      phase = "AIM";
    }
  }
}

function drawHUD() {
  textAlign(LEFT, TOP);
  textSize(20);
  fill(0, 229, 160);
  text("BEAT THE STAT", 14, 12);
  textSize(10);
  fill(300);
  text("ALISSON BECKER  " + int(KEEPER_SAVE * 100) + "% SAVE RATE", 14, 38);

  textAlign(RIGHT, TOP);
  textSize(20);
  fill(300);
  text(goals + " GOALS", W - 14, 12);

  for (var i = 0; i < 5; i++) {
    noStroke();
    if (i < 5 - kicksLeft) {
      fill(0, 229, 160);
    } else {
      fill(200);
    }
    ellipse(W / 2 - 40 + i * 20, H - 16, 11, 11);
  }
}
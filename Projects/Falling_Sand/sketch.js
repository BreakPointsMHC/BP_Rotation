size = 10; // Grain size (now only declared once)
let extent = 10;
let ds = 1;
let alwaysDropSand = true;

let points = [];
let grains = [];
let Color = 1;

let hand1X = 0, hand1Y = 0, hand2X = 0, hand2Y = 0;
let videoW = 160;
let videoH = 100;
let video;
let hands;
let camera;
let handLandmarks = []; // Store all hand landmarks for visualization

let MIRROR = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();
  extent = extent * 2 / size;

  // Initialize the points array for sand simulation
  for (let i = 0; i < Math.floor(width / size); i++) {
    points[i] = [];
    for (let j = 0; j < Math.floor(height / size); j++) {
      points[i][j] = 0;
    }
  }

  // Setup webcam
  video = createCapture(VIDEO);
  video.size(videoW, videoH);
  video.hide();

  // Setup MediaPipe Hands
  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`, 
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onResults);

  camera = new Camera(video.elt, {
    onFrame: async () => {
      await hands.send({ image: video.elt });
    },
    width: videoW,
    height: videoH,
  });
  camera.start();
  
  // Start the timer to restart the program after 10 seconds (10 * 1000 ms)
  timer = setTimeout(restartProgram, 10 * 1000);
}


// Function to restart the program after 10 seconds
function restartProgram() {
  console.log("Restarting program after 30 seconds...");
  background(25, 25, 112); // Clear the canvas


points = [];
  
  // Initialize the points array for sand simulation
  for (let i = 0; i < Math.floor(width / size); i++) {
    points[i] = [];
    for (let j = 0; j < Math.floor(height / size); j++) {
      points[i][j] = 0;
    }
  }

 grains = [];

  // Restart the timer to continuously reset every 10 seconds
  clearTimeout(timer);
  timer = setTimeout(restartProgram, 40 * 1000); // Restart the timer
}


function onResults(results) {
  hand1X = hand1Y = hand2X = hand2Y = 0;
  handLandmarks = []; // Reset landmarks each frame
  
  if (results.multiHandLandmarks.length > 0) {
    // Store all landmarks for visualization
    handLandmarks = results.multiHandLandmarks;
    
    // First hand (index finger tip - landmark 8)
    const hand1 = results.multiHandLandmarks[0];
    hand1X = hand1[8].x * width;
    hand1Y = hand1[8].y * height;
    if (MIRROR) hand1X = width - hand1X;
    
    // Second hand (if detected)
    if (results.multiHandLandmarks.length > 1) {
      const hand2 = results.multiHandLandmarks[1];
      hand2X = hand2[8].x * width;
      hand2Y = hand2[8].y * height;
      if (MIRROR) hand2X = width - hand2X;
    }
  }
}

class grain {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.s = 4;
    this.done = false;
  }

  update() {
    if (!this.done) {
      this.done = true;
      this.s += ds;

      for (let i = this.s; i > 0; i--) {
        if (points[this.x][this.y + i] == 0) {
          points[this.x][this.y] = 0;
          this.y += i;
          this.done = false;
          break;
        } else {
          if (points[this.x - 1][this.y + i] == 0 && points[this.x + 1][this.y + i] == 0) {
            points[this.x][this.y] = 0;
            this.x += random([-1, 1]);
            this.y += i;
            this.done = false;
            break;
          } else {
            if (points[this.x - 1][this.y + i] == 0) {
              points[this.x][this.y] = 0;
              this.x--;
              this.y += i;
              this.done = false;
              break;
            } else if (points[this.x + 1][this.y + i] == 0) {
              points[this.x][this.y] = 0;
              this.x++;
              this.y += i;
              this.done = false;
              break;
            }
          }
        }
      }
      points[this.x][this.y] = 1;
    }
  }

  show() {
    fill(this.c, 245, 245);
    square(this.x * size, this.y * size, size);
  }
}

function draw() {
  // Light blue background
  background(30, 30, 95);

  // Draw hand visualization first (under the sand)
  drawHandVisualization();

  // Drop sand for both hands if they're detected
  dropSandForHand(hand1X, hand1Y);
  dropSandForHand(hand2X, hand2Y);

  // Update and display each grain
  for (let i = 0; i < grains.length; i++) {
    if (grains[i].x == 0 || grains[i].x >= width / size - 2) {
      continue; 
    }
    grains[i].update();
    grains[i].show();
  }
}

function dropSandForHand(handX, handY) {
  if (handX > 0 && handY > 0) {
    Color += size / 5;
    if (Color > 360) {
      Color = 1;
    }

    for (let i = 0; i < extent / size; i++) {
      let x = floor(handX / size + random(-extent, extent)); // Removed "width - handX"
      let y = floor(handY / size + random(-extent, extent));
      let handBasedColor = map(handX, 0, width, 180, 240);
      if (x > 0 && x < width / size - 1 && points[x][y] == 0) {
        grains.push(new grain(x, y, handBasedColor)); 
      }
    }
  }
}

function onResults(results) {
  hand1X = hand1Y = hand2X = hand2Y = 0;
  handLandmarks = []; // Reset landmarks each frame
  
  if (results.multiHandLandmarks.length > 0) {
    // Store all landmarks for visualization
    handLandmarks = results.multiHandLandmarks;
    
    // First hand (index finger tip - landmark 8)
    const hand1 = results.multiHandLandmarks[0];
    hand1X = hand1[8].x * width;
    hand1Y = hand1[8].y * height;
    if (MIRROR) hand1X = width - hand1X; // Apply mirroring here if needed
    
    // Second hand (if detected)
    if (results.multiHandLandmarks.length > 1) {
      const hand2 = results.multiHandLandmarks[1];
      hand2X = hand2[8].x * width;
      hand2Y = hand2[8].y * height;
      if (MIRROR) hand2X = width - hand2X; // Apply mirroring here if needed
    }
  }
}

function drawHandVisualization() {
  if (handLandmarks.length === 0) return;
  
  for (const landmarks of handLandmarks) {
    // Draw connections between landmarks (bones)
    stroke(200, 150);
    strokeWeight(2);
    noFill();
    drawHandConnections(landmarks);
    
    // Draw all landmarks as small dots
    for (let i = 0; i < landmarks.length; i++) {
      let x = MIRROR ? width - landmarks[i].x * width : landmarks[i].x * width;
      let y = landmarks[i].y * height;
      
      fill(200, 200, 255, 150);
      noStroke();
      ellipse(x, y, 8);
    }
    
    // Highlight fingertips with colored circles
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb to pinky
    const colors = [
      color(255, 100, 100), // Thumb - red
      color(100, 255, 100), // Index - green
      color(100, 100, 255), // Middle - blue
      color(255, 255, 100), // Ring - yellow
      color(255, 100, 255)  // Pinky - pink
    ];
    
    for (let i = 0; i < fingerTips.length; i++) {
      let tipIndex = fingerTips[i];
      let x = MIRROR ? width - landmarks[tipIndex].x * width : landmarks[tipIndex].x * width;
      let y = landmarks[tipIndex].y * height;
      
      fill(colors[i]);
      ellipse(x, y, 20);
    }
    
    // Highlight palm center (landmark 0)
    let palmX = MIRROR ? width - landmarks[0].x * width : landmarks[0].x * width;
    let palmY = landmarks[0].y * height;
    fill(255, 150, 0);
    ellipse(palmX, palmY, 25);
  }
}

function drawHandConnections(landmarks) {
  // Palm connections
  for (let i = 1; i <= 4; i++) {
    let x1 = MIRROR ? width - landmarks[0].x * width : landmarks[0].x * width;
    let y1 = landmarks[0].y * height;
    let x2 = MIRROR ? width - landmarks[i*4].x * width : landmarks[i*4].x * width;
    let y2 = landmarks[i*4].y * height;
    line(x1, y1, x2, y2);
  }
  
  // Finger connections
  for (let f = 0; f < 5; f++) {
    const base = f * 4;
    for (let i = 1; i <= 3; i++) {
      let x1 = MIRROR ? width - landmarks[base+i].x * width : landmarks[base+i].x * width;
      let y1 = landmarks[base+i].y * height;
      let x2 = MIRROR ? width - landmarks[base+i+1].x * width : landmarks[base+i+1].x * width;
      let y2 = landmarks[base+i+1].y * height;
      line(x1, y1, x2, y2);
    }
  }
}
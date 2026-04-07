//Sylvan Garland 4/5/26
//uses ml5 handPose model

let handPose;
let video;
let hands = [];
let redLayer;
let drawLayer;
let textLayer;
let palmToFingertipDistances = [];
let palmDistances = [];
let handColor = "Green";

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({ flipped: true, maxHands: 1 });
}

function setup() {
  //start the video stream adn hand detection model
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  frameRate(100);
  createCanvas(windowWidth, windowHeight);

  // start with white background
  background(255, 255, 255);

  //make the different graphics layers
  redLayer = createGraphics(windowWidth, windowHeight);
  drawLayer = createGraphics(windowWidth, windowHeight);
  textLayer = createGraphics(windowWidth, windowHeight);
}

function draw() {
  //draw redLayer and drawLayer every frame
  image(redLayer, 0, 0);
  image(drawLayer, 0, 0);
  image(textLayer, 0, 0);

  //display text instructions
  textLayer.textStyle(NORMAL);
  textLayer.fill(0, 0, 0);
  textLayer.textSize(25);
  textLayer.text(
    'Draw with your pointer finger! To "raise" the brush, make a fist. To erase, open your hand.',
    20,
    30
  );
  textLayer.textStyle(ITALIC);
  textLayer.text(
    "For best results, keep your palm facing towards the screen.",
    20,
    56
  );

  //draw the color squares
  textLayer.fill("Red");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2, 40, 40);
  textLayer.fill("Orange");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 50, 40, 40);
  textLayer.fill("Yellow");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 100, 40, 40);
  textLayer.fill("Green");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 150, 40, 40);
  textLayer.fill("Blue");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 200, 40, 40);
  textLayer.fill("Purple");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 250, 40, 40);
  textLayer.fill("Pink");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 300, 40, 40);
  textLayer.fill("Brown");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 350, 40, 40);
  textLayer.fill("Black");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 400, 40, 40);
  textLayer.fill("White");
  textLayer.rect(windowWidth * 0.05, windowHeight * 0.2 + 450, 40, 40);

  displayHands();

  //draw the ticTacToe board
  //ticTacToe();
}

function displayHands() {
  //With this number, we can draw accordingly
  for (const hand of hands) {
    console.log("there are " + (hands.length % 21) + " hands in frame");

    //2-player debugging
    //cases: all drawing, some drawing, none drawing

    //update each hand's color
    checkHandColors(hand);

    //if current hand is closed
    if (checkFist(hand)) {
      console.log("fist detected");
      //we are in "brush up" mode
      redLayer.stroke(255, 255, 255);
      redLayer.rect(0, 0, windowWidth, windowHeight);

      for (let i = 0; i < hand.keypoints.length; i++) {
        let keypoint = hand.keypoints[i];
        if (i == 8) {
          //draw an x as the index fingers move so user can see where they are on the screen
          //redLayer.strokeWeight(1);
          redLayer.stroke(handColor);
          redLayer.textSize(20);
          redLayer.text("x", keypoint.x, keypoint.y);
        }
      }
    } else if (checkPalm(hand)) {
      console.log("palm detected");
      //we are in eraser mode
      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        if (j == 8) {
          //get rid of the red lines
          redLayer.stroke(255, 255, 255);
          redLayer.rect(0, 0, windowWidth, windowHeight);

          //draw an open white circle so we know where the hand in on the screen, then make it disappear
          redLayer.strokeWeight(2);
          redLayer.stroke(handColor);
          redLayer.circle(keypoint.x, keypoint.y, 15);

          //do the erasing
          drawLayer.erase();
          drawLayer.circle(keypoint.x, keypoint.y, 7.5);
          drawLayer.noErase();
        }
      }
    } else {
      //we are in drawing mode
      //draw a line as the index finger moves
      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        if (j == 8) {
          //get rid of the red lines
          redLayer.stroke(255, 255, 255);
          redLayer.rect(0, 0, windowWidth, windowHeight);
          drawLayer.stroke(handColor);
          drawLayer.strokeWeight(10);
          drawLayer.point(keypoint.x, keypoint.y);
        }
      }
    }
  }
}

// determines whether the hand is in a fist
function checkFist(hand) {
  //relevant landmarks: 0-17 and 0-20, 0-13 and 0-16, 0-9 and 0-12, 0-5 and 0-8, 0-2 and 0-4 (thumb, will ignore for now)
  let palmToFingertipDistances = [
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[20].x,
      hand.keypoints[20].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[16].x,
      hand.keypoints[16].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[12].x,
      hand.keypoints[12].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[8].x,
      hand.keypoints[8].y
    ),
  ];

  let palmDistances = [
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[17].x,
      hand.keypoints[17].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[13].x,
      hand.keypoints[13].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[9].x,
      hand.keypoints[9].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[5].x,
      hand.keypoints[5].y
    ),
  ];

  for (let i = 0; i < palmDistances.length; i++) {
    //return false if any finger (other than thumb) is sticking out
    if (palmDistances[i] < palmToFingertipDistances[i]) {
      return false;
    }
  }

  return true; //all 5 fingers are curled
}

// determines whether the hand is fully open
function checkPalm(hand) {
  //relevant landmarks: 0-17 and 0-20, 0-13 and 0-16, 0-9 and 0-12, 0-5 and 0-8, 0-2 and 0-4
  let palmToFingertipDistances = [
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[20].x,
      hand.keypoints[20].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[16].x,
      hand.keypoints[16].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[12].x,
      hand.keypoints[12].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[8].x,
      hand.keypoints[8].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[4].x,
      hand.keypoints[4].y
    ),
  ];

  let palmDistances = [
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[17].x,
      hand.keypoints[17].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[13].x,
      hand.keypoints[13].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[9].x,
      hand.keypoints[9].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[5].x,
      hand.keypoints[5].y
    ),
    dist(
      hand.keypoints[0].x,
      hand.keypoints[0].y,
      hand.keypoints[2].x,
      hand.keypoints[2].y
    ),
  ];

  for (let i = 0; i < palmDistances.length; i++) {
    //return false if any finger is not sticking out
    if (palmDistances[i] > palmToFingertipDistances[i]) {
      return false;
    }
  }

  return true; //all 5 fingers are open
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}

//draws the tic tac toe board
function ticTacToe() {
  textLayer.rect(100, 75, 10, 250);
  textLayer.rect(190, 75, 10, 250);
  textLayer.rect(25, 150, 250, 10);
  textLayer.rect(25, 240, 250, 10);
}

function checkHandColors(hand) {
  //first, make sure we're in the right x-range (same for all colors)
  if (
    hand.keypoints[8].x >= windowWidth * 0.05 &&
    hand.keypoints[8].x <= windowWidth * 0.05 + 40
  ) {
    //then check the y position to determine color
    if (
      hand.keypoints[8].y >= windowHeight * 0.2 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 40
    ) {
      handColor = "Red";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 50 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 90
    ) {
      handColor = "Orange";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 100 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 140
    ) {
      handColor = "Yellow";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 150 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 190
    ) {
      handColor = "Green";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 200 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 240
    ) {
      handColor = "Blue";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 250 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 290
    ) {
      handColor = "Purple";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 300 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 340
    ) {
      handColor = "Pink";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 350 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 390
    ) {
      handColor = "Brown";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 400 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 440
    ) {
      handColor = "Black";
    } else if (
      hand.keypoints[8].y >= windowHeight * 0.2 + 450 &&
      hand.keypoints[8].y <= windowHeight * 0.2 + 490
    ) {
      handColor = "White";
    }
  }
}

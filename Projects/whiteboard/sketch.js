// Sylvan Garland 4/20/26
// uses ml5 handPose model

let handPose;
let video;
let hands = [];
let redLayer;
let drawLayer;
let textLayer;
let palmToFingertipDistances = [];
let palmDistances = [];
let handColors = [];
let tttOn = false;

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  // start the video stream and hand detection model
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  frameRate(60);
  createCanvas(windowWidth, windowHeight);

  // start with white background
  background(255, 255, 255);

  // make the different graphics layers
  redLayer = createGraphics(windowWidth, windowHeight);
  drawLayer = createGraphics(windowWidth, windowHeight);
  textLayer = createGraphics(windowWidth, windowHeight);
}

function draw() {
  // draw each layer every frame
  image(redLayer, 0, 0);
  image(drawLayer, 0, 0);
  image(textLayer, 0, 0);

  // display text instructions
  textLayer.textStyle(NORMAL);
  textLayer.fill(0, 0, 0);
  textLayer.textSize(25);
  textLayer.text(
    'Draw with your pointer finger! To "raise" the brush, make a fist. To erase, open your hand.',
    20,
    30
  );
  textLayer.textStyle(BOLD);
  textLayer.text(
    "For best results, keep your palm facing towards the screen.",
    20,
    60
  );

  // clear screen "button"
  textLayer.fill("White");
  textLayer.rect(windowWidth * 0.15, windowHeight * 0.2 - 10, 150, 30);
  textLayer.fill("Black");
  textLayer.textStyle(NORMAL);
  textLayer.text(
    "clear screen",
    windowWidth * 0.15 + 6,
    windowHeight * 0.2 + 13
  );

  // tic tac toe "button"
textLayer.fill("White");
  textLayer.rect(windowWidth * 0.15 + 200, windowHeight * 0.2 - 10, 119, 30);
  textLayer.fill("Black");
  textLayer.text(
    "tic tac toe",
    windowWidth * 0.15 + 206,
    windowHeight * 0.2 + 13
  );
  
  // drawing prompt "button"
  textLayer.fill("White");
  textLayer.rect(windowWidth * 0.15 + 369, windowHeight * 0.2 - 10, 188, 30);
  textLayer.fill("Black");
  textLayer.text(
    "drawing prompt",
    windowWidth * 0.15 + 375,
    windowHeight * 0.2 + 13
  );
  
  // color squares
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
}

function displayHands() {
  //get rid of previous redLayer frame
  redLayer.stroke(255, 255, 255);
  redLayer.rect(0, 0, windowWidth, windowHeight);
  
  console.log("there are " + hands.length + " hands in frame");
  
  // check if any buttons have been "pressed" -- need to update the screen
   for (let h = 0; h < hands.length; h++) {
     // if button has been pressed, switch the state of the board 
    if(ticTacToe(hands[h])){
      tttOn  = true;
      drawTTT();
      break;
    }
   }

  // now, draw each detected hand accordingly
  for (let h = 0; h < hands.length; h++) {
    //update 2D array storing current color of each hand
    checkHandColors(h);
    if(handColors[h] == null){
      handColors[h] = "Green";
    }

    //check if any buttons have been selected
    clearScreen(hands[h]);
    
    //if current hand is closed
    if (checkFist(hands[h])) {
      console.log("fist detected");
      //we are in "brush up" mode
      for (let i = 0; i < hands[h].keypoints.length; i++) {
        let keypoint = hands[h].keypoints[i];
        if (i == 8) {
          //draw an x as the index fingers move so user can see where they are on the screen
          //redLayer.strokeWeight(1);
          redLayer.stroke(handColors[h]);
          redLayer.textSize(20);
          redLayer.text("x", keypoint.x, keypoint.y);
        }
      }
    } else if (checkPalm(hands[h])) {
      console.log("palm detected");
      //we are in eraser mode
      for (let j = 0; j < hands[h].keypoints.length; j++) {
        let keypoint = hands[h].keypoints[j];
        if (j == 8) {
          //draw an open white circle so we know where the hand in on the screen, then make it disappear
          redLayer.strokeWeight(2);
          redLayer.stroke(handColors[h]);
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
      for (let j = 0; j < hands[h].keypoints.length; j++) {
        let keypoint = hands[h].keypoints[j];
        if (j == 8) {
          drawLayer.stroke(handColors[h]);
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
function ticTacToe(hand) {
  //if hand is on the button
   if (
    hand.keypoints[8].x >= windowWidth * 0.15 + 200 &&
    hand.keypoints[8].x <= windowWidth * 0.15 + 319 &&
    hand.keypoints[8].y >= windowHeight * 0.2 - 10 &&
    hand.keypoints[8].y <= windowHeight * 0.2 + 20
  ) {
     return true;
    } else {
      return false;
    }
}

// draws tic tac toe board on screen
function drawTTT(){
  if(tttOn){
    //draw tic tac toe board
    textLayer.fill("Black");
    textLayer.rect(350, 175, 7, 250);
    textLayer.rect(440, 175, 7, 250);
    textLayer.rect(275, 250, 250, 7);
    textLayer.rect(275, 340, 250, 7);
  } 
}

// updates the color for a hand if it moves over a color from the side menu
function checkHandColors(hand) {
  //first, make sure we're in the right x-range (same for all colors)
  if (
    hands[hand].keypoints[8].x >= windowWidth * 0.05 &&
    hands[hand].keypoints[8].x <= windowWidth * 0.05 + 40
  ) {
    //then check the y position to determine color
    if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 40
    ) {
      handColors[hand] = "Red";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 50 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 90
    ) {
      handColors[hand] = "Orange";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 100 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 140
    ) {
      handColors[hand] = "Yellow";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 150 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 190
    ) {
      handColors[hand] = "Green";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 200 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 240
    ) {
      handColors[hand] = "Blue";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 250 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 290
    ) {
      handColors[hand] = "Purple";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 300 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 340
    ) {
      handColors[hand] = "Pink";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 350 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 390
    ) {
      handColors[hand] = "Brown";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 400 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 440
    ) {
      handColors[hand] = "Black";
    } else if (
      hands[hand].keypoints[8].y >= windowHeight * 0.2 + 450 &&
      hands[hand].keypoints[8].y <= windowHeight * 0.2 + 490
    ) {
      handColors[hand] = "White";
    } else {
      return; 
    }
  } else {
    return; 
  }
}

// clears the board if a user moves over the button
function clearScreen(hand) {
  if (
    hand.keypoints[8].x >= windowWidth * 0.15 &&
    hand.keypoints[8].x <= windowWidth * 0.15 + 150 &&
    hand.keypoints[8].y >= windowHeight * 0.2 - 10 &&
    hand.keypoints[8].y <= windowHeight * 0.2 + 20
  ) {
    //erase the drawing layer
    console.log("erasing");
    drawLayer.erase()
    drawLayer.rect(0, 0, windowWidth, windowHeight);
    drawLayer.noErase();
    
    // hide the tic tac toe board
    textLayer.erase();
    textLayer.rect(274, 174, 252, 252);
    textLayer.noErase();
  }
}
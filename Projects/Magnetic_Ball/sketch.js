let handpose;
let video;
let hands = [];
let prevPos = null;
let currentPos = new Vector(0, 0);
let ballPos  = new Vector(0, 0);
let ballVel = new Vector(0,0);
let angle = 0;
let spinVel = 0;
let holding = true;
let ballString = [];
let stringLength = 20;
let soundfx;

function setup() {
  createCanvas(640, 480);
  //createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(width, height);
  
  soundfx = loadSound('./collideSFX.mp3');

  handpose = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("hand", results => {
    hands = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

//function windowResized() {
  //resizeCanvas(windowWidth, windowHeight);
//}
function mousePressed() {
  // Unlock audio on first click
  userStartAudio();
}

function modelReady() {
  console.log("Model ready!");
}


function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
}

function detectMovement(x, y){
  currentPos = new Vector (x,y);
  
  if (prevPos === null) {
    prevPos = currentPos;
    return new Vector(0, 0);
  }
    let delPos = currentPos.minus(prevPos);
    prevPos = currentPos;
    return delPos;
  
}

function drawKeypoints() {
  if (hands.length > 0) {
    let hand = hands[0];
    // Palm landmarks: 0, 1, 5, 9, 13, 17
    let palmPoints = [0, 1, 5, 9, 13, 17].map(i => hand.landmarks[i]);
    
    // Calculate the average x and y position from the coordinates of these landmarks
    let x = palmPoints.reduce((sum, p) => sum + p[0], 0) /palmPoints.length;
    let y = palmPoints.reduce((sum, p) => sum + p[1], 0) /palmPoints.length;
    
    let deltaVec = detectMovement(x, y);
    let palmPos = new Vector(x,y);
    let b2Palm = palmPos.minus(ballPos);
    
    // If there is fast throwing movement, move the ball to other hand
    if(deltaVec.mag() > 20 && holding == true){
      
      holding = false;
      ballVel =  deltaVec.timesScalar(0.5);
      spinVel = 0.3
    }
    
    // Update the ball's position
    if (holding) {
      ballPos = new Vector (x, y);
    } else {
      // Move to new direction
      //ballPos = ballPos.plus(ballVel);
      //ballVel = ballVel.timesScalar(0.98);
      
      // Also calculate return rate
      let returnRate = b2Palm.unit().timesScalar(1)
      
      ballVel = ballVel.plus(returnRate);

      // Move ball and its string
      ballPos = ballPos.plus(ballVel);
      ballString.push(Vector.clone(ballPos));
      if (ballString.length > stringLength) {
        ballString.shift();
      }

      // Slow down gradually
      ballVel = ballVel.timesScalar(0.98);
      
       // Collision with edges change the direction by changing veloc
      if (ballPos.x < 0 || ballPos.x > width){
        soundfx.play()
        ballVel.x *= -0.8;
        //soundfx.stop();
      } 
      if (ballPos.y < 0 || ballPos.y > height){
        soundfx.play()
        ballVel.y *= -0.8;
      } 
      // Catch when close
      if (b2Palm.mag() < 20) {
        holding = true;
        spinVel = 0;
      }
    }
    
    for (let i = 0; i < ballString.length; i++) {
      let t = ballString[i];
      let alpha = map(i, 0, ballString.length - 1, 20, 150);

      push();
      translate(t.x, t.y);
      fill(238, 72, 60, alpha);
      noStroke();
      ellipse(0, 0, 100, 100);
      
      stroke(173,247,182);
      strokeWeight(4);
      line(0, 0, 0, -60);
      pop();
    }

    // Draw the ball
    push();
    translate(ballPos.x, ballPos.y);
    rotate(angle);
    angle += spinVel;
    

    fill(238, 72, 60);
    noStroke();
    ellipse(0, 0, 120, 120);

    stroke(173,247,182);
    strokeWeight(4);
    line(0, 0, 0, -60);

    pop();
  } // end of checking hand.length > 0
}
class StartScreen {
  constructor() {
    this.isRaising = false; // Hand raising detection
    this.raiseStartTime = 0; // Hand raising time
    this.requiredHoldTime = 2000; // Hold for 2 sec (2000ms)
    
    this.holdProgress = 0;
  }

  draw() {
    
    noStroke();
    // Show the webcam feed in the background so they can see themselves!
    image(video, 0, 0, width, height);
    
    /*
    Background machine
    */
    image(machineImg, 0, 0, width, height);
    
    /*
    Title screen text
    */
    let colors = [
      color(148, 0, 211), // Violet
      color(75, 0, 130),  // Indigo
      color(0, 0, 255),   // Blue
      color(0, 255, 0),   // Green
      color(255, 255, 0), // Yellow
      color(255, 165, 0), // Orange
      color(255, 0, 0)    // Red
    ];
    
    textAlign(CENTER, CENTER);
    textFont(myPixelFont); // Load custom Arcade font beforehand
    
    
    /*
    Draw the rainbow loading effect
    */
    textSize(20); 
    for (let i = 0; i < colors.length; i++) {
      fill(colors[i]);
      text("CAT BREAKING BOX", (width / 2) + (i * 4) - 12, (height / 2 - 85));
    }
    
    /*
    Game start instruction
    */
    fill(255);
    textSize(15);
    text("RAISE EITHER HAND\n ABOVE YOUR SHOULDER\n TO START", width / 2 - 8, height / 2);
    fill(255);
    textSize(13);
    text("START", width/2 - 2, height - 35);
    
    
    /*
    Hand Track logic
    */
    let handRaised = false;
    let targetWrist = null;

    if (poses.length > 0) {
      let pose = poses[0]; // Look at the first person
      
      // Find the specific joints we care about
      let leftW = pose.keypoints.find(kp => kp.name === 'left_wrist');
      let rightW = pose.keypoints.find(kp => kp.name === 'right_wrist');
      let leftS = pose.keypoints.find(kp => kp.name === 'left_shoulder');
      let rightS = pose.keypoints.find(kp => kp.name === 'right_shoulder');

      // Check if Left Hand is visible and raised above the shoulder
      if (leftW && leftS && leftW.confidence > 0.5 && leftS.confidence > 0.5 && leftW.y < leftS.y) {
        handRaised = true;
        targetWrist = leftW;
      } 
      // Otherwise, check if Right Hand is visible and raised above the shoulder
      else if (rightW && rightS && rightW.confidence > 0.5 && rightS.confidence > 0.5 && rightW.y < rightS.y) {
        handRaised = true;
        targetWrist = rightW;
      }
    }
    /*
    Count down timer: Pour timer in holdProgress
    Make sure that AI doesn't restart instantly
    */
    if (handRaised) {
      this.holdProgress += deltaTime;
    }
    else{
      this.holdProgress -= deltaTime;
    }
    this.holdProgress = constrain(this.holdProgress, 0, this.requiredHoldTime);
      
    // Draw loading rainbow ring on wrist
    if (this.holdProgress > 0 && targetWrist) {
      let currentPercent = this.holdProgress / this.requiredHoldTime;
      let angle = map(this.holdProgress, 0, this.requiredHoldTime, 0, TWO_PI);
      
      // Pick a color from the rainbow array based on how full the timer is
      let colorIndex = floor(map(currentPercent, 0, 1, 0, colors.length - 1));
      colorIndex = constrain(colorIndex, 0, colors.length - 1); // Out of bound fix
      let currentRingColor = colors[colorIndex];

      noFill();
      stroke(currentRingColor); 
      strokeWeight(10);
      arc(targetWrist.x, targetWrist.y, 150, 150, -PI/2, -PI/2 + angle);
    }

    // Start game once hold for long enough
    if (this.holdProgress >= this.requiredHoldTime) {
      this.holdProgress = 0;  // Reset the timer for next time
      gameScreen.setup();
      gameState = "GAME";     // Trigger the state machine
    }
    
  }
  
}


/*class StartScreen {
  draw() {
    background(50);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("AR BREAKOUT", width / 2, height / 2 - 40);
    
    textSize(20);
    text("Press SPACEBAR to start", width / 2, height / 2 + 20);

    // Simple transition logic
    if (keyIsDown(32)) { // 32 is Spacebar
      gameState = "GAME";
    }
  }
}
*/
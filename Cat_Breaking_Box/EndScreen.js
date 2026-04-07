class EndScreen {
  constructor() {
    this.displayStartTime = 0;
    this.waitDuration = 10000; // Wait 10 seconds
  }

  init() {
    this.displayStartTime = millis();
    gameOverSound.play()
  }

  draw() {
    noStroke();
    image(video, 0, 0, width, height);
    image(machineImg, 0, 0, width, height);

    let colors = [
      color(148, 0, 211), color(75, 0, 130), color(0, 0, 255),
      color(0, 255, 0), color(255, 255, 0), color(255, 165, 0), color(255, 0, 0)
    ];

    textAlign(CENTER, CENTER);
    textFont(myPixelFont);

    // Display rainbow game over text
    textSize(25);
    for (let i = 0; i < colors.length; i++) {
      fill(colors[i]);
      text("GAME OVER", (width / 2) + (i * 4) - 12, (height / 2 - 85));
    }
    
    fill(255);
    textSize(13);
    text("END", width/2 - 2, height - 35);

    // Display the score
    fill(255);
    textSize(20);
    text("YOUR SCORE: " + lastScore, width / 2, height / 2 - 10);
    
    // Check if break the record
    if (lastScore >= highScore && lastScore > 0) {
      // Flash yellow and white
      fill(frameCount % 20 < 10 ? color(255, 255, 0) : 255);
      textSize(14);
      text("NEW RECORD!", width / 2, height / 2 + 20);
    } else {
      fill(200);
      textSize(14);
      text("HIGH SCORE: " + highScore, width / 2, height / 2 + 20);
    }

    // Counting time to reset start
    let elapsed = millis() - this.displayStartTime;
    let remaining = ceil((this.waitDuration - elapsed) / 1000);
    
    fill(255, 255, 0);
    textSize(10);
    if (remaining > 0) {
      text("RESTART GAME IN " + remaining, width / 2, height / 2 + 65);
    }

    if (elapsed >= this.waitDuration) {
      gameState = "START";
    }
  }
}
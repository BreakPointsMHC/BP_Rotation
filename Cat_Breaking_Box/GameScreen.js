/*
Main logic of the game play 
*/
class GameScreen {
  constructor() {
    this.catBall = null;
    this.humanPaddle = null;
    this.bricks = [];
    this.score = 0;
    
    // Init Machine Boundary
    this.SCREEN_X1 = 0; 
    this.SCREEN_Y1 = 0; 
    this.SCREEN_X2 = 0; 
    this.SCREEN_Y2 = 0; 
    this.screenWidth = 0;
    this.screenHeight = 0;
    
    // Init paddle
    this.paddleWidth = 0;
    this.paddleHeight = 20;
    this.paddleY = 0;
    
    // Init cat wobbling
    this.catWobble = 1.0;
    this.wobbleVelocity = 0;
    
    // Init Game level 
    this.isTransitioning = false;
    this.transitionStartTime = 0;
    this.transitionDuration = 3000;
  }

  setup() {
    engine.world.gravity.y = 0;
    this.score = 0; // Score reset every game
    this.bricks = [];
    Matter.World.clear(world, false);
    Matter.Events.off(engine);
    
    this.SCREEN_X1 = width * 0.16; // Top left x corner
    this.SCREEN_Y1 = height * 0.18; // Top left Y corner
    this.SCREEN_X2 = width * 0.84; // Bottom right x corner
    this.SCREEN_Y2 = height * 0.73; // Bottom right Y corner
    this.screenWidth = this.SCREEN_X2 - this.SCREEN_X1
    this.screenHeight = this.SCREEN_Y2 - this.SCREEN_Y1
    this.paddleWidth = this.screenWidth * 0.35;
    this.paddleHeight = 20;
    this.paddleY = this.SCREEN_Y2 + 5;
    
    /*
    Setup walls
    */
    let wallOptions = { isStatic: true, friction: 0, restitution: 1 };
    Matter.World.add(world, [
      Matter.Bodies.rectangle(this.SCREEN_X1 + (this.screenWidth/2), this.SCREEN_Y1 - 10, this.screenWidth, 20, wallOptions), // Top
      Matter.Bodies.rectangle(this.SCREEN_X1 - 10, this.SCREEN_Y1 + (this.screenHeight/2), 20, this.screenHeight, wallOptions), // Left
      Matter.Bodies.rectangle(this.SCREEN_X2 + 10, this.SCREEN_Y1 + (this.screenHeight/2), 20, this.screenHeight, wallOptions)  // Right
    ]);
    
    /*
    Setup Catball
    */
    this.catBall = Matter.Bodies.circle(width / 2, height / 2, 15, {
      restitution: 1, 
      friction: 0, 
      frictionAir: 0,
      frictionStatic: 0,
      inertia: Infinity, 
      label: 'ball'
    });
    Matter.World.add(world, this.catBall);
    Matter.Body.setVelocity(this.catBall, { x: 2, y: -2 });
    
    /*
    Setup bricks
    */
    let columns = 6;
    let rows = 3;
    let brickW = 50;
    let brickH = 45;
    let spacing = 10;
    
    let totalGridW = (columns * brickW) + ((columns - 1) * spacing);
    let startX = this.SCREEN_X1 + (this.screenWidth - totalGridW) / 2 + (brickW / 2);
    
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        let x = startX + i * (brickW + spacing);
        let y = this.SCREEN_Y1 + 20 + j * (brickH + 15);
        let brick = Matter.Bodies.rectangle(x, y, brickW, brickH, { isStatic: true, label: 'brick' });
        brick.isHit = false;
        brick.hitTimer = 0;
        this.bricks.push(brick);
        Matter.World.add(world, brick);
      }
    }
    
    /*
    Setup paddles
    */
    this.humanPaddle = Matter.Bodies.rectangle(width/2, this.paddleY, this.paddleWidth, this.paddleHeight, { isStatic: true, label: 'paddle' });
    Matter.World.add(world, this.humanPaddle);
    
    /*
    Collision logic
    Score + 10 for every box broken
    */
    Matter.Events.on(engine, 'collisionStart', (event) => {
      let pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        let bodyA = pairs[i].bodyA;
        let bodyB = pairs[i].bodyB;
        
        // Check if ball hit the brick or brick hit the ball
        if ((bodyA.label === 'brick' && bodyB.label === 'ball') || 
            (bodyB.label === 'brick' && bodyA.label === 'ball')) {
          
          let curBrick = bodyA.label === 'brick' ? bodyA : bodyB;
          
          if (!curBrick.isHit && gameState === "GAME") { 
            curBrick.isHit = true; // Mark brick as hit
            this.score += 10;
            curBrick.hitTimer = millis();
            Matter.World.remove(world, curBrick);
            meowSound.play(); 
          }
        }
      }
    });
    
    /*
    Cat Wobble logic
    */
    Matter.Events.on(engine, 'collisionStart', (event) => {
    let pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        let bodyA = pairs[i].bodyA;
        let bodyB = pairs[i].bodyB;

        if (bodyA.label === 'ball' || bodyB.label === 'ball') {
            this.catWobble = 0.7; 
        }

    }
});
    
  }

  draw() {
    // Background
    push();
    imageMode(CORNER);
    image(video, 0, 0, width, height); // Camera
    image(machineImg, 0, 0, width, height); // Claw Machine
    pop();
    
    // Score display
    push();
    textFont(myPixelFont); 
    textAlign(RIGHT, TOP);
    textSize(24); 

    stroke(0);
    strokeWeight(6); 
    fill(0); 
    text("SCORE: " + this.score, this.SCREEN_X2, this.SCREEN_Y1 - 35);

    noStroke();
    fill(255, 255, 0); 
    text("SCORE: " + this.score, this.SCREEN_X2, this.SCREEN_Y1 - 35);
    pop();
    
    // Screen label
    push();
    fill(255);
    textSize(13);
    text("GAME", width/2 - 23, height - 35);
    pop();
    
    /*
    Paddle logic (Hand Tracking)
    */
    if (poses.length > 0) {
      let pose = poses[0]; // Get the first person
      
      // Look for wrist
      let leftW = pose.keypoints.find(kp => kp.name === 'left_wrist');
      let rightW = pose.keypoints.find(kp => kp.name === 'right_wrist');
      
      let activeHand = null;

      // Decide which hand to track
      // If both hands are visible, track the one held higher up (smaller Y value)
      if (leftW && rightW && leftW.confidence > 0.4 && rightW.confidence > 0.4) {
        activeHand = leftW.y < rightW.y ? leftW : rightW; 
      } else if (rightW && rightW.confidence > 0.4) {
        activeHand = rightW; // Only right hand visible
      } else if (leftW && leftW.confidence > 0.4) {
        activeHand = leftW;  // Only left hand visible
      }

      // Move the paddle to the active hand
      if (activeHand) {
        let targetX = activeHand.x;
        
        // Constrain the paddle so it cannot go out of the screen boundaries
        targetX = constrain(targetX, this.SCREEN_X1 + this.paddleWidth/2, this.SCREEN_X2 - this.paddleWidth/2);

        // lerp() smoothing we added to fix camera lag!
        let currentX = this.humanPaddle.position.x;
        let smoothedX = lerp(currentX, targetX, 0.4); 

        // Update the paddle's position in the physics engine
        Matter.Body.setPosition(this.humanPaddle, { x: smoothedX, y: this.paddleY });
      }
    }

    /*
    Drawing paddle
    */
    push();
    imageMode(CENTER);
    image(cushionImg, this.humanPaddle.position.x, this.humanPaddle.position.y, this.paddleWidth, 60);
    pop();
    
    /*
    Jelly wobbly cat logic
    */
    let springK = 0.15;  
    let damping = 0.85;  
    
    let force = springK * (1.0 - this.catWobble);
    this.wobbleVelocity += force;
    this.wobbleVelocity *= damping;
    this.catWobble += this.wobbleVelocity;
    
    /*
    Drawing catball
    */
    push();
    imageMode(CENTER);
    // Move origin to the ball coordinate
    translate(this.catBall.position.x, this.catBall.position.y);
    // If hit right stay still, left flip
    if (this.catBall.velocity.x > 0){
      scale(-1,1);
    }
    
    let finalW = 50 * (1 / this.catWobble); 
    let finalH = 50 * this.catWobble;
    
    image(catImg, 0, 0, finalW, finalH);
    pop();
    
    /*
    Drawing bricks
    */
    push();
    imageMode(CENTER);
    this.bricks = this.bricks.filter(b => !b.isHit || (millis() - b.hitTimer < 200));
    
    // close box if not hit, open otherwise
    for (let b of this.bricks){
      if (b.isHit){
        image(openBoxImg, b.position.x, b.position.y, 70, 60);
      }
      else{
        image(closeBoxImg, b.position.x, b.position.y, 70, 60);
      }
    }
    pop();
    
    /*
    End game logic (lose)
    */
    if (this.catBall.position.y > this.SCREEN_Y2) {
      Matter.Body.setVelocity(this.catBall, {x: 0, y: 0});
      lastScore = this.score; 

      if (lastScore > highScore) {
        highScore = lastScore;
        // Store new record in browser
    localStorage.setItem("catBreakingBoxHighScore", highScore);
      }

      endScreen.init(); 
      gameState = "END";
    }
    
    
    /*
    Anti-Stuck Logic
    Prevents the ball from bouncing perfectly horizontally, or vertically forever
    */
    let vel = this.catBall.velocity;
    let pos = this.catBall.position; // Get the cat's exact coordinates!
    let minSpeed = 3; 

    // Enforce minimum speed
    let currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (currentSpeed < minSpeed && currentSpeed > 0) {
        let multiplier = minSpeed / currentSpeed;
        Matter.Body.setVelocity(this.catBall, { 
            x: vel.x * multiplier, 
            y: vel.y * multiplier 
        });
    }

    // Prevent purely horizontal loops (bouncing left/right forever)
    if (Math.abs(vel.y) < 0.5) {
        // If it's in the top half of the screen, push it DOWN. If bottom half, push UP.
        let pushY = pos.y < height / 2 ? 2 : -2; 
        Matter.Body.setVelocity(this.catBall, { x: vel.x, y: pushY });
    }

    // Prevent purely vertical loops (bouncing up/down forever)
    if (Math.abs(vel.x) < 0.5) {
        // If it's on the left side of the screen, push RIGHT. If right side, push LEFT.
        let pushX = pos.x < width / 2 ? 2 : -2;
        Matter.Body.setVelocity(this.catBall, { x: pushX, y: vel.y });
    }
  }
}
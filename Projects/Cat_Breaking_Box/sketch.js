/*
Variables
*/
let video;
let bodyPose;
let poses = []; 

let engine, world; 
let lastScore = 0;
let highScore = Number(localStorage.getItem("catBreakingBoxHighScore")) || 0;
let gameState = "START"; // Can be "START", "GAME", or "END"


// Screen instances
let startScreen;
let gameScreen;
let endScreen;

// Asssets
let machineImg, catImg, closeBoxImg, openBoxImg, cushionImg;
let myPixelFont;
let meowSound;
let gameOverSound;

function preload(){
  // MoveNet AI model for pose detection, flip to mirror correctly
  bodyPose = ml5.bodyPose("MoveNet", {flipped: true});
  machineImg = loadImage('assets/Machine.PNG');
  catImg = loadImage('assets/Cat.PNG');
  closeBoxImg = loadImage('assets/CloseBox.PNG');
  openBoxImg = loadImage('assets/OpenBox.PNG');
  cushionImg = loadImage('assets/Cushion.PNG');
  myPixelFont = loadFont('assets/PressStart2P-Regular.ttf');
  meowSound = loadSound('assets/meow.mp3');
  gameOverSound= loadSound('assets/gameover.wav');
}

function setup() {
  createCanvas(640, 480);
  
  /*
  Setup Webcam
  */
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, getPoses)
  
  /*
  Setup Physics
  */
  engine = Matter.Engine.create();
  world = engine.world;
  
  /*
  Initialize screens
  */
  startScreen = new StartScreen();
  gameScreen = new GameScreen();
  endScreen = new EndScreen();
  
  gameScreen.setup(); // Init game objects
  
}

// Use AI to get poses
function getPoses(results){
  poses = results;
}

function draw() {
  Matter.Engine.update(engine); // Update physics in the background
  
  /*
  State machine: switch between screens based on game state
  */
  if (gameState === "START"){
    startScreen.draw();
  }
  else if (gameState === "GAME"){
    gameScreen.draw();
  }
  else if (gameState === "END"){
    endScreen.draw();
  }
}
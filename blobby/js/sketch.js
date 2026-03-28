//Amelia Henzel
/* This code controls the virus game and breakpoints input */

//Global vars
const videoW = 640;
const videoH = 360;
const camIndx = 0;
const mirroring = true;
const rotation = 0; // in angles
const maxNumHands = 2;
var bpDisplays; 

var blob;
var blobs = [];
let blobColors = [];
let blobSpeed = 5;
var popSound;

let checkFrame = 0;

  let winTime = 0;
let showingWin = false;

let confettiColor = [], confetti = [];



function preload() {
    popSound = loadSound('bubble-pop.mp3');
}
function setup() {  
  frameRate(30);

    // instantiate a BPDisplays object to handle video processing
  bpDisplays = new BPDisplaysHands(initVideoInteraction, videoW, videoH, camIndx, mirroring, rotation, maxNumHands);
  
  //gradient stuff
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  noStroke();
  //add colors to the array of blob color options
  blobColors.push(color(52, 65, 100, 100)); //color for r = 100
  blobColors.push(color(190, 100, 100, 100)); // color for r = 100 and 80
  blobColors.push(color(132, 65, 100, 100)); //color for r = 80 and 60
  blobColors.push(color(225, 65, 100, 100)); //color for r = 60 and 40
  blobColors.push(color(310, 100, 100, 100)); //color for r = 40

  createCanvas(windowWidth, windowHeight);
  
  	confettiColor = [color('#00aeef'), color('#ec008c'), color('#72c8b6')];
  for (let i = 0; i < 200; i++) {
    confetti[i] = new Confetti(random(0, width), random(-height, 0), random(-10, 10));
  }
 
  spawnBlobs(blobSpeed);
}

function draw() {
  
  //restart every 5 minutes (300,000 milliseconds)
setInterval(() => location.reload(), 5 * 60 * 1000);
  
  //only check for collision every 3 frames
  checkFrame = (checkFrame + 1) % 3;
  let toRemove = [];
  
    background(0, 0, 20, 100);
    
  // If currently showing win screen
  if (showingWin) {
    //won text
    textFont('Arial');
    textSize(100);
    fill('white');
    textAlign(CENTER, CENTER);
    text('You Won!', windowWidth / 2, windowHeight/2);
        
    //confetti
    	for (let i = 0; i < confetti.length / 2; i++) {
    confetti[i].confettiDisplay();

    if (confetti[i].y > height) {
      confetti[i] = new Confetti(random(0, width), random(-height, 0), random(-1, 1));
    }
  }

  for (let i = int(confetti.length / 2); i < confetti.length; i++) {
    confetti[i].confettiDisplay();

    if (confetti[i].y > height) {
      confetti[i] = new Confetti(random(0, width), random(-height, 0), random(-1, 1));
    }
  }

    // When 10 seconds have passed, restart
    if (millis() - winTime > 10000) {
      showingWin = false;
      spawnBlobs(blobSpeed);   // restart game
    }
    return; // stop drawing game while win text is showing
  
    }
  
    //draw the blobs
    for (var i = blobs.length - 1; i >= 0; i--) {
     
    blobs[i].show();
    blobs[i].update();
    blobs[i].hitedge();
       
    }
  //display hands
  
  // if the video stream isn't set up yet, don't do anything
  if (!bpDisplays.isCaptureReady() ) return;
  
  displayHands(i, toRemove);
    

   // Remove blobs after iteration to avoid breaking index order
  // Sort descending so splice doesn't mess up later indices
  toRemove.sort((a, b) => b - a);
  for (const i of toRemove) {
    if (blobs[i]) blobs.splice(i, 1);
  }
  
  
  // If all blobs are gone, trigger win state
  if (blobs.length === 0 && !showingWin) {
    showingWin = true;
    winTime = millis();   // start timer
    
    }
}

function restartSketch(){
var blob;
var blobs = [];
let blobColors = [];
let blobSpeed = 5;
var popSound;
let checkFrame = 0;

  console.log("restart");
    // instantiate a BPDisplays object to handle video processing
  bpDisplays = new BPDisplaysHands(initVideoInteraction, videoW, videoH, camIndx, mirroring, rotation, maxNumHands);
  
  //gradient stuff
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  noStroke();
  //add colors to the array of blob color options
  blobColors.push(color(52, 65, 100, 100)); //color for r = 100
  blobColors.push(color(190, 100, 100, 100)); // color for r = 100 and 80
  blobColors.push(color(132, 65, 100, 100)); //color for r = 80 and 60
  blobColors.push(color(225, 65, 100, 100)); //color for r = 60 and 40
  blobColors.push(color(310, 100, 100, 100)); //color for r = 40

  createCanvas(windowWidth, windowHeight);
 
  spawnBlobs(blobSpeed);
}
function checkForBlob(pointx, pointy, blobindex, toRemove){
  //check if there is a blob at the index
     // if (blobs[blobindex] !== undefined) {
  
  if (pointx> (blobs[blobindex].pos.x - blobs[blobindex].r) && pointx < (blobs[blobindex].pos.x + blobs[blobindex].r)) {
      if (pointy > (blobs[blobindex].pos.y - blobs[blobindex].r) && (pointy < blobs[blobindex].pos.y + blobs[blobindex].r)) {      
          
        //if the blob is not a tiny blob
        if (blobs[blobindex].r > 40) {
            //break it up into two smaller blobs
            var newBlobs = blobs[blobindex].breaks();
            blobs = blobs.concat(newBlobs);
          }
          //play the sound
          popSound.play();

      if (!toRemove.includes(blobindex)) {
      toRemove.push(blobindex);
    }
        
      }
  }
//}

}

//create the initial 10 blobs 
function spawnBlobs(speed){
  //create an array of smaller blobs
  for (var i = 0; i < 8; i++) {
    blobs[i] = new myBlob(100, createVector(random(100, width - 100), random(100, height - 100)), createVector(random(-speed, speed), random(-speed, speed)));
  }
  
}


// Demo the hands code by displaying each landmark
// as a strobing (random fill) circle.
// NOTE: coords are all in range between 0 and 1
function displayHands(blobindex, toRemove) 
{  
  // if the results are empty (nothing detected) prompt the user to stand back
  if (!bpDisplays.handResults){
    return;
  } 
  
  //we need to check FOR EACH HAND
  
  // If there are results in the landmarks then let's go through them
  if (bpDisplays.handResults.multiHandLandmarks) {
    if(bpDisplays.handResults.multiHandLandmarks.length == 0){
      textFont('Arial', 200);
      textSize(40);
      fill('white');
      textAlign(CENTER, CENTER);
  text('No Hand 👋 Detected!', windowWidth/2, 200);
    }
  
    
    for (const landmarks of bpDisplays.handResults.multiHandLandmarks) {

      
      // GO through every landmark for this hand
      for (let i = 0; i < landmarks.length; i++) {
        //for the pointer finger landmark
        if ( i == 8){
        fill (100, 100, 100, 100);
        noStroke();
        ellipse(landmarks[i].x * windowWidth, landmarks[i].y * windowHeight, 20);
        //check for collison with blob
        let fingertips = [landmarks[8]];
        for (const point of fingertips) {
            let pointx = point.x * windowWidth;
            let pointy = point.y * windowHeight;
          if(checkFrame === 0){
            for (var b = blobs.length - 1; b >= 0; b--) {
         checkForBlob(pointx, pointy, b, toRemove);
            }
       }
        }
      }
        
        
        else{
        // Draw a circle at the landmark
        strokeWeight(2);
        fill (167, 199, 231, 100);
        noStroke();
        ellipse(landmarks[i].x * windowWidth, landmarks[i].y * windowHeight, 20);
        }
      }
    }
  }
  
  
  
}

function initVideoInteraction() {
    bpDisplays.capture.style('opacity', 0); // Hide camera feed
}



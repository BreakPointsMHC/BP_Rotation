let handPose;
let video;
let hands = [];
let animals = ["🐝","🐛","🦆","🪿","🦆","🐰","🦊","🐻","🐼","🦁","🐷","🦧","🦃","🦚","🦜","🐿️","🦥","🦭","🐸", "🐯", "🐼", "🐵", "🐘", "🦒"];
let underwaterAnimals = ["🐟","🐠","🐡","🐙","🦑","🦀","🦞","🦐","🐬","🐋","🦈","🦭"];
let confettiEmojis = ["🎉", "✨", "🎊", "🫧", "⭐", "💙"];

let isUnderwaterMode = false;
//prevents infinite call
let isCurrentlyMatching = false; 

let confettiParticles = [];
let confettiTimer = 0;
let gravity;

//state tracking arrays
let currentAnimals = [];
let wasHandClosed = [];

function preload() {
  handPose = ml5.handPose({ flipped: true }); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  //initialize the gravity vector once
  gravity = createVector(0, 0.2);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  //mode switch bckground
  if (isUnderwaterMode) {
    //blue for water
    background(10, 30, 80);
    fill(255); // White text
  } else {
    //pink
    background(242, 206, 232);
    fill(0); //black text
  }
  //instruction
  textSize(24);
  textAlign(CENTER, TOP);
  text("make a fist and open it to summon your pet :) *tips: double hands = double pets!*", width / 2, 30);

  displayHands();
  handleConfetti();
}

function gotHands(results) {
  hands = results;
  
  //sort hands by x to prevent index swapping(left always idx 0)
  if (hands.length === 2) {
    hands.sort((a, b) => a.keypoints[0].x - b.keypoints[0].x);
  }
}

function displayHands() {  
  if (hands.length === 0) return;
  
  let activeAnimals = isUnderwaterMode ? underwaterAnimals : animals;

  for (let h = 0; h < hands.length; h++) {
    let currentHand = hands[h];
    let keypoints = currentHand.keypoints; 
    let tipDistance = dist(keypoints[12].x, keypoints[12].y, keypoints[0].x, keypoints[0].y);
    let baseDistance = dist(keypoints[9].x, keypoints[9].y, keypoints[0].x, keypoints[0].y);
    
    let isHandClosed = tipDistance < baseDistance;

    if (wasHandClosed[h] === undefined) {
      wasHandClosed[h] = true; 
      currentAnimals[h] = random(activeAnimals);
    }

    if (wasHandClosed[h] === true && isHandClosed === false) {
      currentAnimals[h] = random(activeAnimals);
    }

    wasHandClosed[h] = isHandClosed;

    for (let i = 0; i < currentHand.keypoints.length; i++) {
      let x = map(keypoints[i].x, 0, 640, 0, width);
      let y = map(keypoints[i].y, 0, 480, 0, height);

      if (i === 9) {
        if (!isHandClosed) {
          textSize(150);
          textAlign(CENTER, CENTER);
          text(currentAnimals[h], x, y); 
        }
      }
    }
  }

  //detects matches
  if (hands.length === 2) {
    let handsOpen = !wasHandClosed[0] && !wasHandClosed[1];
    let animalsMatch = currentAnimals[0] === currentAnimals[1];
    
    if (handsOpen && animalsMatch) {
      if (!isCurrentlyMatching) {
        triggerModeSwap(); 
        //lock
        isCurrentlyMatching = true;
      }
    } else {
      //lock
      isCurrentlyMatching = false;
    }
  } else {
    //unlock
    isCurrentlyMatching = false; 
  }
}

function triggerModeSwap() {
  isUnderwaterMode = !isUnderwaterMode; 
  confettiTimer = 180; 
  
  //confetti
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      position: createVector(width / 2, height / 2),
      velocity: createVector(random(-10, 10), random(-15, 5)),
      emoji: random(confettiEmojis)
    });
  }
}

function handleConfetti() {
  if (confettiTimer > 0) {
    textSize(30);
    textAlign(CENTER, CENTER);
    
    for (let p of confettiParticles) {
      text(p.emoji, p.position.x, p.position.y);
      // velocity vector+=gravity vector
      p.velocity.add(gravity);
       // pos vector+= velocity vector
      p.position.add(p.velocity);
    }
    confettiTimer--;
  } else if (confettiParticles.length > 0) {
    confettiParticles = []; 
  }
}
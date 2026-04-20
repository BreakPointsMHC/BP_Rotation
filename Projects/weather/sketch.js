import {
  FaceLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

// Global variables
let img;
let font;
let cloudOneX = 50;
let weather = "RAIN";
let currentTint, targetTint, currentOverlayColor, targetOverlayColor, currentMode;
let sunAmount = 0, targetSunAmount = 0, snowAmount = 0, targetSnowAmount = 0, rainAmount = 0, targetRainAmount = 0;
let faceLandmarker, capture, faceLandmarkerResult;
let smileL = 0, smileR = 0, eyeSquintL = 0, eyeSquintR = 0, squintStartTime = 0, jawOpen = 0, hasFace = false;
let blackCat, brownCat;
let blackCatSprites, brownCatSprites;
let blackCatAnis = {
  sleep: {
    row: 35,
    frames: 7,
  },
  run: {
    row: 8,
    frames: 6,
  },
  lick: {
    row: 37,
    frames: 9,
  },
  runAway: {
    row: 11,
    frames: 6,
  }
}

let brownCatAnis = {
  sleep: {
    row: 38,
    frames: 7,
  },
  spin: {
    row: 1,
    frames: 8,
  },
  scratch: {
    row: 40,
    frames: 11,
  },
  annoyed: {
    row: 41,
    frames: 2,
  }
}

// Sets up face land marker
const initializeFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });
};

function getBlendshape(blendshapes, name) {
  return blendshapes.find((b) => b.categoryName === name)?.score || 0;
}

const detectFace = () => {
  if (!faceLandmarker || !capture?.elt) return requestAnimationFrame(detectFace);
  const video = capture.elt;
  if (video.readyState < 2) return requestAnimationFrame(detectFace);

  faceLandmarkerResult = faceLandmarker.detectForVideo(video, performance.now());
  hasFace = faceLandmarkerResult.faceLandmarks?.length > 0;

  if (faceLandmarkerResult.faceBlendshapes?.length) {
    const cats = faceLandmarkerResult.faceBlendshapes[0].categories;
    smileL = getBlendshape(cats, "mouthSmileLeft");
    smileR = getBlendshape(cats, "mouthSmileRight");
    eyeSquintL = getBlendshape(cats, "eyeSquintLeft");
    eyeSquintR = getBlendshape(cats, "eyeSquintRight");
    jawOpen = getBlendshape(cats, "jawOpen");
  }
  requestAnimationFrame(detectFace);
};

function changeToSunny() {
  weather = "SUN";
  targetSnowAmount = 0; targetSunAmount = 1;   targetRainAmount = 0;
  targetTint = color(250, 247, 160);
  targetOverlayColor = color(240, 236, 175, 0.95);
  blackCat.changeAni("lick");
  brownCat.changeAni("scratch");
  
}

function changeToSnowy() {
  weather = "SNOWY";
  targetSnowAmount = 1; targetSunAmount = 0; targetRainAmount = 0;  
  targetTint = color(151, 162, 230);
  targetOverlayColor = color(204, 169, 201);
  blackCat.changeAni("run");
  brownCat.changeAni("spin");
}

function changeToRainy() {
  weather = "RAINY";
  targetSnowAmount = 0; targetSunAmount = 0; targetRainAmount = 1;
  targetTint = color(155, 209, 242);
  targetOverlayColor = color(143, 177, 186);
  blackCat.changeAni("runAway");
  brownCat.changeAni("annoyed");
}

function changeToCloudy() {
  weather = "CLOUDY";
  targetSnowAmount = 0; targetSunAmount = 0; targetRainAmount = 0;
  targetTint = color(255); // Pure white (no tint)
  targetOverlayColor = color(0, 0); // Transparent (no overlay)
  blackCat.changeAni("sleep");
  brownCat.changeAni("sleep");
}

function changeWeather() {
  if (smileL > 0.2 || smileR > 0.2) changeToSunny();
  else if (jawOpen > 0.3) changeToSnowy();
  else if (eyeSquintL > 0.3 && eyeSquintL < 0.9 && eyeSquintR > 0.3 && eyeSquintR < 0.9) {
    if (squintStartTime === 0) squintStartTime = millis();
    if (millis() - squintStartTime > 300) changeToRainy();
  } else {
    squintStartTime = 0;
    changeToCloudy();
  }
}

function preload() {
  img = loadImage('./pixelbg.jpg');
  font = loadFont('./gamefont.ttf');
  blackCatSprites = loadImage('cat_assets/whitecat.png');
  brownCatSprites = loadImage('cat_assets/blackcat.png');
}

function setup() {
  new Canvas();
  noSmooth();
  frameRate(80);
  capture = createCapture(VIDEO);
  capture.hide();

  currentTint = color(255); // Change from (255, 0)
  targetTint = color(255);  // Change from (255, 0)
  currentOverlayColor = color(0, 0); // No initial overlay color
  targetOverlayColor = color(0, 0);  // No initial overlay color
  currentMode = OVERLAY;

  initializeFaceLandmarker().then(() => {
    detectFace();
  });
  
  blackCat = new Sprite();
  blackCat.position = {x: width * 3.5/4 ,y: height * 3/4};
  blackCat.scale = 10;
  blackCat.spriteSheet = blackCatSprites;
  blackCat.anis.w = 32;
  blackCat.anis.h = 32;
  blackCat.addAnis(blackCatAnis);
  blackCat.changeAni("sleep");
  
  brownCat = new Sprite();
  brownCat.position = {x: width * 2.9/4 ,y: height * 3/4};
  brownCat.scale = 10;
  brownCat.spriteSheet = brownCatSprites;
  brownCat.anis.w = 32;
  brownCat.anis.h = 32;
  brownCat.addAnis(brownCatAnis);
  brownCat.changeAni("sleep");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (blackCat) {
    blackCat.x = width * 3.5/4;
    blackCat.y = height * 3/4;
  }
  if (brownCat) {
    brownCat.x = width * 2.9/4;
    brownCat.y = height * 3/4;
  }
}

function draw() {
  changeWeather();

  snowAmount = lerp(snowAmount, targetSnowAmount, 0.1);
  sunAmount = lerp(sunAmount, targetSunAmount, 0.08);
  rainAmount = lerp(rainAmount, targetRainAmount, 0.1);
  currentTint = lerpColor(currentTint, targetTint, 0.05);
  currentOverlayColor = lerpColor(currentOverlayColor, targetOverlayColor, 0.05);

  tint(currentTint);
  image(img, 0, 0, width, height);

  blendMode(currentMode);
  noStroke();
  fill(currentOverlayColor);
  rect(0, 0, width, height);
  
  blendMode(BLEND);

  
  if (sunAmount > 0.08) {
    noStroke();
    const x = width * 0.85; 
    const y = height * 0.23; 

    const outerD = min(width, height) * 0.21 * sunAmount;
    const innerD = min(width, height) * 0.11 * sunAmount;

    fill(255, 240, 150, 190 * sunAmount);
    circle(x, y, outerD);
    fill(250, 250, 172, 200 * sunAmount);
    circle(x, y, innerD);
}


  if (snowAmount > 0.1) {
    for (let i = 0; i < 280; i++) {
      fill(255, 255, 255, 220 * snowAmount);
      circle(random(width), random(height), random(min(150, min(width, height) * 0.0175)));
    }
  }

  if (rainAmount > 0.1) {
    strokeWeight(3);
    for (let i = 0; i < 200; i++) {
      stroke(255, 255, 255, 170 * rainAmount);
      const rx = random(width), ry = random(height);
      line(rx, ry, rx - 27, ry + 27);
    }
  }

  cloudOneX = frameCount % width;

  noTint();
  const camW = min(160, width * 0.35);
  const camH = camW * 0.75;
  // image(capture, 20, height - camH - 90, camW, camH);

  stroke(0);     
  strokeWeight(7);
  fill(255);
  textSize(33);
  textStyle(BOLD);
  textFont(font);
  textAlign(RIGHT, TOP);
  text("Angle your face towards the camera,", width - 30, 30);
  text(
    "Smile for Sunny, Open mouth for Snowy, Hold your Squint for Rainy!",
    width - 32,
    60
  );
  textStyle(NORMAL);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`smileL: ${smileL.toFixed(2)}`, 20, 30);
  text(`smileR: ${smileR.toFixed(2)}`, 20, 45);
  text(`eyeSquintL: ${eyeSquintL.toFixed(2)}`, 20, 60);
  text(`eyeSquintR: ${eyeSquintR.toFixed(2)}`, 20, 75);
  text(`jawOpen: ${jawOpen.toFixed(2)}`, 20, 90);
  text(`hasFace: ${hasFace ? "YES" : "NO"}`, 20, 105);
  
}

((
  functions = {
    preload,
    setup,
    draw,
    windowResized
  }
) => Object.assign(window, functions)).call();
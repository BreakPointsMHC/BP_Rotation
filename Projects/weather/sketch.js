import {
  FaceLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

// Global variables
let cloudOneX = 50;
let weather = "RAIN";
let bgColor, targetBgColor, mountColor, targetMountColor, grassColor, targetGrassColor;
let sunAmount = 0, targetSunAmount = 0, snowAmount = 0, targetSnowAmount = 0, rainAmount = 0, targetRainAmount = 0;
let faceLandmarker, capture, faceLandmarkerResult;
let smileL = 0, smileR = 0, eyeSquintL = 0, eyeSquintR = 0, squintStartTime = 0, jawOpen = 0, hasFace = false;

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
  targetBgColor = color(145, 221, 255);
  targetMountColor = color(145, 190, 182);
  targetGrassColor = color(84, 179, 100);
  targetSnowAmount = 0; targetSunAmount = 1; targetRainAmount = 0;
}

function changeToSnowy() {
  weather = "SNOWY";
  targetBgColor = color(190, 220, 235);
  targetMountColor = color(160, 175, 190);
  targetGrassColor = color(150, 185, 195);
  targetSnowAmount = 1; targetSunAmount = 0; targetRainAmount = 0;
}

function changeToCloudy() {
  weather = "CLOUDY";
  targetBgColor = color(10, 10, 40);
  targetMountColor = color(71, 74, 61);
  targetGrassColor = color(50, 76, 50);
  targetSnowAmount = 0; targetSunAmount = 0; targetRainAmount = 0;
}

function changeToRainy() {
  weather = "RAINY";
  targetBgColor = color(100, 145, 190);
  targetMountColor = color(60, 85, 115);
  targetGrassColor = color(45, 95, 115);
  targetSnowAmount = 0; targetSunAmount = 0; targetRainAmount = 1;
}

function changeWeather() {
  if (smileL > 0.2 && smileR > 0.2) changeToSunny();
  else if (jawOpen > 0.3) changeToSnowy();
  else if (eyeSquintL > 0.4 && eyeSquintL < 0.9 && eyeSquintR > 0.4 && eyeSquintR < 0.9) {
    if (squintStartTime === 0) squintStartTime = millis();
    if (millis() - squintStartTime > 400) changeToRainy();
  } else {
    squintStartTime = 0;
    changeToCloudy();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(40);
  capture = createCapture(VIDEO);
  capture.hide();

  bgColor = color(10, 10, 40);
  targetBgColor = color(10, 10, 40);
  mountColor = color(71, 74, 61);
  targetMountColor = color(71, 74, 61);
  grassColor = color(50, 76, 50);
  targetGrassColor = color(50, 76, 50);

  initializeFaceLandmarker().then(() => {
    detectFace();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  changeWeather();

  bgColor = lerpColor(bgColor, targetBgColor, 0.08);
  mountColor = lerpColor(mountColor, targetMountColor, 0.08);
  grassColor = lerpColor(grassColor, targetGrassColor, 0.08);
  snowAmount = lerp(snowAmount, targetSnowAmount, 0.1);
  sunAmount = lerp(sunAmount, targetSunAmount, 0.08);
  rainAmount = lerp(rainAmount, targetRainAmount, 0.1);

  background(bgColor);
  const groundY = height * 0.76;

  if (sunAmount > 0.08) {
    noStroke();
    const x = width * 0.55;
    const y = height * 0.4;
    const outerD = min(width, height) * 0.45 * sunAmount;
    const innerD = min(width, height) * 0.36 * sunAmount;
    fill(255, 240, 150, 180 * sunAmount);
    circle(x, y, outerD);
    fill(250, 250, 172, 240 * sunAmount);
    circle(x, y, innerD);
  }

  stroke(0);
  fill(lerpColor(mountColor, color(0), 0.25));
  triangle(width * 0.25, groundY, width * 0.7, height * 0.4, width, groundY);
  fill(lerpColor(mountColor, color(0), 0.5));
  triangle(width * 0.25, groundY, width * 0.7, height * 0.4, width * 0.4375, groundY);

  fill(lerpColor(mountColor, color(0), 0.11));
  triangle(-width * 0.15, groundY, width * 0.25, height * 0.3, width * 0.7, groundY);
  fill(lerpColor(mountColor, color(0), 0.35));
  triangle(-width * 0.15, groundY, width * 0.25, height * 0.3, width * 0.0001, groundY);

  fill(mountColor);
  triangle(width * 0.12, groundY, width * 0.5, height * 0.4, width * 0.9, groundY);
  fill(lerpColor(mountColor, color(0), 0.2));
  triangle(width * 0.12, groundY, width * 0.5, height * 0.4, width * 0.29, groundY);

  noStroke();
  fill(grassColor);
  rect(0, groundY, width, height - groundY);

  noStroke();
  fill(255, weather === "SUN" ? 160 : 170);
  ellipse(cloudOneX, height * 0.2, width * 0.24, height * 0.08);
  ellipse(cloudOneX - width * 0.12, height * 0.28, width * 0.18, height * 0.045);
  ellipse(cloudOneX + width * 0.08, height * 0.35, width * 0.14, height * 0.035);

  if (snowAmount > 0.1) {
    for (let i = 0; i < 100; i++) {
      fill(255, 255, 255, 220 * snowAmount);
      circle(random(width), random(height), random(min(15, min(width, height) * 0.02)));
    }
  }

  if (rainAmount > 0.1) {
    strokeWeight(2);
    for (let i = 0; i < 100; i++) {
      stroke(255, 255, 255, 120 * rainAmount);
      const rx = random(width), ry = random(height);
      line(rx, ry, rx - 30, ry + 30);
    }
  }

  cloudOneX = frameCount % width;
  
  const camW = min(160, width * 0.35);
  const camH = camW * 0.75;
  image(capture, width - camW - 20, height - camH - 20, camW, camH);

  // Description
  noStroke();
  fill(255);
  textSize(25);
  text("Slightly angle your face towards the camera,", 20, height - 60);
  text(
    "Then Smile for Sunny 🌞, Open mouth for Snowy ❄️, Squint for Rainy 💧!",
    20,
    height - 30,
  );
  textSize(15);
  text(`smileL: ${smileL.toFixed(2)}`, 20, 30);
  text(`smileR: ${smileR.toFixed(2)}`, 20, 45);
  text(`eyeSquintL: ${eyeSquintL.toFixed(2)}`, 20, 60);
  text(`eyeSquintR: ${eyeSquintR.toFixed(2)}`, 20, 75);
  text(`jawOpen: ${jawOpen.toFixed(2)}`, 20, 90);
  text(`hasFace: ${hasFace ? "YES" : "NO"}`, 20, 105);
}

/* EXPORTER: This maps the module-scoped functions to the global window
  so that the p5.js library can find them.
*/
((
  functions = {
    setup,
    draw,
    windowResized
  }
) => Object.assign(window, functions)).call();
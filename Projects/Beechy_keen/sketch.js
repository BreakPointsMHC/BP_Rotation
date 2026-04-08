// I AM HACKING SO MUCH TOGETHER :( 
// NOTE THAT -- I COPY THE VIDEO INTO A BUFFER
// THIS DEALS WITH DISPLAYING THE FLIPPED VIDEO AND COORDS BEING CORRECT
// EXCEPT FOR "LEFT" and "RIGHT" are reversed in FLIPPED mode

import {
  FaceDetector,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let BUTTERFLY_THRESHOLD = 2;
let SMOOTHIE_THRESHOLD = 3;
let CHAIR_THRESHOLD = 4;
let videoBuffer;
let canvasW = 1280;
let canvasH = 720;
let canvasAspectRatio = canvasH/canvasW;

let FLIPPED = true;
let faceDetector;
let detectionStarted = false;
let numFaces = 0;

let boundingBox = {x:-1, y:-1, w:-1, h:-1}; // in canvas coords
// 6 key points (right eye, left eye, nose tip, mouth center, right ear tragion, and left ear tragion).
let keypoints, keypointColors;
let keypointColorVals = ["red", "green", "blue", "yellow", "orange", "purple"];



let beachImage,sunglassesImage,smoothieImage,
    leftChairImage,rightChairImage,butterflyImage;
let scaleRatio;
let beachChairs = new Array();
let leftChair;

/*************** PRELOAD IMAGES *****************/
// Load the image and create a p5.Image object.
function preload() {
  beachImage = loadImage('assets/beach.jpg');
  sunglassesImage = loadImage('assets/sunglassesTree.png');
  // hatImage = loadImage('assets/hat.png');
  smoothieImage = loadImage('assets/smoothie.png');
  leftChairImage = loadImage('assets/leftChair.png');
  rightChairImage = loadImage('assets/rightChair.png');
  butterflyImage = loadImage('assets/butterfly.png');
}
/*************** END PRELOAD IMAGES *****************/

// Initialize the object detector
const initializefaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU"
    },    
  model: 'short',
  minDetectionConfidence: 0.4,
    runningMode: "IMAGE"
  });

  console.log( "faceDetector initialized" );
};

let video; // webcam input
function setup() {
  createCanvas( canvasW, canvasH );
  video = createCapture(VIDEO,{ flipped:FLIPPED },startDetecting);  
  video.hide();  
  
  // I have a buffer that I send my video to that will deal with mirroring
  // then mediapipe accesses the pixels from that buffer directly
  videoBuffer = createGraphics(width,height);
  initializefaceDetector();
  initKeypoints();
}


function initKeypoints()
{
  keypoints = new Array(6);
  keypointColors = new Array(6);
  for ( let i = 0; i < keypoints.length; i++ )
  {
    keypoints[i] = {x:-1,y:-1};
    keypointColors[i] = color( keypointColorVals[i])
  }
}

function draw() 
{
  
  //reload the browser every 5 minutes: (300,000 milliseconds) helps avoid memory leaks and issues with //tracking/sound 
setInterval(() => location.reload(), 5 * 60 * 1000);

  background(256);
  
  tint(255, 255);
  image(beachImage, 0,0,canvasW,canvasH,0,0,beachImage.width,beachImage.width*canvasAspectRatio);
  
  drawBeachItems();
  
  // copy the video feed to the buffer
  videoBuffer.image( video, 0, 0, canvasW, canvasH, 0, 0, video.width, video.width*canvasAspectRatio);

  
  tint(255, 100);
  
  // copy the buffer to the canvas; 
  // this will allow us to decorate the canvas without 
  // changing the vision processing on the video feed
  image(videoBuffer, 0, 0, canvasW, canvasH );
    
  tint(255, 255);
  if (detectionStarted)
    detectFaces();
}

function drawBeachItems()
{
  // if more than 3 faces, we get chairs!
  if ( numFaces >= CHAIR_THRESHOLD )
    {
      // if there aren't enough chairs
      if ( beachChairs.length < numFaces )
        {
          let chairsToAdd = numFaces - beachChairs.length;
          let leftChair = true;
          if ( beachChairs.length % 2 == 1 )
            leftChair = false;
          // for each new person, make a chair
          for ( let i = 0; i < chairsToAdd; i++ )
            {
              if ( leftChair )
                beachChairs.push( {x: random()*0.2*canvasW,
                               y: 0.5*canvasH + random()*0.3*canvasH});
              else
                 beachChairs.push( {x: 0.7*canvasW + random()*0.2*canvasW,
                               y: 0.5*canvasH + random()*0.3*canvasH});
              leftChair = !leftChair;
            }
        }
      
      // for each person draw the chair
      for ( let i = 0; i < numFaces; i ++ )
        {
          if ( i % 2 == 0 )
            image( leftChairImage, beachChairs[i].x, beachChairs[i].y, 100, 100*(leftChairImage.height/leftChairImage.width) );
          else
            image( rightChairImage, beachChairs[i].x, beachChairs[i].y, 100, 100*(rightChairImage.height/rightChairImage.width) );
        }
    }
  
}

function startDetecting()
{
  console.log("detectionStarted");
  detectionStarted = true;
}


function detectFaces() {
  if ( faceDetector && video.elt)
    {
     const detections = faceDetector.detect(videoBuffer.elt).detections;
      numFaces = detections.length;
      
      if ( detections.length > 0 )
    for (let detection of detections) {
      
      boundingBox.x = canvasW/videoBuffer.elt.width*detection.boundingBox.originX;
      boundingBox.y = canvasH/videoBuffer.elt.height*detection.boundingBox.originY;
      boundingBox.w = canvasW/videoBuffer.elt.width*detection.boundingBox.width;
      boundingBox.h = canvasH/videoBuffer.elt.height*detection.boundingBox.height;
      
//       fill(255,255,255,30);
//       rect( boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h );

      // 6 key points (right eye, left eye, nose tip, mouth center, right ear tragion, and left ear tragion).
      for ( let i = 0; i < keypoints.length; i++ )
      {
        keypoints[i].x = canvasW*detection.keypoints[i].x;
        keypoints[i].y = canvasH*detection.keypoints[i].y;
        
//         fill( keypointColors[i] );
//         ellipse( keypoints[i].x,keypoints[i].y, 20, 20);
      }      
      addAccessories();
    }
    }
}

// assumes boundingBox and keypoints are populated with
// canvas coords for current face
function addAccessories()
{
  
  // sunglasses
  scaleRatio = boundingBox.w/sunglassesImage.width;
  
  image( sunglassesImage, boundingBox.x, 
       keypoints[0].y-scaleRatio*sunglassesImage.height/2, 
        scaleRatio*sunglassesImage.width,scaleRatio*sunglassesImage.height);
  
  // smoothie
  if ( numFaces >= SMOOTHIE_THRESHOLD )
  {
    scaleRatio = boundingBox.h/smoothieImage.height;
    image( smoothieImage, keypoints[3].x - 0.75*scaleRatio*smoothieImage.width, keypoints[3].y,
          scaleRatio*smoothieImage.width,scaleRatio*smoothieImage.height);
  }  
  
  // butterfly
  if ( numFaces >= BUTTERFLY_THRESHOLD )
    {
  scaleRatio = boundingBox.h/butterflyImage.height;
  image( butterflyImage, keypoints[2].x, 
         boundingBox.y - scaleRatio*butterflyImage.height, 
         scaleRatio*butterflyImage.width,scaleRatio*butterflyImage.height);
  }
}

/*
Note that in index.html the script type is 'module' to allow the 'import' keyword:

<script src='sketch.js' type='module'></script>

Which means that the critical functions must be manually imported into the 'dom', as follows:
*/
((
  functions = {
    /* select required functions */
    preload,
    setup,
    draw,
    //mouseMoved,
    //mouseDragged,
    //mousePressed,
    //mouseReleased,
    //mouseClicked,
    //doubleClicked,
    //mouseWheel,
  }
) => Object.assign(window, functions)).call();
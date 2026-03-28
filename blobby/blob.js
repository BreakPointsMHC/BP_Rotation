//Amelia Henzel
/* This code is to generate a blob shape using perlin noise */

//Create blob object
function myBlob(r, pos, vel){
  this.pos = pos;
  this.r = r;
  var yoff = 0.0;
  this.vel = vel;

//Move the blob
  this.update = function() {
    this.pos.add(this.vel);
  }

//this function draws the blob with perlin noise
//inspired by:
// Daniel Shiffman
// https://thecodingtrain.com/challenges/36-blobby
this.show = function(){
  
//set the blob color based on size
let color1 = blobColors[(100 - this.r)/20];
let color2 = blobColors[((100 - this.r)/20) + 1];

push();
translate(this.pos.x, this.pos.y);
beginShape();
  
  //draw the gradient
  radialGradient(0, 0, 0, 0, 0, this.r, color1, color2);
  
  let xoff = 0;
  for (var a = 0; a < TWO_PI; a += 0.1) {
    let offset = map(noise(xoff, yoff), 0, 1, -10, 10);
    radius = this.r + offset;
    let x = radius * cos(a);
    let y = radius * sin(a);
    vertex(x, y);
    xoff += 0.1;  
  }
  endShape();
  
  //draw the circle shape
      fill(0, 0, 255, 30);
      ellipse(0, 0, this.r, this.r);
  
  pop();
  
  yoff += 0.01;
}

//this function is if the blob hits the edge of the screen. We should move it back on to the canvas
this.hitedge = function() {
    
    if (this.pos.x > width - this.r) {
      this.vel.x = this.vel.x * -1; 
    } else if (this.pos.x < this.r) {
      this.vel.x = this.vel.x * -1; 
    }
    if (this.pos.y > height - this.r) {
      this.vel.y = this.vel.y * -1; 
    } else if (this.pos.y < this.r) {
      this.vel.y = this.vel.y * -1; 
    }
  }
    

//this function breaks up the blob into an array containing two smaller blobs
this.breaks = function() {
    var newBlobs = [];
    newBlobs[0] = new myBlob(this.r - 20, createVector(this.pos.x - 40, this.pos.y + 40), createVector(this.vel.x * -1, this.vel.y * -1));
    newBlobs[1] = new myBlob(this.r - 20, createVector(this.pos.x + 40, this.pos.y - 40), createVector(this.vel.x , this.vel.y ));
    return newBlobs;
  }

}

//this function draws a gradient
function radialGradient(startX, startY, startR, endX, endY, endR, startC, endC){
  let gradient = drawingContext.createRadialGradient(startX, startY, startR, endX, endY, endR);
  gradient.addColorStop(0, startC);
  gradient.addColorStop(1, endC);
  
  drawingContext.fillStyle = gradient;
  
}
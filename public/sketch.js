const MODEL_URL = 'models/';
var canvas;
var vid;
var results;
var landmarks;
var btn;
var div;
var loaded = false;

var startButton;

var happy = false;
var smileLvl = 0;

function setup() {
  div = createDiv('<br>face-api models are loading...');

  canvas = createCanvas(270, 480).parent('myCanvas');
  // use an async callback to load in the models and run the getResults() function
  vid = createCapture(VIDEO, async () => {
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
    //div.elt.innerHTML = '<br>model loaded!';
    //Button zum Starten/Fullscreen-Aktivierung: Fullscreen kann nur durch Userinteraktion gestartet werden
    div.hide();
    startButton = createButton("fullscreen (allow camera first!)");
    startButton.class("button");
    startButton.mousePressed(startApp);
    
    loaded = true;
    getResults(); // init once
  }).parent('myCanvas');
  vid.size(640, 480);
  vid.hide();
}

async function getResults() {
  results = await faceapi.detectSingleFace(vid.elt).withFaceExpressions();
  getResults();
}

function draw() {
  translate(width/2, height/2);
  scale(-1, 1);
  background(0, 0, 255); //background(170, 153, 255);
  //imageMode(CENTER);
  //image(vid, 0, 0);
  let eyeX;
  let eyeY;

  if (loaded) {

    // results
    if (results) {

      // draw bounding box
      let x = results.detection.box.x;
      let y = results.detection.box.y;
      let w = results.detection.box.width;
      let h = results.detection.box.height;
      noFill();
      stroke(255);
      strokeWeight(2);
      //rect(x - width/2 -width/2, y - height/2, w, h);

      eyeX = x + w/2;
      eyeY = y + h/2;

      // expressions
      let expressions = [];
      for (var expr in results.expressions) {
        expressions.push([expr, results.expressions[expr]]);
      }

      // loop trough expressions except last one (because "asSortedArray")
      for (let i = 0; i < expressions.length - 1; i++) {
        let label = expressions[i][0];
        let confidence = expressions[i][1];
        
        if (label == "happy" && confidence > 0.8) {
          happy = true;
          //text(label, x / 2, y + h / 2);
        }else if (confidence > 0.8){
          happy = false;
          smileLvl = 0;
        }
      }
    }
  }
  face(eyeX, eyeY);
}

function face(addX, addY){
  let movement = 80;
  let moveX = 0;
  let moveY = 0;

  if(addX && addY){
    moveX = map(addX, 0, vid.width, -movement, movement);
    moveY = map(addY, 0, vid.height, -movement, movement);
  }

  ellipseMode(CENTER);
  fill(255);
  noStroke();
  ellipse(-50 + moveX, -50 + moveY, 15);
  ellipse(50 + moveX, -50 + moveY, 15);
  stroke(255);
  strokeWeight(7);
  noFill();
  beginShape();
  curveVertex(-65 + moveX - smileLvl, 50 + moveY - smileLvl * 2);
  curveVertex(-65 + moveX - smileLvl * .5, 50 + moveY - smileLvl);
  curveVertex(-25 + moveX, 50 + moveY);
  curveVertex(25 + moveX, 50 + moveY);
  curveVertex(65 + moveX + smileLvl * .5, 50 + moveY -smileLvl);
  curveVertex(65 + moveX + smileLvl, 50 + moveY - smileLvl * 2);
  endShape();
  resetMatrix();
  if(happy){
    if(smileLvl < 30){
      smileLvl += .7;
    }
  }
}

function startApp(){
  startButton.hide();
  canvas.show();
  canvas = resizeCanvas(displayWidth, displayHeight);
  canvas = fullscreen(true);
}
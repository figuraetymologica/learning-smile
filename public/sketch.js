const MODEL_URL = 'models/';
var canvas;
var vid;
var results;
var landmarks;
var btn;
var div;
var loaded = false;

var startButton;

var smileLvl = 0;
var startLearning = false;

var lastMoved = [];
var lastMovement = [];
var personGone;

var moveX = 0;
var moveY = 0;

function setup() {
  div = createDiv('<br>face-api models are loading...');

  canvas = createCanvas(270, 480).parent('myCanvas');
  // use an async callback to load in the models and run the getResults() function
  vid = createCapture(VIDEO, async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
    //await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    //div.elt.innerHTML = '<br>model loaded!';
    //Button zum Starten/Fullscreen-Aktivierung: Fullscreen kann nur durch Userinteraktion gestartet werden
    div.hide();
    startButton = createButton("interaction start!");
    startButton.class("button");
    startButton.mousePressed(startApp);
    
    loaded = true;
    getResults(); // init once
  }).parent('myCanvas');
  vid.size(960, 1280);
  vid.hide();

  for(let i = 0; i < 100; i++){
    lastMoved.push(false);
  }
}

//bro...

async function getResults() {
  results = await faceapi.detectSingleFace(vid.elt, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
  //results = await faceapi.detectSingleFace(vid.elt).withFaceExpressions();
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
  let happy;

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
    }else{
      happy = false;
    }
  }
  face(eyeX, eyeY, happy);
}

function face(addX, addY, happy){
  let movement = 160;
  let moveX = 0;
  let moveY = 0;

  if(addX && addY && startLearning){
    moveX = map(addX, 0, vid.width, -movement, movement);
    moveY = map(addY, 0, vid.height, -movement, movement);

    lastMovement = [moveX, moveY];
    lastMoved.shift();
    lastMoved.push(true);
  }else if(startLearning){
    lastMoved.shift();
    lastMoved.push(false);

    personGone = true;

    for(let i = 0; i < lastMoved.length; i++){
      if(lastMoved[i]){
        personGone = false;
      }
    }

    if(personGone){
      if(lastMovement[0] > 0){
        lastMovement[0] -= random(0, 3);
      }else if(lastMovement[0] < 0){
        lastMovement[0] += random(0, 3);;
      }

      if(lastMovement[1] > 0){
        lastMovement[1] -= random(0, 3);
      }else if(lastMovement[1] < 0){
        lastMovement[1] += random(0, 3);
      }
    }
    moveX = lastMovement[0];
    moveY = lastMovement[1];
  }


  ellipseMode(CENTER);
  fill(255);
  noStroke();
  ellipse(-100 + moveX, -100 + moveY, 30);
  ellipse(100 + moveX, -100 + moveY, 30);
  stroke(255);
  strokeWeight(14);
  noFill();
  beginShape();
  curveVertex(-130 + moveX - smileLvl, 100 + moveY - smileLvl * 2);
  curveVertex(-130 + moveX - smileLvl * .5, 100 + moveY - smileLvl);
  curveVertex(-50 + moveX, 100 + moveY);
  curveVertex(50 + moveX, 100 + moveY);
  curveVertex(130 + moveX + smileLvl * .5, 100 + moveY -smileLvl);
  curveVertex(130 + moveX + smileLvl, 100 + moveY - smileLvl * 2);
  endShape();
  resetMatrix();
  if(happy && startLearning){
    if(smileLvl < 60){
      smileLvl += 2.4;
    }
  }
}

function startApp(){
  startButton.hide();
  canvas.show();
  canvas = resizeCanvas(windowWidth, windowHeight);
  startLearning = true;
}
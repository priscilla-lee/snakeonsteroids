//food bytes & snakes
var foods = [];
var snakes = [];
var timeDelay = 30;
var numFoods = 25;

//dictionaries
var key = {
	enter: 13, 	
	space: 32, 
	shift: 16,
	play: 80,
	pause: 83,

	up: 38,	 down: 40,	right: 39,	left: 37,
	w:  87,  s:    83,	d:     68,	a:    65,
	y:  89,  h:    72,  j:     74,  g:    71
}

var randColors = ["yellowgreen", "yellow", "violet", "turquoise", "tomato", 
				  "teal", "steelblue", "skyblue", "salmon", "rebeccapurple", 
				  "purple", "palegreen", "paleturqoise", "orangered", 
				  "olivedrab", "orchid", "mediumslateblue", "magenta", "lightsalmon", 
				  "lightgreen", "hotpink", "gold", "darkturqoise", 
				  "darkorange", "aqua"];

var colors = {
	normal: "black",
	special: "green"
}

//math, scaling
canvas.height = screen.height*0.8;
canvas.width = screen.width*0.56;

document.querySelector("#hugcanvas").style.height = "" + canvas.height + "px";
document.querySelector("#hugcanvas").style.width = "" + canvas.width + "px";

var numXs = 75;
var numYs = 60;
var scaleX = canvas.width/numXs;
var scaleY = canvas.height/numYs;

//rendering
var ctx = canvas.getContext("2d");
ctx.beginPath();
ctx.strokeStyle = "rgb(50,50,50)";

//draw very first start image
var startImg = document.getElementById("start");
ctx.drawImage(startImg,0,0,canvas.width, canvas.height);


// for (var x = 0; x < numXs; x++) {
// 	for (var y = 0; y < numYs; y++) {
// 		ctx.lineWidth = 1;
// 		ctx.strokeRect(x*scaleX,y*scaleY, scaleX, scaleY);;
// 	}
// }

//draw a square, given a coordinate
function fillSquare(x, y, color) {	
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.fillRect(x*scaleX,y*scaleY, scaleX, scaleY);
	ctx.closePath();
}

function clearSquare(x, y) {	
	ctx.beginPath();
	ctx.clearRect(x*scaleX,y*scaleY, scaleX, scaleY);
	ctx.closePath();
}

//just for console log purposes
function printArray(array) {
	var string = "";
	for (var i = 0; i < array.length; i++) {
		string += "(" + array[i].x + "," + array[i].y + "),";
	}
	//console.log(string);
}

//snake object
function Snake(startHead, headColor, bodyColor) {
	this.body = [startHead, startHead, startHead];
	this.justAte = false;
	this.lastDir = "right";
	this.isDead = false;
	this.index = function() {
		for (var i = 0; i < snakes.length; i++) {
			if (snakes[i] == this) return i;
		} return -1;
	}
	this.drawEntire = function() {
		//draw head first
		fillSquare(this.body[0].x, this.body[0].y, headColor);
		//draw rest of body
		for (var i = 1; i < this.body.length; i++) {
			fillSquare(this.body[i].x, this.body[i].y, bodyColor);
		}
		printArray(this.body);
	}
	this.crashed = function() {
		var head = this.body[0];
		var x = head.x;
		var y = head.y;
		var hitWall = (x < 0 || x >= numXs || y < 0 || y >= numYs);

		var hitSnakeCount = 0;
		for (var i = 0; i < snakes.length; i++) {
				var sb = snakes[i].body;
				for (var b = 0; b < sb.length; b++) {
					if (x == sb[b].x && y == sb[b].y)
						hitSnakeCount++;
				}
		}
		return hitWall || (hitSnakeCount > 1);
	}
	this.explode = function() {
		//erase entire body
		for (var i = 0; i < this.body.length; i++) {
			clearSquare(this.body[i].x, this.body[i].y); //fillSquare(this.body[i].x, this.body[i].y, "rgba(255,255,255,0");
			moreFood(); //bodyColor);
		}
		//respawn new body food byte pieces
		this.isDead = true;

		//remove all pieces from body array
		this.body = [];

		document.querySelector("#controls" + this.index()).src = "failcontrols" + (this.index()+1)+ ".png";

		if (isGameOver()) endGame();
	}
	this.fooding = function() {
		//console.log("checking for fooding");
		var head = this.body[0];
		//console.log("printing foods");
		printArray(foods);
		if (isFood(head.x, head.y)) {
			this.justAte = true;
			//console.log("eating right now");
			var fIndex = whichFood(head.x, head.y);
			//document.body.style.backgroundColor = foods[fIndex].color;
			document.querySelector("#hugcanvas").style.backgroundColor = foods[fIndex].color;
			foods.splice(fIndex, 1);
			moreFood(); //color["normal"]);

			var score = document.querySelector("#score" + this.index());
			score.innerHTML = "" + (parseInt(score.innerHTML)+1);

			(new Audio("nom" + this.index() + ".wav")).play();

			//.innerHTML;
			//document.querySelector("#score" + this.index()).innerHTML = "" + (parseInt(s)+1);
		}
	}
	this.inertia = function() {
		if (this.isDead) return;
		if (this.justAte) this.moveGrow(this.lastDir);
		else this.moveShift(this.lastDir);
	}
	this.move = function(dir) {
		var lr = (dir=="left" && this.lastDir=="right");
		var rl = (dir=="right" && this.lastDir=="left");
		var ud = (dir=="up" && this.lastDir=="down");
		var du = (dir=="down" && this.lastDir=="up"); 

		if (lr || rl || ud || du) return;

		if (this.isDead) return;
		this.lastDir = dir;
		// if (this.justAte) this.moveGrow(dir);
		// else this.moveShift(dir);
	}
	this.moveGrow = function(dir) {
		var head = this.body[0];
		var push = {x:head.x, y:head.y};

		if (dir == "up") push.y--;
		else if (dir == "down") push.y++;
		else if (dir == "left") push.x--;
		else push.x++;

		this.body.unshift(push);

		fillSquare(push.x, push.y, headColor);
		fillSquare(head.x, head.y, bodyColor);

		if (this.crashed()) {
			(new Audio("splat.wav")).play();
			this.explode(); //gameOver();
		}

		this.justAte = false;
		this.fooding();
	}
	this.moveShift = function(dir) {
		var pop = this.body.pop();
		var head = this.body[0];

		var push = {x:head.x, y:head.y};

		if (dir == "up") push.y--;
		else if (dir == "down") push.y++;
		else if (dir == "left") push.x--;
		else push.x++;

		this.body.unshift(push);

		//render update
		clearSquare(pop.x, pop.y); //fillSquare(pop.x, pop.y, "rgba(255,255,255,0");
		fillSquare(push.x, push.y, headColor);
		fillSquare(head.x, head.y, bodyColor);

		//console.log(this.body);
		//console.log("printing body");
		printArray(this.body);

		if (this.crashed()) {
			//console.log("crashed");
			//pause();
			(new Audio("splat.wav")).play();
			this.explode(); //gameOver();
			//console.log(this.index());
		}
		// console.log(this.justAte + " justAte");
		// if (this.justAte())
		this.fooding();
	}
}

function Food(x, y, color){
	this.x = x;
	this.y = y;
	this.color = color;
	this.draw = function() {
		fillSquare(x,y,color);
	}
}


function isSnake(x, y) {
	//console.log(snakes);
	for (var i = 0; i < snakes.length; i++) {
		var sb = snakes[i].body;
		for (var b = 0; b < sb.length; b++) {
			if (x == sb[b].x && y == sb[b].y)
				return true;
		}
	} return false;
}

function isFood(x, y) {
	for (var i = 0; i < foods.length; i++) {
		if (x == foods[i].x && y == foods[i].y)
			return true;
	} return false;
}

function whichFood(x, y) {
	for (var i = 0; i < foods.length; i++) {
		if (x == foods[i].x && y == foods[i].y)
			return i;
	} return -1;
}

//game logic
var started = false;
var paused = true;
var loop = null;

function start() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//draw grid
	// ctx.lineWidth = 5;
	// ctx.strokeStyle = "rgb(50,50,50)";
	// ctx.strokeRect(0,0,canvas.width, canvas.height);
	
	snakes[0] = new Snake({x:0, y:9}, "green", "orange");
	snakes[0].drawEntire();

	snakes[1] = new Snake({x:0, y:25}, "blue", "red");
	snakes[1].drawEntire();
	
	snakes[2] = new Snake({x:0, y:41}, "purple", "pink");
	snakes[2].drawEntire();

	//console.log(snakes);

	started = true;

	for (var i = 0; i < numFoods; i++) {
		moreFood(); //color["normal"]);
	}
}

function play() {
	loop = setInterval(step, timeDelay);
	paused = false;
}

function pause() {
	clearInterval(loop);
	paused = true;
}

function isGameOver() {
	for (var i = 0; i < snakes.length; i++) {
		if (!snakes[i].isDead) return false;
	} return true;
}

function endGame() {
	setTimeout(function() {
		(new Audio("gameover.wav")).play();
		setTimeout(function() {(new Audio("fail.wav")).play();},1000);
		//setTimeout(function() { (new Audio("gameover.wav")).play(); }, 1750);
		// Make it rain
		createRain();
		pause();
	    var ctx=canvas.getContext("2d");
	    var img = document.getElementById("gameover");
	    ctx.drawImage(img,0,0,canvas.width, canvas.height);
	}, 1000);
}

function step() {
	for (var i = 0; i < snakes.length; i++) {
		snakes[i].inertia();
	}
}

function moreFood(){
	var randX = Math.floor(Math.random() * numXs);
	var randY = Math.floor(Math.random() * numYs);
	while (isFood(randX, randY) || isSnake(randX, randY)) {
		randX = Math.floor(Math.random() * numXs);
		randY = Math.floor(Math.random() * numYs);
	}

	var color = randColors[Math.floor(Math.random() * randColors.length)];
	var food = new Food(randX, randY, color);
	food.draw();
	foods.push(food);
	//console.log("food here " +randX + " " + randY);
}

window.onkeydown = function(e) {
	var k = e.keyCode;
	//console.log("KEY: "  + k);


	if ((k == key.space) && started && isGameOver()) {
		location.reload();
	}

	if (started && isGameOver()) return;
	
	if (!started) {
		if (k == key.space) {
			(new Audio("start.wav")).play();
			start();
			setTimeout(play, 1000); 

		}
	} else {
		if (k == key.up) snakes[1].move("up");
		else if (k == key.down) snakes[1].move("down"); 
		else if (k == key.right) snakes[1].move("right"); 
		else if (k == key.left) snakes[1].move("left");

		if (k == key.w) snakes[0].move("up");
		else if (k == key.s) snakes[0].move("down"); 
		else if (k == key.d) snakes[0].move("right"); 
		else if (k == key.a) snakes[0].move("left");

		if (k == key.y) snakes[2].move("up");
		else if (k == key.h) snakes[2].move("down"); 
		else if (k == key.j) snakes[2].move("right"); 
		else if (k == key.g) snakes[2].move("left");


		else if (k == key.shift) moreFood();//["normal"]);

		else if (k == key.space) {
			if (paused) play();
			else pause();
		}


		if (isGameOver()) endGame();
	}
}

//code that we stole from online, yayyyyyyy 
// number of drops created.
var nbDrop = 300; 

// function to generate a random number range.
function randRange( minNum, maxNum) {
  return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
}

// function to generate drops
function createRain() {
	for( i=1;i<nbDrop;i++) {
		var dropLeft = randRange(0,screen.width);
		var dropTop = randRange(-1000,screen.height);

		$('.rain').append('<div class="drop" id="drop'+i+'"></div>');
		$('#drop'+i).width(30).height(30);

		var rand = randRange(0,10);

		if (rand == 0) {
			$('#drop'+i).css({
				"background-image": "url(face1.png)",
				"background-size": "100%",
				"left": dropLeft,
				"top": dropTop
			});
		} else if (rand == 1) {
			$('#drop'+i).css({
				"background-image": "url(face2.png)",
				"background-size": "100%",
				"left": dropLeft,
				"top": dropTop
			});
		} else if (rand == 2) {
			$('#drop'+i).css({
				"background-image": "url(face3.png)",
				"background-size": "100%",
				"left": dropLeft,
				"top": dropTop
			});
		} else {
			var color = randColors[Math.floor(Math.random() * randColors.length)];
			$('#drop'+i).css({
				"background-color": color,
				"left": dropLeft,
				"top": dropTop,
				"width": 15,
				"height": 15
			});
		}
	}
}

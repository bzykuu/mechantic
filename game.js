var map = [];
map = [[3, 5, 7, 5, 4, 6],
       [2, 3, 6, 2, 4, 5],
       [8, 5, 1, 6, 1, 4],
       [1, 7, 8, 3, 7, 3],
       [9, 1, 4, 1, 3, 2],
       [3, 3, 2, 2, 5, 1]];
var map2 = [];
map2 = [[5, 3, 4],
		[3, 4, 7],
		[4, 7, 9]];
var step = 50; //refresh rate
var antCounter = 1;
var turnCounter = 1;
var backgroundPheromone = 5; //+waga do ruchu bez pheromonow
var directionsTable = ["N", "S", "W", "E"];
var player = 0;
var gameState;

var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};
Vector.prototype.sum = function(otherVector) {
		return new Vector(this.x + otherVector.x, this.y + otherVector.y);
};


var Ant = function(where) {
	this.position = where;
	this.anthill = [];
	this.energyMax = 1;
	this.energy = 1;
	this.vision = 1;
	this.carryMax = 1;
	this.carry = 0;
	this.goingBack = 0;
};
Ant.prototype.move = function(direction) {
	var dest = calcDirection(this.position, direction);
	if (cellExists(dest)) {
		this.clone(this, dest, direction);
		getCell(this.position).ants.pop();
	};
};
Ant.prototype.harvest = function() {
	if (getCell(this.position).sand > 0 && this.carry < this.carryMax) {
		getCell(this.position).sand -= 1;
		this.carry += 1;
	};
};
Ant.prototype.drop = function() {
		getCell(this.position).sand += 1;
		this.carry -= 1;
};
Ant.prototype.act = function() {
//	console.log("carry: " + this.carry + ", anthill.length: " + this.anthill.length);
	if (this.goingBack == 1) {
//		console.log("wraca pusta");
		if (this.checkIfAnthill()) {
			this.goingBack = 0;
		}
		else {
			this.move(this.anthill[this.anthill.length-1]);
		};
	}
	else if (this.carry == this.carryMax && !this.checkIfAnthill()) {
//		console.log("wraca i niesie");
		this.leaveTrail();
		this.move(this.anthill[this.anthill.length-1]);
	}
	else if (this.carry > 0 && this.checkIfAnthill()) {
//		console.log("drop");
		this.drop();
	}
	else if (this.carry < this.carryMax && !this.checkIfAnthill() && getCell(this.position).sand > 0) {
//		console.log("harvest");
		this.harvest();
	}
	else {
//		console.log("rndmove");
		if (this.checkIfAnthill()) {
			while (this.anthill.length)
				this.anthill.pop();
		};
		var direction;
		var dest;
		var possibleDirections = this.checkPheromones();
		for (var i = 0; i < directionsTable.length; i++) {
			dest = calcDirection(this.position, directionsTable[i]);
			if (getCell(dest) && getCell(dest).sand > 0) {
				possibleDirections[i] = 1000; //go eat
			};
			if (direction == "N" || direction == "E") {
				possibleDirections[i] += backgroundPheromone; //oddalaj sie od mrowiska
			};
		};
		do {
			direction = randomDirection(possibleDirections);
			dest = calcDirection(this.position, direction);
			if (direction == "N")
				possibleDirections[0] = -1;
			else if (direction == "S")
				possibleDirections[1] = -1;
			else if (direction == "W")
				possibleDirections[2] = -1;
			else if (direction == "E")
				possibleDirections[3] = -1;
		}
		while ((direction != "blindAlley") && (!cellExists(dest) || this.checkBacktrack(direction)));
		if (direction != "blindAlley")
			this.move(direction);
		else
			this.goingBack = 1; //zacznie wracac
	};
	this.look();
};
Ant.prototype.clone = function(oldAnt, where, direction) {
	if (cellExists(where)) {
		var newAnt = new Ant(where);
		if (oldAnt.anthill.length > 0) {
			oldAnt.anthill.forEach(function(dir) {
				newAnt.anthill.push(dir);
			})
		};
		if (newAnt.anthill.length > 0 && direction == newAnt.anthill[newAnt.anthill.length-1]) {
			newAnt.anthill.pop();
		}
		else {
			newAnt.anthill.push(reverseDirection(direction));
		};
		newAnt.energyMax = oldAnt.energyMax;
		newAnt.carryMax = oldAnt.carryMax;
		newAnt.vision = oldAnt.vision;
		newAnt.carry = oldAnt.carry;
		newAnt.goingBack = oldAnt.goingBack;
		getCell(where).acted.push(newAnt);
	};
};
Ant.prototype.look = function() {
	var vector = new Vector(0, 0);
	for (var k = 0; k <= this.vision; k++) {
		for (var i = -k; i <= k; i++) {
			for (var j = -i; j <= i; j++) {
				vector.x = j;
				vector.y = Math.abs(i) - Math.abs(j);
				var dest = this.position.sum(vector);
				if (dest.x >= 0 && dest.y >= 0) {
					if (!cellExists(dest) || getCell(dest).sand == null) {
						createNewCell(dest);
					};
				};
				vector.y = -Math.abs(i) + Math.abs(j);
				dest = this.position.sum(vector);
				if (dest.x >= 0 && dest.y >= 0) {
					if (!cellExists(dest) || getCell(dest).sand == null) {
						createNewCell(dest);
					};
				};
			};
		};
	};
};
Ant.prototype.checkIfAnthill = function() {
	var base = new Vector(0, 0);
	if (this.position.x == base.x && this.position.y == base.y) {
		return true;
	}
	else {
		return false;
	};
};
Ant.prototype.leaveTrail = function() {
	getCell(this.position).pheromone = Math.floor(this.anthill.length * 3 * Math.max(Math.log(this.anthill.length), 4));
};
Ant.prototype.checkPheromones = function() {
	var n = 0;
	if (getCell(this.position.sum(new Vector(0, 1))) && this.anthill[this.anthill.length-1] != "N")
		n = getCell(this.position.sum(new Vector(0, 1))).pheromone;
	var s = 0;
	if (getCell(this.position.sum(new Vector(0, -1))) && this.anthill[this.anthill.length-1] != "S")
		s = getCell(this.position.sum(new Vector(0, -1))).pheromone;
	var w = 0;
	if (getCell(this.position.sum(new Vector(-1, 0))) && this.anthill[this.anthill.length-1] != "W")
		w = getCell(this.position.sum(new Vector(-1, 0))).pheromone;
	var e = 0;
	if (getCell(this.position.sum(new Vector(1, 0))) && this.anthill[this.anthill.length-1] != "E")
		e = getCell(this.position.sum(new Vector(1, 0))).pheromone;
	if (n > 100) n = 100;
	if (s > 100) s = 100;
	if (w > 100) w = 100;
	if (e > 100) e = 100;
	var t = backgroundPheromone;
	return [n+t, s+t, w+t, e+t];
};
Ant.prototype.checkBacktrack = function(direction) {
	var vector = directionToVector(reverseDirection(direction));
	for (var i = this.anthill.length-1; i>=0; i--) {
		vector = vector.sum(directionToVector(this.anthill[i]));
		if (vector.x == 0 && vector.y == 0) {
			return true;
		};
	};
	return false;
};




var getCell = function(vector) {
	if (world1.map[vector.x] && world1.map[vector.x][vector.y])
		return world1.map[vector.x][vector.y];
};

var randomDirection = function([n, s, w, e]) {
	if (n == -1) n = 0;
	if (s == -1) s = 0;
	if (w == -1) w = 0;
	if (e == -1) e = 0;
	var i = Math.floor((n+s+w+e) * Math.random());
	var dir = "";
	if ((n+s+w+e) == 0) {
		dir = "blindAlley";
	}
	else if (i < n) {
		dir = "N";
	}
	else if (i < n+s) {
		dir = "S";
	}
	else if (i < n+s+w) {
		dir = "W";
	}
	else if (i < n+s+w+e) {
		dir = "E";
	};
	return dir;
};

var directionToVector = function(direction) {
	var vector = new Vector(0, 0);
	return calcDirection(vector, direction);
};

var calcDirection = function(vector, direction) {
	var x=0, y=0;
	switch (direction) {
		case "N": y += 1; break;
		case "S": y -= 1; break;
		case "W": x -= 1; break;
		case "E": x += 1; break;
	};
	var addVector = new Vector(x, y);
	return vector.sum(addVector);
};

var reverseDirection = function(direction) {
	var newDir = "";
	switch (direction) {
		case "N": newDir = "S"; break;
		case "S": newDir = "N"; break;
		case "W": newDir = "E"; break;
		case "E": newDir = "W"; break;
	};
	return newDir;
};

var cellOccupied = function(vector) {
	if (getCell(vector).ants.length == 0)
		return false;
	else
		return true;
}

var cellExists = function(vector) {
	if (getCell(vector)) 
		return true;
	else
		return false;
}

var createNewCell = function(vector, value) {
	var number = Math.floor(10*Math.random());
	if (typeof value == "number")
		number = value;
	if (!cellExists(vector)) {
		while (world1.mapMaxX <= vector.x) {
			world1.map.push([]);
			world1.mapMaxX ++;
		};
		for (var i = 0; i < vector.x; i++) {
			while (world1.map[i].length <= vector.y) {
				world1.map[i].push(new Cell(i, vector.y, null));
			};
		};
		world1.map[vector.x].push(new Cell(vector.x, vector.y, number));
		if (world1.map[vector.x].length > world1.mapMaxY)
			world1.mapMaxY = world1.map[vector.x].length;
	}
	else {
		getCell(vector).sand = number;
	};
};



var print = function (what, where) {
	var elem = document.getElementById(where);
	elem.innerHTML = what;
}

var drawMap = function(map, where) {
	var mapGrid = document.getElementById(where);
	mapGrid.innerHTML = "";
	mapGrid.parentNode.style.width = 30 * world1.mapMaxX + "px";
	mapGrid.parentNode.style.height = 24 * world1.mapMaxY - 1 + "px";
	for (var i = world1.mapMaxY-1; i >= 0; i--) {
		var row = document.createElement("ul");
        row.setAttribute("id", "row" + i);
        row.className = "mapRow";
		mapGrid.appendChild(row);
		for (var j = 0; j < world1.mapMaxX; j++){
			var cell = document.createElement("li");
	        cell.setAttribute("id", "cell(" + j + ", " + i + ")");
    	    cell.className = "mapCell";
    	    row.appendChild(cell);
    	    cell.style.width = "30px"//(100 / (world1.mapMaxX+1)) + "%";
    	    if (map[j][i] && map[j][i].pheromone > 0) {
	    	    cell.style.backgroundColor = "orange";
	    	};
    	    if (map[j][i] && map[j][i].ants.length > 0) {
    	    	cell.innerHTML = "*";
    	    }
    	    else if (map[j][i]){
	    	    cell.innerHTML = map[j][i].sand;
	    	}
	    	else {
	    		cell.innerHTML = "&nbsp;";
	    	};
		};
	};
};
var drawMapPhero = function(map, where) {
	var string = "";
	for (var i = world1.mapMaxY - 1; i >= 0; i--) {
		for (var j = 0; j < world1.mapMaxX; j++){
			if (map[j][i] && map[j][i] != null) {
				string += map[j][i].pheromone;
				string += " ";
			}
			else {
				string += "  ";
			};
		};
		string += "<br>";
	};
	print(string, where);
};

var Cell = function(x, y, value) {
	this.position = new Vector(x, y);
	this.sand = value;
	this.ants = [];
	this.acted = [];
	this.pheromone = 0;
};

var World = function(map) {
	this.map = [];
	for (var i = 0; i < map.length; i++) {
		this.map.push([]);
		for (var j = 0; j < map[i].length; j++) {
			this.map[i].push(new Cell(i, j, map[i][j]));
		};
	};
	this.mapMaxX = this.map.length;
	this.mapMaxY = this.map[0].length;
};
World.prototype.turn = function() {
	this.map.forEach(function(line) {
		line.forEach(function(cell) {
			if (cell.ants.length > 0) {
				for (var i = cell.ants.length-1; i >= 0; i--) {
					cell.ants[i].act();
					if (i == cell.ants.length-1) {
						cell.acted.push(cell.ants.pop());
					};
				};
			};
		});
	});
	this.map.forEach(function(line) {
		line.forEach(function(cell) {
			if (cell.acted.length > 0) {
				for (var i = cell.acted.length-1; i>=0 ; i--) {
					cell.ants.push(cell.acted.pop());
				};
			};
			if (cell.pheromone >= 1) {
				cell.pheromone -= 1;
			};
		});
	});
	drawMap(world1.map, "map1Grid");
//	drawMapPhero(world1.map, "temp3");


	document.getElementById("antCounter").innerHTML = "collected: " + world1.map[0][0].sand + "<br>ants: " + antCounter + "<br>sand/100turn: " + Math.floor(100*((world1.map[0][0].sand)+10*antCounter)/turnCounter);
	turnCounter++;
};

var clock = setInterval(function() {
	readGameState();
	timerChange();
	buttonClickability();
	if (gameState.player1Seat && gameState.player2Seat) {
		world1.turn();
	};
	if (player > 0) {
		changeGameState("player" + player + "Ants", antCounter);
	};
}, step);


world1 = new World(map2);

world1.map[0][0].ants.push(new Ant(new Vector(0, 0)));


var antButton = document.getElementById("antButton");
var butt = document.createElement("Button");
butt.appendChild(document.createTextNode("Ant!"));
butt.onclick = function() {
	if (world1.map[0][0].sand >= 10) {
		world1.map[0][0].ants.push(new Ant(new Vector(0, 0)));
		world1.map[0][0].ants[world1.map[0][0].ants.length-1].acted = 1;
		world1.map[0][0].sand -= 10;
		antCounter ++;
	};
};
antButton.appendChild(butt);

var leftButton = document.getElementById("leftButton");
var butt = document.createElement("Button");
butt.appendChild(document.createTextNode("Take a seat"));
butt.onclick = function() {
	if (gameState.player1Seat == false) {
		changeGameState("player1Seat", true);
		player = 1;
	}
	else {
		changeGameState("player1Seat", false);
		player = 0;
	};
};
leftButton.appendChild(butt);

var rightButton = document.getElementById("rightButton");
var butt = document.createElement("Button");
butt.appendChild(document.createTextNode("Take a seat"));
butt.onclick = function() {
	if (gameState.player2Seat == false) {
		changeGameState("player2Seat", true);
		player = 2;
	}
	else {
		changeGameState("player2Seat", false);
		player = 0;
	};
};
rightButton.appendChild(butt);

var resetButton = document.getElementById("resetButton");
var butt = document.createElement("Button");
butt.appendChild(document.createTextNode("Reset"));
butt.onclick = function() {
	resetGame();
};
resetButton.appendChild(butt);

var buttonClickability = function () {
	if (player == 1 || !gameState.player1Seat) {
		document.getElementById("leftButton").firstElementChild.disabled = false;
	}
	else {
		document.getElementById("leftButton").firstElementChild.disabled = true;
	};
	if (player == 2 || !gameState.player2Seat) {
		document.getElementById("rightButton").firstElementChild.disabled = false;
	}
	else {
		document.getElementById("rightButton").firstElementChild.disabled = true;
	};
	if (player > 0) {
		document.getElementById("antButton").firstElementChild.disabled = false;
	}
	else {
		document.getElementById("antButton").firstElementChild.disabled = true;
	};
};

var timer = document.getElementById("timer");
var timerText = document.createElement("p");
timerText.setAttribute("id", "timerText")
timer.appendChild(timerText);
timerText.innerHTML = "Waiting";

var timerChange = function() {
	if (gameState.player1Seat == true && gameState.player2Seat == true) {
		document.getElementById("timerText").innerHTML = "Go!";
	}
	else {
		document.getElementById("timerText").innerHTML = "Waiting";	
	}
};

var resetGame = function () {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			gameState = JSON.parse(this.responseText);
			world1 = new World(map2);
			world1.map[0][0].ants.push(new Ant(new Vector(0, 0)));
			turnCounter = 1;
			antCounter = 1;
			player = 0;
		};
	};
	req.open("GET", "gameStateOriginal.json", true);
	req.send();
};

var readGameState = function () {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
//			console.log(this.responseText);
			gameState = JSON.parse(this.responseText);
		};
	};
	req.open("GET", "gameState.json", true);
	req.send();
};
var readGameStateSync = function() {
	var req = new XMLHttpRequest();
	req.open("GET", "gameState.json", false);
	req.send();
	return JSON.parse(req.responseText);
};
gameState = readGameStateSync();

var changeGameState = function (attribute, value) {
	var state;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			state = JSON.parse(this.responseText);
			state[attribute] = value;
			var sendReq = new XMLHttpRequest();
			sendReq.open("POST", "gameState.json", true);
			sendReq.send(JSON.stringify(state));
		};
	};
	req.open("GET", "gameState.json", true);
	req.send();
};
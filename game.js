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
var antCounter = 1;
var turnCounter = 1;
var backgroundPheromone = 1; //+waga do ruchu bez pheromonow

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
	getCell(this.position).pheromone += (3 * this.anthill.length);
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
	var string = "";
	for (var i = world1.mapMaxY - 1; i >= 0; i--) {
		for (var j = 0; j < world1.mapMaxX; j++){
			if (map[j][i] && map[j][i].sand != null) {
				if (map[j][i].ants.length == 0)
					if (map[j][i].sand < 10) {
						string += map[j][i].sand;
						string += " ";
					}
					else
						string += "x ";
				else
					string += "* ";
			}
			else {
				string += "&nbsp;&nbsp;";
			};
		};
		string += "<br>";
	};
	print(string, where);
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
	drawMap(world1.map, "temp");
	drawMapPhero(world1.map, "temp3");

	var para = document.createElement("P");
	para.id = "temp2";
	tekst = document.getElementById("temp2");
	tekst.innerHTML = "collected: " + world1.map[0][0].sand + "<br>ants: " + antCounter + "<br>sand/100turn: " + Math.floor(100*((world1.map[0][0].sand)+10*antCounter)/turnCounter);
	turnCounter++;
};

var clock = setInterval(function() {
		world1.turn();
}, 200);


world1 = new World(map2);

world1.map[0][0].ants.push(new Ant(new Vector(0, 0)));


var para = document.createElement("P");
para.id = "temp";
para.appendChild(document.createTextNode("yyy"));
document.body.appendChild(para);
tekst = document.getElementById("temp");
tekst.innerHTML = "xxx";

var para = document.createElement("P");
para.id = "temp3";
para.appendChild(document.createTextNode("yyy"));
document.body.appendChild(para);
tekst = document.getElementById("temp3");
tekst.innerHTML = "xxx";

var para = document.createElement("P");
para.id = "temp2";
para.appendChild(document.createTextNode("collected: " + world1.map[0][0].sand));
document.body.appendChild(para);

var butt = document.createElement("Button");
butt.id = "tempButt";
butt.appendChild(document.createTextNode("Ant!"));
butt.onclick = function() {
	if (world1.map[0][0].sand >= 10) {
		world1.map[0][0].ants.push(new Ant(new Vector(0, 0)));
		world1.map[0][0].ants[world1.map[0][0].ants.length-1].acted = 1;
		world1.map[0][0].sand -= 10;
		antCounter ++;
	};
};
document.body.appendChild(butt);

var para = document.createElement("P");
para.id = "temp3";
para.appendChild(document.createTextNode("cost: 10"));
document.body.appendChild(para);
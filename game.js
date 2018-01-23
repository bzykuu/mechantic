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
	if (this.carry == this.carryMax && !this.checkIfAnthill()) {
//		console.log("wraca");
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
		do {
			direction = randomDirection();
			dest = calcDirection(this.position, direction);
		}
		while (!cellExists(dest));
		this.move(direction);
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

var getCell = function(vector) {
	if (world1.map[vector.x] && world1.map[vector.x][vector.y])
		return world1.map[vector.x][vector.y];
};

var randomDirection = function() {
	var i = Math.floor(4 * Math.random()); //4, czyli bez "w miejscu"
	var dir = "";
	switch (i) {
		case 0: dir = "N"; break;
		case 1: dir = "S"; break;
		case 2: dir = "W"; break;
		case 3: dir = "E"; break;
		case 4: break;
	};
	return dir;
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
		while (world1.map.length <= vector.x) {
			world1.map.push([]);
			world1.mapMaxX ++;
		};
		for (var i = 0; i < vector.x; i++) {
			while (world1.map[i].length < vector.y) {
				world1.map[i].push(new Cell(i, vector.y, null));
			};
		};
		world1.map[vector.x].push(new Cell(vector.x, vector.y, number));
		if (world1.map[vector.x].length > world1.mapMaxY)
			world1.mapMaxY = world1.map[vector.x].length;
	}
	else {
		getCell(dest).sand == value;
	};
};



var print = function (what, where) {
	var elem = document.getElementById(where);
	elem.innerHTML = what;
}

var drawMap = function(map) {
	var string = "";
	for (var i = world1.mapMaxY - 1; i >= 0; i--) {
		for (var j = 0; j < world1.mapMaxX; j++){
			if (map[j][i] && map[j][i] != null) {
				if (map[j][i].ants.length == 0)
					if (map[j][i].sand < 10)
						string += map[j][i].sand;
					else
						string += "x";
				else
					string += "*";
			}
			else {
				string += " ";
			};
		};
		string += "<br>";
	};
	print(string, "temp");
};

var Cell = function(x, y, value) {
	this.position = new Vector(x, y);
	this.sand = value;
	this.ants = [];
	this.acted = [];
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
		});
	});
	drawMap(world1.map);

	var para = document.createElement("P");
	para.id = "temp2";
	tekst = document.getElementById("temp2");
	tekst.innerHTML = "collected: " + world1.map[0][0].sand + "<br>ants: " + antCounter;
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
var map = [];
map = [[3, 5, 7, 5, 4, 6],
       [2, 3, 6, 2, 4, 5],
       [8, 5, 1, 6, 1, 4],
       [1, 7, 8, 3, 7, 3],
       [9, 1, 4, 1, 3, 2],
       [3, 3, 2, 2, 5, 1]];

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
	if (!cellOccupied(dest)) {
		var newAnt = getCell(dest).ant = new Ant(dest);
		newAnt.anthill = this.anthill;
		if (direction == newAnt.anthill[newAnt.anthill.length-1]) {
			newAnt.anthill.pop();
		}
		else {
			newAnt.anthill.push(reverseDirection(direction));
		};

		getCell(this.position).ant = null;
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

var getCell = function(vector) {
	return world1.map[vector.x][vector.y];
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

var cellOccupied = function(cell) {
	if (cell.ant == null)
		return false;
	else return true;
}

var print = function (what, where) {
	var elem = document.getElementById(where);
	elem.innerHTML = what;
}

var drawMap = function(map) {
	var string = "";
	for (var i = map.length - 1; i >= 0; i--) {
		for (var j = 0; j < map[i].length; j++){
			if (map[j][i].ant == null)
				string += map[j][i].sand;
			else
				string += "o";
		}
		string += "<br>";
	};
	print(string, "temp");
};

var Cell = function(x, y, value) {
	this.position = new Vector(x, y);
	this.sand = value;
	this.ant = null;
};

var World = function(map) {
	this.map = [];
	for (var i = 0; i < map.length; i++) {
		this.map.push([]);
		for (var j = 0; j < map[i].length; j++) {
			this.map[i].push(new Cell(i, j, map[i][j]));
		};
	};
};
world1 = new World(map);

world1.map[0][0].ant = new Ant(new Vector(0, 0));


var para = document.createElement("P");
para.id = "temp";
para.appendChild(document.createTextNode("yyy"));
document.body.appendChild(para);
tekst = document.getElementById("temp");
tekst.innerHTML = "xxx";

var para = document.createElement("P");
para.id = "temp2";
para.appendChild(document.createTextNode("Anthill is here: " + world1.map[0][0].ant.anthill));
document.body.appendChild(para);

world1.map[0][0].ant.move("N");

drawMap(world1.map);
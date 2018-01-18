var map = [];
map = [[3, 5, 7, 5, 4, 6],
       [2, 3, 6, 2, 4, 5],
       [8, 5, 1, 6, 1, 4],
       [1, 7, 8, 3, 7, 3],
       [9, 1, 4, 1, 3, 2],
       [3, 3, 2, 2, 5, 1]];

var Ant = function(x, y) {
	this.position = [x, y];
	this.anthill = [0, 0];
	this.energyMax = 1;
	this.energy = 1;
	this.vision = 1;
	this.carryMax  = 1;
	this.carry = 0;
	this.move = function(direction) {
		var dest = calcDirection(this.position, direction);
 		if (!cellOccupied(dest)) {
 			console.log("this: "this);
 			console.log("position: "world1.map[this.position[0]][this.position[1]]);
 			console.log("dest: "dest);
 			world1.map[dest[0], dest[1]].ant = world1.map[this.position[0]][this.position[1]].ant;
 			world1.map[this.position[0]][this.position[1]].ant = null;
 		};
	}
};

var calcDirection = function([x, y], direction) {
	switch (direction) {
		case "N": return [x, y+1];
		case "S": return [x, y-1];
		case "W": return [x-1, y];
		case "E": return [x+1, y];
	};
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
		for (var j = 0; j < map[i].length; j++) {
			if (map[i][j].ant == null) {
				string += map[i][j].sand;
			}
			else {
				string += "o";
			}
		};
		string += "<br>";
	};
	print(string, "temp");
};

var Cell = function(x, y, value) {
	this.position = [x, y];
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

world1.map[0][0].ant = new Ant(0, 0);


var para = document.createElement("P");
para.id = "temp";
para.appendChild(document.createTextNode("Anthill is here: " + world1.map[0][0].ant.anthill));
document.body.appendChild(para);

tekst = document.getElementById("temp");
tekst.innerHTML = "Anthill is here: " + world1.map[0][0].ant.anthill;

drawMap(world1.map);

var para = document.createElement("P");
para.id = "temp2";
para.appendChild(document.createTextNode("Anthill is here: " + world1.map[0][0].ant.anthill));
document.body.appendChild(para);

world1.map[0][0].ant.move("N");
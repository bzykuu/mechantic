var map = [];
map = [[3, 5, 7, 5, 4, 6],
       [2, 3, 6, 2, 4, 5],
       [8, 5, 1, 6, 1, 4],
       [1, 7, 8, 3, 7, 3],
       [9, 1, 4, 1, 3, 2],
       [3, 3, 2, 2, 5, 1]];
var Ant = function() {
  this.anthill = [0, 0];
  this.energyMax = 1;
  this.energy = 1;
  this.vision = 1;
  this.carryMax  = 1;
  this.carry = 0;
};


var print = function (what, where) {
	var elem = document.getElementById(where);
	elem.innerHTML = what;
}

var drawMap = function(map) {
	var string = "";
	for (var i = 0; i < map.length; i++) {
		for (var j = 0; j < map[i].length; j++) {
			string += map[i][j];
		};
		string += "<br>";
	};
	print(string, "temp");
};

var Cell = function(x, y, value) {
	this.x = x;
	this.y = y;
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

world1.map[0][0].ant = new Ant();


var para = document.createElement("P");
para.id = "temp";
para.appendChild(document.createTextNode("Anthill is here: " + world1.map[0][0].ant.anthill));
document.body.appendChild(para);

tekst = document.getElementById("temp");
tekst.innerHTML = "Anthill is here: " + world1.map[0][0].ant.anthill;

drawMap(map);
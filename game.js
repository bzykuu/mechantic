var map = [];
map = [[3, 5, 7, 5, 4, 6],
       [2, 3, 6, 2, 4, 5],
       [8, 5, 1, 6, 1, 4],
       [1, 7, 8, 3, 7, 3],
       [9, 1, 4, 1, 3, 2],
       [3, 3, 2, 2, 5, 1]];
var Ant = function(name) {
  this.name = name;
  this.position = [0, 0];
};
var ant0 = new Ant("0");

var para = document.createElement("P");
para.id = "temp";
var t = document.createTextNode("Ant0 is here: " + ant0.position);
para.appendChild(t);
document.body.appendChild(para);

tekst = document.getElementById("temp");

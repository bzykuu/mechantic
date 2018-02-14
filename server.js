var http = require("http");
var fs = require("fs");
var url = require('url');
var path = require('path');

var mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.ico': 'image/x-icon'
};

var resetGameState = function () {
	return JSON.parse(fs.readFileSync("./gameStateOriginal.json"));
};
var gameState = resetGameState();

var server = http.createServer(function(request, response) {
	var fileName;
	fileName = url.parse(request.url).pathname;
	if (request.method == "GET") {
		var ext  = path.parse(fileName).ext;
		response.writeHead(200, {"Content-Type": mimeType[ext]});
		if (fileName == "/favicon.ico") {
			response.end();
		}
		else if (fileName == "/gameStateOriginal.json") {
			gameState = resetGameState();
			response.write(JSON.stringify(gameState));
			response.end();
		}
		else if (fileName == "/gameState.json") {
			response.write(JSON.stringify(gameState));
			response.end();
		}
		else {
			fs.readFile("." + fileName, function(err, data) {
				response.write(data);
				response.end();
			});
		};
	}
	else if (request.method == "POST") {
		if (fileName == "/gameState.json") {
		    var body = [];
		    request.on('data', function(chunk) {
		        body.push(chunk);
		    });
		    request.on('end', function() {
		        body = Buffer.concat(body).toString();
			    gameState = JSON.parse(body);

				var ext  = path.parse(fileName).ext;
				response.writeHead(200, {"Content-Type": mimeType[ext]});
				response.end();
		    });
		};
	};
});
server.listen(8000);
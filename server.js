var http = require("http");
var fs = require("fs");
var url = require('url');
var path = require('path');

var mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css'
};

var server = http.createServer(function(request, response) {
	var fileName;
	fileName = url.parse(request.url).pathname;
	if (request.method == "GET") {
		fs.readFile("." + fileName, function(err, data) {
			var ext  = path.parse(fileName).ext;
			if (fileName == "/gameStateOriginal.json") {
				fs.writeFile("./gameState.json", data, function (err, file) {
					if (err) throw err;
				});
			};
			response.writeHead(200, {"Content-Type": mimeType[ext]});
			response.write(data);
			response.end();
		});
	}
	else if (request.method == "POST") {
		if (fileName == "/gameState.json") {
		    var body = [];
		    request.on('data', function(chunk) {
		        body.push(chunk);
		    });
		    request.on('end', function() {
		        body = Buffer.concat(body).toString();
			    bodyObject = JSON.parse(body);

			    fs.writeFile("." + fileName, body, function (err, file) {
					if (err) throw err;
				});
	
				var ext  = path.parse(fileName).ext;
				response.writeHead(200, {"Content-Type": mimeType[ext]});
				response.end();
		    });
		};
	};
});
server.listen(8000);
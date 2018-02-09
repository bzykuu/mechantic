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
	fileName = url.parse(request.url);
	fs.readFile("." + fileName.pathname, function(err, data) {
		var ext  = path.parse(fileName.pathname).ext;
		response.writeHead(200, {"Content-Type": mimeType[ext]});
		response.write(data);
		response.end();
	});
});
server.listen(8000);
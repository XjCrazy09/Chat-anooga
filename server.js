/*
        Ryan Villarreal
        Server.js - handles the server side functionality


        handling HTTP requests from clients - https://gist.github.com/rpflorence/701407
*/


var server = require('http').createServer(host),
                                io = require('socket.io').listen(server),
                                fs = require('fs'),
                                mime = require('mime'),
                                url = require('url'),
                                path = require('path'),
                                redis = require("redis");

var currentUsers = [];
var rooms = ['general']; 


// tell the server what socket to listen on - also creates a runnable script
server.listen(80);

// handle HTTP requests from clients
function host (request, response) {
        var pathname = url.parse(request.url).pathname;
        if (pathname == "/") pathname = "index.html";
        var filename = path.join(process.cwd(), pathname);

        fs.exists(filename, function(exists) {
                // throw 404 page if no file at requested path
                if (!exists) {
                        response.writeHead(404, {"Content-Type": "text/plain"});
                        response.write("404 Not Found");
                        response.end();
                        return;
                }

                // file found, get MIME type and send appropriately
                response.writeHead(200, {'Content-Type': mime.lookup(filename)});
                fs.createReadStream(filename, {
                        'flags': 'r',
                        'encoding': 'binary',
                        'mode': 0666,
                        'bufferSize': 4 * 1024
                }).addListener("data", function(chunk) {
                        response.write(chunk, 'binary');
                }).addListener("close",function() {
                        //console.log('Loaded file ' + filename + ' with filetype ' + mime.lookup(filename));
                        response.end();
                });
        });
};

// new connecting client
io.sockets.on('connection', function (socket) {

	io.sockets.emit('updateUsers', currentUsers);

	// put socket in general room
	socket.join('general');

	// attach function to each connected socket
}


function handle_message(socket) {
        socket.on('sendMessage', function(message){
                if(message !== '' && socket.user !== undefined) {
                        // broadcast to chat room
                        console.log('@' + socket.user + ' said: ' + message);
                        // more or less appending to the chat box
                        io.sockets.emit('add_message', '<strong>' + socket.user+ '</strong> - ' + message);

                };
        });
};

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
                                pipe = require('pipe'),
                                redis = require("redis");


// Eventually would like to work out the bugs of emoticons for text boxes
//var emoticons = require('emoticons');

// create an array for holding currently connected users
var live_users = new Array();

// rooms defined by Socket.io
var rooms = ['general']; 

// keeps the console from printing tons of random info
io.set('log level', 1);

// setup the redis server
var client = redis.createClient(); 

// error checking for redis server
client.on("error", function(err){
	console.log("Error " + err); 
});

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
                        response.end();
                });
        });
};


io.sockets.on('connection', function (socket){

	// on page update user list for a new connector
	io.sockets.emit('update_user_list', live_users);


	socket.join('general'); 

	// attach function to each connected socket
	handle_message(socket);
	handle_signup(socket);
	handle_login(socket);
});


// meesage recieved from client
function handle_message(socket){
	socket.on('send_message', function(message, room)
	{
		console.log('recieving a message on the server side');
		// broadcast message to users in general room
		console.log(socket.user + ' said ' + message);
		io.sockets.in('general').emit('add_message', '<strong> ' + socket.user + '</strong>  - ' + message);
		});
};


function handle_signup(socket)
{
	socket.on('signup', function(user, password)
	{
		if(user === '')
		{ // handle empty input
			console.log("Have to type something");
			return; 
		}
	client.hexists(user, 'username', function(err, res) 
	{
		if(res)
		{
			console.log("That name is already taken"); 
			return; 
	} else { // create new user
		client.hmset(user, 'username', user, 'password', password); 
		socket.user = user; 
		socket.password = password; 
		live_users.push(user); 
		io.sockets.emit('add_message', user + ' has logged in. '); 
		io.sockets.emit('update_user_list', live_users); 
		console.log('user: ' + user + ' has signed up.'); 
		}; 
	}); 
	}); 
};
	
// only difference is not pushing to the redis server, instead reading from
function handle_login(socket)
{
	socket.on('login', function(user, password)
	{
		if(user === '')
		{ //handles empty input
			console.log('You have to enter something into these boxes');
				return; 
		};

		if(live_users.indexOf(user) !== -1)
		{
			console.log('That username is already logged in');
				return; 
		};

		client.hexists(user, 'username', function(err, res)
		{
			if(res)
			{ // username exists and is not already logged in
				client.hgetall(user, function(err, res2)
				{
					if(res2.password === password)
					{
						socket.user = user; 
						socket.password = password;
						live_users.push(user);
						io.sockets.emit('add_message', user + ' has logged in.');
						io.sockets.emit('update_user_list', live_users); 


						console.log('User: ' + user + ' has logge din with password: ' + password);	
					}
					else 
					{ 	// password is incorrect
						console.log('Wrong password');
					};
				});
			}
			else
			{
				// username doesn't exist
				console.log('Username does not exist');
			};
		});
	});
};


// predefined event from the socket.io 
function handle_logout(socket)
{
	console.log('this is from the disconnect - server side');
	socket.on('disconnect', function(user)
	{
		// only roadcast if user was logged in
		if(socket.user)
		{
			io.sockets.emit('add_message', socket.user + ' has logged out', 'general'); 
			var i = live_users.indexOf(socket.user);
			live_users.splice(i,1); 
			io.sockets.emit('update_user_list', live_users); 

		};
	});
};

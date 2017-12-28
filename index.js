var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var nonPaired = [];
var first = [];
var second = [];

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');});


io.on('connection', function(socket){
	console.log('a user connected');
	var size = nonPaired.length;
	nonPaired[size] = socket.id;
	console.log(nonPaired);
	io.to(socket.id).emit('msg', "connected to server, wait for pairing with an opponent.");

	if (nonPaired.length >= 2){
		var firstSize = first.length;
		first[firstSize] = nonPaired[0];
		second[firstSize] = nonPaired[1];
		nonPaired.splice(0, 1);
		nonPaired.splice(0, 1);
		
		var msg = "Paired... you can now start talking";
		io.to(first[firstSize]).emit('msg', msg);
		io.to(second[firstSize]).emit('msg', msg);
		
	}


	socket.on('disconnect', function(){
		console.log('user disconnected');
		
		if (nonPaired.indexOf(socket.id) != -1){
			nonPaired.splice(nonPaired.indexOf(socket.id));
		}
		else if (first.indexOf(socket.id) != -1){
			var index = first.indexOf(socket.id);
			first.splice(index, 1);
			
			nonPaired[nonPaired.length] = second[index];
			
			io.to(second[index]).emit('chat message', "your pair left, waiting for a new one...");
			second.splice(index, 1);
			
			
		}
		else {
			var index = second.indexOf(socket.id);
			second.splice(index, 1);
			
			nonPaired[nonPaired.length] = first[index];
			
			io.to(first[index]).emit('chat message', "your pair left, waiting for a new one...");
			first.splice(index, 1);
			
		}
		
		

	});
	socket.on('msg', function(msg){
		if (msg == ""){
			return;
		}
		//console.log('message: ' + msg);
		
		if (nonPaired.indexOf(socket.id) == -1){
			io.to(socket.id).emit('msg', "you: " + msg);
			if (first.indexOf(socket.id) != -1){
				var index = first.indexOf(socket.id);
				io.to(second[index]).emit('msg', "opponent: " + msg);
			}
			else {
				var index = second.indexOf(socket.id);
				io.to(first[index]).emit('msg', "opponent: " + msg);

			}
		}
	});
	socket.on('log', function (msg0){
		console.log(msg0);
	});
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
    

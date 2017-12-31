var express = require('express'),
app 		= express(),
http 		= require('http').Server(app),
config		= require('./config/config'),
io 			= require('socket.io')(http);


//those relevant to pair chat
var nonPaired = [];
var first = [];
var second = [];


//relevant to rooms
var rooms = [];


app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
	socket.emit('connected');


	//a connection estabilished on the pair chat page
	socket.on('pairConnection', function(){
		console.log('an user connected to the pair chat...');
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
	});
	
	//a connection estabilished on the pick room page
	socket.on('roomPickConnection', function(){
		//inform the new client of the existing rooms
		//(for loop here later)
		socket.emit('populate', "asd" , '10');
	});
	//a connection estabilished on the room page
	socket.on('roomConnection', function(roomId){
		socket.emit('roomInfo', 'tässä sit joskus jotain?');
	});
	
	

	//someone disconnected
	socket.on('disconnect', function(){
		console.log('user disconnected');
		
		if (nonPaired.indexOf(socket.id) != -1){
			nonPaired.splice(nonPaired.indexOf(socket.id));
		}
		else if (first.indexOf(socket.id) != -1){
			var index = first.indexOf(socket.id);
			first.splice(index, 1);
			
			nonPaired[nonPaired.length] = second[index];
			
			io.to(second[index]).emit('msg', "your pair left, waiting for a new one...");
			second.splice(index, 1);
			
			
		}
		else if (second.indexOf(socket.id) != -1){
			var index = second.indexOf(socket.id);
			second.splice(index, 1);
			
			nonPaired[nonPaired.length] = first[index];
			
			io.to(first[index]).emit('msg', "your pair left, waiting for a new one...");
			first.splice(index, 1);
			
		}
		
		

	});
	//a pair sent something
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
	
	
	//create a new room to the rooms list, todo
	socket.on('create', function(name){
		console.log("created room with name " + name);
	});

	
	
	socket.on('log', function (msg0){
		console.log(msg0);
	});
});


http.listen(config.port, function(){
  console.log(`Listening on port ${config.port}`);
});
    

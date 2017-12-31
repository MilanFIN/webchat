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
var rooms = []; //meant to include objects with the attributes: name, participants[socketids here]


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
		console.log('emitting room info');
		for(i = 0; i < rooms.length; i++){
			socket.emit('populate', rooms[i].name, rooms[i].participants.length);
		}
		//socket.emit('populate', "asd" , '10');
	});
	
	//a connection estabilished on the room page
	socket.on('roomConnection', function(roomId){
		if (roomId < rooms.length){
			rooms[roomId].participants.push(socket.id);
			for (i = 0; i < rooms[roomId].participants.length; i++){
				//relay room name and size to everyone in the room, as it may have changed
				io.to(rooms[roomId].participants[i]).emit('roomInfo', rooms[roomId].name, rooms[roomId].participants.length);
			}
			console.log('joined room... ' + roomId)
		}
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
		
		else {
			//finally must check if the user was in any rooms
			var found = false;
			var personNumber = 0;
			for (i = 0; i < rooms.length; i++){

				if (rooms[i].participants.indexOf(socket.id) != -1){
					//found in some room, remove from there
					personNumber = rooms[i].participants.indexOf(socket.id) + 1;
					rooms[i].participants.splice(rooms[i].participants.indexOf(socket.id), 1);
					found = true;
				}
					
				if (found){
					//tell others that the person left

					for (j = 0; j < rooms[i].participants.length; j++){
						io.to(rooms[i].participants[j]).emit('roomMsg', personNumber + ' left the room. Others numbers might have changed');
						io.to(rooms[i].participants[j]).emit('roomInfo', rooms[i].name, rooms[i].participants.length);

					}
					if (rooms[i].participants.length == 0){
						rooms.splice(i, 1);
					}
					break;
				}

			}
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
	
	
	//create a new room to the rooms list
	//only requirement is that the name does not already exist
	socket.on('create', function(name){
		var found = false;
		for (i = 0; i < rooms.length; i++){
			if (rooms[i].name == name){
				found = true;
			}
		}
		if (!found){
			var newRoom = {};
			newRoom.name = name;
			newRoom.participants = [];
			rooms.push(newRoom);
			socket.emit('moveToRoom', rooms.length-1);

		}
	});
	//requested a specific room, check if available, and tell the index
	socket.on('requestRoom', function(name){
		console.log('room requested ' + name);

		for (i = 0; i < rooms.length; i++){
			if (rooms[i].name == name){
				socket.emit('moveToRoom', i);
				break;
			}
		}
	});
	
	//message to others on the room
	socket.on('roomMsg', function(msg, roomName){
		for (i = 0; i < rooms.length; i++){
			if (rooms[i].name == roomName){

				for (j = 0; j < rooms[i].participants.length; j++){

					if (rooms[i].participants[j] == socket.id){
						socket.emit('roomMsg', 'you: ' + msg)
					}
					else {
						var personNumber = j+1;
						io.to(rooms[i].participants[j]).emit('roomMsg', personNumber + ": " + msg);
					}
				}
				break;
			}
		}
	});
	
	
	
	socket.on('log', function (msg0){
		console.log(msg0);
	});
});


http.listen(config.port, function(){
  console.log(`Listening on port ${config.port}`);
});
    

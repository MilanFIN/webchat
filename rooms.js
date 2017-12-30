var express = require('express'),
app 		= express(),
http 		= require('http').Server(app),
config		= require('./config/config'),
io 			= require('socket.io')(http);



var rooms = [];


app.use(express.static(__dirname + '/public'));


//app.get('/', function(req, res){
//res.sendFile(__dirname + '/pick.html');});


io.on('connection', function(socket){
	console.log('a user connected');
	
	socket.emit('connected');
	socket.emit('populate', "asd" , '10');


	socket.on('disconnect', function(){
		console.log('user disconnected');
		
		
		
		

	});
	socket.on('create', function(name){
		console.log("created room with name " + name);
	});
	socket.on('log', function (msg0){
		console.log(msg0);
	});
	
	socket.on('requestRoom', function(roomId){
		//asetetaan tämä tietty client id:n mukaiseen huoneeseen..-joskus
		socket.emit('roomInfo', 'tässä sit joskus jotain?');
		console.log('asd');
	});
});


http.listen(config.port, function(){
  console.log(`Listening on port ${config.port}`);
});
    

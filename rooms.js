var express = require('express'),
app 		= express(),
http 		= require('http').Server(app),
config		= require('./config/config'),
io 			= require('socket.io')(http);




app.use(express.static(__dirname + '/public'));


//app.get('/', function(req, res){
//res.sendFile(__dirname + '/pick.html');});


io.on('connection', function(socket){
	console.log('a user connected');
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
});


http.listen(config.port, function(){
  console.log(`Listening on port ${config.port}`);
});
    

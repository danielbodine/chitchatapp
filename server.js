var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var games_list = ['football', 'sports', 'computer science'];
router.use(express.static(path.resolve(__dirname, 'public')));

//on a new socket connection
io.on('connection', function (socket) {

  console.log("a user connected!!");
  socket.on('get_rooms', function(){
       
        var room_object = {};

        for(var i = 0; i < games_list.length; i++){
          room_object['name'+i] = games_list[i];
        }
        io.sockets.emit('get_rooms', room_object);
               console.log("done room");
  });
  
  //on a user joining a room
  socket.on('subscribe', function(user) { 
        console.log('joining room', user.join_room);
        socket.join(user.join_room);
        socket.user_language = user.lang;
        socket.group_name = user.join_room;
  });
  
  //on a user disconnect
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  //on a new chat message
  socket.on('chat message', function(message){
    console.log('message: ' + message.msg);
    message.sent_lang = message.lang;
    message.lang = socket.user_language;
    io.sockets.in(socket.group_name).emit('chat message', message);
  });
  
  //exits socket (user) from room
  socket.on('unsubscribe', function(){
    socket.leave(socket.group_name);
    console.log('leaving room: ' + socket.group_name);
    socket.emit('room_left');

  });
  
  //when a new group is created by a user
  socket.on('new_group', function(new_group_name){

    if(games_list.indexOf(new_group_name.toString().toLowerCase()) < 0){
      console.log('created: ' + new_group_name);
      games_list.push(new_group_name.toString().toLowerCase());
      io.sockets.emit('new_group', new_group_name.toString().toLowerCase());
    }
    else {
       io.sockets.emit('new_group', new_group_name.toString().toLowerCase());
    }
  });

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
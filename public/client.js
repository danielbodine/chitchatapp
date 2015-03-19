    var room; 
    var new_group = false;
    
    //when the page is ready
    $(document).ready(function(){
    

      

      
      //chat area is hidden until a room is joined  
      $("#chat").hide();
      
      //creates a new socket connection
      var socket = io.connect();

      //requests and receives the list of rooms from the server
      socket.emit('get_rooms');
      socket.on('get_rooms', function(list_rooms){
        $('#room_buttons').empty();
        for (var key in list_rooms) {
          $('#room_buttons').append("<button class='submit_name'>" + list_rooms[key] + "</button>");    
        }
        return;
      });
      
      //creates a button to join each room
      $("#room_buttons").on('click', '.submit_name', buttonClick);
      
      //function to create a new group
      $("#new_group_button").click(function() {
        socket.emit('new_group', $('#new_group_name').val());
        socket.on('new_group', function(new_name){
        $("#lobby").hide();
        $("#chat").show();

        socket.emit('subscribe', {join_room:$('#new_group_name').val(), lang:$('#lang').val()});
        
        $("#chat_header").text("Room: " + $('#new_group_name').val());
        return;
        });
      });
      

      //user leaves room, brough back to lobby
      socket.on('room_left', function(){
        socket.emit('get_rooms');
        $('#lobby').show();
        $('#chat').hide();
        $('#new_group_name').val('');
        $('#messages').empty();
      });
      
             //submits the chat message and creates the message JSON
      $('form').submit(function(){
          socket.emit('chat message', {msg: $('#m').val(), name: $('#user_name').val(), lang:$('#lang').val(), sent_lang:$('#lang').val()});
          
          $('#m').val('');
          return false;
        });
        
        // user requests to leave room, sends message to server
        $('#back_button').click(function() {
          socket.emit('unsubscribe', room);
          return false; 
        });

        
        //on receiving a new chat message
        socket.on('chat message', function(message){
            var trans_mes = "";
            if($('#lang').val() != message.sent_lang){
              trans_mes= translate(message);
            }
            else {
              $('#messages').append($('<li>').text(message.name + ": " +message.msg));
            }
        });
      //function called when a join chat button is clicked
      function buttonClick(){
        $("#lobby").hide();
        $("#chat").show();

        //this line is what asks the server to connect and share a socket with the client
        room = $(this).text();

        socket.emit('subscribe', {join_room:$(this).text(), lang:$('#lang').val()});
        
        $("#chat_header").text("Room: " + $(this).text());
        return; 
      };
    });
    
        
    //function that takes a message and translates it to the language of the client
      function translate(message){  
        var xhr = new XMLHttpRequest();
        var params = message.msg.replace(/ /g,"+");
        xhr.open("GET","https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150316T144206Z.fc55aecea1189d31.6839b8194e4de85f0a470523ed2ef041a4010c37&lang=" + $('#lang').val() +"&text="+params, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)  { 
            var serverResponse = xhr.response;
            var obj = JSON.parse(serverResponse);
            $('#messages').append($('<li>').text(message.name + ": " + obj.text));
            }
        };
        xhr.send();
      };
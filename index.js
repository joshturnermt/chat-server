var express = require('express')();
var server = require('http').Server(express);
var io = require('socket.io')(server);


var usernames = {};

function get_key(v)
{
  var val = '';

  for(var key in usernames)
  {
    if(usernames[key] == v)
    val = key;
  }
  return val;
}


io.on('connection', socket => {

  socket.on('adduser', function(username){
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = socket.id;


    // echo globally (all clients) that a person has connected
    // socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected: ' + socket.id);

    // update the list of users in chat, client-side
    //io.sockets.emit('updateusers', usernames);

    // console.log(usernames);
    //console.log(get_key(socket.id));
  });

  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];

  });


    socket.on('sendMessage', function (data) {
        // console.log(data);
        const responseSocket = io.sockets.connected[usernames[data.to]];
        // console.log('condtion true ', usernames[data['to']], " data[to]", data['to']);
        io.to(usernames[data['to']]).emit('receiveMessagec', data);
    });

  socket.on('sendIsActive', function(user_id) {

    const user = usernames[user_id];
    const socketId = socket.id;
    let response;

    if(user) {
      // User is active
      response = {is_active: true};
    } else {
      // User is not active
      response = {is_active: false};
    }

    // console.log(response);

    const responseSocket = io.sockets.connected[socketId];
    if(responseSocket) {
      responseSocket.emit('receiveIsActive', response);
    }

  });


  console.log(socket.id + ' - Some client connected')
})

const port = process.env.PORT || 3031

server.listen(port, ()=> {
  console.log('listening on: ', port)
})

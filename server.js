/*
    server
    Required node packages: express, redis, socket.io
*/
const PORT = 8087;
const HOST = '127.0.0.1'
//const HOST = '192.168.99.200'

var express = require('express'),
    http = require('http'), 
    server = http.createServer(app);

var app = express();

var nicknames = {}, users = {}, socketid ='',socketsrv ='';

const redis = require('redis');
const client = redis.createClient();
log('info', 'connected to redis server');

const io = require('socket.io');

if (!module.parent) {
    server.listen(PORT, HOST);
     const socket2  = io.listen(server,{ log: false });

    socket2.on('connection', function(socket) {
        const subscribe = redis.createClient()
        subscribe.subscribe('realtime');

        subscribe.on("message", function(channel, message) {
            socket.send(message);
            //log('msg', "received from channel #" + channel + " : " + message);
        });

        socket.on('message', function(msg) {
           // log('debug', msg);
        });

        socket.on('disconnect', function() {
            //log('warn', 'disconnecting from redis');
            subscribe.quit();
        });

        // ---------- ANTRIAN SERVER 
        socket.on('user message', function (msg) {
    socket.broadcast.emit('user message', {user: socket.nickname, message: msg.message});
  });


  socket.on('checkin', function (incoming) {
        users[incoming.id] = socket.id;
        //console.log('socketid', socket.id);
        //console.log('incoming', users[incoming.phonenumber]);
  });


  // send to user id [ mulai teller ]
  socket.on('mulai', function (msg) {
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('mulai_antrian',{pos: msg.pos, noloket: msg.noloket, loket: msg.loket});
    //console.log('mulai',{pos: msg.pos, noloket: msg.noloket, loket: msg.loket, id:socketsrv});
  });

// send to user id [ stop/istirahat teller ]
  socket.on('stop', function (msg) {
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('stop_antrian',{pos: msg.pos, noloket: msg.noloket, loket: msg.loket});
    //console.log('mulai',{pos: msg.pos, noloket: msg.noloket, loket: msg.loket, id:socketsrv});
  });


  socket.on('mulai_callback', function (msg) {
    socketid = users[msg.id];
    socket2.sockets.socket(socketid).emit('mulai_teller',{pos: msg.pos,status:msg.status,noantrian:msg.noantrian,count:msg.count,total:msg.total,layan:msg.layan});
    //console.log('mulai_callback',{pos: msg.pos, status: msg.status, noantrian: msg.noantrian,count:msg.count,total:msg.total,layan:msg.layan, id:socketid});
  });

  socket.on('stop_callback', function (msg) {
    socketid = users[msg.id];
    socket2.sockets.socket(socketid).emit('stop_teller',{status:"0"});
    //console.log('mulai_callback',{pos: msg.pos, status: msg.status, noantrian: msg.noantrian,count:msg.count,total:msg.total,layan:msg.layan, id:socketid});
  });


  socket.on('lewat', function (msg) {
    socketid = users[msg.noloket];
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('lewat_antrian', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
    socket2.sockets.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos}); //send to all termasuk sender
     //console.log('debug lewat', msg.pos+ " - "+msg.count);
  });


  socket.on('panggil', function (msg) {
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('panggil_antrian', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
    socket2.sockets.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos,noloket: msg.noloket, loket: msg.loket}); //send to all termasuk sender
    //console.log('debug panggil', socketid+ " - "+msg.loket+ " - "+msg.antrian+ " - "+msg.noloket);
  });

  // send to user id
  socket.on('panggilClient', function (msg) {
    socketid = users[msg.id];
    socket2.sockets.socket(socketid).emit('message_client',{panggil:msg.message});
    //console.log('debug',socket.id);
  });

  socket.on('broadcast_end_panggil', function (msg) {
     socketid = users[msg.id];
     socket2.sockets.socket(socketid).emit('broadcast_panggil_id',{noantrian: msg.noantrian,status:msg.status,jml:msg.jml});
     socket.broadcast.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos, count: msg.count, total: msg.total}); //send to all termasuk sender
     //console.log('broadcast_end_panggil', msg.pos+ " - "+msg.count);
     //console.log('broadcast_end_panggil_id', msg.noantrian);
  });


  socket.on('layan', function (msg) {
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('layan_antrian', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
    //socket2.sockets.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos,noloket: msg.noloket, loket: msg.loket}); //send to all termasuk sender
    //console.log('LAYAN ', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
  });

  socket.on('siap', function (msg) {
    socketsrv = users[msg.server];
    socket2.sockets.socket(socketsrv).emit('siap_antrian', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
    //socket2.sockets.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos,noloket: msg.noloket, loket: msg.loket}); //send to all termasuk sender
    //console.log('LAYAN ', {pos: msg.pos,noloket: msg.noloket, loket: msg.loket});
  });

   socket.on('siaplayan', function (msg) {
     socketid = users[msg.id];
     socket2.sockets.socket(socketid).emit('siap_layan_antrian',{status:msg.status,layan: true});
     //console.log('siap_layan_antrian', 'oke');
  });


  socket.on('okelayan', function (msg) {
    socketid = users[msg.id];
    socket2.sockets.socket(socketid).emit('okelayan_antrian', {loket:msg.id,noantrian: msg.noantrian,countlayan: msg.countlayan,status:"2"});
    //socket2.sockets.emit('broadcast_panggil', {antrian:  msg.antrian, pos: msg.pos,noloket: msg.noloket, loket: msg.loket}); //send to all termasuk sender
    //console.log('okelayan', {noantrian: msg.noantrian});
  });

   socket.on('q_satu', function (msg) {
    socket2.sockets.emit('q_satu', {jml: msg}); //send to all termasuk sender
  });

  socket.on('nickname', function (nick, fn) {
    nickname = nick.nickname;
    if (nicknames[nickname]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nickname] = socket.nickname = nickname;
      socket.broadcast.emit('announcement', {user: nickname, action: 'connected'});
      socket2.emit('nicknames', nicknames);
    }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', {user: socket.nickname, action: 'disconected'});
    socket.broadcast.emit('nicknames', nicknames);
  });
    });
}

function log(type, msg) {

    var color   = '\u001b[0m',
        reset = '\u001b[0m';

    switch(type) {
        case "info":
            color = '\u001b[36m';
            break;
        case "warn":
            color = '\u001b[33m';
            break;
        case "error":
            color = '\u001b[31m';
            break;
        case "msg":
            color = '\u001b[34m';
            break;
        default:
            color = '\u001b[0m'
    }

    console.log(color + '   ' + type + '  - ' + reset + msg);
}

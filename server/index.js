const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let canvas = Array(1000).fill().map(() => Array(1000).fill(null));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.emit('initialCanvas', canvas);

  socket.on('draw', (data) => {
    canvas = data;
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});

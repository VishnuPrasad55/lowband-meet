const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e6 });

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {}; // roomId -> Set of socket ids

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join-room', (roomId) => {
    currentRoom = roomId;
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = new Set();

    const existingPeers = Array.from(rooms[roomId]);
    rooms[roomId].add(socket.id);

    socket.emit('existing-peers', existingPeers);
    socket.to(roomId).emit('new-peer', socket.id);
  });

  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('draw', (payload) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('draw', payload);
    }
  });

  socket.on('clear-board', () => {
    if (currentRoom) socket.to(currentRoom).emit('clear-board');
  });

  socket.on('screen-share-started', () => {
    if (currentRoom) socket.to(currentRoom).emit('peer-screen-share-started', socket.id);
  });

  socket.on('screen-share-stopped', () => {
    if (currentRoom) socket.to(currentRoom).emit('peer-screen-share-stopped', socket.id);
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(socket.id);
      socket.to(currentRoom).emit('peer-left', socket.id);
      if (rooms[currentRoom].size === 0) delete rooms[currentRoom];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Low-bandwidth call server running on port ${PORT}`));

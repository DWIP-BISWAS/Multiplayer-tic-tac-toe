const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

let players = [];
let games = {};

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    players.push({ id: socket.id, username });
    if (players.length % 2 === 0) {
      const player1 = players[players.length - 2];
      const player2 = players[players.length - 1];
      const roomId = `game-${player1.id}-${player2.id}`;
      games[roomId] = { board: Array(9).fill(null), turn: player1.id };

      io.to(player1.id).emit('start', { opponent: player2.username, roomId });
      io.to(player2.id).emit('start', { opponent: player1.username, roomId });
      socket.join(roomId);
      io.to(player1.id).join(roomId);
    }
  });

  socket.on('move', ({ roomId, index }) => {
    const game = games[roomId];
    if (game && game.turn === socket.id) {
      game.board[index] = game.turn === players[0].id ? 'X' : 'O';
      game.turn = game.turn === players[0].id ? players[1].id : players[0].id;
      io.to(roomId).emit('update', game.board);
    }
  });

  socket.on('chat', ({ roomId, message }) => {
    io.to(roomId).emit('chat', {
      username: players.find((p) => p.id === socket.id).username,
      message,
    });
  });

  socket.on('disconnect', () => {
    players = players.filter((p) => p.id !== socket.id);
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

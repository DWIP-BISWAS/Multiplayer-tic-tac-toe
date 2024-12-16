const socket = io();

let roomId = null;

// Login screen
document.getElementById('join-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  if (username) {
    socket.emit('join', username);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
  }
});

// Game start
socket.on('start', ({ opponent, roomId: gameRoom }) => {
  roomId = gameRoom;
  document.getElementById('opponent-name').innerText = opponent;
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => {
      socket.emit('move', { roomId, index: i });
    });
    board.appendChild(cell);
  }
});

// Game update
socket.on('update', (board) => {
  document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.innerText = board[index] || '';
  });
});

// Chat
document.getElementById('send-btn').addEventListener('click', () => {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message) {
    socket.emit('chat', { roomId, message });
    input.value = '';
  }
});

socket.on('chat', ({ username, message }) => {
  const chatBox = document.getElementById('chat-box');
  const chatMessage = document.createElement('p');
  chatMessage.innerText = `${username}: ${message}`;
  chatBox.appendChild(chatMessage);
});

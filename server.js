const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;

function checkWinner() {
  const winConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let condition of winConditions) {
    const [a,b,c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes('') ? null : 'draw';
}

io.on('connection', (socket) => {
  socket.emit('updateBoard', { board, currentPlayer });

  socket.on('makeMove', ({ index }) => {
    if (!gameActive || board[index] !== '') return;

    board[index] = currentPlayer;
    const winner = checkWinner();

    if (winner) {
      gameActive = false;
      io.emit('updateBoard', { board, currentPlayer });
      io.emit('gameOver', { winner: winner === 'draw' ? null : winner });
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      io.emit('updateBoard', { board, currentPlayer });
    }
  });

  socket.on('restartGame', () => {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    io.emit('restart', { board, currentPlayer });
  });
});
const PORT = process.env.PORT || 3001;


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

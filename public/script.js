const socket = io();

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart');

let currentPlayer = 'X';
let gameActive = true;

function handleCellClick(e) {
  const cell = e.target;
  const index = cell.getAttribute('data-cell-index');

  if (cell.textContent !== '' || !gameActive) return;

  socket.emit('makeMove', { index });
}

function updateBoard(board) {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.toggle('taken', board[index] !== '');
  });
}

function handleGameOver(winner) {
  gameActive = false;
  statusText.textContent = winner ? `${winner} wins!` : "It's a draw!";
}

function resetGame() {
  socket.emit('restartGame');
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', resetGame);

socket.on('updateBoard', ({ board, currentPlayer: cp }) => {
  updateBoard(board);
  currentPlayer = cp;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
});

socket.on('gameOver', ({ winner }) => {
  handleGameOver(winner);
});

socket.on('restart', ({ board, currentPlayer: cp }) => {
  gameActive = true;
  updateBoard(board);
  currentPlayer = cp;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
});

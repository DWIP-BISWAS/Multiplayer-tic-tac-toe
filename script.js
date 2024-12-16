const usernameInput = document.getElementById("username");
const startBtn = document.getElementById("start-btn");
const gameBoard = document.getElementById("game-board");
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");

let username = "";
let gameId = null;
let currentPlayer = "";
let boardState = Array(9).fill("");

startBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name.");
    return;
  }

  startBtn.disabled = true;
  usernameInput.disabled = true;

  const response = await fetch("/.netlify/functions/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", username }),
  });

  const data = await response.json();
  gameId = data.gameId;
  currentPlayer = data.currentPlayer;

  gameBoard.style.display = "block";
  statusElement.textContent = `Game started! You are ${currentPlayer}. Waiting for opponent...`;

  checkGameUpdates();
});

function createBoard() {
  boardElement.innerHTML = "";
  boardState.forEach((cell, index) => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");
    if (cell) {
      cellElement.textContent = cell;
      cellElement.classList.add("taken");
    } else {
      cellElement.addEventListener("click", () => makeMove(index));
    }
    boardElement.appendChild(cellElement);
  });
}

async function makeMove(index) {
  const response = await fetch("/.netlify/functions/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "move", gameId, username, index }),
  });

  const data = await response.json();
  if (data.error) {
    alert(data.error);
  } else {
    boardState = data.boardState;
    createBoard();
    if (data.winner) {
      statusElement.textContent = data.winner === "draw" ? "It's a draw!" : `${data.winner} wins!`;
      resetBtn.style.display = "block";
    } else {
      statusElement.textContent = `Your move, ${data.currentTurn}.`;
    }
  }
}

async function checkGameUpdates() {
  const response = await fetch(`/functions/game?gameId=${gameId}`);
  const data = await response.json();
  boardState = data.boardState;
  createBoard();
  if (data.winner) {
    statusElement.textContent = data.winner === "draw" ? "It's a draw!" : `${data.winner} wins!`;
    resetBtn.style.display = "block";
  } else {
    statusElement.textContent = `Your move, ${data.currentTurn}.`;
    setTimeout(checkGameUpdates, 1000);
  }
                          }
    

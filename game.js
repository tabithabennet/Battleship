let board = [];
let ships = [];
let shipHits = {};
let guesses = 20;

document.addEventListener("DOMContentLoaded", () => {
  fetch("battleship.json")
    .then(res => res.json())
    .then(data => {
      ships = data.ships;
      initializeGame();
    });
});

function initializeGame() {
  board = [];
  shipHits = {};
  guesses = 20;
  document.getElementById("message").textContent = "";
  document.getElementById("guesses").textContent = `Guesses left: ${guesses}`;
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  // Build board and squares
  for (let row = 0; row < 6; row++) {
    board[row] = [];
    for (let col = 0; col < 6; col++) {
      board[row][col] = { hasShip: null, hit: false };
      const div = document.createElement("div");
      div.className = "square";
      div.dataset.row = row;
      div.dataset.col = col;
      div.addEventListener("click", handleClick);
      boardEl.appendChild(div);
    }
  }

  placeShips();
}

function placeShips() {
  ships.forEach(ship => {
    const { name, orientation, size, coords } = ship;
    const [col, row] = coords.map(c => c - 1);
    shipHits[name] = { total: size, hitCount: 0 };

    for (let i = 0; i < size; i++) {
      const r = orientation === "vertical" ? row + i : row;
      const c = orientation === "horizontal" ? col + i : col;
      board[r][c].hasShip = name;
    }
  });
}

function handleClick(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  const square = board[row][col];

  if (square.hit || guesses <= 0) return;

  square.hit = true;
  guesses--;

  if (square.hasShip) {
    const shipName = square.hasShip;
    shipHits[shipName].hitCount++;

    e.target.classList.add("hit");

    if (shipHits[shipName].hitCount === shipHits[shipName].total) {
      displayMessage("Sunk!");
    } else {
      displayMessage("Hit!");
    }
  } else {
    e.target.classList.add("miss");
    displayMessage("Miss!");
  }

  document.getElementById("guesses").textContent = `Guesses left: ${guesses}`;

  if (guesses === 0 || allShipsSunk()) {
    endGame();
  }
}

function allShipsSunk() {
  return ships.every(ship => {
    const hits = shipHits[ship.name];
    return hits.hitCount === hits.total;
  });
}

function endGame() {
  const boardSquares = document.querySelectorAll(".square");
  boardSquares.forEach(square => {
    const r = parseInt(square.dataset.row);
    const c = parseInt(square.dataset.col);
    if (board[r][c].hasShip && !square.classList.contains("hit")) {
      square.classList.add("ship");
    }
  });

  const message = allShipsSunk() ? "You win!" : "Game over!";
  displayMessage(message);
}

function displayMessage(msg) {
  document.getElementById("message").textContent = msg;
}

function resetGame() {
  initializeGame();
}

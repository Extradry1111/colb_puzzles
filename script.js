// ==================== DOM ELEMENTS ====================
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const puzzle = document.getElementById('puzzle');
const galleryImgs = document.querySelectorAll('.gallery-img');
const shuffleBtn = document.getElementById('shuffle-btn');
const backBtn = document.getElementById('back-btn');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const beeContainer = document.getElementById('bee-container');
const gameBeeContainer = document.getElementById('game-bee-container');
const honeyDrips = document.getElementById('honey-drips');

// ==================== GAME STATE ====================
let board = [];
let emptyIndex = 8;
let currentImage = '';
let timer = 0;
let moves = 0;
let timerInterval = null;
let isPlaying = false;

// ==================== INITIALIZE ====================
function init() {
  createNonstopBees();
  createGameBees();
  createHoneyDrips();
  attachGalleryListeners();
  attachButtonListeners();
}

// NONSTOP BEES - They keep spawning and flying across
function createNonstopBees() {
  // Create initial bees
  for (let i = 0; i < 8; i++) {
    spawnBee(i * 2);
  }
  
  // Spawn new bee every 4 seconds
  setInterval(() => {
    spawnBee(0);
  }, 4000);
}

function spawnBee(delay) {
  setTimeout(() => {
    const bee = document.createElement('div');
    bee.className = 'bee';
    bee.textContent = '🐝';
    bee.style.top = Math.random() * 80 + 10 + '%';
    bee.style.left = '-50px';
    bee.style.animationDuration = (10 + Math.random() * 8) + 's';
    beeContainer.appendChild(bee);
    
    // Remove bee after animation completes
    setTimeout(() => {
      bee.remove();
    }, parseFloat(bee.style.animationDuration) * 1000);
  }, delay * 1000);
}

function createGameBees() {
  // Create initial bees for game screen
  for (let i = 0; i < 10; i++) {
    spawnGameBee(i * 2);
  }
  
  // Spawn new bee every 5 seconds
  setInterval(() => {
    if (!menu.classList.contains('hidden')) return; // Only spawn if in game
    spawnGameBee(0);
  }, 5000);
}

function spawnGameBee(delay) {
  setTimeout(() => {
    const bee = document.createElement('div');
    bee.className = 'game-bee';
    bee.textContent = '🐝';
    bee.style.top = Math.random() * 80 + 10 + '%';
    bee.style.left = '-100px';
    bee.style.animationDuration = (12 + Math.random() * 10) + 's';
    gameBeeContainer.appendChild(bee);
    
    // Remove bee after animation completes
    setTimeout(() => {
      bee.remove();
    }, parseFloat(bee.style.animationDuration) * 1000);
  }, delay * 1000);
}

function createHoneyDrips() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const drip = document.createElement('div');
      drip.className = 'honey-drip';
      drip.style.left = Math.random() * 100 + '%';
      drip.style.animationDelay = Math.random() * 3 + 's';
      honeyDrips.appendChild(drip);
    }, i * 300);
  }
}

// ==================== GALLERY & MENU ====================
function attachGalleryListeners() {
  galleryImgs.forEach((img) => {
    img.addEventListener('click', () => {
      currentImage = img.src;
      startNewGame();
    });
  });
}

function startNewGame() {
  menu.classList.add('hidden');
  game.classList.remove('hidden');
  
  board = [...Array(8).keys()];
  board.push(null);
  shuffleBoard();
  emptyIndex = board.indexOf(null);
  moves = 0;
  timer = 0;
  winMessage.classList.add('hidden');
  
  renderBoard();
  startTimer();
  isPlaying = true;
}

// ==================== BOARD MANAGEMENT ====================
function shuffleBoard() {
  for (let i = 0; i < 200; i++) {
    const validMoves = getValidMoves();
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    [board[randomMove], board[emptyIndex]] = [board[emptyIndex], board[randomMove]];
    emptyIndex = randomMove;
  }
}

function getValidMoves() {
  const moves = [];
  const row = Math.floor(emptyIndex / 3);
  const col = emptyIndex % 3;

  if (row > 0) moves.push(emptyIndex - 3);
  if (row < 2) moves.push(emptyIndex + 3);
  if (col > 0) moves.push(emptyIndex - 1);
  if (col < 2) moves.push(emptyIndex + 1);

  return moves;
}

function renderBoard() {
  puzzle.innerHTML = '';
  board.forEach((tileIndex, position) => {
    const tile = document.createElement('div');
    tile.className = 'tile';

    if (tileIndex !== null) {
      const row = Math.floor(tileIndex / 3);
      const col = tileIndex % 3;
      tile.style.backgroundImage = `url('${currentImage}')`;
      tile.style.backgroundPosition = `-${col * 120}px -${row * 120}px`;
      tile.style.backgroundSize = '360px 360px';
      tile.addEventListener('click', () => moveTile(position));
    } else {
      tile.classList.add('empty');
    }

    puzzle.appendChild(tile);
  });
}

function moveTile(position) {
  if (!isPlaying) return;

  const validMoves = getValidMoves();
  if (validMoves.includes(position) && isAdjacent(position, emptyIndex)) {
    [board[position], board[emptyIndex]] = [board[emptyIndex], board[position]];
    emptyIndex = position;
    moves++;
    movesEl.textContent = moves;
    renderBoard();

    if (checkWin()) {
      endGame();
    }
  }
}

function isAdjacent(pos1, pos2) {
  const row1 = Math.floor(pos1 / 3);
  const col1 = pos1 % 3;
  const row2 = Math.floor(pos2 / 3);
  const col2 = pos2 % 3;

  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function checkWin() {
  for (let i = 0; i < 8; i++) {
    if (board[i] !== i) return false;
  }
  return true;
}

// ==================== TIMER ====================
function startTimer() {
  clearInterval(timerInterval);
  timer = 0;
  timerEl.textContent = '0s';

  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer + 's';
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ==================== WIN STATE ====================
function endGame() {
  isPlaying = false;
  stopTimer();
  document.getElementById('final-time').textContent = timer + 's';
  document.getElementById('final-moves').textContent = moves;
  winMessage.classList.remove('hidden');
}

// ==================== BUTTONS ====================
function attachButtonListeners() {
  shuffleBtn.addEventListener('click', () => {
    if (isPlaying) {
      board = [...Array(8).keys()];
      board.push(null);
      shuffleBoard();
      emptyIndex = board.indexOf(null);
      moves = 0;
      movesEl.textContent = '0';
      renderBoard();
    }
  });

  backBtn.addEventListener('click', backToMenu);
}

function backToMenu() {
  stopTimer();
  isPlaying = false;
  menu.classList.remove('hidden');
  game.classList.add('hidden');
  puzzle.innerHTML = '';
  winMessage.classList.add('hidden');
}

// ==================== START ====================
window.backToMenu = backToMenu;
init();
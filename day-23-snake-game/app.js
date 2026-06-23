/**
 * Day 23: Neon Snake Game
 * Core JavaScript Logic
 */

// Game States
const STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
};

// Canvas Settings
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE; // 400 / 20 = 20 tiles

// Game State Variables
let gameState = STATES.START;
let snake = [];
let direction = { dx: 1, dy: 0 };
let nextDirection = { dx: 1, dy: 0 };
let directionQueue = [];
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let soundMuted = false;

// Game Loop / Speed Control Variables
let lastTime = 0;
let speedAccumulator = 0;
const BASE_SPEED = 140; // Initial move tick duration in ms

// Particle System
let particles = [];

// Cache DOM Elements
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameContainer = document.getElementById('game-container');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const newHighScoreBadge = document.getElementById('new-high-score-badge');
const startBtn = document.getElementById('start-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const speakerIcon = document.getElementById('speaker-icon');

// Web Audio API Context Lazy Init
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
}

// Sound Synthesizer
function playSynthSound(type) {
  if (soundMuted) return;
  initAudio();
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  if (type === 'eat') {
    // Retro coin-like sweep sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'hit') {
    // Low frequency explosive crash
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.45);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'start') {
    // Synth-wave short intro chord
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
    osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
    osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

// Particle System Emitter
function createParticles(x, y, color) {
  // Translate grid coordinates to canvas coordinates (center of tile)
  const px = x * GRID_SIZE + GRID_SIZE / 2;
  const py = y * GRID_SIZE + GRID_SIZE / 2;
  
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 2.5;
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      alpha: 1,
      color: color,
      decay: 0.02 + Math.random() * 0.03
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Initialize Application
function init() {
  // Load High Score
  const savedHighScore = localStorage.getItem('snake-high-score');
  if (savedHighScore !== null) {
    highScore = parseInt(savedHighScore, 10);
  } else {
    highScore = 0;
  }
  highScoreEl.textContent = formatScore(highScore);
  
  // Load Sound Settings
  const savedSoundMute = localStorage.getItem('snake-sound-muted');
  if (savedSoundMute !== null) {
    soundMuted = savedSoundMute === 'true';
  }
  updateSoundIcon();

  // Event Listeners
  startBtn.addEventListener('click', startGame);
  resumeBtn.addEventListener('click', resumeGame);
  restartBtn.addEventListener('click', resetToStart);
  soundToggleBtn.addEventListener('click', toggleSound);
  
  window.addEventListener('keydown', handleKeyDown);
  
  // Start drawing idle screen
  requestAnimationFrame(gameLoop);
}

// Format Score with padding (e.g. 5 -> 005)
function formatScore(num) {
  return num.toString().padStart(3, '0');
}

// Start Game
function startGame() {
  // Reset states
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { dx: 1, dy: 0 };
  nextDirection = { dx: 1, dy: 0 };
  directionQueue = [];
  score = 0;
  currentScoreEl.textContent = formatScore(0);
  particles = [];
  
  spawnFood();
  
  gameState = STATES.PLAYING;
  gameContainer.className = 'game-container playing';
  
  // Update Overlay Screen UI
  startScreen.classList.remove('active');
  pauseScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  
  playSynthSound('start');
}

// Pause / Resume
function pauseGame() {
  if (gameState !== STATES.PLAYING) return;
  gameState = STATES.PAUSED;
  gameContainer.className = 'game-container paused';
  pauseScreen.classList.add('active');
}

function resumeGame() {
  if (gameState !== STATES.PAUSED) return;
  gameState = STATES.PLAYING;
  gameContainer.className = 'game-container playing';
  pauseScreen.classList.remove('active');
  playSynthSound('start');
}

function togglePause() {
  if (gameState === STATES.PLAYING) {
    pauseGame();
  } else if (gameState === STATES.PAUSED) {
    resumeGame();
  }
}

// Reset to Start Screen
function resetToStart() {
  gameState = STATES.START;
  gameContainer.className = 'game-container';
  gameOverScreen.classList.remove('active');
  startScreen.classList.add('active');
}

// Spawn Food
function spawnFood() {
  let attempts = 0;
  let newFood = {};
  
  // Avoid placing food on the snake body
  while (attempts < 100) {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
    
    // Check collision with snake
    const collision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!collision) {
      food = newFood;
      return;
    }
    attempts++;
  }
  
  // Fallback if snake fills entire canvas
  food = newFood;
}

// Game Over Logic
function triggerGameOver() {
  gameState = STATES.GAMEOVER;
  gameContainer.className = 'game-container game-over';
  
  finalScoreEl.textContent = score;
  
  // Update High Score if needed
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake-high-score', highScore.toString());
    highScoreEl.textContent = formatScore(highScore);
    newHighScoreBadge.style.display = 'block';
  } else {
    newHighScoreBadge.style.display = 'none';
  }
  
  gameOverScreen.classList.add('active');
  playSynthSound('hit');
}

// Get dynamic speed based on current score
function getMoveSpeedMs() {
  // Speed scales from 140ms down to 60ms as score increases
  return Math.max(60, BASE_SPEED - Math.floor(score / 5) * 8);
}

// Keyboards Controls Map
const DIRECTION_MAP = {
  // Arrow keys
  'ArrowUp': { dx: 0, dy: -1 },
  'ArrowDown': { dx: 0, dy: 1 },
  'ArrowLeft': { dx: -1, dy: 0 },
  'ArrowRight': { dx: 1, dy: 0 },
  // WASD keys
  'KeyW': { dx: 0, dy: -1 },
  'KeyS': { dx: 0, dy: 1 },
  'KeyA': { dx: -1, dy: 0 },
  'KeyD': { dx: 1, dy: 0 }
};

function handleKeyDown(e) {
  // Pause/Resume on Spacebar
  if (e.key === ' ') {
    e.preventDefault();
    if (gameState === STATES.PLAYING || gameState === STATES.PAUSED) {
      togglePause();
    } else if (gameState === STATES.START) {
      startGame();
    }
    return;
  }
  
  // Direct Direction Mapping
  const targetDir = DIRECTION_MAP[e.code] || DIRECTION_MAP[e.key];
  if (targetDir && gameState === STATES.PLAYING) {
    e.preventDefault(); // Prevent page scroll
    
    // Peek at the last direction in the queue to avoid rapid duplicate updates
    const lastQueued = directionQueue.length > 0 ? directionQueue[directionQueue.length - 1] : direction;
    
    // Check if the input is opposite of the current/last-queued direction
    const isOpposite = (targetDir.dx === -lastQueued.dx && targetDir.dy === -lastQueued.dy);
    
    if (!isOpposite) {
      directionQueue.push(targetDir);
    }
  }
}

// Process direction input queue
function updateDirection() {
  if (directionQueue.length > 0) {
    const next = directionQueue.shift();
    direction = next;
  }
}

// Toggle Sound
function toggleSound() {
  soundMuted = !soundMuted;
  localStorage.setItem('snake-sound-muted', soundMuted.toString());
  updateSoundIcon();
  
  // Play sound indicator if unmuted
  if (!soundMuted) {
    playSynthSound('start');
  }
}

function updateSoundIcon() {
  if (soundMuted) {
    soundToggleBtn.classList.add('muted');
    speakerIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
  } else {
    soundToggleBtn.classList.remove('muted');
    speakerIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  }
}

// Core Snake Movement step (run on tick accumulator)
function updateGameStep() {
  if (gameState !== STATES.PLAYING) return;
  
  // Handle Direction Queue
  updateDirection();
  
  // Compute new snake head location
  const head = snake[0];
  const nextHead = {
    x: head.x + direction.dx,
    y: head.y + direction.dy
  };
  
  // Check Wall Collision
  if (nextHead.x < 0 || nextHead.x >= TILE_COUNT || nextHead.y < 0 || nextHead.y >= TILE_COUNT) {
    triggerGameOver();
    return;
  }
  
  // Check Self Collision (ignoring the last tail cell because it will move out of the way)
  // But wait! If the snake eats food, the tail does NOT move out of the way, so check all segments.
  const selfCollision = snake.some((segment, index) => {
    // Only skip the tail segment if we aren't eating food this tick, 
    // to be safe we check all segments except the tail in normal movement
    if (index === snake.length - 1) return false;
    return segment.x === nextHead.x && segment.y === nextHead.y;
  });
  
  if (selfCollision) {
    triggerGameOver();
    return;
  }
  
  // Add new head to snake array
  snake.unshift(nextHead);
  
  // Check Food Consumption
  if (nextHead.x === food.x && nextHead.y === food.y) {
    score++;
    currentScoreEl.textContent = formatScore(score);
    
    // Spawn particles burst
    createParticles(food.x, food.y, '#ff007f');
    playSynthSound('eat');
    
    // Spawn new food
    spawnFood();
  } else {
    // Remove tail segment if food is not eaten
    snake.pop();
  }
}

// Drawing Functions
function draw() {
  // Clear canvas
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Subtle Grid
  drawGrid();
  
  // Draw particles
  updateAndDrawParticles();
  
  // Draw Food (if playing or paused)
  if (gameState === STATES.PLAYING || gameState === STATES.PAUSED) {
    drawFood();
  }
  
  // Draw Snake (if playing or paused or gameover)
  if (gameState !== STATES.START) {
    drawSnake();
  }
}

// Draw Grid Dot intersections
function drawGrid() {
  ctx.fillStyle = 'rgba(102, 252, 241, 0.05)';
  for (let i = 1; i < TILE_COUNT; i++) {
    for (let j = 1; j < TILE_COUNT; j++) {
      ctx.fillRect(i * GRID_SIZE - 1, j * GRID_SIZE - 1, 2, 2);
    }
  }
}

// Draw Snake
function drawSnake() {
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    
    ctx.save();
    
    if (isHead) {
      ctx.fillStyle = '#66fcf1';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
    } else {
      // Body has a slight gradient / fade towards the tail
      const intensity = Math.max(0.4, 1 - index / snake.length);
      ctx.fillStyle = `rgba(57, 255, 20, ${intensity})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(57, 255, 20, 0.6)';
    }
    
    // Rounded block segments
    const x = segment.x * GRID_SIZE + 1;
    const y = segment.y * GRID_SIZE + 1;
    const w = GRID_SIZE - 2;
    const h = GRID_SIZE - 2;
    const radius = 6;
    
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, radius) : ctx.rect(x, y, w, h);
    ctx.fill();
    
    // Draw Eyes on Head for visual feedback
    if (isHead) {
      ctx.fillStyle = '#080b11';
      ctx.shadowBlur = 0; // turn off shadow for eyes
      
      const eyeSize = 3;
      const offset = 4;
      
      let eye1 = {}, eye2 = {};
      
      // Position eyes based on movement direction
      if (direction.dx === 1) { // Moving Right
        eye1 = { x: x + w - offset, y: y + offset };
        eye2 = { x: x + w - offset, y: y + h - offset };
      } else if (direction.dx === -1) { // Moving Left
        eye1 = { x: x + offset, y: y + offset };
        eye2 = { x: x + offset, y: y + h - offset };
      } else if (direction.dy === 1) { // Moving Down
        eye1 = { x: x + offset, y: y + h - offset };
        eye2 = { x: x + w - offset, y: y + h - offset };
      } else if (direction.dy === -1) { // Moving Up
        eye1 = { x: x + offset, y: y + offset };
        eye2 = { x: x + w - offset, y: y + offset };
      }
      
      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
      ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  });
}

// Draw Food with glowing Pulse Effect
function drawFood() {
  const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
  const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
  
  // Use sin wave to pulse the food radius smoothly
  const time = Date.now();
  const pulse = Math.sin(time / 140) * 1.5;
  const radius = (GRID_SIZE / 2 - 2) + pulse;
  
  ctx.save();
  ctx.fillStyle = '#ff007f';
  ctx.shadowBlur = 12 + Math.abs(pulse) * 3;
  ctx.shadowColor = '#ff007f';
  
  ctx.beginPath();
  // Draw double ring style food for cyberpunk visual
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Faint inner core circle
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius - 4), 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

// Main Frame loop (60 FPS rendering + variable speed ticks)
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const elapsed = timestamp - lastTime;
  lastTime = timestamp;
  
  if (gameState === STATES.PLAYING) {
    speedAccumulator += elapsed;
    const moveTickDuration = getMoveSpeedMs();
    
    // If accumulator exceeds tick speed, trigger step update
    while (speedAccumulator >= moveTickDuration) {
      updateGameStep();
      speedAccumulator -= moveTickDuration;
    }
  } else {
    // Keep accumulator zero if not active
    speedAccumulator = 0;
  }
  
  // Draw elements
  draw();
  
  // Next Frame
  requestAnimationFrame(gameLoop);
}

// Run initial configurations
init();

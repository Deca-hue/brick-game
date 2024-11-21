document.getElementById("leftArrow").addEventListener("contextmenu", (e) => e.preventDefault());
document.getElementById("rightArrow").addEventListener("contextmenu", (e) => e.preventDefault());

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.75;
}
resizeCanvas();

// Game variables
let ballRadius = canvas.width * 0.02;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = canvas.height * 0.03;
const paddleWidth = canvas.width * 0.2;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = canvas.width / (brickColumnCount + 1);
const brickHeight = canvas.height * 0.05;
const brickPadding = canvas.width * 0.01;
const brickOffsetTop = canvas.height * 0.1;
const brickOffsetLeft = canvas.width * 0.05;

let bricks = [];
let score = 0;
let paused = false;

// Retrieve high score from localStorage or initialize it
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore"), 10) : 0;

// Initialize bricks
function initializeBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
initializeBricks();

// Event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Touch controls
document.getElementById("leftArrow").addEventListener("touchstart", () => (leftPressed = true));
document.getElementById("leftArrow").addEventListener("touchend", () => (leftPressed = false));
document.getElementById("rightArrow").addEventListener("touchstart", () => (rightPressed = true));
document.getElementById("rightArrow").addEventListener("touchend", () => (rightPressed = false));

let rightPressed = false;
let leftPressed = false;
// Disable right-click context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
// Disable default keydown behavior for arrow keys
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault(); // Prevent default behavior for arrow keys
  }
});

// Sound effects
const brickHitSound = new Audio("bricks-104933.mp3");
const paddleHitSound = new Audio("paddle-hit.mp3");
const gameOverSound = new Audio("game-over-39-199830.mp3");

// Key handlers
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === "P" || e.key === "p") {
    paused = !paused;
    if (!paused) draw();
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Drawing functions
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#FF5733";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
  ctx.fillText("High Score: " + highScore, canvas.width - 150, 20);
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = "#FF0000";
  ctx.fillText("Game Over!", canvas.width / 2 - 75, canvas.height / 2 - 10);
  ctx.fillText("Click to Restart", canvas.width / 2 - 110, canvas.height / 2 + 40);
  gameOverSound.play();
  canvas.addEventListener("click", () => document.location.reload());
}

// Collision detection
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          brickHitSound.play();
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore); // Save high score
          }
        }
      }
    }
  }
}

function resetBricks() {
  initializeBricks();
  dx *= 1.1;
  dy *= 1.1;
}

// Game loop
function draw() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  // Ball-wall collision
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      paddleHitSound.play();
    } else {
      drawGameOver();
      return;
    }
  }

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;

  // Next level
  if (bricks.flat().every(b => b.status === 0)) {
    resetBricks();
  }

  requestAnimationFrame(draw);
}

draw();


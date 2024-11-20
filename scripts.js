const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Ball properties
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controls
let rightPressed = false;
let leftPressed = false;

// Brick properties
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
let score = 0;

// Create bricks
function createBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

createBricks(); // Initialize bricks at the start

// Event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Draw bricks
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

// Collision detection
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score += 10; // Increase score when a brick is hit
        }
      }
    }
  }

  // If all bricks are cleared, create new ones and increase speed
  let allBricksCleared = true;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        allBricksCleared = false;
        break;
      }
    }
  }

  if (allBricksCleared) {
    createBricks();
    increaseBallSpeed();
  }
}

// Increase ball speed
function increaseBallSpeed() {
  if (dx > 0) dx += 0.2;
  else dx -= 0.2;

  if (dy > 0) dy += 0.2;
  else dy -= 0.2;
}

// Draw score
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

// Draw Game Over screen
function drawGameOver() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "#FF0000";
  ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
  
  // Add a "Start Again" button
  ctx.font = "20px Arial";
  ctx.fillText("Click to Start Again", canvas.width / 2 - 110, canvas.height / 2 + 40);
  
  // Add click listener for restarting the game
  canvas.addEventListener("click", restartGame);
}

// Reset game state
function resetGame() {
  // Reset ball properties
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;

  // Reset paddle position
  paddleX = (canvas.width - paddleWidth) / 2;

  // Reset score and bricks
  score = 0;
  createBricks();

  // Restart the game loop
  draw();
}

// Restart the game
function restartGame() {
  resetGame();
  canvas.removeEventListener("click", restartGame); // Remove the event listener to avoid multiple triggers
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else {
      drawGameOver(); // Call the game over function
      return; // Stop the game loop
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

draw(); // Start the game loop

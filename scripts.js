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

    // Ball properties
    let ballRadius = canvas.width * 0.02;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 2;
    let dy = -2;

    // Paddle properties
    const paddleHeight = canvas.height * 0.03;
    const paddleWidth = canvas.width * 0.2;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // Controls
    let rightPressed = false;
    let leftPressed = false;

    // Brick properties
    const brickRowCount = 5;
    const brickColumnCount = 8;
    const brickWidth = canvas.width / (brickColumnCount + 1);
    const brickHeight = canvas.height * 0.05;
    const brickPadding = canvas.width * 0.01;
    const brickOffsetTop = canvas.height * 0.1;
    const brickOffsetLeft = canvas.width * 0.05;

    let bricks = [];
    let score = 0;

    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Event listeners
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    // Touch controls
    document.getElementById("leftArrow").addEventListener("touchstart", () => (leftPressed = true));
    document.getElementById("leftArrow").addEventListener("touchend", () => (leftPressed = false));
    document.getElementById("rightArrow").addEventListener("touchstart", () => (rightPressed = true));
    document.getElementById("rightArrow").addEventListener("touchend", () => (rightPressed = false));

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
            if (
              x > b.x &&
              x < b.x + brickWidth &&
              y > b.y &&
              y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              score++;
              if (score === brickRowCount * brickColumnCount) {
                resetBricks();
                dx *= 1.1; // Increase speed
                dy *= 1.1; // Increase speed
              }
            }
          }
        }
      }
    }

    function resetBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r].status = 1;
        }
      }
    }

    // Draw the score
    function drawScore() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#0095DD";
      ctx.fillText("Score: " + score, 8, 20);
    }

    // Draw game over
    function drawGameOver() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "30px Arial";
      ctx.fillStyle = "#FF0000";
      ctx.fillText("You Lost!", canvas.width / 2 - 75, canvas.height / 2 - 10);
      ctx.fillText("Click to Restart", canvas.width / 2 - 110, canvas.height / 2 + 40);

      // Add restart functionality
      canvas.addEventListener("click", () => document.location.reload());
    }

    // Game loop
    function draw() {
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

      requestAnimationFrame(draw);
    }

    draw();


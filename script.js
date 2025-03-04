const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = 600;
const height = 400;
canvas.width = width;
canvas.height = height;

// Colores
const WHITE = "#FFFFFF";
const GREEN = "#00FF00";
const RED = "#FF0000";
const BLACK = "#000000";

// Variables del juego
let snake = [{ x: 100, y: 50 }];
let snakeDir = { x: 10, y: 0 };
let food = { x: getRandomPosition(width), y: getRandomPosition(height) };
let enemy = [{ x: 300, y: 200 }];
let enemyDir = { x: 0, y: 0 };
let score = 0;
let running = false;
let enemyAILevel = 0.05;
let speedMultiplier = 1.0;

// Música
const gameMusic = new Audio("ARCADE.mp3"); 
gameMusic.loop = true; 

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("velocityButton").addEventListener("click", changeSpeed);

function startGame() {
    resetGame();
    running = true;
    gameLoop();
    gameMusic.play();
}

function resetGame() {
    snake = [{ x: 100, y: 50 }];
    snakeDir = { x: 10, y: 0 };
    food = { x: getRandomPosition(width), y: getRandomPosition(height) };
    enemy = [{ x: 300, y: 200 }];
    enemyDir = { x: 0, y: 0 };
    score = 0;
    enemyAILevel = 0.05;
}

function getRandomPosition(limit) {
    return Math.floor(Math.random() * (limit / 10)) * 10;
}

function changeSpeed() {
    const speeds = [0.5, 1.0, 2.0, 5.0];
    let index = speeds.indexOf(speedMultiplier);
    index = (index + 1) % speeds.length;
    speedMultiplier = speeds[index];
    document.getElementById("velocityButton").textContent = `x${speedMultiplier}`;
}

document.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "ArrowUp" && snakeDir.y === 0) snakeDir = { x: 0, y: -10 };
    if (event.key === "ArrowDown" && snakeDir.y === 0) snakeDir = { x: 0, y: 10 };
    if (event.key === "ArrowLeft" && snakeDir.x === 0) snakeDir = { x: -10, y: 0 };
    if (event.key === "ArrowRight" && snakeDir.x === 0) snakeDir = { x: 10, y: 0 };
});

function gameLoop() {
    if (!running) return;

    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, width, height);

    moveSnake();
    moveEnemy();
    checkCollisions();

    drawSnake();
    drawEnemy();
    drawFood();
    drawScore();

    let baseSpeed = Math.max(30, 100 - score * 3);
    let adjustedSpeed = baseSpeed / speedMultiplier;
    setTimeout(gameLoop, adjustedSpeed);
}

function moveSnake() {
    let newHead = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

    if (newHead.x < 0) newHead.x = width - 10;
    if (newHead.x >= width) newHead.x = 0;
    if (newHead.y < 0) newHead.y = height - 10;
    if (newHead.y >= height) newHead.y = 0;

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        food = { x: getRandomPosition(width), y: getRandomPosition(height) };
        enemyAILevel = Math.min(0.9, enemyAILevel + 0.05);
    } else {
        snake.pop();
    }
}

function moveEnemy() {
    let targetX = snake[0].x;
    let targetY = snake[0].y;
    let currentX = enemy[0].x;
    let currentY = enemy[0].y;

    // Interpolación lineal para mover el enemigo suavemente (enemyAILevel) 
    enemy[0].x += (targetX - currentX) * (score * 0.15);
    enemy[0].y += (targetY - currentY) * (score * 0.15);

    // Redondear la posición a la cuadrícula
    enemy[0].x = Math.round(enemy[0].x / 10) * 10;
    enemy[0].y = Math.round(enemy[0].y / 10) * 10;
}

function checkCollisions() {
    if (Math.abs(snake[0].x - enemy[0].x) < 10 && Math.abs(snake[0].y - enemy[0].y) < 10) {
        running = false;
        gameMusic.pause();
        gameMusic.currentTime = 0;
        setTimeout(() => alert("¡Perdiste! Puntuación: " + score), 100);
    }
}

function drawSnake() {
    ctx.fillStyle = GREEN;
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, 10, 10);
    }
}

function drawEnemy() {
    ctx.fillStyle = RED;
    ctx.fillRect(enemy[0].x, enemy[0].y, 10, 10);
}

function drawFood() {
    ctx.fillStyle = WHITE;
    ctx.fillRect(food.x, food.y, 10, 10);
}

function drawScore() {
    ctx.fillStyle = WHITE;
    ctx.font = "20px Arial";
    ctx.fillText("Puntuación: " + score, 10, 20);
}

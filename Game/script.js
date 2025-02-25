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
let enemyDir = { x: 10, y: 0 };
let score = 0;
let running = false;
let enemyAILevel = 0.1;
let speedMultiplier = 1.0; // Velocidad inicial (x1.0)

// Música
const gameMusic = new Audio("Octavio Mesa - Al Rojo Vivo.mp3"); 
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
    enemyDir = { x: 10, y: 0 };
    score = 0;
    enemyAILevel = 0.1;
}

// Generar posición aleatoria
function getRandomPosition(limit) {
    return Math.floor(Math.random() * (limit / 10)) * 10;
}

// Cambiar velocidad del juego
function changeSpeed() {
    const speeds = [0.5, 1.0, 2.0, 5.0]; // Opciones de velocidad
    let index = speeds.indexOf(speedMultiplier);
    index = (index + 1) % speeds.length; // Ciclar entre velocidades
    speedMultiplier = speeds[index];
    document.getElementById("velocityButton").textContent = `x${speedMultiplier}`;
}

// Escuchar teclas
// Escuchar teclas y prevenir el desplazamiento de la página
document.addEventListener("keydown", (event) => {
    // Evita que la página se desplace con las teclas de flecha
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    // Control de dirección de la serpiente
    if (event.key === "ArrowUp" && snakeDir.y === 0) snakeDir = { x: 0, y: -10 };
    if (event.key === "ArrowDown" && snakeDir.y === 0) snakeDir = { x: 0, y: 10 };
    if (event.key === "ArrowLeft" && snakeDir.x === 0) snakeDir = { x: -10, y: 0 };
    if (event.key === "ArrowRight" && snakeDir.x === 0) snakeDir = { x: 10, y: 0 };
});

// Bucle del juego
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

    let baseSpeed = Math.max(30, 100 - score * 3); // Velocidad base según puntuación
    let adjustedSpeed = baseSpeed / speedMultiplier; // Aplicar multiplicador de velocidad
    setTimeout(gameLoop, adjustedSpeed);
}

// Mover la serpiente
function moveSnake() {
    let newHead = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

    // Borde de pantalla
    if (newHead.x < 0) newHead.x = width - 10;
    if (newHead.x >= width) newHead.x = 0;
    if (newHead.y < 0) newHead.y = height - 10;
    if (newHead.y >= height) newHead.y = 0;

    snake.unshift(newHead);

    // Comer comida
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        food = { x: getRandomPosition(width), y: getRandomPosition(height) };
        enemyAILevel = Math.min(0.9, score / 20);
    } else {
        snake.pop();
    }
}

// Mover el enemigo
function moveEnemy() {
    if (Math.random() < enemyAILevel) {
        if (enemy[0].x < snake[0].x) enemyDir = { x: 10, y: 0 };
        else if (enemy[0].x > snake[0].x) enemyDir = { x: -10, y: 0 };
        else if (enemy[0].y < snake[0].y) enemyDir = { x: 0, y: 10 };
        else if (enemy[0].y > snake[0].y) enemyDir = { x: 0, y: -10 };
    }

    let newHead = { x: enemy[0].x + enemyDir.x, y: enemy[0].y + enemyDir.y };
    enemy.unshift(newHead);
    enemy.pop();
}

// Verificar colisiones
function checkCollisions() {
    for (let segment of snake) {
        if (segment.x === enemy[0].x && segment.y === enemy[0].y) {
            running = false;
            gameMusic.pause();
            gameMusic.currentTime = 0;
            alert("¡Perdiste! Puntuación: " + score);
        }
    }
}

// Dibujar la serpiente
function drawSnake() {
    ctx.fillStyle = GREEN;
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, 10, 10);
    }
}

// Dibujar el enemigo
function drawEnemy() {
    ctx.fillStyle = RED;
    for (let segment of enemy) {
        ctx.fillRect(segment.x, segment.y, 10, 10);
    }
}

// Dibujar la comida
function drawFood() {
    ctx.fillStyle = WHITE;
    ctx.fillRect(food.x, food.y, 10, 10);
}

// Dibujar la puntuación
function drawScore() {
    ctx.fillStyle = WHITE;
    ctx.font = "20px Arial";
    ctx.fillText("Puntuación: " + score, 10, 20);
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos UI
const startButton = document.getElementById("startButton");
const exitButton = document.getElementById("exitButton");
const velocityButton = document.getElementById("velocityButton");
const scoreValue = document.getElementById("scoreValue");

// Tamaño del canvas
let width = window.innerWidth * 0.9;
let height = window.innerHeight * 0.5;
canvas.width = width;
canvas.height = height;

// Colores
const WHITE = "#FFFFFF";
const GREEN = "#00FF00";
const RED = "#FFD700";
const BLACK = "#000000";

// Variables del juego
let snake = [{ x: 100, y: 50 }];
let snakeDir = { x: 10, y: 0 };
let food = { x: getRandomPosition(width), y: getRandomPosition(height) };
let enemy = [{ x: 300, y: 200 }];
let score = 0;
let running = false;
let gameStarted = false;
let enemyAILevel = 0.05;
let speedMultiplier = 1.0;

// Música
const gameMusic = new Audio("audio/ARCADE.mp3");
gameMusic.loop = true;

// Inicialización del juego
function init() {
    setupEventListeners();
    detectMobileControls();
}

function setupEventListeners() {
    // Botones principales
    startButton.addEventListener("click", startGame);
    exitButton.addEventListener("click", () => location.reload());
    velocityButton.addEventListener("click", changeSpeed);
    
    // Controles de teclado
    document.addEventListener("keydown", handleKeyDown);
}

function detectMobileControls() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.getElementById("mobileControls").style.display = "grid";
        setupMobileControls();
    }
}

function setupMobileControls() {
    const addMobileControl = (id, dir) => {
        const btn = document.getElementById(id);
        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            changeDirection(dir);
        });
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            changeDirection(dir);
        });
    };

    addMobileControl("upBtn", { x: 0, y: -10 });
    addMobileControl("downBtn", { x: 0, y: 10 });
    addMobileControl("leftBtn", { x: -10, y: 0 });
    addMobileControl("rightBtn", { x: 10, y: 0 });
}

function handleKeyDown(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const directions = {
            "ArrowUp": { x: 0, y: -10 },
            "ArrowDown": { x: 0, y: 10 },
            "ArrowLeft": { x: -10, y: 0 },
            "ArrowRight": { x: 10, y: 0 }
        };
        changeDirection(directions[event.key]);
    }
}

function changeDirection(newDir) {
    // Solo permite cambios de dirección válidos (no opuestos)
    if (snakeDir.x !== -newDir.x && snakeDir.y !== -newDir.y) {
        snakeDir = newDir;
    }
}

// Funciones del juego
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        startButton.textContent = "Reiniciar";
    }
    
    if (running) {
        running = false;
        setTimeout(() => {
            resetGame();
            running = true;
            gameLoop();
        }, 100);
    } else {
        resetGame();
        running = true;
        gameLoop();
        gameMusic.play();
    }
}

function resetGame() {
    snake = [{ x: 100, y: 50 }];
    snakeDir = { x: 10, y: 0 };
    food = { x: getRandomPosition(width), y: getRandomPosition(height) };
    enemy = [{ x: 300, y: 200 }];
    score = 0;
    enemyAILevel = 0.05;
    updateScore();
}

function getRandomPosition(limit) {
    return Math.floor(Math.random() * ((limit - 10) / 10)) * 10;
}

function changeSpeed() {
    const speeds = [0.5, 1.0, 2.0, 5.0];
    const currentIndex = speeds.indexOf(speedMultiplier);
    speedMultiplier = speeds[(currentIndex + 1) % speeds.length];
    velocityButton.textContent = `x${speedMultiplier}`;
}

// Bucle principal del juego
function gameLoop() {
    if (!running) return;

    // Limpiar canvas
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, width, height);

    // Actualizar estado
    moveSnake();
    moveEnemy();
    checkCollisions();

    // Dibujar elementos
    drawSnake();
    drawEnemy();
    drawFood();

    // Control de velocidad
    const baseSpeed = Math.max(50, 150 - score * 3);
    const adjustedSpeed = baseSpeed / speedMultiplier;
    setTimeout(gameLoop, adjustedSpeed);
}

function moveSnake() {
    const newHead = {
        x: snake[0].x + snakeDir.x,
        y: snake[0].y + snakeDir.y
    };

    // Efecto "túnel" en bordes
    if (newHead.x < 0) newHead.x = width - 10;
    if (newHead.x >= width) newHead.x = 0;
    if (newHead.y < 0) newHead.y = height - 10;
    if (newHead.y >= height) newHead.y = 0;

    snake.unshift(newHead);

    // Comprobar si comió la fruta
    if (Math.abs(newHead.x - food.x) < 10 && Math.abs(newHead.y - food.y) < 10) {
        score++;
        updateScore();
        food = { x: getRandomPosition(width), y: getRandomPosition(height) };
        enemyAILevel = Math.min(0.9, enemyAILevel + 0.05);
    } else {
        snake.pop();
    }
}

function moveEnemy() {
    const [enemyHead] = enemy;
    const [snakeHead] = snake;
    
    const dx = snakeHead.x - enemyHead.x;
    const dy = snakeHead.y - enemyHead.y;
    const step = 0.5 * speedMultiplier * (1 + enemyAILevel);

    if (Math.abs(dx) > Math.abs(dy)) {
        enemyHead.x += dx > 0 ? step : -step;
        enemyHead.y = enemyHead.y + (dy/dx) * (enemyHead.x - enemy[0].x);
    } else if (dy !== 0) {
        enemyHead.y += dy > 0 ? step : -step;
        enemyHead.x = enemyHead.x + (dx/dy) * (enemyHead.y - enemy[0].y);
    }

    // Asegurar que el enemigo no salga del canvas
    enemyHead.x = Math.max(0, Math.min(width - 10, Math.round(enemyHead.x)));
    enemyHead.y = Math.max(0, Math.min(height - 10, Math.round(enemyHead.y)));
}

function checkCollisions() {
    const [snakeHead] = snake;
    const [enemyHead] = enemy;

    if (Math.abs(snakeHead.x - enemyHead.x) < 10 && 
        Math.abs(snakeHead.y - enemyHead.y) < 10) {
        endGame();
    }
}

function endGame() {
    running = false;
    gameMusic.pause();
    gameMusic.currentTime = 0;
    setTimeout(() => alert(`¡Perdiste! Puntuación: ${score}`), 100);
}

function updateScore() {
    scoreValue.textContent = score;
}

// Funciones de dibujo
function drawSnake() {
    ctx.fillStyle = GREEN;
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 10, 10);
    });
}

function drawEnemy() {
    ctx.fillStyle = RED;
    ctx.fillRect(enemy[0].x, enemy[0].y, 10, 10);
}

function drawFood() {
    ctx.fillStyle = WHITE;
    ctx.fillRect(food.x, food.y, 10, 10);
}

// Iniciar el juego cuando se carga la página
window.addEventListener("load", init);
window.addEventListener("resize", () => {
    width = window.innerWidth * 0.9;
    height = window.innerHeight * 0.5;
    canvas.width = width;
    canvas.height = height;
});

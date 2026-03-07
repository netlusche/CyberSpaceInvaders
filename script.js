const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Element References
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('scoreDisplay');
const hiScoreDisplay = document.getElementById('hiScoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const newHiScoreMsg = document.getElementById('newHiScoreMsg');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game State Enum
const GAME_STATE = {
    START: 0,
    PLAYING: 1,
    GAMEOVER: 2
};

let currentState = GAME_STATE.START;

// Dimensions
canvas.width = 800;
canvas.height = 600;

// Variables
let score = 0;
let hiScore = localStorage.getItem('cyberInvadersHiScore') || 0;
hiScoreDisplay.innerText = hiScore.toString().padStart(5, '0');

let lives = 3;
let keys = {};
let frameBuffer = 0; // For timing
let maxEnemyBombs = 1;
let hitPauseTimer = 0;

// Entities arrays
let player;
let bullets = [];
let enemies = [];
let particles = [];
let enemyBullets = [];

// Settings
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3; // slower bullets
const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;
const ENEMY_PADDING = 50;
const ENEMY_OFFSET_TOP = 60;
const ENEMY_OFFSET_LEFT = 80;

let enemySpeedX = 0.5; // initial enemy horizontal speed (even slower)
let enemyDirection = 1; // 1 = right, -1 = left

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && currentState === GAME_STATE.PLAYING) {
        player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Classes
class Player {
    constructor() {
        this.width = 40;
        this.height = 20;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.color = '#00ffff'; // Neon Cyan
        this.speed = PLAYER_SPEED;
        this.cooldown = 0; // Prevent spamming
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Ship geometry (triangle/spaceship shape)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update() {
        if ((keys['ArrowLeft'] || keys['KeyA']) && this.x > 0) {
            this.x -= this.speed;
        }
        if ((keys['ArrowRight'] || keys['KeyD']) && this.x + this.width < canvas.width) {
            this.x += this.speed;
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    shoot() {
        if (this.cooldown === 0) {
            bullets.push(new Bullet(this.x + this.width / 2, this.y, -BULLET_SPEED, '#00ffff'));
            this.cooldown = 15; // Frames delay between shots
            createParticles(this.x + this.width/2, this.y, 5, this.color);
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 20;
        this.color = '#ff00ff'; // Neon Pink
        this.value = 100;
        this.active = true;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Cyberpunk invader shape
        ctx.fillRect(this.x, this.y + 5, this.width, 10);
        ctx.fillRect(this.x + 5, this.y, this.width - 10, 5);
        ctx.fillRect(this.x + 5, this.y + 15, this.width - 10, 5);
        
        // "Eyes"
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x + 8, this.y + 7, 4, 4);
        ctx.fillRect(this.x + 18, this.y + 7, 4, 4);
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x - 2;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = speed;
        this.color = color;
        this.active = true;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        // Check bounds
        if (this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Helper Functions
function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function initEnemies() {
    enemies = [];
    for (let c = 0; c < ENEMY_COLS; c++) {
        for (let r = 0; r < ENEMY_ROWS; r++) {
            const x = c * (30 + ENEMY_PADDING) + ENEMY_OFFSET_LEFT;
            const y = r * (20 + ENEMY_PADDING) + ENEMY_OFFSET_TOP;
            let enemy = new Enemy(x, y);
            
            // Randomly Color some enemies differently (Yellow vs Pink)
            if (r === 0) {
                enemy.color = '#ff003c'; // Red-ish top row (harder)
                enemy.value = 300;
            } else if (r === 1 || r === 2) {
                enemy.color = '#ffff00'; // Yellow middle
                enemy.value = 200;
            }
            
            enemies.push(enemy);
        }
    }
}

function updateHUD() {
    scoreDisplay.innerText = score.toString().padStart(5, '0');
    let lifeString = '';
    for(let i=0; i<Math.max(0, lives); i++) lifeString += '♥';
    livesDisplay.innerText = lifeString;
}

function startGame() {
    startScreen.classList.add('hidden');
    startScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active');
    hud.classList.remove('hidden');

    player = new Player();
    bullets = [];
    enemyBullets = [];
    particles = [];
    
    score = 0;
    lives = 3;
    maxEnemyBombs = 1;
    enemySpeedX = 0.5; // reset speed
    hitPauseTimer = 0;
    initEnemies();
    updateHUD();

    currentState = GAME_STATE.PLAYING;
}

function gameOver() {
    currentState = GAME_STATE.GAMEOVER;
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
    
    finalScoreDisplay.innerText = score;
    
    if (score > hiScore) {
        hiScore = score;
        localStorage.setItem('cyberInvadersHiScore', hiScore);
        hiScoreDisplay.innerText = hiScore.toString().padStart(5, '0');
        newHiScoreMsg.classList.remove('hidden');
    } else {
        newHiScoreMsg.classList.add('hidden');
    }
}

function checkCollisions() {
    // Player bullets hitting enemies
    bullets.forEach(b => {
        if (!b.active) return;
        enemies.forEach(e => {
            if (!e.active) return;
            
            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.height + b.y > e.y) {
                    // Hit!
                    b.active = false;
                    e.active = false;
                    createParticles(e.x + e.width/2, e.y + e.height/2, 15, e.color);
                    score += e.value;
                    updateHUD();
            }
        });
    });

    // Enemy bullets hitting player
    enemyBullets.forEach(b => {
        if (!b.active) return;
        if (b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.height + b.y > player.y &&
            hitPauseTimer === 0) {
                // Hit!
                b.active = false;
                lives--;
                
                // Huge explosion
                createParticles(player.x + player.width/2, player.y + player.height/2, 40, '#ff003c'); // Red
                createParticles(player.x + player.width/2, player.y + player.height/2, 40, '#ffff00'); // Yellow
                
                updateHUD();
                hitPauseTimer = 60; // Pause game for 60 frames (1 second)
        }
    });

    // Clean up inactive entities
    bullets = bullets.filter(b => b.active);
    enemies = enemies.filter(e => e.active);
    enemyBullets = enemyBullets.filter(b => b.active);
}

function updateEnemySwarm() {
    let edgeHit = false;
    
    for (let i = 0; i < enemies.length; i++) {
        let e = enemies[i];
        if (!e.active) continue;
        
        e.x += enemySpeedX * enemyDirection;
        
        // Random shooting chance: limited by maxEnemyBombs
        if (enemyBullets.length < maxEnemyBombs) {
            // Very low chance per frame so bombs fall slowly at start
            if (Math.random() < 0.0005) { 
                enemyBullets.push(new Bullet(e.x + e.width/2, e.y + e.height, ENEMY_BULLET_SPEED, '#ff003c'));
            }
        }

        if (e.x + e.width > canvas.width - 20 || e.x < 20) {
            edgeHit = true;
        }
    }

    if (edgeHit) {
        enemyDirection *= -1;
        enemySpeedX += 0.05; // very slight speed increase on drop
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].y += 10; // drop down much less (was 30)
            // Check if enemies reached player level
            if (enemies[i].y + enemies[i].height >= player.y) {
                gameOver();
            }
        }
    }
    
    // Check win condition (all enemies dead)
    if (enemies.length === 0) {
        // Next wave!
        score += 1000; // Wave clear bonus
        maxEnemyBombs++; // Increase max bombs per wave
        initEnemies();
        enemySpeedX = 0.5 + (maxEnemyBombs - 1) * 0.2; // Scaled base speed
    }
}

// Clear screen with trail effect
function drawBackground() {
    ctx.fillStyle = 'rgba(0, 5, 10, 0.4)'; // Cyberpunk dark, slightly transparent for trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (currentState === GAME_STATE.PLAYING) {
        frameBuffer++;
        drawBackground();
        
        if (hitPauseTimer > 0) {
            hitPauseTimer--;
            
            // Draw entities but don't update them (pauses the game action)
            bullets.forEach(b => { b.draw(); });
            enemyBullets.forEach(b => { b.draw(); });
            enemies.forEach(e => { e.draw(); });
            
            // Update and draw particles for the explosion
            particles.forEach(p => { p.update(); p.draw(); });
            particles = particles.filter(p => p.life > 0);
            
            if (hitPauseTimer === 0) {
                if (lives <= 0) {
                    gameOver();
                } else {
                    // Respawn player
                    player.x = canvas.width / 2 - player.width / 2;
                    enemyBullets = []; // Clear enemy bullets to avoid spawn kill
                }
            }
        } else {
            // Normal Event Loop
            // Update & Draw Player
            player.update();
            player.draw();

            // Update & Draw Bullets
            bullets.forEach(b => { b.update(); b.draw(); });
            enemyBullets.forEach(b => { b.update(); b.draw(); });

            // Update & Draw Enemies
            updateEnemySwarm();
            enemies.forEach(e => { e.draw(); });

            // Check all collisions
            checkCollisions();

            // Update & Draw Particles
            particles.forEach(p => { p.update(); p.draw(); });
            particles = particles.filter(p => p.life > 0);
        }
    }
    
    // Small ambient particles even on start screen if desired, but we'll stick to static CSS there.
    if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAMEOVER) {
        // We still need to clear or draw to avoid garbage, but CSS handles overlays.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Let's create a cool grid effect in canvas for background
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const timeOffset = Date.now() / 50 % 40;
        ctx.beginPath();
        for(let i = 0; i < canvas.height; i += 40) {
            ctx.moveTo(0, i + timeOffset);
            ctx.lineTo(canvas.width, i + timeOffset);
        }
        for(let i = 0; i < canvas.width; i += 40) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
        }
        ctx.stroke();
    }

    requestAnimationFrame(gameLoop);
}

// Start visual loop immediately
requestAnimationFrame(gameLoop);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ფიქსირებული თამაშის რეზოლუცია (რომ ყველგან ერთნაირად გამოიყურებოდეს) ---
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// --- ცვლადები და პარამეტრები ---
let groundLineY = GAME_HEIGHT - 80; 
let score = 0;
let isGameOver = false;

let me = {
    x: 100,
    y: 0, 
    width: 90,
    height: 160,
    dy: 0,
    jumpForce: 18,
    gravity: 0.75,
    originalHeight: 160,
    originalWidth: 90
};

let spike = {
    x: 0,
    y: 0,
    width: 90,
    height: 80,
    speed: 12,
    angle: 0
};

// --- რესურსების ჩატვირთვა ---
const backgroundImg = new Image();
backgroundImg.src = 'background.png';
const playerImg = new Image();
playerImg.src = 'mixo.png';
const spikeImg = new Image();
spikeImg.src = 'საზამთრო.png';

const jumpSound = new Audio('ახტომა.mp4');
const crashSound = new Audio('ა დედა მოუვა.mp4');
const bgMusic = new Audio('bgMusic.mp4'); 
bgMusic.loop = true;
bgMusic.volume = 0.5;

// საწყისი პოზიციების გასწორება
me.y = groundLineY - me.height;
spike.y = groundLineY - spike.height;
spike.x = GAME_WIDTH + 100;

// --- მართვა (კომპიუტერი + ტელეფონი) ---
function jump() {
    if (bgMusic.paused && !isGameOver) {
        bgMusic.play().catch(e => console.log("Music blocked"));
    }

    const onGround = me.y >= (groundLineY - me.height - 5);
    if (onGround && !isGameOver) { 
        me.dy = -me.jumpForce;
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log("Sound error")); 
        
        me.width = 80;
        me.height = 175;
    }
}

window.addEventListener('keydown', (e) => { 
    if (e.code === 'Space') {
        e.preventDefault();
        jump(); 
    }
});

window.addEventListener('pointerdown', () => {
    jump();
});

function endgame() {
    isGameOver = true;
    bgMusic.pause(); 
    crashSound.play(); 
    
    let savedHighScore = localStorage.getItem('highscore') || 0;
    if (score > savedHighScore) {
        localStorage.setItem('highscore', score);
        savedHighScore = score;
    }

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'წააგე!',
            text: `ქულა: ${Math.floor(score)} | რეკორდი: ${savedHighScore}`,
            icon: 'error',
            confirmButtonText: 'თავიდან ცდა'
        }).then((result) => { if (result.isConfirmed) location.reload(); });
    } else {
        alert("წააგე! რეკორდი: " + savedHighScore);
        location.reload();
    }
}

function update() {
    if (isGameOver) return;

    me.y += me.dy;
    if (me.y < groundLineY - me.height) {
        me.dy += me.gravity;
    } else {
        me.y = groundLineY - me.height;
        me.dy = 0;
        me.width = me.originalWidth;
        me.height = me.originalHeight;
    }

    spike.x -= spike.speed;
    spike.angle -= (spike.speed * 0.05); 
    spike.speed += 0.0008; 
    
    if (spike.x < -spike.width) {
        spike.x = GAME_WIDTH + Math.random() * 400 + 200;
        score += 1;
    }

    if (
        me.x + 15 < spike.x + spike.width - 15 &&
        me.x + me.width - 15 > spike.x + 15 &&
        me.y + 15 < spike.y + spike.height &&
        me.y + me.height > spike.y + 10
    ) {
        endgame();
    }
}

function draw() {
    // ფონი იხატება ფიქსირებულ ზომებზე
    ctx.drawImage(backgroundImg, 0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "black";
    ctx.font = "bold 32px Arial";
    ctx.fillText("ქულა: " + Math.floor(score), 40, 60);
    ctx.font = "24px Arial";
    ctx.fillText("რეკორდი: " + (localStorage.getItem('highscore') || 0), 40, 105);

    ctx.drawImage(playerImg, me.x, me.y, me.width, me.height);

    ctx.save();
    ctx.translate(spike.x + spike.width / 2, spike.y + spike.height / 2);
    ctx.rotate(spike.angle);
    ctx.drawImage(spikeImg, -spike.width / 2, -spike.height / 2, spike.width, spike.height);
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

backgroundImg.onload = () => {
    gameLoop();
}
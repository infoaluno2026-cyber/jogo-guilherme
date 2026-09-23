const introScreen = document.querySelector('#introScreen');
const gameScreen = document.querySelector('#gameScreen');
const endingScreen = document.querySelector('#endingScreen');
const player = document.querySelector('#player');
const enemy = document.querySelector('#enemy');
const projectiles = document.querySelector('#projectiles');
const arena = document.querySelector('#arena');
const heroHealthBar = document.querySelector('#heroHealth');
const enemyHealthBar = document.querySelector('#enemyHealth');
const heroHealthText = document.querySelector('#heroHealthText');
const enemyHealthText = document.querySelector('#enemyHealthText');
const missionText = document.querySelector('#missionText');
const arenaMessage = document.querySelector('#arenaMessage');
const powerStatus = document.querySelector('#powerStatus');

const keys = new Set();
let game = { playerX: 70, playerY: 190, enemyX: 0, enemyY: 150, heroHealth: 100, enemyHealth: 100, running: false, lastShot: 0 };

function placeActors() {
  const maxX = arena.clientWidth - 85;
  game.enemyX = maxX - 35;
  game.playerX = Math.max(30, Math.min(game.playerX, maxX));
  game.playerY = Math.max(55, Math.min(game.playerY, arena.clientHeight - 125));
  game.enemyY = Math.max(55, Math.min(game.enemyY, arena.clientHeight - 125));
  player.style.left = `${game.playerX}px`;
  player.style.top = `${game.playerY}px`;
  enemy.style.left = `${game.enemyX}px`;
  enemy.style.top = `${game.enemyY}px`;
}

function updateHud() {
  heroHealthBar.style.width = `${game.heroHealth}%`;
  enemyHealthBar.style.width = `${game.enemyHealth}%`;
  heroHealthText.textContent = game.heroHealth;
  enemyHealthText.textContent = game.enemyHealth;
}

function startGame() {
  introScreen.classList.remove('screen-visible');
  introScreen.style.display = 'none';
  endingScreen.classList.remove('active');
  gameScreen.classList.add('active');
  game = { ...game, playerX: 70, playerY: arena.clientHeight / 2 - 50, heroHealth: 100, enemyHealth: 100, running: true, lastShot: 0 };
  missionText.textContent = 'Alcance Winter no Reino do Gelo';
  arenaMessage.textContent = 'Winter está esperando...';
  arenaMessage.style.opacity = '1';
  updateHud();
  placeActors();
}

function movePlayer() {
  if (!game.running) return;
  const speed = keys.has('shift') ? 6 : 3.5;
  if (keys.has('arrowleft') || keys.has('a')) game.playerX -= speed;
  if (keys.has('arrowright') || keys.has('d')) game.playerX += speed;
  if (keys.has('arrowup') || keys.has('w')) game.playerY -= speed;
  if (keys.has('arrowdown') || keys.has('s')) game.playerY += speed;
  placeActors();
  requestAnimationFrame(movePlayer);
}

function shoot() {
  if (!game.running || Date.now() - game.lastShot < 450) return;
  game.lastShot = Date.now();
  powerStatus.textContent = 'Bola de fogo lançada';
  const projectile = document.createElement('span');
  projectile.className = 'projectile';
  projectile.style.left = `${game.playerX + 52}px`;
  projectile.style.top = `${game.playerY + 37}px`;
  projectiles.appendChild(projectile);
  const targetX = game.enemyX;
  const targetY = game.enemyY + 34;
  const distance = Math.max(200, targetX - game.playerX);
  projectile.animate([{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${distance}px, ${targetY - game.playerY - 37}px) scale(.5)` }], { duration: 380, easing: 'ease-in' }).onfinish = () => {
    projectile.remove();
    game.enemyHealth = Math.max(0, game.enemyHealth - 20);
    enemy.classList.add('flash');
    setTimeout(() => enemy.classList.remove('flash'), 300);
    updateHud();
    if (game.enemyHealth === 0) finishGame();
  };
}

function enemyAttack() {
  if (!game.running || game.enemyHealth <= 0) return;
  const closeEnough = Math.abs(game.enemyX - game.playerX) < 260;
  if (closeEnough && Math.random() < 0.018) {
    game.heroHealth = Math.max(0, game.heroHealth - 8);
    player.classList.add('shake');
    setTimeout(() => player.classList.remove('shake'), 300);
    powerStatus.textContent = 'O gelo atingiu Lonpi';
    updateHud();
    if (game.heroHealth === 0) {
      arenaMessage.textContent = 'Lonpi congelou. Tente novamente.';
      game.running = false;
    }
  }
}

function finishGame() {
  game.running = false;
  arenaMessage.textContent = 'EXPLOSÃO FIRE ICE!';
  missionText.textContent = 'Winter foi derrotado. O reino está salvo!';
  setTimeout(() => { gameScreen.classList.remove('active'); endingScreen.classList.add('active'); }, 1000);
}

document.querySelector('#startButton').addEventListener('click', startGame);
document.querySelector('#restartButton').addEventListener('click', startGame);
document.querySelector('#playAgainButton').addEventListener('click', startGame);
document.querySelector('#extraButton').addEventListener('click', () => {
  document.querySelector('#extraMission').classList.add('visible');
  document.querySelector('#extraButton').textContent = 'Missão desbloqueada ✦';
  document.querySelector('#extraButton').disabled = true;
});
window.addEventListener('keydown', (event) => { keys.add(event.key.toLowerCase()); if (event.code === 'Space') { event.preventDefault(); shoot(); } });
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('resize', placeActors);
setInterval(enemyAttack, 100);
placeActors();
requestAnimationFrame(movePlayer);

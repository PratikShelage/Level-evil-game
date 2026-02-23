import { setupInput, getInputState, endInputFrame } from './input.js';
import { Player } from './player.js';
import { Level, TILE_SIZE } from './level.js';
import { renderGame } from './renderer.js';
import { Camera } from './camera.js';
import { ParticleSystem } from './particles.js';
import { SoundManager } from './sound.js';
import { levels } from './levels/index.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const touchControls = document.getElementById('touchControls');
setupInput(touchControls);

const sound = new SoundManager();
canvas.addEventListener('pointerdown', () => sound.unlock(), { once: true });
window.addEventListener('keydown', () => sound.unlock(), { once: true });

const game = {
  state: 'menu',
  levelIndex: 0,
  level: new Level(levels[0]),
  player: null,
  particles: new ParticleSystem(),
  camera: new Camera(canvas.width, canvas.height),
  levelDeaths: 0,
  totalDeaths: 0,
  totalTime: 0,
  transition: 0,
  completeDelay: 0
};

function respawnLevel(resetDeaths = false) {
  if (resetDeaths) game.levelDeaths = 0;
  game.level.reset();
  game.player = new Player(game.level.spawn);
}

function loadLevel(index) {
  game.levelIndex = index;
  game.level = new Level(levels[index]);
  respawnLevel(true);
}

function killPlayer() {
  game.levelDeaths += 1;
  game.totalDeaths += 1;
  game.particles.spawnDeath(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2);
  game.camera.shake(4, 0.08);
  sound.death();
  respawnLevel();
}

function nextLevel() {
  sound.levelComplete();
  game.completeDelay = 0.5;
  if (game.levelIndex >= levels.length - 1) {
    game.state = 'complete';
    return;
  }
  game.transition = 0.2;
  setTimeout(() => loadLevel(game.levelIndex + 1), 220);
}

let lastTime = 0;

function update(dt, input) {
  if (game.state !== 'playing') return;

  game.totalTime += dt;
  if (input.restartPressed) respawnLevel();

  if (game.level.inReverseGravity(game.player)) {
    game.player.gravity = -1100;
  } else {
    game.player.gravity = 1100;
  }

  const movement = game.player.update(dt, input, game.level);
  if (movement.jumped) sound.jump();

  game.level.updateTraps(dt, game.player, {
    onTrapActivate: () => sound.trapTrigger(),
    onFloorCollapse: () => sound.floorCollapse()
  });

  if (game.level.checkHazards(game.player)) killPlayer();
  if (game.player.y > canvas.height + 60 || game.player.y < -150) killPlayer();

  if (game.level.checkDoor(game.player)) nextLevel();

  let sawIntensity = 0;
  for (const trap of game.level.traps) {
    if (trap.def.type === 'saw') {
      const p = trap.getPosition();
      const d = Math.hypot(game.player.x - p.x, game.player.y - p.y);
      sawIntensity = Math.max(sawIntensity, Math.max(0, 0.12 - d / 1800));
    }
  }
  sound.setSawIntensity(sawIntensity);

  game.camera.update(dt);
  game.particles.update(dt);
}

function handleGlobalInput(input) {
  if (input.escapePressed) {
    game.state = game.state === 'playing' ? 'paused' : game.state === 'paused' ? 'playing' : 'menu';
  }
  if (game.state === 'menu' && input.jumpPressed) {
    game.state = 'playing';
    game.totalDeaths = 0;
    game.totalTime = 0;
    loadLevel(0);
  }
}

canvas.addEventListener('click', () => {
  if (game.state === 'menu') {
    game.state = 'playing';
    loadLevel(0);
  }
});

function loop(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;

  const input = getInputState();
  handleGlobalInput(input);
  update(dt, input);
  renderGame(ctx, game);
  if (game.transition > 0) {
    game.transition -= dt;
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, game.transition * 4)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  endInputFrame();
  requestAnimationFrame(loop);
}

loadLevel(0);
requestAnimationFrame(loop);

// expose for smoke tests
window.__trapRunner = { game, loadLevel, respawnLevel, TILE_SIZE };

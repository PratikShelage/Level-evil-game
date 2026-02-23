import { TILE_SIZE, TILES } from './level.js';

export function renderGame(ctx, game) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, width, height);

  const offset = game.camera.getOffset();
  ctx.save();
  ctx.translate(offset.x, offset.y);

  renderTiles(ctx, game.level);
  renderTraps(ctx, game.level);
  renderDoor(ctx, game.level.door);
  renderPlayer(ctx, game.player);
  renderParticles(ctx, game.particles.items);
  ctx.restore();

  renderHud(ctx, game);
  renderOverlay(ctx, game);
}

function renderTiles(ctx, level) {
  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.cols; col += 1) {
      const tile = level.getTile(col, row);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      if ([TILES.FLOOR, TILES.WALL, TILES.CEILING].includes(tile)) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#c7c7c7';
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      } else if (tile === TILES.SPIKE) {
        drawSpike(ctx, x, y, TILE_SIZE, '#f04f5d');
      } else if (tile === TILES.FAKE) {
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  for (const zone of level.gravityZones) {
    ctx.fillStyle = 'rgba(93, 125, 255, 0.25)';
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = 'rgba(93, 125, 255, 0.7)';
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
  }
}

function renderTraps(ctx, level) {
  for (const trap of level.traps) {
    if (trap.def.type === 'falling_ceiling') {
      ctx.fillStyle = trap.active ? '#ff6868' : '#ff9d9d';
      ctx.fillRect(trap.def.x, trap.y ?? trap.def.y, trap.def.w, trap.def.h);
    }
    if (trap.def.type === 'moving_wall') {
      ctx.fillStyle = '#d6d6d6';
      ctx.fillRect(trap.x ?? trap.def.x, trap.def.y, trap.def.w, trap.def.h);
    }
    if (trap.def.type === 'popup_spike') {
      const p = trap.progress ?? 0;
      if (!trap.active && trap.triggered) {
        ctx.fillStyle = '#ffd36b';
        ctx.fillRect(trap.def.x, trap.def.y + TILE_SIZE - 5, trap.def.w || TILE_SIZE, 5);
      }
      if (p > 0) drawSpike(ctx, trap.def.x, trap.def.y + TILE_SIZE * (1 - p), trap.def.w || TILE_SIZE, '#f04f5d');
    }
    if (trap.def.type === 'saw') {
      const pos = trap.getPosition?.() ?? trap.def.from;
      drawSaw(ctx, pos.x, pos.y, trap.def.radius);
    }
    if (trap.def.type === 'teleport_spike' && trap.target) {
      if (!trap.active) {
        ctx.fillStyle = 'rgba(255,205,84,0.8)';
        ctx.fillRect(trap.target.x, trap.target.y + TILE_SIZE - 8, TILE_SIZE, 8);
      } else {
        drawSpike(ctx, trap.target.x, trap.target.y, TILE_SIZE, '#ff3b30');
      }
    }
    if (trap.def.type === 'floor_shift') {
      ctx.fillStyle = '#e3e3e3';
      ctx.fillRect(trap.def.x + (trap.offset || 0), trap.def.y, trap.def.w, trap.def.h);
    }
  }
}

function drawSaw(ctx, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#e84545';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (radius - 2), Math.sin(a) * (radius - 2));
    ctx.lineTo(Math.cos(a) * (radius + 4), Math.sin(a) * (radius + 4));
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpike(ctx, x, y, width, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + TILE_SIZE - 2);
  ctx.lineTo(x + width * 0.5, y + 6);
  ctx.lineTo(x + width - 2, y + TILE_SIZE - 2);
  ctx.closePath();
  ctx.fill();
}

function renderDoor(ctx, door) {
  ctx.fillStyle = '#47dd78';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#47dd78';
  ctx.fillRect(door.x + 10, door.y + 6, TILE_SIZE - 20, TILE_SIZE - 8);
  ctx.shadowBlur = 0;
}

function renderPlayer(ctx, player) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function renderParticles(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function renderHud(ctx, game) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Level ${game.levelIndex + 1}/10`, 20, 32);
  ctx.textAlign = 'right';
  ctx.fillText(`Deaths: ${game.levelDeaths}`, ctx.canvas.width - 20, 32);
  ctx.textAlign = 'center';
  ctx.font = '18px sans-serif';
  ctx.fillText(game.totalTime.toFixed(2), ctx.canvas.width / 2, ctx.canvas.height - 16);
  ctx.textAlign = 'left';
}

function renderOverlay(ctx, game) {
  if (game.state === 'menu') {
    ctx.fillStyle = 'rgba(0,0,0,0.76)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 78px sans-serif';
    ctx.fillText('TRAP RUNNER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 24);
    ctx.font = '28px sans-serif';
    ctx.fillText('Press SPACE or Click to Start', ctx.canvas.width / 2, ctx.canvas.height / 2 + 36);
  }
  if (game.state === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }
  if (game.state === 'complete') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('YOU BEAT THE LEVEL DEVIL', ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
    ctx.font = '28px sans-serif';
    ctx.fillText(`Total deaths: ${game.totalDeaths}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    ctx.fillText(`Total time: ${game.totalTime.toFixed(2)}s`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 58);
  }
  ctx.textAlign = 'left';
}

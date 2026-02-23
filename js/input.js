const pressed = new Set();
const justPressed = new Set();

const keyMap = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyR: 'restart',
  Escape: 'escape'
};

export const touchState = { left: false, right: false, jump: false };

export function setupInput(touchContainer) {
  window.addEventListener('keydown', (e) => {
    const action = keyMap[e.code];
    if (!action) return;
    if (!pressed.has(action)) justPressed.add(action);
    pressed.add(action);
    if (['jump', 'left', 'right'].includes(action)) e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    const action = keyMap[e.code];
    if (!action) return;
    pressed.delete(action);
  });

  if (matchMedia('(pointer: coarse)').matches && touchContainer) {
    touchContainer.hidden = false;
    for (const button of touchContainer.querySelectorAll('button')) {
      const action = button.dataset.touch;
      const onStart = (event) => {
        event.preventDefault();
        touchState[action] = true;
      };
      const onEnd = (event) => {
        event.preventDefault();
        touchState[action] = false;
      };
      button.addEventListener('touchstart', onStart, { passive: false });
      button.addEventListener('touchend', onEnd, { passive: false });
      button.addEventListener('touchcancel', onEnd, { passive: false });
      button.addEventListener('mousedown', onStart);
      button.addEventListener('mouseup', onEnd);
      button.addEventListener('mouseleave', onEnd);
    }
  }
}

export function getInputState() {
  return {
    left: pressed.has('left') || touchState.left,
    right: pressed.has('right') || touchState.right,
    jump: pressed.has('jump') || touchState.jump,
    jumpPressed: justPressed.has('jump') || touchState.jump,
    restartPressed: justPressed.has('restart'),
    escapePressed: justPressed.has('escape')
  };
}

export function endInputFrame() {
  justPressed.clear();
}

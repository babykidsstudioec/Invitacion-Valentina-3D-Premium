/* BabyKids · profundidad delicada interactiva (escritorio y celulares) */
(() => {
  'use strict';
  const scene = document.querySelector('[data-depth-scene]');
  if (!scene) return;
  const container = scene.closest('.hero');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduced) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let frame = 0;
  let resetTimer;
  function apply(event, strength) {
    if (!document.body.classList.contains('invitation-open')) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(-.5,Math.min(.5,(event.clientX - rect.left)/rect.width-.5));
    const y = Math.max(-.5,Math.min(.5,(event.clientY - rect.top)/rect.height-.5));
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      scene.style.setProperty('--ry', `${(x*strength).toFixed(2)}deg`);
      scene.style.setProperty('--rx', `${(-y*strength*.8).toFixed(2)}deg`);
    });
  }
  const reset = () => {
    clearTimeout(resetTimer);
    scene.style.removeProperty('--ry');
    scene.style.removeProperty('--rx');
  };
  if (fine) {
    container.addEventListener('pointermove', event => apply(event, 6), {passive:true});
    container.addEventListener('pointerleave', reset, {passive:true});
  } else {
    // En móvil se inclina brevemente al tocar la foto; no bloquea el scroll.
    container.addEventListener('pointerdown', event => {
      if (event.isPrimary === false) return;
      apply(event, 7);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(reset, 800);
    }, {passive:true});
    container.addEventListener('pointercancel', reset, {passive:true});
  }
})();

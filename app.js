/* BabyKids Studio — Invitación Valentina Premium + Google Sheets via Apps Script */
(() => {
  'use strict';
  const cfg = window.BABYKIDS_CONFIG || {};
  const $ = id => document.getElementById(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxGuests = Math.min(4, Math.max(1, Number(cfg.maxAsistentes) || 4));
  const endpoint = String(cfg.appsScriptUrl || '').trim();
  let busy = false;
  let opened = false;

  /* Siempre comenzar arriba, incluso al volver desde otra pestaña o usando Atrás.
     Se neutraliza el scroll suave solo durante el reposicionamiento. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function goToTop() {
    const root = document.documentElement;
    const prior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => { root.style.scrollBehavior = prior; });
  }
  goToTop();
  window.addEventListener('load', goToTop);
  window.addEventListener('pageshow', event => {
    goToTop();
    requestAnimationFrame(goToTop);
    // Safari/iPhone también puede restaurar el desplazamiento algo más tarde.
    setTimeout(goToTop, 100);
    if (event.persisted) {
      // Al regresar mediante el historial, vuelve a mostrar el sobre inicial.
      opened = false;
      const overlay = document.getElementById('magic-gate');
      const open = document.getElementById('open-envelope');
      if (overlay && open) {
        overlay.hidden = false;
        overlay.classList.remove('opening', 'gone');
        document.body.classList.remove('invitation-open');
        open.disabled = false;
        document.getElementById('gate-hint').textContent = '✧ Pulsa el sobre para abrirlo ✧';
        const audioEl = document.getElementById('birthday-audio');
        if (audioEl && !audioEl.paused) audioEl.pause();
      }
    }
  });

  /* Música — la mayoría de navegadores exige un toque del usuario */
  const audio = $('birthday-audio');
  // Los archivos originales de imagen y música se incluyen en el ZIP.
  // Si un archivo falta, el navegador mostrará la imagen alternativa o el audio no sonará.

  const musicBtn = $('music-button');
  async function toggleMusic() {
    if (!audio.paused) { audio.pause(); return; }
    try { audio.volume = .53; await audio.play(); } catch (e) { console.info('Toca Play para activar la música', e); }
  }
  function refreshMusic() {
    const playing = !audio.paused;
    musicBtn.textContent = playing ? 'Ⅱ' : '▶';
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  }
  musicBtn.addEventListener('click', toggleMusic);
  audio.addEventListener('pause', refreshMusic);
  audio.addEventListener('play', refreshMusic);

  /* Apertura del sobre y lluvia de mariposas / destellos */
  const gate = $('magic-gate'), openBtn = $('open-envelope');
  function magicBurst() {
    const root = $('magic-particles');
    if (!root) return;
    // Dibujadas con SVG para que las mariposas se vean igual en iPhone y Android.
    // Se colocan alrededor de la pantalla (no encima del formulario) y sobreviven
    // a la transición del sobre para que el usuario alcance a verlas.
    const butterflySVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M31 31C14 2-2 10 7 29c4 9 14 10 23 7-17 5-19 26-6 23 8-2 10-13 10-22" fill="#e9a7c2" stroke="#b37791" stroke-width="1.3"/>
      <path d="M33 31C50 2 66 10 57 29c-4 9-14 10-23 7 17 5 19 26 6 23-8-2-10-13-10-22" fill="#edc5d2" stroke="#b37791" stroke-width="1.3"/>
      <path d="M31 29c-8-10-17-14-21-11M33 29c8-10 17-14 21-11" fill="none" stroke="#fff7eb" stroke-width="2"/>
      <path d="M31 21c-8-8-4-14-7-15M33 21c8-8 4-14 7-15" fill="none" stroke="#987285" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M32 22q-5 13 0 28q5-15 0-28" fill="#987285"/>
      <circle cx="19" cy="27" r="2.5" fill="#fff8ed" opacity=".95"/>
      <circle cx="45" cy="27" r="2.5" fill="#fff8ed" opacity=".95"/>
    </svg>`;
    const amount = window.matchMedia('(max-width:640px)').matches ? 10 : 13;
    for (let i = 0; i < amount; i++) {
      const part = document.createElement('span');
      part.className = 'butterfly-fly';
      part.setAttribute('aria-hidden','true');
      part.innerHTML = butterflySVG;
      // Concentradas a los costados, para no tapar el nombre Valentina.
      const side = i % 2 === 0;
      const x = side ? 2 + Math.random() * 23 : 74 + Math.random() * 22;
      part.style.setProperty('--bx', `${x}vw`);
      part.style.setProperty('--by', `${17 + Math.random() * 60}vh`);
      part.style.setProperty('--bsize', `${25 + Math.random() * 22}px`);
      part.style.setProperty('--dx', `${-45 + Math.random() * 90}px`);
      part.style.setProperty('--bdelay', `${Math.random() * 1.0}s`);
      part.style.setProperty('--duration', `${4.7 + Math.random() * 1.7}s`);
      root.appendChild(part);
      if (reduced) {
        // El efecto visual queda estático y breve, respetando accesibilidad.
        setTimeout(() => part.remove(), 3200);
      } else {
        part.addEventListener('animationend', () => part.remove(), {once:true});
        setTimeout(() => part.remove(), 9500);
      }
    }
    if (reduced) return;
    const chars = ['✦','✧','✿','♡'];
    for (let i = 0; i < 16; i++) {
      const part = document.createElement('span');
      part.className = 'particle'; part.textContent = chars[i % chars.length];
      part.style.setProperty('--x', `${7 + Math.random()*86}vw`);
      part.style.setProperty('--delay', `${Math.random()*.85}s`);
      part.style.setProperty('--drift', `${-90+Math.random()*180}px`);
      part.style.setProperty('--time', `${3 + Math.random()*2}s`);
      part.style.fontSize = `${14 + Math.random()*15}px`;
      root.appendChild(part);
      part.addEventListener('animationend', () => part.remove(), {once:true});
      setTimeout(() => part.remove(), 8500);
    }
  }
  openBtn.addEventListener('click', () => {
    if (opened) return;
    opened = true; openBtn.disabled = true;
    gate.classList.add('opening');
    $('gate-hint').textContent = '✧ Tu sorpresa está por comenzar ✧';
    // El gesto del usuario permite intentar reproducir audio.
    if (audio.paused) toggleMusic();
    const pause = reduced ? 40 : 1450;
    setTimeout(() => {
      // La tarjeta siempre se revela desde el comienzo, no desde el último scroll.
      goToTop();
      gate.classList.add('gone');
      document.body.classList.add('invitation-open');
      requestAnimationFrame(goToTop);
      magicBurst();
      setTimeout(() => { gate.hidden = true; }, reduced ? 50 : 850);
    }, pause);
  });

  /* Fecha, cuenta regresiva y ubicación */
  $('valentina-title').textContent = String(cfg.nombre || 'Valentina');
  $('event-message').textContent = String(cfg.mensaje || 'Un día mágico para compartir juntos.');
  $('place-text').textContent = String(cfg.lugar || 'El bosque encantado');
  if (/^https:\/\//.test(String(cfg.mapa || ''))) $('map-button').href = cfg.mapa;
  const date = String(cfg.fecha || '2026-12-24');
  const hr = String(cfg.hora || '15:00');
  const offset = /^[-+]\d\d:\d\d$/.test(cfg.zonaHorariaUTC) ? cfg.zonaHorariaUTC : '-05:00';
  const [year,month,day] = date.split('-').map(Number), [hh,mm] = hr.split(':').map(Number);
  if ([year,month,day,hh,mm].every(Number.isFinite)) {
    const d = new Date(Date.UTC(year,month-1,day));
    $('date-text').textContent = new Intl.DateTimeFormat('es-EC',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'UTC'}).format(d);
    $('time-text').textContent = new Intl.DateTimeFormat('es-EC',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,1,hh,mm)));
  }
  const eventTS = Date.parse(`${date}T${hr}:00${offset}`);
  function countdown() {
    if (!Number.isFinite(eventTS)) return;
    let left = Math.max(0,eventTS-Date.now());
    const d = Math.floor(left/86400000);left%=86400000;
    const h = Math.floor(left/3600000);left%=3600000;
    const m = Math.floor(left/60000);const s=Math.floor(left%60000/1000);
    [d,h,m,s].forEach((v,i)=>{ $(['days','hours','minutes','seconds'][i]).textContent=String(v).padStart(2,'0'); });
    if (eventTS<=Date.now()) $('countdown-note').textContent='¡Gracias por ser parte de esta celebración!';
  }
  countdown(); setInterval(countdown,1000);

  /* RSVP — un solo enlace, una respuesta por nombre coincidente en Sheets */
  const form=$('rsvp-form'), feedback=$('rsvp-feedback'), confirmBtn=$('confirm-button');
  const attendance=$('attendance'), adults=$('adults'), children=$('children');
  const setup=$('setup-warning');
  const configured=/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint);
  if (!configured) { setup.hidden=false; confirmBtn.textContent='✧ Probar formulario (sin guardar)'; }
  const readNum = el => Number.parseInt(el.value,10) || 0;
  function updateTotal() {
    const yes=attendance.value==='si';
    $('attendee-block').hidden=!yes;
    const sum=readNum(adults)+readNum(children);
    const total=$('total-count');total.textContent=`${sum} ${sum===1?'persona':'personas'}`;
    const valid=sum>=1 && sum<=maxGuests;
    total.closest('.total-indicator').classList.toggle('invalid',yes&&!valid);
    return !yes || valid;
  }
  [attendance,adults,children].forEach(el=>el.addEventListener('change',updateTotal));updateTotal();
  function msg(text,type='') { feedback.textContent=text; feedback.className='rsvp-feedback '+type; }
  function done(title,body) {
    form.hidden=true;
    const box=$('rsvp-done');box.hidden=false;
    $('done-heading').textContent=title;$('done-copy').textContent=body;
    box.focus();
  }
  // JSONP para Apps Script: Google redirige la respuesta, y fetch POST desde GitHub Pages
  // puede ser bloqueado por CORS. JSONP funciona con ContentService JSON JavaScript.
  // IMPORTANTE: solo usamos nuestra propia URL de Apps Script configurada arriba.
  function request(params) {
    return new Promise((resolve,reject)=>{
      if (!configured) {reject(new Error('Sin conexión a Google Sheets'));return;}
      const callback='__bk'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
      const script=document.createElement('script');
      let settled=false;
      const cleanup=()=>{delete window[callback];script.remove();clearTimeout(timeout)};
      const finish=(error,value)=>{if(settled)return;settled=true;cleanup();error?reject(error):resolve(value)};
      const timeout=setTimeout(()=>finish(new Error('Tiempo de espera agotado')),18000);
      window[callback]=result=>finish(null,result);
      const qs=new URLSearchParams({...params,callback});
      script.src=endpoint+'?'+qs.toString();script.async=true;
      script.onerror=()=>finish(new Error('No se pudo conectar con el registro'));
      document.head.appendChild(script);
    });
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    const name=$('guest-name').value.trim().replace(/\s+/g,' ');
    const yes=attendance.value==='si';
    const a=yes?readNum(adults):0, n=yes?readNum(children):0;
    const note=$('guest-note').value.trim();
    if(name.length<4||name.length>90||name.split(/\s+/).length<2){msg('Escribe tu nombre y un apellido. Puedes omitir el segundo nombre y las tildes.','error');$('guest-name').focus();return}
    if(!updateTotal()){msg('Puedes confirmar entre 1 y 4 personas en total, contando adultos y niños.','error');return}
    if(!configured){msg('Vista previa correcta. No se guardó ninguna respuesta: falta publicar y conectar Apps Script.','info');return}
    busy=true;confirmBtn.disabled=true;confirmBtn.textContent='Verificando y registrando…';msg('Estamos buscando tu nombre en la lista…','info');
    try {
      const reply=await request({action:'confirm',name,attendance:yes?'Confirmado':'No asistirá',adults:a,children:n,note});
      if(reply.ok){
        done(yes?'¡Tu asistencia está confirmada!':'¡Gracias por avisarnos!', yes?
          `Registramos ${a+n} ${a+n===1?'asistente':'asistentes'} para ${name}. ¡Te esperamos!`:
          `Registramos que ${name} no podrá asistir. ¡Gracias por responder!`);
      } else if(reply.code==='already_answered'){
        done('Esta respuesta ya fue registrada','La confirmación para ese nombre ya se realizó. El formulario está bloqueado para evitar duplicados.');
      } else if(reply.code==='not_found'){
        msg('No encontramos una coincidencia. Escribe tu nombre y al menos un apellido correcto, o comunícate con el organizador.','error');
      } else if(reply.code==='ambiguous'){
        msg('Hay más de un invitado con esas palabras. Escribe otro nombre o apellido para identificarte.','error');
      } else {
        msg(reply.message||'No pudimos guardar tu respuesta. Inténtalo de nuevo.','error');
      }
    } catch(err){ msg('No hay conexión con el registro. Revisa internet y vuelve a intentar; evita enviar varias veces seguidas.','error'); console.warn(err); }
    finally {busy=false;if(!form.hidden){confirmBtn.disabled=false;confirmBtn.textContent='♡   Confirmar mi respuesta   ✧'}}
  });
})();

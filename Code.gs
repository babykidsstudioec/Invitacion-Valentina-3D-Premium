/**
 * BABYKIDS STUDIO FOTOGRÁFICO · VALENTINA
 * Backend Google Apps Script para invitaciones generales.
 * Publicación: Implementar > Nueva implementación > Aplicación web
 * Ejecutar como: Yo | Quién tiene acceso: Cualquier usuario.
 * Se usa JSONP para que la página GitHub Pages pueda leer la respuesta.
 * NOTA: Es una DEMO por nombre, no verifica identidad; comparte la hoja solo con el organizador.
 * La coincidencia parcial solo se admite si identifica una fila única.
 */
const CFG = Object.freeze({
  SPREADSHEET_ID: '1iPeIG1y7b7AcY10LP0t95JSkceDafJ0YzajTkH89-6k',
  INVITADOS: 'Invitados',
  REVISAR: 'Por revisar',
  HEADER_ROW: 5,
  MAX_PERSONAS: 4
});

function doGet(e) {
  const p = (e && e.parameter) || {};
  // El nombre se genera al azar en nuestro sitio. Un callback malicioso se rechaza.
  const cb = String(p.callback || '').trim();
  if (!/^[$A-Za-z_][$A-Za-z0-9_]{0,80}$/.test(cb)) {
    return ContentService.createTextOutput('Callback inválido');
  }
  let response;
  try {
    if (p.action === 'confirm') response = register_(p);
    else if (p.action === 'ping') response = {ok: true, service: 'BabyKids RSVP', version: '1.0'};
    else response = {ok: false, code: 'invalid_action', message: 'Acción no reconocida'};
  } catch (err) {
    console.error(err);
    response = {ok: false, code: 'server_error', message: 'No fue posible procesar la respuesta'};
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(response) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function register_(p) {
  const name = safeText_(p.name, 90), note = safeText_(p.note, 250);
  const status = String(p.attendance || '').trim();
  const going = status === 'Confirmado';
  const notGoing = status === 'No asistirá';
  const adults = Number(p.adults), children = Number(p.children);
  const total = adults + children;
  if (name.length < 4) return {ok:false, code:'invalid_name', message:'Indica nombre y apellido'};
  if (!going && !notGoing) return {ok:false, code:'invalid_attendance', message:'Asistencia no válida'};
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults<0 || children<0 ||
      (going && (total < 1 || total > CFG.MAX_PERSONAS)) || (!going && total !== 0)) {
    return {ok:false, code:'invalid_count', message:'Máximo cuatro personas en total'};
  }
  // Bloqueo evita registros simultáneos duplicados para el mismo nombre.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(12000)) return {ok:false, code:'busy', message:'Registro ocupado. Inténtalo nuevamente.'};
  try {
    const ss=SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sh=ss.getSheetByName(CFG.INVITADOS);
    if (!sh) throw new Error('Falta la pestaña Invitados');
    const last=Math.max(CFG.HEADER_ROW+1,sh.getLastRow());
    const rows=sh.getRange(CFG.HEADER_ROW+1,2,last-CFG.HEADER_ROW,3).getDisplayValues(); // B:C:D
    // Buscar sin exigir el nombre completo literal. Siempre priorizamos una
    // coincidencia exacta para evitar confundir dos familiares parecidos.
    const match = findGuestRows_(rows, name);
    if (match.code === 'need_more') {
      return {ok:false, code:'invalid_name',
        message:'Escribe al menos dos palabras: por ejemplo, tu nombre y apellido.'};
    }
    const hits = match.hits;
    if (!hits.length) {
      review_(ss,name,status,adults,children,'No coincide con un nombre de la lista, ni por coincidencia parcial única');
      return {ok:false,code:'not_found',message:'No encontramos una coincidencia. Escribe tu nombre y un apellido correcto.'};
    }
    if (hits.length>1) {
      review_(ss,name,status,adults,children,'Coincidencia ambigua: varios invitados comparten las palabras escritas');
      return {ok:false,code:'ambiguous',message:'Varios invitados coinciden. Escribe un nombre o apellido adicional.'};
    }
    const hit=hits[0];
    // Columna D = respuesta original persistente. Si ya existe, no permitir actualización.
    if (String(hit.data[2]||'').trim()) return {ok:false,code:'already_answered',message:'Ya existe una confirmación para este invitado'};
    const shRow=hit.row;
    // No modificar nombre ni fórmulas del estado (col. E), total (H) ni bloqueo (K).
    sh.getRange(shRow,4).setValue(status);                      // D
    sh.getRange(shRow,6,1,2).setValues([[going?adults:0,going?children:0]]); // F:G
    sh.getRange(shRow,9).setValue(new Date());                 // I
    if(note) sh.getRange(shRow,10).setValue(asCellText_(note));// J
    SpreadsheetApp.flush();
    return {ok:true,code:'saved',status,total:going?total:0};
  } finally { lock.releaseLock(); }
}

/**
 * Ejemplos admitidos (si hay una coincidencia única):
 *   María Fernanda Torres -> Maria Torres / María Fernanda
 *   José Miguel Zambrano -> Jose Zambrano / Miguel Zambrano
 * Se eliminan solo tildes, mayúsculas, signos y nombres intermedios omitidos.
 * No se inventa una coincidencia para letras mal escritas, ni se publica la lista.
 */
function findGuestRows_(rows, name) {
  const key = normalizeName_(name);
  const typed = key.split(' ').filter(Boolean);
  if (typed.length < 2) return {code:'need_more', hits:[]};
  const entries = rows.map((r, i) => ({
    row: CFG.HEADER_ROW + i + 1,
    data: r,
    key: normalizeName_(r[0])
  })).filter(e => e.key);

  const exact = entries.filter(e => e.key === key);
  if (exact.length) return {code:'exact', hits:exact};

  // Cada palabra escrita debe coincidir EXACTAMENTE con una palabra de la
  // lista, respetando el orden, pero se permiten nombres intermedios omitidos.
  // Esta búsqueda parcial solo se acepta si da UNA coincidencia inequívoca.
  const partial = entries.filter(e => {
    const words = e.key.split(' ');
    let cursor = 0;
    for (const word of typed) {
      const ix = words.indexOf(word, cursor);
      if (ix === -1) return false;
      cursor = ix + 1;
    }
    return true;
  });
  return {code:'partial', hits:partial};
}

function normalizeName_(x) {
  return String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9 ]/g,' ').toLowerCase().replace(/\s+/g,' ').trim();
}
function safeText_(x,max) {
  return String(x||'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
}
function asCellText_(x) { return /^[=+\-@]/.test(x) ? "'"+x : x; }
function review_(ss,name,status,adults,children,why) {
  const sh=ss.getSheetByName(CFG.REVISAR);
  if(sh) sh.appendRow([new Date(),asCellText_(name),'',status,adults,children,why,'No']);
}

/** Prueba opcional dentro de Apps Script: no altera la hoja. */
function pruebaConexion() {
  const sheet=SpreadsheetApp.openById(CFG.SPREADSHEET_ID).getSheetByName(CFG.INVITADOS);
  Logger.log('Conectado. Primera prueba: ' + sheet.getRange('B6').getDisplayValue());
}

/** Prueba de reconocimiento SIN escribir nada en Google Sheets. */
function pruebaNombresFlexibles() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(CFG.INVITADOS);
  const last = Math.max(sh.getLastRow(), CFG.HEADER_ROW + 1);
  const rows = sh.getRange(CFG.HEADER_ROW + 1, 2, last - CFG.HEADER_ROW, 3).getDisplayValues();
  ['Maria Torres', 'MARÍA FERNANDA TORRES', 'Jose Zambrano', 'Ana Mendoza', 'Maria'].forEach(name => {
    const result = findGuestRows_(rows, name);
    const labels = result.hits.map(x => x.data[0]);
    Logger.log(name + ' -> ' + (labels.length ? labels.join(' | ') : result.code));
  });
}

# BabyKids Studio Fotográfico — Invitación Valentina 3D Premium

## ¿Qué incluye esta entrega?

El **sitio completo**, sin necesidad de rescatar archivos del proyecto anterior:

- `index.html`: página de invitación y formulario.
- `styles.css`: diseño base del bosque encantado.
- `assets/css/3d.css`: efecto 3D del interior, relieve, profundidad y adaptación al móvil.
- `app.js`: sobre animado, música, cuenta regresiva y formulario.
- `assets/js/3d.js`: efecto 3D sutil al mover el mouse en computadora.
- `config.js`: datos que podrás modificar al crear nuevas invitaciones.
- `assets/img/valentina.webp`: foto original usada en el ejemplo.
- `assets/img/preview-whatsapp.jpg`: imagen de vista previa al compartir.
- `assets/audio/cumpleanos-feliz.mp3`: melodía de cumpleaños.
- `backend/Code.gs`: **código de Google Apps Script**, se pega en Google, no hace falta subirlo al sitio.

### Funciones

1. **Sobre mágico de apertura**, con mariposas, brillitos, flores y música activable.
2. **Interior con efecto 3D**, entrada tridimensional de la tarjeta, capas, profundidad, relieve y movimiento delicado en escritorio; en móvil conserva sombras y relieve sin forzar inclinaciones que dificulten la lectura.
3. Fecha, lugar, botón Google Maps y cuenta regresiva real (hora de Guayaquil, UTC−05:00).
4. Formulario de RSVP: nombre, asistencia sí/no, adultos, niños (entre 1 y **4 personas** en total si asisten), mensaje opcional.
5. Una vez conectado Apps Script, se marca automáticamente la fila en Sheets **verde = confirmado, rojo = pendiente y gris/plomo = no asistirá**.
6. Google Apps Script impide **una segunda respuesta con el mismo nombre** una vez registrado en la columna D; la invitación sigue pudiéndose ver.
7. Todos usan **un solo enlace público**, no hay enlaces individuales.

## PASO 1 — Abrir en Visual Studio Code

1. Descomprime el ZIP `Valentina_3D_Premium_PARA_VISUAL_STUDIO.zip` en tu escritorio.
2. Abre Visual Studio Code y selecciona **Archivo → Abrir carpeta**; elige la carpeta descomprimida.
3. En la lista de archivos, haz clic derecho en **`index.html` → Open with Live Server**.
4. Se abrirá tu navegador. **Toca el sobre**, mira la fotografía, prueba la música, el mapa y rellena el formulario.
5. Por ahora verás el mensaje **"Modo de demostración: falta conectar Google Apps Script"**. Esto es normal; evita afirmar que se registró una asistencia si todavía no has conectado Google.

## PASO 2 — Conectar Google Sheets y Google Apps Script

Tu hoja actual está aquí:
https://docs.google.com/spreadsheets/d/1iPeIG1y7b7AcY10LP0t95JSkceDafJ0YzajTkH89-6k/edit

**Ya contiene diez nombres ficticios de prueba**, además de cualquier nombre adicional que hayas escrito por tu cuenta. No borres tus modificaciones actuales.

1. Abre la hoja con tu cuenta de Google.
2. Haz clic en **Extensiones → Apps Script**.
3. En el editor `Código.gs` / `Code.gs`, elimina el código predeterminado.
4. Abre en Visual Studio Code la carpeta `backend` y copia **todo** el contenido de `Code.gs` al editor de Apps Script.
5. Guarda con **Ctrl + S**. Ponle nombre al proyecto: `BabyKids – RSVP Valentina`.
6. Selecciona la función **`pruebaConexion`**, haz clic en **Ejecutar** y autoriza los permisos de acceso a **tu hoja**. Debe mostrar un nombre de la lista en el registro de ejecución.
7. En la parte superior derecha, pulsa **Implementar → Nueva implementación**.
8. En "Seleccionar tipo", elige **Aplicación web**. Configura:
   - **Ejecutar como:** Yo (tu cuenta).
   - **Quién tiene acceso:** Cualquier usuario / Cualquiera.
9. Pulsa **Implementar** y copia la URL que termina exactamente en **`/exec`**.
10. Vuelve a Visual Studio Code, abre **`config.js`**, y reemplaza:

   ```js
   appsScriptUrl: ''
   ```

   por tu dirección real:

   ```js
   appsScriptUrl: 'https://script.google.com/macros/s/TU_ID_REAL/exec'
   ```

11. Guarda `config.js` con **Ctrl + S** y recarga la vista de Live Server.

> Si editas Apps Script posteriormente, utiliza **Implementar → Administrar implementaciones → Editar → Nueva versión → Implementar** para publicar la nueva versión. Guardar el código sin actualizar la implementación no cambia la versión web publicada.

### PRUEBA DEL REGISTRO

1. En la hoja, selecciona un nombre todavía marcado **Pendiente**.
2. Escríbelo **exactamente** en el formulario. Por ejemplo: `María Fernanda Torres`, si sigue pendiente cuando hagas la prueba.
3. Selecciona **Sí asistiré**, **2 adultos** y **1 niño** (total 3), y envía.
4. Si Apps Script está correctamente configurado, aparecerá **Tu asistencia está confirmada**.
5. Verifica la hoja: columna `D` = `Confirmado`, columna `E` = `Confirmado`, adultos = `2`, niños = `1`, total = `3`, fila **VERDE**.
6. Recarga la invitación y prueba a confirmar con **el mismo nombre**: deberá indicar que **ya fue registrada**, sin sumar una nueva respuesta.
7. Prueba con otro nombre pendiente y selecciona **No podré asistir**. Su fila cambiará a **PLOMO / GRIS**.
8. Si colocas un nombre que no está en la lista, se avisará al invitado y el intento quedará en la hoja `Por revisar`.

**Si registras una prueba real por error:** para dejar ese invitado nuevamente Pendiente, limpia la celda de la columna `D` de su fila y, si corresponde, las columnas `F`, `G`, `I` y `J`. La columna `E` volverá a calcular Pendiente automáticamente.

## PASO 3 — Publicar en GitHub Pages

Si quieres actualizar la invitación actual, el repositorio es:
https://github.com/babykidsstudioec/Invitacion-Valentina

**Recomendación:** primero haz una copia de seguridad del proyecto antiguo en tu PC para no perder la versión anterior.

En **la carpeta del repositorio local que ya usabas para Valentina**:

1. Copia y reemplaza los archivos de la nueva versión: `index.html`, `styles.css`, `app.js`, `config.js` y toda la carpeta `assets`.
2. **No es necesario subir `backend/Code.gs`** a GitHub; ya debe estar publicado mediante Apps Script.
3. Abre la terminal de Visual Studio Code y ejecuta:

   ```powershell
   git status
   git add index.html styles.css app.js config.js assets
   git commit -m "Valentina: invitacion 3D premium y formulario Google Sheets"
   git push origin main
   ```

4. Si `git` muestra `nothing to commit`, significa que los cambios ya fueron registrados; revisa `git status`.
5. Comprueba GitHub Pages: en Settings → Pages, Source **Deploy from a branch**, `main`, `/(root)`.
6. Enlace de la invitación: https://babykidsstudioec.github.io/Invitacion-Valentina/

Si la acabas de publicar, GitHub Pages puede demorar unos minutos. Para revisar archivos nuevos en el navegador prueba con `?v=9` en el enlace (los previews de WhatsApp pueden mantener imágenes en caché).

### ¿Quieres conservar la invitación anterior?

Antes de subir al repositorio existente, crea un **repositorio de demostración diferente**; así esta versión 3D no reemplazará la versión antigua. Primero podemos revisarla juntos y decidir dónde publicarla.

## Limitaciones que debes conocer

- Una sola invitación para todos **sí puede bloquear segundas respuestas por nombre**, pero **no puede impedir que alguien comparta el enlace** o confirme haciéndose pasar por otra persona.
- Los nombres deben coincidir con la lista (no importan tildes y mayúsculas, pero sí el contenido del nombre); si hay dos nombres iguales, la respuesta quedará pendiente de revisión.
- El formulario de demostración utiliza **JSONP sobre una petición GET** para recibir respuestas desde Apps Script y GitHub Pages. Eso significa que nombre y datos enviados pueden quedar en URLs/registros de servicio; **no recolectes datos sensibles en esta versión de prueba**. Antes de vender a clientes con listas reales recomendamos migrar a un servicio con POST y controles de acceso, limitación de peticiones y aviso de privacidad adecuado.
- **Google Sheets no debe hacerse público**. Apps Script se ejecuta desde tu cuenta, la hoja privada solo la ve el organizador.
- Para uso comercial frecuente utiliza un alojamiento adecuado; GitHub Pages no es el hosting recomendado para un servicio comercial de invitaciones.
- Usa fotografías de niños únicamente con las autorizaciones pertinentes.

---

**BabyKids Studio Fotográfico** · Demo interactiva de Valentina, Ecuador, 2026.


## Cambios de esta versión
- Eliminado el campo de teléfono del formulario.
- Cuando se abre o se vuelve a entrar (incluso usando Atrás), el desplazamiento empieza desde arriba.
- La invitación mantiene el sobre 3D, el formulario y el máximo de cuatro personas.
- Si aún no publicaste Apps Script, utiliza el archivo backend/Code.gs actualizado. Si ya lo publicaste, el sitio seguirá funcionando sin enviar teléfono; puedes actualizar después el script.

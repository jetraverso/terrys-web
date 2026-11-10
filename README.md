# Terry's Burgers — web pública

Sitio estático (HTML + CSS + JS, sin build) para **terrysburgers.com**.

Secciones: Historia · Productos (burgers con personaje e ingredientes) · Carta · Delivery & Take away
(Glovo, Uber Eats, Just Eat y take away por Ágora con QR) · **Reservas** · **Eventos** (privados, agenda
y catering) · Trabajá con nosotros · Contacto.

## Archivos

- `index.html` — toda la página (incluye metadatos para Google y redes).
- `styles.css` — estilos (blanco y negro, Bernard MT Condensed + Montserrat).
- `app.js` — interacción. Arriba de todo en la parte **CONFIGURACIÓN** están la conexión a Supabase,
  los turnos con reserva y el máximo de personas.
- `assets/` — fotos, logos de plataformas y tipografía.

## Reservas, consultas y agenda

Usan el **mismo proyecto de Supabase que admin.terrysburgers.com**. Las tablas y funciones están en
`../administracion/schema.sql`, parte 9 (`reservas`, `eventos_consultas`, `agenda`,
`web_reservar()`, `web_consulta_evento()`).

- La web solo puede **crear** reservas/consultas (con validación y límite anti-spam en la base) y
  **leer** la agenda publicada. No puede ver ninguna reserva.
- Se gestionan desde la solapa **Web** de admin.terrysburgers.com: confirmar con un toque de WhatsApp,
  cambiar estado, responder consultas y cargar fechas en la agenda.
- Si cambian los horarios con reserva, cambiarlos en `CONFIG.turnos` (app.js) **y** en `web_reservar()`.

## Probar en la Mac

```bash
python3 -m http.server 8792 --directory .
```

y abrir http://localhost:8792.

Al cambiar `styles.css` o `app.js`, subir el número `?v=` en `index.html` para que los navegadores no
usen la versión vieja.

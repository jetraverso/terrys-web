/* Terry's Burgers · Pedido take away
   Paso 1: cómo (recoger en el local) · Paso 2: día y hora · Paso 3: productos · Paso 4: resumen.
   La carta sale de web_carta(): los productos que se muestran (nombre, foto, descripción) se eligen
   en la solapa Pedidos del admin, y el precio y las opciones (extras, quitar, salsa, partes del menú)
   vienen de Ágora. El pedido va a web_pedir(), que cobra con esos mismos datos, y entra solo en Ágora.
   Por ahora se paga al retirar. */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ------------------------------------------------------------------ */
/* CONFIGURACIÓN                                                        */
/* ------------------------------------------------------------------ */
const CONFIG = {
  // Mismo proyecto de Supabase que la web y el admin. Clave pública: solo puede llamar a web_pedir().
  supabaseUrl: "https://cgkpklimplpedgxbgzvu.supabase.co",
  supabaseKey: "sb_publishable_yG1hrdoynoxBBYh9LX7QpA_we_bb_qC",
  telefono: "615 35 11 31",
  // Horario del local. Se puede pasar a buscar desde 15 min después de abrir hasta el cierre.
  turnos: { Mediodía: ["13:00", "15:30"], Noche: ["20:00", "23:00"] },
  paso: 15,             // minutos entre horarios
  margen: 30,           // minutos mínimos para preparar el pedido
  diasAdelante: 1,      // hoy y mañana
};

const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ------------------------------------------------------------------ */
/* CARTA (web_carta: productos del admin + precios y opciones de Ágora)   */
/* ------------------------------------------------------------------ */
// Cada línea del carrito es "producto|variante|opciones" (variante: simple/doble o vacío;
// opciones: ids de Ágora ordenados y separados por coma).
const clave = (id, v = "", ops = []) => `${id}|${v}|${[...ops].map(Number).sort((a, b) => a - b).join(",")}`;
const NOMBRES_CAT = { burgers: "Hamburguesas", menus: "Menús", picar: "Para picar", bebidas: "Bebidas", postres: "Postres" };
const cap = t => t ? t[0].toUpperCase() + t.slice(1) : "";
let CATEGORIAS = [];
let VARIANTES = {};   // "id|v" → { id, v, nombre, titulo, desc, precio, img, cat, roles }
let cartaLista = false, cartaError = false;

function armarCarta(filas){
  CATEGORIAS = []; VARIANTES = {};
  const variantes = r => (r.variantes || []).filter(x => x.precio != null).map(x => {
    const v = x.v || "";
    const titulo = r.categoria === "burgers" ? (v === "doble" ? `${r.nombre} Doble` : r.nombre) : v ? `${r.nombre} ${v}` : r.nombre;
    const it = { id: r.id, v, nombre: r.nombre, titulo,
                 desc: r.descripcion || "", precio: +x.precio, img: r.foto_url || "", cat: r.categoria,
                 roles: (x.roles || []).filter(g => g.opciones && g.opciones.length) };
    VARIANTES[`${r.id}|${v}`] = it;
    return it;
  });
  for (const cat of Object.keys(NOMBRES_CAT)){
    const items = filas.filter(r => r.categoria === cat).flatMap(variantes);
    if (!items.length) continue;
    if (cat === "burgers"){
      const dobles = items.filter(x => x.v === "doble"), simples = items.filter(x => x.v !== "doble");
      const grupos = [];
      if (dobles.length) grupos.push({ titulo: "Dobles", sub: "Dos medallones de carne de 100 g en pan brioche", items: dobles });
      if (simples.length) grupos.push({ titulo: "Simples", sub: "Un medallón de carne de 100 g en pan brioche", items: simples });
      CATEGORIAS.push({ id: cat, nombre: NOMBRES_CAT[cat], grupos });
    } else {
      CATEGORIAS.push({ id: cat, nombre: NOMBRES_CAT[cat], grupos: [{ items }] });
    }
  }
}

// Menús: solo de lunes a viernes al mediodía (retiro entre las 12:00 y las 16:00).
function menuDisponible(){
  if (!estado.dia || !estado.hora) return false;
  const dow = new Date(estado.dia + "T12:00:00Z").getUTCDay();
  return dow >= 1 && dow <= 5 && estado.hora >= "12:00" && estado.hora <= "16:00";
}
const catVisible = c => c.id !== "menus" || menuDisponible();
let menusSacados = false;
function sacarNoDisponibles(){
  let sacados = false;
  for (const k of Object.keys(estado.items)) if (!linea(k)) { if (k.startsWith("menu")) sacados = true; delete estado.items[k]; }
  if (sacados) { menusSacados = true; guardar(); }
}

// Una línea del carrito armada (nombre, detalle y precio con extras); null si ya no es válida.
function linea(k){
  const [id, v, s] = k.split("|");
  const it = VARIANTES[`${id}|${v}`]; if (!it) return null;
  if (it.cat === "menus" && !menuDisponible()) return null;
  const ops = s ? s.split(",").map(Number) : [];
  const todas = it.roles.flatMap(g => g.opciones);
  if (ops.some(o => !todas.some(x => x.id === o))) return null;
  for (const g of it.roles){
    const n = g.opciones.filter(o => ops.includes(o.id)).length;
    if (n < g.min || n > g.max) return null;
  }
  const elegidas = todas.filter((x, i) => ops.includes(x.id) && todas.findIndex(y => y.id === x.id) === i);
  const extra = elegidas.map(x => x.nombre).join(", ");
  return { ...it, ops, extra, precio: it.precio + elegidas.reduce((t, x) => t + (+x.precio || 0), 0) };
}

async function cargarCarta(){
  try {
    armarCarta(await rpc("web_carta", {}) || []);
    cartaLista = true; cartaError = false;
    // lo que había en el carrito y ya no está (o cambió) se saca
    for (const k of Object.keys(estado.items)) if (!linea(k)) delete estado.items[k];
    if (!CATEGORIAS.some(c => c.id === estado.cat)) estado.cat = CATEGORIAS[0]?.id || "burgers";
    guardar();
  } catch {
    cartaError = true;
  }
  if (pasoActual === 3) pintarCatalogo();
  if (pasoActual === 4) pintarResumen();
  pintarCarrito();
}

/* ------------------------------------------------------------------ */
/* ESTADO (se guarda en este navegador para no perder el pedido)        */
/* ------------------------------------------------------------------ */
const CLAVE = "terrys-pedido-v3";
let estado = { modo: "recoger", dia: null, hora: null, cat: "burgers", items: {} };
try {
  const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
  if (g && typeof g === "object") estado = { ...estado, ...g, items: g.items || {} };
} catch {}
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch {} };

const euros = n => n.toFixed(2).replace(".", ",") + " €";

/* ------------------------------------------------------------------ */
/* FECHAS Y HORAS (siempre hora de Barcelona)                           */
/* ------------------------------------------------------------------ */
function ahoraBcn(){
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, min: (+p.hour) * 60 + (+p.minute) };
}
const aMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const aHHMM = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function sumarDias(iso, n){ const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function nombreDia(iso, hoy){
  if (iso === hoy) return "Hoy";
  if (iso === sumarDias(hoy, 1)) return "Mañana";
  return new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "long", timeZone: "UTC" });
}
function fechaCorta(iso){
  return new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).replace(",", "");
}
function horasDe(dia){
  const { dia: hoy, min } = ahoraBcn();
  const out = {};
  for (const [turno, [a, b]] of Object.entries(CONFIG.turnos)){
    out[turno] = [];
    for (let m = aMin(a) + CONFIG.paso; m <= aMin(b); m += CONFIG.paso)
      if (dia !== hoy || m >= min + CONFIG.margen) out[turno].push(aHHMM(m));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* PASOS                                                                */
/* ------------------------------------------------------------------ */
let pasoActual = 1;
function irA(n){
  if ((n === 3 || n === 4) && !estado.hora) n = 2;   // sin hora no se puede seguir
  pasoActual = n;
  $$(".step").forEach(s => (s.hidden = +s.dataset.step !== n));
  $("#steps").hidden = n === 5;
  $$("#steps li").forEach(li => {
    const k = +li.dataset.step;
    li.classList.toggle("isOn", k === n);
    li.classList.toggle("isDone", k < n);
  });
  if (n === 2) pintarHoras();
  if ((n === 3 || n === 4) && cartaLista) sacarNoDisponibles();
  if (n === 3) pintarCatalogo();
  if (n === 4) pintarResumen();
  if (n === 4) $("#enviar").disabled = !totales().n;
  pintarCarrito();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ir]");
  if (b && !b.disabled) irA(+b.dataset.ir);
  const li = e.target.closest("#steps li.isDone");
  if (li) irA(+li.dataset.step);
});

/* 2 · Día y hora */
function pintarHoras(){
  const { dia: hoy } = ahoraBcn();
  const dias = Array.from({ length: CONFIG.diasAdelante + 1 }, (_, i) => sumarDias(hoy, i));
  if (!dias.includes(estado.dia)) { estado.dia = dias.find(d => Object.values(horasDe(d)).flat().length) || dias[0]; estado.hora = null; }
  $("#dias").innerHTML = dias.map(d =>
    `<button type="button" role="tab" class="dia${d === estado.dia ? " isOn" : ""}" data-dia="${d}" aria-selected="${d === estado.dia}">
       <b>${nombreDia(d, hoy)}</b><small>${new Date(d + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" })}</small></button>`).join("");
  const h = horasDe(estado.dia);
  if (estado.hora && !Object.values(h).flat().includes(estado.hora)) estado.hora = null;
  [["Mediodía", "#turnoMed"], ["Noche", "#turnoNoc"]].forEach(([t, sel]) => {
    const box = $(sel);
    box.hidden = !h[t].length;
    $(".horas", box).innerHTML = h[t].map(x =>
      `<button type="button" class="hora${x === estado.hora ? " isOn" : ""}" data-hora="${x}">${x}</button>`).join("");
  });
  $("#sinHoras").hidden = Object.values(h).flat().length > 0;
  $("#aProductos").disabled = !estado.hora;
  guardar();
}
$("#dias").addEventListener("click", e => {
  const b = e.target.closest("[data-dia]"); if (!b) return;
  estado.dia = b.dataset.dia; estado.hora = null; pintarHoras();
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-hora]"); if (!b) return;
  estado.hora = b.dataset.hora; menusSacados = false; pintarHoras();
});

function textoRecogida(){
  const { dia: hoy } = ahoraBcn();
  const dia = estado.dia === hoy ? "hoy" : estado.dia === sumarDias(hoy, 1) ? "mañana" : fechaCorta(estado.dia);
  return `<span>Recogés en el local <b>${dia} a las ${estado.hora}</b></span><button type="button" class="link" data-ir="2">Cambiar</button>`;
}

/* 3 · Productos */
const cant = id => estado.items[id] || 0;
function cambiar(id, d){
  const n = Math.max(0, Math.min(50, cant(id) + d));
  if (n) estado.items[id] = n; else delete estado.items[id];
  guardar();
  // actualiza solo lo que cambió (sin redibujar toda la lista)
  $$(`[data-q="${CSS.escape(id)}"]`).forEach(el => pintarStepper(el, id));
  if (pasoActual === 3 && linea(id)?.roles.length) pintarCatalogo();
  pintarCats();
  pintarCarrito();
  if (pasoActual === 4) pintarResumen();
}
function stepper(id){
  return `<div class="stepper" data-q="${esc(id)}"></div>`;
}
function pintarStepper(el, id){
  const n = cant(id);
  el.classList.toggle("isOn", n > 0);
  el.innerHTML = n
    ? `<button type="button" class="q" data-menos="${esc(id)}" aria-label="Quitar uno">−</button><span class="qN" aria-live="polite">${n}</span><button type="button" class="q" data-mas="${esc(id)}" aria-label="Agregar uno">+</button>`
    : `<button type="button" class="qAdd" data-mas="${esc(id)}">Agregar <span aria-hidden="true">+</span></button>`;
}
document.addEventListener("click", e => {
  const mas = e.target.closest("[data-mas]"), menos = e.target.closest("[data-menos]");
  if (mas) cambiar(mas.dataset.mas, 1);
  if (menos) cambiar(menos.dataset.menos, -1);
});

function cantidadCat(cat){
  return Object.entries(estado.items).reduce((s, [k, n]) => s + (linea(k)?.cat === cat ? n : 0), 0);
}
function pintarCats(){
  $("#cats").innerHTML = CATEGORIAS.filter(catVisible).map(c => {
    const n = cantidadCat(c.id);
    return `<button type="button" class="cat${c.id === estado.cat ? " isOn" : ""}" data-cat="${c.id}">${c.nombre}${n ? `<span class="catN">${n}</span>` : ""}</button>`;
  }).join("");
}
$("#cats").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  const sec = document.getElementById(`sec-${b.dataset.cat}`); if (!sec) return;
  marcarCat(b.dataset.cat);
  siguiendo = false; clearTimeout(trabaSpy); trabaSpy = setTimeout(() => (siguiendo = true), 900);   // no pelear con el scroll suave
  window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - alturaFija() - 8, behavior: "smooth" });
});
// La lista es una sola: al bajar, la categoría de arriba se marca sola.
let siguiendo = true, trabaSpy = 0;
const alturaFija = () => ($(".top")?.offsetHeight || 0) + ($("#cats")?.offsetHeight || 0);
function marcarCat(id){
  if (estado.cat === id && $("#cats .cat.isOn")?.dataset.cat === id) return;
  estado.cat = id; guardar();
  $$("#cats .cat").forEach(b => b.classList.toggle("isOn", b.dataset.cat === id));
  const b = $(`#cats [data-cat="${id}"]`);
  if (b) $("#cats").scrollTo({ left: b.offsetLeft - $("#cats").offsetWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
}
function seguirScroll(){
  if (!siguiendo || pasoActual !== 3 || !cartaLista) return;
  const limite = alturaFija() + 24;
  let actual = CATEGORIAS.find(catVisible)?.id;
  for (const c of CATEGORIAS.filter(catVisible)){ const sec = document.getElementById(`sec-${c.id}`); if (sec && sec.getBoundingClientRect().top <= limite) actual = c.id; }
  // al llegar al final de la página, la última categoría
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) actual = CATEGORIAS.filter(catVisible).pop()?.id;
  if (actual) marcarCat(actual);
}
window.addEventListener("scroll", () => requestAnimationFrame(seguirScroll), { passive: true });

const SIN_FOTO = `<span class="itImg itImg--vacia" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M9.5 5H15l1.5 2H19a2 2 0 0 1 2 2v8.5M17.6 19H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5"/><path d="M9.9 10.2a3 3 0 0 0 4 4"/></svg></span>`;
const enPedido = idv => Object.entries(estado.items).reduce((t, [k, n]) => t + (k.startsWith(idv + "|") ? n : 0), 0);
function tarjeta(it){
  const foto = it.img ? `<img class="itImg" src="${esc(it.img)}" alt="" loading="lazy" width="120" height="80">` : SIN_FOTO;
  const info = `<div class="itInfo"><b class="itNom">${esc(it.titulo)}</b>${it.desc ? `<span class="itDesc">${esc(it.desc)}</span>` : ""}<span class="itPrecio">${euros(it.precio)}</span></div>`;
  const idv = `${it.id}|${it.v}`;
  if (it.roles.length){
    const n = enPedido(idv);
    const pista = it.roles.map(g => g.nombre.toLowerCase()).slice(0, 3).join(", ");
    const enCarrito = Object.keys(estado.items).filter(k => k.startsWith(idv + "|") && linea(k));
    return `<li class="it it--foto it--opc" data-elegir="${esc(idv)}" role="button" tabindex="0" aria-label="${esc(it.titulo)}: elegir opciones">
      ${foto}
      ${info}
      <div class="elegir"><button type="button" class="qAdd" data-elegir="${esc(idv)}" title="Elegí: ${esc(pista)}">${n ? "Agregar otro" : "Elegir"} <span aria-hidden="true">+</span></button></div>
      ${enCarrito.length ? `<ul class="itLineas" aria-label="En tu pedido">${enCarrito.map(k => {
        const l = linea(k);
        return `<li class="itLinea"><span>${l.extra ? esc(l.extra) : "Sin cambios"}<small>${euros(l.precio)}</small></span>${stepper(k)}</li>`;
      }).join("")}</ul>` : ""}
    </li>`;
  }
  return `<li class="it it--foto">
    ${foto}
    ${info}
    ${stepper(clave(it.id, it.v))}
  </li>`;
}
function pintarCatalogo(){
  $("#recogida").innerHTML = textoRecogida();
  if (!cartaLista){
    $("#cats").innerHTML = "";
    $("#catalogo").innerHTML = cartaError
      ? `<p class="aviso">No pudimos cargar la carta. Recargá la página o llamanos al <a href="tel:+34615351131">${CONFIG.telefono}</a>.</p>`
      : `<p class="aviso">Cargando la carta…</p>`;
    return;
  }
  pintarCats();
  if (!catVisible({ id: estado.cat })) estado.cat = "burgers";
  const visibles = CATEGORIAS.filter(catVisible);
  if (!visibles.length){ $("#catalogo").innerHTML = `<p class="aviso">Por ahora no hay productos para take away.</p>`; return; }
  // todas las categorías una debajo de la otra
  $("#catalogo").innerHTML = (menusSacados ? `<p class="aviso">Los menús son solo de lunes a viernes al mediodía: los sacamos del pedido.</p>` : "") + visibles.map(c => `<section class="secCat" id="sec-${c.id}">
    <h2 class="secT">${c.nombre}</h2>
    ${c.grupos.map(g => `
      ${g.titulo ? `<div class="grupoT"><h3>${g.titulo}</h3>${g.sub ? `<span>${g.sub}</span>` : ""}</div>` : ""}
      <ul class="items">${g.items.map(tarjeta).join("")}</ul>`).join("")}
  </section>`).join("");
  $$("#catalogo [data-q]").forEach(el => pintarStepper(el, el.dataset.q));
}

/* Ventanita para elegir opciones (extras, quitar, salsa, partes del menú) */
let hoja = null;   // { idv, sel: [Set por grupo], n }
function regla(g){
  if (g.min > 0) return g.min === g.max ? `Elegí ${g.min}` : `Elegí entre ${g.min} y ${g.max}`;
  return g.max === 1 ? "Opcional" : `Opcional · hasta ${g.max}`;
}
function hojaOps(){ return [...new Set(hoja.sel.flatMap(s => [...s]))]; }
function hojaLista(){ return VARIANTES[hoja.idv].roles.every((g, i) => hoja.sel[i].size >= g.min && hoja.sel[i].size <= g.max); }
function abrirHoja(idv){
  const it = VARIANTES[idv]; if (!it) return;
  hoja = { idv, sel: it.roles.map(() => new Set()), n: 1 };
  // si un grupo obligatorio tiene una sola opción (ej. patatas del menú), viene marcada
  it.roles.forEach((g, i) => { if (g.min >= 1 && g.opciones.length === 1) hoja.sel[i].add(g.opciones[0].id); });
  pintarHoja();
  if (!history.state?.hoja) history.pushState({ hoja: true }, "");
  document.body.classList.add("hojaAbierta");
  $("#hoja").classList.add("entra");
  setTimeout(() => $("#hoja").classList.remove("entra"), 400);
  $("#hoja").hidden = false;
  setTimeout(() => $("#hoja .hojaCaja")?.focus(), 30);
}
function cerrarHoja(desdeHistorial = false){
  if (!hoja) return;
  hoja = null; $("#hoja").hidden = true; document.body.classList.remove("hojaAbierta");
  if (!desdeHistorial && history.state?.hoja) history.back();
}
window.addEventListener("popstate", () => { if (hoja) cerrarHoja(true); });
function pintarHoja(){
  const it = VARIANTES[hoja.idv];
  const scrollAntes = $("#hoja .hojaCaja")?.scrollTop || 0;
  const extra = hojaOps().reduce((t, id) => t + (+(it.roles.flatMap(g => g.opciones).find(o => o.id === id)?.precio) || 0), 0);
  const total = (it.precio + extra) * hoja.n;
  $("#hoja").innerHTML = `<div class="hojaFondo" data-cerrar></div>
    <div class="hojaCaja" role="dialog" aria-modal="true" aria-labelledby="hojaT" tabindex="-1">
      <button type="button" class="hojaX" data-cerrar aria-label="Volver a la carta">×</button>
      ${it.img ? `<img class="hojaImg" src="${esc(it.img)}" alt="" data-cerrar title="Tocá para volver">` : ""}
      <h3 id="hojaT">${esc(it.titulo)}</h3>
      ${it.desc ? `<p class="hojaDesc">${esc(it.desc)}</p>` : ""}
      ${it.roles.map((g, i) => {
        const lleno = hoja.sel[i].size >= g.max && g.max > 1;
        return `<fieldset class="grupo"><legend>${esc(g.nombre)}<small class="${g.min > 0 && hoja.sel[i].size < g.min ? "falta" : ""}">${regla(g)}</small></legend>
          ${g.opciones.map(o => {
            const on = hoja.sel[i].has(o.id);
            return `<label class="op${on ? " isOn" : ""}"><input type="checkbox" data-g="${i}" value="${o.id}"${on ? " checked" : ""}${!on && lleno ? " disabled" : ""}>
              <span>${esc(o.nombre)}</span>${+o.precio > 0 ? `<em>+${euros(+o.precio)}</em>` : ""}</label>`;
          }).join("")}</fieldset>`;
      }).join("")}
      <div class="hojaPie">
        <div class="stepper isOn"><button type="button" class="q" data-hn="-1" aria-label="Uno menos">−</button><span class="qN">${hoja.n}</span><button type="button" class="q" data-hn="1" aria-label="Uno más">+</button></div>
        <button type="button" class="btn btn--solid" data-hagregar${hojaLista() ? "" : " disabled"}>Agregar · ${euros(total)}</button>
      </div>
    </div>`;
  $("#hoja .hojaCaja").scrollTop = scrollAntes;
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-elegir]");
  if (el && !e.target.closest(".itLineas")) { abrirHoja(el.dataset.elegir); return; }
  if (!hoja) return;
  if (e.target.closest("[data-cerrar]")) { cerrarHoja(); return; }
  const hn = e.target.closest("[data-hn]");
  if (hn) { hoja.n = Math.max(1, Math.min(20, hoja.n + +hn.dataset.hn)); pintarHoja(); return; }
  if (e.target.closest("[data-hagregar]") && hojaLista()){
    const it = VARIANTES[hoja.idv], k = clave(it.id, it.v, hojaOps());
    estado.items[k] = Math.min(50, (estado.items[k] || 0) + hoja.n);
    guardar(); cerrarHoja();
    pintarCatalogo(); pintarCarrito();
  }
});
document.addEventListener("change", e => {
  const inp = e.target.closest("#hoja input[data-g]"); if (!inp || !hoja) return;
  const i = +inp.dataset.g, g = VARIANTES[hoja.idv].roles[i], id = +inp.value;
  if (inp.checked){ if (g.max === 1) hoja.sel[i].clear(); hoja.sel[i].add(id); } else hoja.sel[i].delete(id);
  pintarHoja();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && hoja) cerrarHoja();
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("li[data-elegir]")) { e.preventDefault(); abrirHoja(e.target.dataset.elegir); }
});

/* Barra de abajo y resumen */
function totales(){
  let n = 0, t = 0;
  for (const [k, q] of Object.entries(estado.items)){
    const l = linea(k); if (!l) continue;
    n += q; t += q * l.precio;
  }
  return { n, t };
}
function pintarCarrito(){
  const { n, t } = totales();
  $("#carrito").hidden = !(pasoActual === 3 && n > 0);
  $("#cantidad").textContent = `${n} ${n === 1 ? "producto" : "productos"}`;
  $("#total").textContent = euros(t);
  document.body.classList.toggle("conCarrito", !$("#carrito").hidden);
}
function pintarResumen(){
  $("#recogida2").innerHTML = textoRecogida();
  const orden = Object.keys(VARIANTES);
  const pos = k => orden.indexOf(k.split("|").slice(0, 2).join("|"));
  const ids = Object.keys(estado.items).filter(k => linea(k)).sort((a, b) => pos(a) - pos(b));
  $("#lineas").innerHTML = ids.map(k => {
    const p = linea(k);
    return `<li class="linea">
      <div class="lineaTxt"><b>${esc(p.titulo)}</b>${p.extra ? `<span>${esc(p.extra)}</span>` : ""}</div>
      ${stepper(k)}
      <span class="lineaPrecio">${euros(p.precio * cant(k))}</span>
    </li>`;
  }).join("");
  $$("#lineas [data-q]").forEach(el => pintarStepper(el, el.dataset.q));
  $("#vacio").hidden = ids.length > 0;
  $("#total2").textContent = euros(totales().t);
  $("#enviar").disabled = !ids.length;
}

/* ------------------------------------------------------------------ */
/* DATOS Y ENVÍO                                                        */
/* ------------------------------------------------------------------ */
const PAISES = [
  ["ES", "España", "34"], ["AR", "Argentina", "54"], ["UY", "Uruguay", "598"], ["CL", "Chile", "56"],
  ["PY", "Paraguay", "595"], ["BO", "Bolivia", "591"], ["PE", "Perú", "51"], ["EC", "Ecuador", "593"],
  ["CO", "Colombia", "57"], ["VE", "Venezuela", "58"], ["MX", "México", "52"], ["CU", "Cuba", "53"],
  ["DO", "Rep. Dominicana", "1"], ["BR", "Brasil", "55"], ["US", "Estados Unidos", "1"], ["CA", "Canadá", "1"],
  ["PT", "Portugal", "351"], ["FR", "Francia", "33"], ["IT", "Italia", "39"], ["AD", "Andorra", "376"],
  ["GB", "Reino Unido", "44"], ["IE", "Irlanda", "353"], ["DE", "Alemania", "49"], ["NL", "Países Bajos", "31"],
  ["BE", "Bélgica", "32"], ["CH", "Suiza", "41"], ["AT", "Austria", "43"], ["SE", "Suecia", "46"],
  ["NO", "Noruega", "47"], ["DK", "Dinamarca", "45"], ["FI", "Finlandia", "358"], ["PL", "Polonia", "48"],
  ["RO", "Rumanía", "40"], ["UA", "Ucrania", "380"], ["RU", "Rusia", "7"], ["GR", "Grecia", "30"],
  ["MA", "Marruecos", "212"], ["IL", "Israel", "972"], ["TR", "Turquía", "90"], ["IN", "India", "91"],
  ["CN", "China", "86"], ["JP", "Japón", "81"], ["AU", "Australia", "61"],
];
const bandera = cc => String.fromCodePoint(...[...cc].map(c => 0x1F1A5 + c.charCodeAt(0)));
const form = $("#datos"), pais = $("#pais"), tel = $("#tel");
pais.innerHTML = PAISES.map(([cc, nombre, cod]) =>
  `<option value="${cod}" data-cc="${cc}">${bandera(cc)} +${cod}  ${nombre}</option>`).join("");
const pintarPais = () => { const o = pais.selectedOptions[0]; $(".telPaisTxt").textContent = `${bandera(o.dataset.cc)} +${o.value}`; };
pais.addEventListener("change", pintarPais);
pintarPais();
function telefonoCompleto(){
  let n = tel.value.replace(/[^0-9 +().-]/g, "").trim();
  if (n.startsWith("00")) n = "+" + n.slice(2);
  return !n ? "" : n.startsWith("+") ? n : `+${pais.value} ${n}`;
}
// lo que la persona ya escribió queda guardado en este navegador para el próximo pedido
try {
  const d = JSON.parse(localStorage.getItem("terrys-pedido-datos") || "null");
  if (d){ form.elements.nombre.value = d.nombre || ""; tel.value = d.tel || ""; if (d.pais) pais.value = d.pais; pintarPais(); }
} catch {}

function marcar(){
  let ok = true;
  const mal = (el, m) => { el.closest(".campo, .check").classList.toggle("isError", m); if (m) ok = false; };
  mal(form.elements.nombre, form.elements.nombre.value.trim().length < 2);
  mal(tel, tel.value.replace(/\D/g, "").length < 6);
  mal(form.elements.acepto, !form.elements.acepto.checked);
  if (!ok) form.querySelector(".isError input")?.focus();
  return ok;
}
form.addEventListener("input", e => e.target.closest(".isError")?.classList.remove("isError"));
form.addEventListener("change", e => e.target.closest(".isError")?.classList.remove("isError"));

async function rpc(fn, body){
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CONFIG.supabaseKey, Authorization: `Bearer ${CONFIG.supabaseKey}` },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.message || `Error ${r.status}`);
  return data;
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("#msg"), btn = $("#enviar");
  msg.textContent = "";
  if (!totales().n){ msg.textContent = "Todavía no agregaste nada."; return; }
  if (!marcar()){ msg.textContent = "Completá los campos marcados."; return; }
  const datos = {
    dia: estado.dia, hora: estado.hora,
    nombre: form.elements.nombre.value.trim(), telefono: telefonoCompleto(),
    comentario: form.elements.comentario.value.trim(), web: form.elements.web.value,
    items: Object.entries(estado.items).filter(([k]) => linea(k)).map(([k, cant]) => {
      const [id, variante] = k.split("|");
      return { id, variante: variante || null, cant, opciones: linea(k).ops };
    }),
  };
  btn.disabled = true; btn.textContent = "Enviando…";
  try {
    const r = await rpc("web_pedir", { p: datos });
    try { localStorage.setItem("terrys-pedido-datos", JSON.stringify({ nombre: datos.nombre, tel: tel.value, pais: pais.value })); } catch {}
    const { dia: hoy } = ahoraBcn();
    const cuando = estado.dia === hoy ? "hoy" : estado.dia === sumarDias(hoy, 1) ? "mañana" : fechaCorta(estado.dia);
    $("#okNum").textContent = r?.id ? `Pedido nº ${r.id}` : "";
    $("#okTxt").innerHTML = `Te esperamos <b>${cuando} a las ${estado.hora}</b> en Terry's. Total a pagar en el local: <b>${euros(+(r?.total ?? totales().t))}</b>.`;
    estado.items = {}; estado.hora = null; form.elements.comentario.value = ""; guardar();
    irA(5);
  } catch (err){
    const m = String(err.message || "");
    msg.textContent =
      m.includes("demasiados") ? `Ya recibimos varios pedidos desde ese teléfono. Llamanos al ${CONFIG.telefono}.` :
      m.includes("teléfono") ? "Revisá el teléfono." :
      m.includes("horario") || m.includes("día") ? "Esa hora ya no está disponible. Elegí otra." :
      m.includes("menú") ? "Los menús son solo de lunes a viernes al mediodía. Sacalo del pedido o cambiá la hora." :
      m.includes("producto") ? "Hay un producto que no reconocemos. Recargá la página y probá de nuevo." :
      `No pudimos enviarlo. Probá de nuevo o llamanos al ${CONFIG.telefono}.`;
    if (m.includes("horario") || m.includes("día")) setTimeout(() => irA(2), 1800);
  } finally {
    btn.disabled = false; btn.textContent = "Enviar pedido";
  }
});
$("#otro").addEventListener("click", () => irA(2));

/* ------------------------------------------------------------------ */
// Arranca en el paso 1; si ya había un pedido a medio armar con hora válida, sigue en productos.
(function init(){
  const { dia: hoy } = ahoraBcn();
  const valido = estado.dia && estado.hora && estado.dia >= hoy && Object.values(horasDe(estado.dia)).flat().includes(estado.hora);
  if (!valido){ estado.hora = null; }
  irA(valido && Object.keys(estado.items).length ? 3 : 1);
  cargarCarta();
})();

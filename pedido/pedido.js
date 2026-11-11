/* Terry's Burgers · Pedido take away
   Paso 1: cómo (recoger en el local) · Paso 2: día y hora · Paso 3: productos · Paso 4: resumen.
   El pedido va al Supabase del admin con web_pedir() (que recalcula el total con sus propios
   precios) y aparece en la solapa Web de admin.terrysburgers.com. Por ahora se paga al retirar. */

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

const SALSAS = ["Barbacoa", "Cheddar", "Alioli"];
const IMG = "../assets/img/burgers/";

// Mismos productos y precios que la carta (index.html → sección Carta) y que web_pedir() en
// administracion/schema.sql (parte 12): si cambia un precio, cambiarlo en los tres lugares.
const BURGERS = [
  { id: "terry",  nombre: "Terry",  desc: "Con doble cheddar",                                simple: 7.90, doble: 9.90,  img: "terry.jpg" },
  { id: "torch",  nombre: "Torch",  desc: "Con doble cheddar y bacon",                        simple: 9.50, doble: 11.50, img: "torch.jpg" },
  { id: "russel", nombre: "Russel", desc: "Con cheddar, lechuga, tomate y salsa mil islas",   simple: 9.00, doble: 11.00, img: "russel.jpg" },
  { id: "zulma",  nombre: "Zulma",  desc: "Con cheddar, ketchup, mostaza y cebolla picada",   simple: 9.00, doble: 11.00, img: "zulma.jpg" },
  { id: "rumpi",  nombre: "Rumpi",  desc: "Con cheddar y cebolla smasheada",                  simple: 9.00, doble: 11.00, img: "rumpy.jpg" },
  { id: "buba",   nombre: "Buba",   desc: "Con muzzarellitas, cheddar y barbacoa",            simple: 9.50, doble: 11.50, img: "buba.jpg" },
];

const CATEGORIAS = [
  {
    id: "burgers", nombre: "Hamburguesas",
    grupos: [
      { titulo: "Simples", sub: "Un medallón de carne de 100 g en pan brioche",
        items: BURGERS.map(b => ({ id: `${b.id}-simple`, nombre: b.nombre, extra: "Simple", desc: b.desc, precio: b.simple, img: IMG + b.img })) },
      { titulo: "Dobles", sub: "Dos medallones de carne de 100 g en pan brioche",
        items: BURGERS.map(b => ({ id: `${b.id}-doble`, nombre: b.nombre, extra: "Doble", desc: b.desc, precio: b.doble, img: IMG + b.img })) },
    ],
  },
  {
    id: "picar", nombre: "Para picar",
    grupos: [{ items: [
      { id: "patatas",       nombre: "Patatas fritas",  precio: 4.00 },
      { id: "patatas-russel", nombre: "Patatas Russel", desc: "Con salsa mil islas y bacon crocante", precio: 6.00 },
      { id: "patatas-torch", nombre: "Patatas Torch",   desc: "Con cheddar y bacon crocante", precio: 6.00 },
      { id: "boniatos",      nombre: "Boniatos",        precio: 6.00 },
      { id: "muzzarellitas", nombre: "Muzzarellitas",   desc: "8 unidades · elegí la salsa", precio: 8.50, salsas: true },
      { id: "nuggets",       nombre: "Nuggets",         desc: "8 unidades · elegí la salsa", precio: 8.50, salsas: true },
      { id: "aros",          nombre: "Aros de cebolla", desc: "8 unidades · elegí la salsa", precio: 8.50, salsas: true },
    ] }],
  },
  {
    id: "bebidas", nombre: "Bebidas",
    grupos: [{ items: [
      { id: "agua",         nombre: "Agua mineral",      precio: 2.20 },
      { id: "aquarius",     nombre: "Aquarius",          precio: 2.50 },
      { id: "cocacola",     nombre: "Bebidas Coca-Cola", precio: 2.50 },
      { id: "estrella",     nombre: "Estrella Damm",     precio: 2.90 },
      { id: "estrella00",   nombre: "Estrella Damm 0,0", precio: 2.90 },
      { id: "turia",        nombre: "Turia",             precio: 3.50 },
      { id: "damm-lemon",   nombre: "Damm Lemon",        precio: 3.20 },
      { id: "quilmes",      nombre: "Quilmes Argentina", precio: 3.70 },
      { id: "vino",         nombre: "Copa de vino",      precio: 3.20 },
    ] }],
  },
  {
    id: "postres", nombre: "Postres",
    grupos: [{ items: [
      { id: "franui", nombre: "Franui", desc: "Frambuesas frescas bañadas en doble chocolate", precio: 5.50 },
    ] }],
  },
];

// Índice de productos: cada salsa es una variante con su propia cantidad.
const PRODUCTOS = {};
CATEGORIAS.forEach(c => c.grupos.forEach(g => g.items.forEach(it => {
  it.cat = c.id;
  if (it.salsas) SALSAS.forEach(s => (PRODUCTOS[`${it.id}|${s}`] = { ...it, extra: `Salsa ${s.toLowerCase()}` }));
  else PRODUCTOS[it.id] = it;
})));

/* ------------------------------------------------------------------ */
/* ESTADO (se guarda en este navegador para no perder el pedido)        */
/* ------------------------------------------------------------------ */
const CLAVE = "terrys-pedido-v1";
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
  estado.hora = b.dataset.hora; pintarHoras();
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
  pintarCats();
  pintarCarrito();
  if (pasoActual === 4) pintarResumen();
}
function stepper(id){
  return `<div class="stepper" data-q="${id}"></div>`;
}
function pintarStepper(el, id){
  const n = cant(id);
  el.classList.toggle("isOn", n > 0);
  el.innerHTML = n
    ? `<button type="button" class="q" data-menos="${id}" aria-label="Quitar uno">−</button><span class="qN" aria-live="polite">${n}</span><button type="button" class="q" data-mas="${id}" aria-label="Agregar uno">+</button>`
    : `<button type="button" class="qAdd" data-mas="${id}">Agregar <span aria-hidden="true">+</span></button>`;
}
document.addEventListener("click", e => {
  const mas = e.target.closest("[data-mas]"), menos = e.target.closest("[data-menos]");
  if (mas) cambiar(mas.dataset.mas, 1);
  if (menos) cambiar(menos.dataset.menos, -1);
});

function cantidadCat(cat){
  return Object.entries(estado.items).reduce((s, [id, n]) => s + (PRODUCTOS[id]?.cat === cat ? n : 0), 0);
}
function pintarCats(){
  $("#cats").innerHTML = CATEGORIAS.map(c => {
    const n = cantidadCat(c.id);
    return `<button type="button" class="cat${c.id === estado.cat ? " isOn" : ""}" data-cat="${c.id}">${c.nombre}${n ? `<span class="catN">${n}</span>` : ""}</button>`;
  }).join("");
}
$("#cats").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  estado.cat = b.dataset.cat; guardar(); pintarCatalogo();
  $("#cats").scrollIntoView({ behavior: "smooth", block: "start" });
});

function tarjeta(it){
  const foto = it.img ? `<img class="itImg" src="${it.img}" alt="" loading="lazy" width="120" height="80">` : "";
  if (it.salsas){
    return `<li class="it it--salsas">
      <div class="itInfo"><b class="itNom">${it.nombre}</b>${it.desc ? `<span class="itDesc">${it.desc}</span>` : ""}<span class="itPrecio">${euros(it.precio)}</span></div>
      <div class="salsas">${SALSAS.map(s => `<div class="salsa"><span>${s}</span>${stepper(`${it.id}|${s}`)}</div>`).join("")}</div>
    </li>`;
  }
  return `<li class="it${it.img ? " it--foto" : ""}">
    ${foto}
    <div class="itInfo"><b class="itNom">${it.nombre}</b>${it.desc ? `<span class="itDesc">${it.desc}</span>` : ""}<span class="itPrecio">${euros(it.precio)}</span></div>
    ${stepper(it.id)}
  </li>`;
}
function pintarCatalogo(){
  $("#recogida").innerHTML = textoRecogida();
  pintarCats();
  const c = CATEGORIAS.find(x => x.id === estado.cat) || CATEGORIAS[0];
  $("#catalogo").innerHTML = c.grupos.map(g => `
    ${g.titulo ? `<div class="grupoT"><h3>${g.titulo}</h3>${g.sub ? `<span>${g.sub}</span>` : ""}</div>` : ""}
    <ul class="items">${g.items.map(tarjeta).join("")}</ul>`).join("");
  $$("#catalogo [data-q]").forEach(el => pintarStepper(el, el.dataset.q));
}

/* Barra de abajo y resumen */
function totales(){
  let n = 0, t = 0;
  for (const [id, q] of Object.entries(estado.items)){
    const p = PRODUCTOS[id]; if (!p) continue;
    n += q; t += q * p.precio;
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
  const orden = Object.keys(PRODUCTOS);
  const ids = Object.keys(estado.items).filter(id => PRODUCTOS[id]).sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
  $("#lineas").innerHTML = ids.map(id => {
    const p = PRODUCTOS[id];
    return `<li class="linea">
      <div class="lineaTxt"><b>${p.nombre}</b>${p.extra ? `<span>${p.extra}</span>` : ""}</div>
      ${stepper(id)}
      <span class="lineaPrecio">${euros(p.precio * cant(id))}</span>
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
    items: Object.entries(estado.items).filter(([id]) => PRODUCTOS[id]).map(([id, cant]) => ({ id, cant })),
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
})();

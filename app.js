// Terry's Burgers SPA interactions (no frameworks)
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------------ */
/* DATA – Burgers & Personajes                                          */
/* Editá aquí los nombres, descripciones, ingredientes e historias     */
/* ------------------------------------------------------------------ */
const data = {
  burgers: [
    {
      id: "terry",
      name: "Terry",
      tag: "El clásico que no falla",
      img: "assets/img/burgers/terry.jpg",
      desc: "Elaborada con pan brioche suave y ligeramente dulce que realza cada bocado. En su interior nuestro blend de carne smasheado con doble queso cheddar.",
      bullets: [
        { name: "Pan brioche",  img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Cheddar x2",   img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash",  img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Pan brioche",  img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Terry",
        img: "assets/img/personajes/terry.webp",
        story: "El personaje nace como un homenaje a los dos hermanos que dieron vida a la marca: Matías y Clara, fundadores y creadores de Terry’s Burgers. Desde pequeños, solían llamarse de manera cariñosa “Ter” o “Terry”, un apodo que con el tiempo se convirtió en su seña de identidad."
      }
    },
    {
      id: "torch",
      name: "Torch",
      tag: "El clásico potenciado",
      img: "assets/img/burgers/torch.jpg",
      desc: "Elaborada con pan brioche y nuestro blend de carne smasheado con doble queso cheddar y panceta crujiente.",
      bullets: [
        { name: "Pan brioche",  img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Bacon",        img: "assets/img/ingredientes/bacon.png" },
        { name: "Cheddar x2",   img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash",  img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Pan brioche",  img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Torch",
        img: "assets/img/personajes/torch.webp",
        story: "El nombre nace de una variante cariñosa del apodo con el que Matías suele llamar a Clara, y este personaje refleja su esencia. Como cofundadora de Terry’s, Clara es la mente estratégica: organizada, precisa y siempre enfocada en los números. Representa el equilibrio perfecto entre pasión y planificación, entre sabor y estructura."
      }
    },
    {
      id: "russel",
      name: "Russel",
      tag: "La más fresquita",
      img: "assets/img/burgers/russel.jpg",
      desc: "Elaborada con pan brioche, cheddar y nuestro blend de carne smasheado. Con Tomate fresco, lechuga crujiente y una salsa mil islas que le aporta un sabor cremoso, ligeramente dulce y ácido.",
      bullets: [
        { name: "Pan brioche",    img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Salsa mil isla", img: "assets/img/ingredientes/salsa-mil-isla.png" },
        { name: "Lechuga",        img: "assets/img/ingredientes/lechuga.png" },
        { name: "Tomate",         img: "assets/img/ingredientes/tomate.png" },
        { name: "Cheddar",        img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash",    img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Pan brioche",    img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Russel",
        img: "assets/img/personajes/russel.webp",
        story: "El personaje encarna la personalidad de Matías: alegre, creativo y siempre con una sonrisa. Como cofundador, Matias es el chef que se atreve a innovar, combinar sabores y a sorprender con su toque especial que convierte cada hamburguesa en una experiencia única. Russel representa la pasión y la energía."
      }
    },
    {
      id: "zulma",
      name: "Zulma",
      tag: "La abuela",
      img: "assets/img/burgers/zulma.jpg",
      desc: "La receta de casa de toda la vida. Hecha con el cariño y la sazón que solo la experiencia da.",
      bullets: [
        { name: "Pan brioche", img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Cheddar",     img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash", img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Cebolla",     img: "assets/img/ingredientes/cebolla.png" },
        { name: "Mostaza",     img: "assets/img/ingredientes/mostaza.png" },
        { name: "Ketchup",     img: "assets/img/ingredientes/ketchup.png" },
        { name: "Pan brioche", img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Zulma",
        img: "assets/img/personajes/zulma.webp",
        story: "El personaje nació en representación de la madre de Matías y Clara, el pilar que impulsó y acompaño a los hermanos en sus primeros pasos. Su apoyo fue fundamental en los inicios, cuando el proyecto nació en su casa y sigue siendo una guía constante."
      }
    },
    {
      id: "rumpy",
      name: "Rumpy",
      tag: "Homenaje a la Fried Onion",
      img: "assets/img/burgers/rumpy.jpg",
      desc: "Elaborada con pan brioche, cheddar y nuestro blend de carne de 100g smasheado con cebolla cortada en tiras finitas, que se carameliza en la plancha con sus propios jugos.",
      bullets: [
        { name: "Pan brioche",      img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Cheddar",          img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash",      img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Cebolla smashada", img: "assets/img/ingredientes/cebolla-smashada.png" },
        { name: "Pan brioche",      img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Rumpy",
        img: "assets/img/personajes/rumpy.webp",
        story: "Rumpi es el fiel compañero de Matías y Clara, un adorable golden retriever que siempre ha formado parte de la familia. Un perro humanizado, de carácter alegre y leal que representa la buena vibra y calidez de Terry´s."
      }
    },
    {
      id: "buba",
      name: "Buba",
      tag: "La bomba",
      img: "assets/img/burgers/buba.jpg",
      desc: "Elaborada con pan brioche, cheddar y nuestro blend de carne smasheado. Con dos bastones de muzarela fritos que le aportan una explosión de sabor y con salsa barbacoa que le da un contraste dulce.",
      bullets: [
        { name: "Pan brioche",          img: "assets/img/ingredientes/pan-brioche-top.png" },
        { name: "Salsa barbacoa",       img: "assets/img/ingredientes/salsa-barbacoa.png" },
        { name: "Stick de mozzarellas x2", img: "assets/img/ingredientes/stick-mozzarella.png" },
        { name: "Cheddar",              img: "assets/img/ingredientes/cheddar.png" },
        { name: "Carne smash",          img: "assets/img/ingredientes/carne-smash.png" },
        { name: "Pan brioche",          img: "assets/img/ingredientes/pan-brioche-bottom.png" }
      ],
      character: {
        name: "Buba",
        img: "assets/img/personajes/buba.webp",
        story: "Esta burger nació como una edición especial en honor a la abuela paterna de los hermanos que falleció al poco tiempo de abrir la hamburguesería. El apodo fue inventado por Clara cuando era chiquita y quedo como su identidad. Ahora es un sello distintivo que nos acompaña siempre."
      }
    }
  ]
};

/* ------------------------------------------------------------------ */
/* IMAGEN con fallback                                                  */
/* ------------------------------------------------------------------ */
function safeImg(imgEl, fallbackText){
  imgEl.onerror = () => {
    imgEl.style.display = "none";
    const ph = document.createElement("div");
    ph.className = "imgPlaceholder";
    ph.textContent = fallbackText || "Falta imagen";
    imgEl.parentElement?.appendChild(ph);
  };
}

/* ------------------------------------------------------------------ */
/* PRODUCTOS – tabs + stage con sliding cards                          */
/* ------------------------------------------------------------------ */
function setupProductos(){
  const tabsEl    = document.getElementById("prodTabs");
  const stage     = document.getElementById("prodStage");
  const cardBurger = document.getElementById("cardBurger");

  if (!tabsEl || !stage) return;

  const prodRight = cardBurger.querySelector(".prod-right");

  let currentIdx = 0;

  /* -- Build tabs -------------------------------------------------- */
  data.burgers.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "prod-tab";
    btn.setAttribute("role", "tab");
    btn.dataset.idx = i;
    btn.innerHTML = `<span>${b.name}</span>`;
    btn.addEventListener("click", () => tocarPestana(i));
    tabsEl.appendChild(btn);
  });

  function getTabs(){
    return Array.from(tabsEl.querySelectorAll(".prod-tab"));
  }

  /* -- Fill burger data -------------------------------------------- */
  function populateBurger(b){
    document.getElementById("prodTag").textContent  = b.tag;
    document.getElementById("prodName").textContent = b.name;
    document.getElementById("prodDesc").textContent = b.desc;
    document.getElementById("prodCharHint").textContent = b.character.name;

    const ul = document.getElementById("prodIngList");
    ul.innerHTML = "";
    b.bullets.forEach((item, n) => {
      const li = document.createElement("li");
      li.className = "prod-ing-item";
      li.style.setProperty("--i", n);

      const img = document.createElement("img");
      img.src   = item.img;
      img.alt   = item.name;
      img.className = "prod-ing-img";
      img.onerror = () => { img.style.visibility = "hidden"; };

      const arrow = document.createElement("span");
      arrow.className = "prod-ing-arrow";
      arrow.textContent = "→";

      const label = document.createElement("span");
      label.className = "prod-ing-name";
      label.textContent = item.name;

      li.appendChild(img);
      li.appendChild(arrow);
      li.appendChild(label);
      ul.appendChild(li);
    });

    // Character card
    document.getElementById("prodCharName").textContent  = b.character.name;
    document.getElementById("prodCharStory").textContent = b.character.story;
  }

  /* -- Modo: burger o personaje -------------------------------------
     Se mantiene al pasar de una burger a otra. En modo personaje las
     pestañas de arriba se ponen blancas con letra negra. */
  const enPersonaje = () => stage.classList.contains("showChar");
  function setModo(personaje){
    if (personaje) verIngredientes(false);
    stage.classList.toggle("showChar", personaje);
    tabsEl.classList.toggle("isChar", personaje);
  }
  function tocarPestana(i){
    if (i === currentIdx) setModo(!enPersonaje());   // la misma: burger ↔ personaje
    else selectBurger(i);                            // otra: misma vista, otra burger
  }

  /* -- Fotos de las burgers: las 6 cargadas una encima de la otra ----
     Cambiar de burger = apagar una y prender otra (fundido + leve acercamiento).
     No se copia nada ni se cambia la imagen en el momento: no hay saltos. */
  const fotoBtn = document.getElementById("prodImgBtn");
  const fotoBase = document.getElementById("prodBurgerImg");
  const fotos = data.burgers.map((b, i) => {
    const f = i === 0 ? fotoBase : document.createElement("img");
    f.classList.add("prod-photo");
    f.src = b.img;
    f.alt = `Hamburguesa ${b.name}`;
    f.decoding = "async";
    if (i > 0){ f.setAttribute("aria-hidden", "true"); fotoBase.after(f); }
    safeImg(f, b.name);
    return f;
  });
  const charBase = document.getElementById("prodCharImg");
  const charFotos = data.burgers.map((b, i) => {
    const f = i === 0 ? charBase : document.createElement("img");
    f.classList.add("prod-photo");
    f.src = b.character.img;
    f.alt = `Personaje ${b.character.name}`;
    f.decoding = "async";
    if (i > 0){ f.setAttribute("aria-hidden", "true"); charBase.parentElement.appendChild(f); }
    safeImg(f, b.character.name);
    return f;
  });
  const charRight = document.querySelector("#cardChar .prod-right");

  /* -- Select a burger by index ------------------------------------
     modo: true = personaje, false = burger, sin pasar = el que se está viendo. */
  let sliding = false, cambio = 0;
  function selectBurger(idx, animate = true, modo){
    const personaje = modo ?? enPersonaje();
    if (animate && idx === currentIdx && personaje === enPersonaje()) return;
    const b = data.burgers[idx];

    getTabs().forEach((t, i) => {
      t.classList.toggle("isActive", i === idx);
      t.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
    const tab = getTabs()[idx];
    if (tab) tabsEl.scrollTo({ left: tab.offsetLeft - (tabsEl.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
    currentIdx = idx;

    // fotos de burger y de personaje: se prende la de esta burger
    const todas = fotos.concat(charFotos);
    if (!animate) todas.forEach(f => (f.style.transition = "none"));   // al cargar: sin fundido desde negro
    [fotos, charFotos].forEach(lista => lista.forEach((f, i) => {
      f.classList.toggle("isOn", i === idx);
      if (i === idx) f.removeAttribute("aria-hidden"); else f.setAttribute("aria-hidden", "true");
    }));
    if (!animate){ void fotoBtn.offsetWidth; todas.forEach(f => (f.style.transition = "")); }

    const token = ++cambio;
    const cambiaModo = personaje !== enPersonaje();
    if (!animate || REDUCED_MOTION || !prodRight.animate || cambiaModo){
      // el recuadro que está oculto se actualiza directo y después se cruzan con su fundido
      verIngredientes(false); populateBurger(b); setModo(personaje); sliding = false; return;
    }

    // Texto de la vista actual: se apaga en el lugar, cambia mientras no se ve y vuelve.
    const col = personaje ? charRight : prodRight;
    sliding = true;
    [prodRight, charRight].forEach(c => c.getAnimations().forEach(a => a.cancel()));
    const fuera = col.animate([{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(3px)" }],
      { duration: 260, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    let hecho = false;
    const cambiarTexto = () => {
      if (hecho || token !== cambio) return;      // llegó otro clic: manda el último
      hecho = true;
      const paneles = prodRight.querySelectorAll(".prod-panel");
      paneles.forEach(p => (p.style.transition = "none"));   // a la descripción sin verse deslizar
      verIngredientes(false);
      populateBurger(b);
      void prodRight.offsetWidth;
      paneles.forEach(p => (p.style.transition = ""));
      fuera.cancel();
      const dentro = col.animate(
        [{ opacity: 0, filter: "blur(3px)", translate: "0 10px" }, { opacity: 1, filter: "blur(0)", translate: "0 0" }],
        { duration: 520, easing: "cubic-bezier(0,0,.2,1)" });
      const fin = () => { if (token === cambio) sliding = false; };
      dentro.onfinish = fin;
      setTimeout(fin, 700);
    };
    fuera.onfinish = cambiarTexto;
    setTimeout(cambiarTexto, 320);                  // por si la pestaña quedó en segundo plano
  }

  /* -- Deslizar con el dedo / flechas del teclado ------------------- */
  let x0 = null, y0 = null;
  stage.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    const n = data.burgers.length;
    selectBurger((currentIdx + (dx < 0 ? 1 : -1) + n) % n);
  }, { passive: true });
  tabsEl.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = data.burgers.length, i = (currentIdx + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    selectBurger(i); getTabs()[i]?.focus();
  });

  /* -- Ingredientes: un clic en la burger los abre, otro los cierra -- */
  const imgBtn = document.getElementById("prodImgBtn");
  const imgLabel = imgBtn?.querySelector(".prod-img-label");
  function verIngredientes(si){
    prodRight.classList.toggle("showIng", si);
    if (imgLabel) imgLabel.textContent = si ? "Ocultar ingredientes" : "Ver ingredientes";
    imgBtn?.setAttribute("aria-label", si ? "Ocultar ingredientes" : "Ver ingredientes");
    imgBtn?.setAttribute("aria-expanded", si ? "true" : "false");
  }
  imgBtn?.addEventListener("click", () => verIngredientes(!prodRight.classList.contains("showIng")));
  document.getElementById("prodIngClose")?.addEventListener("click", () => verIngredientes(false));

  /* -- Character card switch --------------------------------------- */
  document.getElementById("prodToChar")?.addEventListener("click", () => setModo(true));
  document.getElementById("prodToBurger")?.addEventListener("click", () => setModo(false));

  /* -- Carrusel automático ------------------------------------------
     Si nadie toca nada: descripción → ingredientes → personaje → siguiente burger.
     Se frena con el mouse encima, al tocar algo (vuelve a los 12 s de no tocar),
     si la sección no está en pantalla o la pestaña está en segundo plano. */
  const PASO = 6500, QUIETO = 12000;
  const bar = document.createElement("div");
  bar.className = "prod-progress isPaused";
  bar.innerHTML = "<span></span>";
  stage.appendChild(bar);
  let encima = false, quietoHasta = 0, timer = null;

  function puedeAvanzar(){
    if (REDUCED_MOTION || document.hidden || encima || sliding || Date.now() < quietoHasta) return false;
    const r = stage.getBoundingClientRect();
    const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return visible > r.height * .6;
  }
  function avanzar(){
    if (enPersonaje()) selectBurger((currentIdx + 1) % data.burgers.length, true, false);
    else if (prodRight.classList.contains("showIng")) setModo(true);
    else verIngredientes(true);
  }
  function programar(){
    clearTimeout(timer);
    if (!puedeAvanzar()){
      bar.classList.remove("isRun"); bar.classList.add("isPaused");
      timer = setTimeout(programar, 600);
      return;
    }
    bar.classList.remove("isPaused", "isRun");
    void bar.offsetWidth;                       // reinicia la barra
    bar.style.setProperty("--dur", PASO + "ms");
    bar.classList.add("isRun");
    timer = setTimeout(() => { if (puedeAvanzar()) avanzar(); programar(); }, PASO);
  }
  function tocar(){ quietoHasta = Date.now() + QUIETO; programar(); }
  [stage, tabsEl].forEach(el => {
    el.addEventListener("pointerdown", tocar);
    el.addEventListener("keydown", tocar);
    el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse"){ encima = true; programar(); } });
    el.addEventListener("pointerleave", e => { if (e.pointerType === "mouse"){ encima = false; programar(); } });
  });
  document.addEventListener("visibilitychange", programar);

  /* -- Init -------------------------------------------------------- */
  selectBurger(0, false, false);
  if (!REDUCED_MOTION) programar();
}

/* ------------------------------------------------------------------ */
/* MODAL CARTA                                                          */
/* ------------------------------------------------------------------ */
function modal(open){
  const m = $("#modal");
  if (!m) return;
  if (open){
    m.hidden = false;
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  } else {
    m.hidden = true;
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

/* ------------------------------------------------------------------ */
/* MOBILE MENU                                                          */
/* ------------------------------------------------------------------ */
function setupMobileMenu(){
  const btn  = $("#burgerBtn");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  const close = () => {
    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    menu.hidden = isOpen;
  });

  $$(".mLink").forEach(a => a.addEventListener("click", close));
  window.addEventListener("hashchange", close);
  window.addEventListener("scroll", () => close(), { passive: true });
}

/* ------------------------------------------------------------------ */
/* ACCIONES GENÉRICAS                                                   */
/* ------------------------------------------------------------------ */
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_IN_OUT = "cubic-bezier(.65,0,.35,1)";            // lento → rápido → lento
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* Desplazamiento entre secciones: arranca suave, acelera y frena al llegar.
   La duración crece con la distancia (0,7 s a 1,4 s). Si la persona mueve la
   rueda o toca la pantalla, se corta y la deja seguir a ella. */
let scrollAnim = null;
// En esta página el que se desplaza es el <body> (html y body miden 100% de alto);
// si algún día pasa a ser la ventana, se usa esa.
function desplazable(){
  const b = document.body;
  return (b.scrollHeight > b.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(b).overflowY))
    ? b : document.scrollingElement;
}
function irA(el, hash){
  if (!el) return;
  const sc = desplazable();
  const margen = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const top0 = sc === document.scrollingElement ? 0 : sc.getBoundingClientRect().top;
  const destino = Math.max(0, Math.min(
    el.getBoundingClientRect().top - top0 + sc.scrollTop - margen,
    sc.scrollHeight - sc.clientHeight));
  if (hash && location.hash !== hash) history.pushState(null, "", hash);
  if (REDUCED_MOTION){ sc.scrollTop = destino; return; }
  cancelAnimationFrame(scrollAnim);
  const desde = sc.scrollTop, dist = destino - desde;
  if (Math.abs(dist) < 2) return;
  const dur = Math.min(1400, Math.max(700, 450 + Math.abs(dist) * .22));
  const t0 = performance.now();
  const paso = now => {
    const t = Math.min(1, (now - t0) / dur);
    sc.scrollTop = desde + dist * easeInOut(t);
    if (t < 1) scrollAnim = requestAnimationFrame(paso);
  };
  scrollAnim = requestAnimationFrame(paso);
}
["wheel", "touchstart", "keydown"].forEach(ev =>
  window.addEventListener(ev, () => cancelAnimationFrame(scrollAnim), { passive: true }));

function setupScrollSuave(){
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href");
    const el = hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    // cerrar el menú del celular si el link estaba ahí
    const menu = $("#mobileMenu");
    if (menu && !menu.hidden && menu.contains(a)){ menu.hidden = true; $("#burgerBtn")?.setAttribute("aria-expanded", "false"); }
    irA(el, hash);
  });
}

/* Cada sección aparece con un fundido suave la primera vez que entra en pantalla.
   Se revisa en cada movimiento del scroll (son pocos bloques), así nunca queda nada oculto. */
function setupAparecer(){
  if (REDUCED_MOTION) return;
  let pendientes = $$("main > section:not(.hero) > .wrap, main > section:not(.hero) > .hist-wrap")
    .filter(b => b.getBoundingClientRect().top > window.innerHeight * .88);   // lo que ya se ve al cargar no se anima
  pendientes.forEach(b => b.classList.add("reveal"));
  let pedido = false;
  const revisar = () => {
    pedido = false;
    const limite = window.innerHeight * .9;
    pendientes = pendientes.filter(b => {
      if (b.getBoundingClientRect().top < limite){ b.classList.add("isIn"); return false; }
      return true;
    });
  };
  const alMover = () => { if (!pedido && pendientes.length){ pedido = true; setTimeout(revisar, 40); } };
  document.body.addEventListener("scroll", alMover, { passive: true });
  window.addEventListener("scroll", alMover, { passive: true });
  window.addEventListener("resize", alMover);
}

function setupActions(){
  $$("[data-action='scrollTo']").forEach(btn => {
    btn.addEventListener("click", () => irA(document.querySelector(btn.dataset.target)));
  });

  $("#openMenu")?.addEventListener("click",  () => modal(true));
  $("#closeMenu")?.addEventListener("click", () => modal(false));
  $("#modalOverlay")?.addEventListener("click", () => modal(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal(false);
  });

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/* ------------------------------------------------------------------ */
/* CARRUSEL HISTORIA – genérico                                         */
/* ------------------------------------------------------------------ */
function makeCarousel(carouselId, trackId, dotsId, intervalMs = 5000){
  const carousel = document.getElementById(carouselId);
  const track    = document.getElementById(trackId);
  const dotsWrap = document.getElementById(dotsId);
  if (!carousel || !track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll(".histSlide"));
  const total  = slides.length;
  if (total === 0) return;

  let idx   = 0;
  let timer = null;

  track.style.width = `${total * 100}%`;
  slides.forEach(s => (s.style.width = `${100 / total}%`));

  function renderDots(){
    dotsWrap.innerHTML = "";
    for (let i = 0; i < total; i++){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "histDot";
      b.setAttribute("aria-label", `Foto ${i + 1}`);
      const fill = document.createElement("span");
      fill.className = "fill";
      b.appendChild(fill);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    }
  }

  function restartDotAnimation(){
    dotsWrap.querySelectorAll(".histDot").forEach((d, i) => {
      d.classList.toggle("isActive", i === idx);
      if (i === idx){
        const fill = d.querySelector(".fill");
        if (fill){ fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = ""; }
      }
    });
  }

  function update(){
    track.style.transform = `translateX(${-(idx * (100 / total))}%)`;
    restartDotAnimation();
  }

  function start(){ stop(); timer = setInterval(() => { idx = (idx + 1) % total; update(); }, intervalMs); }
  function stop(){ if (timer){ clearInterval(timer); timer = null; } }
  function goTo(i, restart = true){ idx = i; update(); if (restart) start(); }

  renderDots();
  update();
  start();

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });

  let startX = null;
  carousel.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", e => {
    if (startX === null) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? (idx + 1) % total : (idx - 1 + total) % total, true);
    startX = null;
  }, { passive: true });
}

function initHistoriaCarousel(){
  makeCarousel("histCarouselA", "histTrackA", "histDotsA", 5000);
  makeCarousel("histCarouselB", "histTrackB", "histDotsB", 6000);
}

/* ------------------------------------------------------------------ */
/* FORMULARIO TRABAJA CON NOSOTROS → abre un mail armado                */
/* ------------------------------------------------------------------ */
function setupJoinForm(){
  const form = $("#joinFormEl");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = n => (form.elements[n]?.value || "").trim();
    if (!marcarFaltantes(form)) return;
    const puesto = form.elements.puesto.selectedOptions[0]?.text || "";
    const cuerpo = [
      `Nombre: ${v("nombre")}`,
      `Email: ${v("email")}`,
      `Posición: ${v("puesto") ? puesto : "-"}`,
      "", v("mensaje"), "", "(Adjunto mi CV)"
    ].join("\n");
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Candidatura · " + v("nombre"))}&body=${encodeURIComponent(cuerpo)}`;
    $("#joinFormWrap").hidden = true;
    $("#joinSuccess").hidden = false;
  });
}

/* ------------------------------------------------------------------ */
/* QR CODE – Take Away                                                  */
/* ------------------------------------------------------------------ */
function setupQR(){
  const container = document.getElementById("qrCanvas");
  if (!container || typeof QRCode === "undefined") return;
  new QRCode(container, {
    text: "https://smartmenu.agorapos.com/?id=eau1gphq&workplaceId=ghgys9hf#/",
    width: 110,
    height: 110,
    colorDark: "#0a0a0a",
    colorLight: "#f5f5f5",
    correctLevel: QRCode.CorrectLevel.M
  });
}

/* ------------------------------------------------------------------ */
/* CONFIGURACIÓN                                                        */
/* ------------------------------------------------------------------ */
// Mismo proyecto de Supabase que admin.terrysburgers.com. La clave es la
// pública ("publishable"): la web solo puede llamar a web_reservar(),
// web_consulta_evento() y leer la agenda publicada (ver schema.sql de administración).
const CONFIG = {
  supabaseUrl: "https://cgkpklimplpedgxbgzvu.supabase.co",
  supabaseKey: "sb_publishable_yG1hrdoynoxBBYh9LX7QpA_we_bb_qC",
  email: "info@terrysburgers.com",
  telefono: "615 35 11 31",
  // Turnos con reserva (cada 15 min). Si cambian, cambiarlo también en web_reservar().
  turnos: [["13:00", "15:00"], ["20:00", "22:30"]],
  maxPersonas: 12,
  diasAdelante: 90,
};

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

// Fecha/hora "de Barcelona", sin importar dónde esté el que mira la web.
function ahoraBcn(){
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, min: (+p.hour) * 60 + (+p.minute) };
}
const aMin = hhmm => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const aHHMM = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function sumarDias(iso, n){ const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function fechaLarga(iso){
  return new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).replace(",", "");
}

function marcarFaltantes(form){
  let ok = true;
  form.querySelectorAll("[required]").forEach(el => {
    const vacio = el.type === "checkbox" ? !el.checked : !String(el.value).trim();
    const malo = vacio || (el.type === "email" && el.value && !el.checkValidity());
    el.closest(".check, .formGroup")?.classList.toggle("isError", malo);
    if (malo){ ok = false; el.addEventListener(el.type === "checkbox" ? "change" : "input", () => el.closest(".check, .formGroup")?.classList.remove("isError"), { once: true }); }
  });
  form.querySelectorAll("input[type=email]:not([required])").forEach(el => {
    const malo = el.value && !el.checkValidity();
    el.closest(".formGroup")?.classList.toggle("isError", malo);
    if (malo) ok = false;
  });
  if (!ok) form.querySelector(".isError input, .isError select, .isError textarea")?.focus();
  return ok;
}

function datosForm(form){
  const o = {};
  new FormData(form).forEach((v, k) => { if (k !== "acepto") o[k] = String(v).trim(); });
  return o;
}

// Envío común de reservas y consultas.
function setupEnvio(form, fn, alOk){
  const card = form.parentElement;
  const msg = $(".formMsg", form);
  const btn = $("button[type=submit]", form);
  const exito = $("[data-success]", card);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    if (!marcarFaltantes(form)) { msg.textContent = "Completá los campos marcados."; return; }
    const datos = datosForm(form);
    btn.disabled = true; const txt = btn.textContent; btn.textContent = "Enviando…";
    try {
      await rpc(fn, { p: datos });
      alOk?.(datos, exito);
      form.hidden = true; exito.hidden = false;
      exito.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err){
      const m = String(err.message || "");
      msg.textContent =
        m.includes("demasiadas") ? `Ya recibimos varias solicitudes desde ese teléfono. Llamanos al ${CONFIG.telefono}.` :
        m.includes("teléfono") ? "Revisá el teléfono." :
        m.includes("horario") ? "Ese horario ya no está disponible, elegí otro." :
        m.includes("fecha") ? "Elegí una fecha dentro de los próximos 3 meses." :
        `No pudimos enviarlo. Probá de nuevo o llamanos al ${CONFIG.telefono}.`;
    } finally {
      btn.disabled = false; btn.textContent = txt;
    }
  });
  $("[data-otra]", card)?.addEventListener("click", () => {
    form.reset(); exito.hidden = true; form.hidden = false; form.dispatchEvent(new Event("reset-ok"));
  });
}

/* ------------------------------------------------------------------ */
/* RESERVAS                                                             */
/* ------------------------------------------------------------------ */
function setupReservas(){
  const form = $("#resForm");
  if (!form) return;
  const fecha = form.elements.fecha, hora = form.elements.hora, pers = form.elements.personas;

  pers.innerHTML = Array.from({ length: CONFIG.maxPersonas }, (_, i) =>
    `<option value="${i + 1}"${i === 1 ? " selected" : ""}>${i + 1} ${i ? "personas" : "persona"}</option>`).join("");

  const preparar = () => {
    const { dia } = ahoraBcn();
    fecha.min = dia; fecha.max = sumarDias(dia, CONFIG.diasAdelante);
    if (!fecha.value) fecha.value = dia;
    llenarHoras();
  };
  function llenarHoras(){
    const { dia, min } = ahoraBcn();
    const antes = hora.value;
    const libres = [];
    for (const [a, b] of CONFIG.turnos)
      for (let m = aMin(a); m <= aMin(b); m += 15)
        if (fecha.value !== dia || m > min + 30) libres.push(aHHMM(m));
    hora.innerHTML = !fecha.value ? `<option value="">Elegí el día</option>`
      : libres.length ? `<option value="">Elegí la hora</option>` + libres.map(h => `<option${h === antes ? " selected" : ""}>${h}</option>`).join("")
      : `<option value="">Hoy ya no quedan horarios</option>`;
  }
  fecha.addEventListener("change", llenarHoras);
  form.addEventListener("reset-ok", preparar);
  preparar();

  setupEnvio(form, "web_reservar", (d, exito) => {
    $("[data-resumen]", exito).textContent =
      `${d.nombre}, ${fechaLarga(d.fecha)} a las ${d.hora} · ${d.personas} ${d.personas === "1" ? "persona" : "personas"}.`;
  });
}

/* ------------------------------------------------------------------ */
/* EVENTOS: tarjetas, agenda y consultas                                */
/* ------------------------------------------------------------------ */
function setupEventos(){
  const form = $("#evForm");
  if (!form) return;
  $$("[data-ev]").forEach(b => b.addEventListener("click", () => {
    form.elements.tipo.value = b.dataset.ev;
    irA($("#evFormCard"));
    setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), 500);
  }));
  form.elements.fecha.min = ahoraBcn().dia;
  setupEnvio(form, "web_consulta_evento");
  cargarAgenda();
}

async function cargarAgenda(){
  const ul = $("#agendaList");
  if (!ul) return;
  const vacio = `<li class="agendaEmpty muted">Pronto anunciamos nuevas fechas. Seguinos en <a class="mailLink" href="https://www.instagram.com/terrysburgers.bcn/" target="_blank" rel="noopener">Instagram</a> para enterarte primero.</li>`;
  try {
    const desde = ahoraBcn().dia;
    const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/agenda?select=fecha,hora,titulo,descripcion,imagen_url&fecha=gte.${desde}&order=fecha.asc&limit=8`,
      { headers: { apikey: CONFIG.supabaseKey, Authorization: `Bearer ${CONFIG.supabaseKey}` } });
    if (!r.ok) throw new Error(r.status);
    const filas = await r.json();
    if (!filas.length){ ul.innerHTML = vacio; return; }
    const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    ul.innerHTML = filas.map(f => {
      const d = new Date(f.fecha + "T12:00:00Z");
      const dia = d.toLocaleDateString("es-ES", { day: "2-digit", timeZone: "UTC" });
      const mes = d.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" }).replace(".", "");
      const sem = d.toLocaleDateString("es-ES", { weekday: "long", timeZone: "UTC" });
      return `<li class="agendaItem">
        <div class="agendaDate"><span class="agendaDay">${dia}</span><span class="agendaMon">${esc(mes)}</span></div>
        <div class="agendaBody">
          <div class="agendaTitle">${esc(f.titulo)}</div>
          <div class="small">${esc(sem)}${f.hora ? " · " + esc(f.hora) : ""}</div>
          ${f.descripcion ? `<p class="muted">${esc(f.descripcion)}</p>` : ""}
        </div>
        ${f.imagen_url && /^https:\/\//.test(f.imagen_url) ? `<img class="agendaImg" src="${esc(f.imagen_url)}" alt="" loading="lazy" />` : ""}
      </li>`;
    }).join("");
  } catch {
    ul.innerHTML = vacio;
  }
}

/* ------------------------------------------------------------------ */
/* INIT                                                                 */
/* ------------------------------------------------------------------ */
function init(){
  setupProductos();
  setupActions();
  setupMobileMenu();
  initHistoriaCarousel();
  setupJoinForm();
  setupQR();
  setupReservas();
  setupEventos();
  setupScrollSuave();
  setupAparecer();
}

document.addEventListener("DOMContentLoaded", init);

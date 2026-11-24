/* ==========================================================================
   Jorge Bonafont · Garrafón a domicilio · Guadalajara
   Un solo motor de scroll (rAF) · reveals con respaldo por geometría ·
   anime.js y Lenis opcionales (la página funciona completa sin ellos).
   ========================================================================== */

// Número de WhatsApp (formato internacional sin "+"). Si queda vacío, se ocultan
// el botón flotante y el envío del formulario.
const WHATSAPP = "523318917753";
const TELEFONO = "+523318917753";

(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasAnime = () => typeof window.anime === "function";
  const waLink = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  const DEFAULT_WA = "Hola, quiero pedir un garrafón Bonafont de 20 L a domicilio.";
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const fmtMoney = (n) => "$ " + Math.round(n).toLocaleString("es-MX");
  let lenis = null;

  const ZONES = [
    { n: "Colonia Esperanza", a: ["esperanza"] },
    { n: "La Joya", a: ["la joya", "joya"] },
    { n: "La Joyita", a: ["la joyita", "joyita"] },
    { n: "Huentitán el Alto", a: ["huentitan el alto", "huentitan alto"] },
    { n: "Huentitán el Bajo", a: ["huentitan el bajo", "huentitan bajo"] },
    { n: "San Miguel de Huentitán", a: ["san miguel de huentitan", "san miguel"] },
    { n: "Zoológico Guadalajara", a: ["zoologico", "zoologico guadalajara", "zoo"] },
    { n: "Doctor Atl", a: ["doctor atl", "dr atl", "atl"] },
    { n: "Mirador", a: ["mirador"] },
    { n: "Batallón de San Patricio", a: ["batallon de san patricio", "san patricio", "batallon"] },
    { n: "Belisario Domínguez", a: ["belisario dominguez", "belisario"] }
  ];

  /* ---------- Número animado (anime.js si existe, si no rAF) ---------- */
  function tweenNumber(from, to, dur, onUpdate) {
    if (reduce) { onUpdate(to); return; }
    if (hasAnime()) {
      const o = { v: from };
      window.anime({ targets: o, v: to, duration: dur, easing: "easeOutExpo", round: 1, update: () => onUpdate(o.v) });
      return;
    }
    const t0 = performance.now();
    (function f(now) {
      const t = clamp((now - t0) / dur);
      onUpdate(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- Ráfaga de gotas ---------- */
  function burst(x, y) {
    if (reduce) return;
    const n = 14;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i");
      d.className = "drop";
      d.style.left = x + "px";
      d.style.top = y + "px";
      document.body.appendChild(d);
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 60 + Math.random() * 90;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 30;
      const done = () => d.remove();
      if (hasAnime()) {
        window.anime({ targets: d, translateX: dx, translateY: [0, dy, dy + 60], scale: [1, 0.3], opacity: [1, 0], duration: 1000 + Math.random() * 400, easing: "easeOutCubic", complete: done });
      } else if (d.animate) {
        d.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px,${dy + 40}px) scale(.3)`, opacity: 0 }], { duration: 1100, easing: "ease-out" }).onfinish = done;
      } else done();
    }
  }

  /* ---------- WhatsApp ---------- */
  function setWa(el, texto) {
    el.dataset.waText = texto;
    if (WHATSAPP) el.href = waLink(texto);
  }
  function wireWhatsApp() {
    if (!WHATSAPP) {
      root.classList.add("no-wa");
      $$("[data-wa]").forEach((a) => { a.hidden = true; });
      return;
    }
    $$("[data-wa]").forEach((a) => {
      a.href = waLink(a.dataset.waText || DEFAULT_WA);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- Cargador ---------- */
  let readyDone = false;
  const state = { v: 1 }; // entrada de chips orbitales
  function ready() {
    if (readyDone) return;
    readyDone = true;
    root.classList.add("is-ready");
    introChips();
  }
  function introChips() {
    if (reduce) { state.v = 1; return; }
    if (hasAnime()) {
      window.anime({ targets: state, v: 1, duration: 1500, delay: 400, easing: "easeOutElastic(1, .7)" });
    } else {
      setTimeout(() => { state.v = 1; }, 600);
    }
    setTimeout(() => { state.v = 1; }, 4200);
  }
  function initLoader() {
    const loader = $("#loader");
    if (!loader) { ready(); return; }
    const num = $("#loaderNum");
    const txt = $("#loaderTxt");
    if (!reduce) state.v = 0;
    let out = false;
    const exit = () => {
      if (out) return;
      out = true;
      loader.classList.add("is-out");
      ready();
      setTimeout(() => { loader.style.display = "none"; }, 1100);
    };
    const dur = reduce ? 300 : 1700;
    const t0 = performance.now();
    (function step(now) {
      const t = clamp((now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (num) num.textContent = String(Math.round(e * 100)).padStart(3, "0");
      if (t < 1) requestAnimationFrame(step);
      else {
        if (txt) txt.textContent = "Listo. Tu agua de hoy.";
        setTimeout(exit, reduce ? 0 : 450);
      }
    })(t0);
    setTimeout(exit, reduce ? 600 : 2400); // tope duro
  }

  /* ---------- Encabezado / menú ---------- */
  function initMenu() {
    const burger = $("#burger");
    const sheet = $("#sheet");
    if (!burger || !sheet) return;
    const set = (open) => {
      root.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      sheet.setAttribute("aria-hidden", String(!open));
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener("click", () => set(!root.classList.contains("menu-open")));
    $$("a", sheet).forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("menu-open")) set(false); });
    window.matchMedia("(min-width: 900px)").addEventListener("change", (m) => { if (m.matches) set(false); });
  }

  function initFloat() {
    const b = $("#waBubble");
    if (!b || !WHATSAPP) return;
    setTimeout(() => b.classList.add("show"), 5000);
    setTimeout(() => b.classList.remove("show"), 11000);
  }

  /* ---------- Estado en vivo Abierto / Cerrado ---------- */
  function initStatus() {
    const els = $$("[data-status]");
    const week = $$(".week li");
    const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    function nowMx() {
      try {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Mexico_City", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
        const get = (t) => (parts.find((p) => p.type === t) || {}).value;
        return { d: dias[get("weekday")], h: (parseInt(get("hour"), 10) % 24) + parseInt(get("minute"), 10) / 60 };
      } catch (e) {
        const n = new Date();
        return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 };
      }
    }
    function update() {
      const { d, h } = nowMx();
      const laboral = d >= 1 && d <= 6;
      const open = laboral && h >= 8 && h < 16;
      let msg;
      if (open) msg = "Abierto ahora · te atendemos";
      else if (laboral && h < 8) msg = "Abrimos hoy a las 8:00";
      else if (d === 6 && h >= 16) msg = "Abrimos el lunes a las 8:00";
      else msg = "Abrimos mañana a las 8:00";
      els.forEach((el) => {
        el.classList.toggle("is-open", open);
        const t = $("[data-status-text]", el);
        if (t) t.textContent = msg;
      });
      week.forEach((li) => li.classList.toggle("is-today", Number(li.dataset.d) === d));
    }
    update();
    setInterval(update, 60000);
  }

  /* ---------- Motor de scroll único ---------- */
  const hooks = {};
  function initScrollEngine() {
    const items = $$("[data-scroll]").map((el) => ({ el, mode: el.dataset.scroll, p: -1 }));
    const progressRoot = root;
    let lastY = window.scrollY, vel = 0, skew = 0;
    const ribbons = $$(".ribbons");

    function calcP(it) {
      const r = it.el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (it.mode === "pin") {
        const range = r.height - vh;
        return range > 4 ? clamp(-r.top / range) : clamp((vh - r.top) / (vh + r.height));
      }
      if (it.mode === "out") return clamp(-r.top / Math.max(1, r.height));
      return clamp((vh - r.top) / (vh + r.height));
    }
    function setP(it, p) {
      if (Math.abs(p - it.p) < 0.0004) return;
      it.p = p;
      it.el.style.setProperty("--p", p.toFixed(4));
      const h = hooks[it.el.id];
      if (h) h(p);
    }

    if (reduce) {
      items.forEach((it) => {
        const s = it.el.dataset.scrollStatic;
        setP(it, s !== undefined ? parseFloat(s) : 1);
      });
      revealGeometry();
      updateRaz(true);
      return;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      items.forEach((it) => setP(it, calcP(it)));
      const max = document.documentElement.scrollHeight - vh;
      progressRoot.style.setProperty("--sp", max > 0 ? clamp(y / max).toFixed(4) : "0");
      // Inclinación de las cintas según la velocidad de scroll
      vel += ((y - lastY) - vel) * 0.2;
      lastY = y;
      const target = clamp(vel * 0.35, -8, 8);
      skew += (target - skew) * 0.5;
      if (Math.abs(skew) < 0.02 && Math.abs(vel) < 0.05) { skew = 0; vel = 0; }
      ribbons.forEach((r) => r.style.setProperty("--skew", skew.toFixed(2) + "deg"));
      revealGeometry();
      updateRaz(false);
      if (Math.abs(vel) > 0.05 || Math.abs(skew) > 0.02) req();
    }
    function req() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    window.addEventListener("load", req);
    update();
    window.__bonaReq = req;
  }

  /* ---------- Reveals (IntersectionObserver + respaldo por geometría) ---------- */
  let pendingReveal = [];
  function initReveal() {
    pendingReveal = $$("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      pendingReveal.forEach((el) => el.classList.add("is-in"));
      pendingReveal = [];
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
      pendingReveal = pendingReveal.filter((el) => !el.classList.contains("is-in"));
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    pendingReveal.forEach((el) => io.observe(el));
    setTimeout(revealGeometry, 2000);
    setTimeout(revealGeometry, 4000);
    window.addEventListener("load", () => setTimeout(revealGeometry, 600));
  }
  function revealGeometry() {
    if (!pendingReveal.length) return;
    const vh = window.innerHeight;
    pendingReveal.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-in");
    });
    pendingReveal = pendingReveal.filter((el) => !el.classList.contains("is-in"));
  }

  /* ---------- Gotas en canvas ---------- */
  function Drops(canvas, opt) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const host = opt.host || canvas.parentElement;
    let w = 0, h = 0, ds = [], visible = true, running = false;
    const ptr = { x: -999, y: -999 };
    function size() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = window.innerWidth < 700 ? opt.nMobile : opt.n;
      ds = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 2 + Math.random() * 5, v: 0.25 + Math.random() * 0.7, ph: Math.random() * 6.28, amp: 6 + Math.random() * 14 }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ds.forEach((d) => {
        if (!reduce) {
          d.y -= d.v;
          if (d.y < -20) { d.y = h + 20; d.x = Math.random() * w; }
        }
        let x = d.x + Math.sin(t * 0.001 + d.ph) * d.amp;
        if (opt.pointer) {
          const dx = x - ptr.x, dy = d.y - ptr.y, dist = Math.hypot(dx, dy);
          if (dist < 110 && dist > 0.1) d.x += (dx / dist) * (110 - dist) * 0.06;
        }
        ctx.beginPath();
        ctx.arc(x, d.y, d.r, 0, 6.2832);
        ctx.fillStyle = `rgba(${opt.rgb},.16)`;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${opt.rgb},.55)`;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.28, 0, 6.2832);
        ctx.fillStyle = "rgba(255,255,255,.7)";
        ctx.fill();
      });
    }
    function loop(t) {
      if (!visible || document.hidden) { running = false; return; }
      draw(t);
      requestAnimationFrame(loop);
    }
    function start() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }
    size();
    draw(0);
    window.addEventListener("resize", () => { size(); draw(0); });
    if (opt.pointer && finePointer) {
      host.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      }, { passive: true });
      host.addEventListener("pointerleave", () => { ptr.x = ptr.y = -999; });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
    start();
  }

  /* ---------- Hero: órbita falsa 3D + parallax con puntero ---------- */
  function initHero() {
    const hero = $("#inicio");
    const stage = $("#stage");
    if (!hero || !stage) return;
    const chips = $$(".orbit__chip", stage);
    const th = chips.map((_, i) => (i * Math.PI) / 2 + 0.6);
    const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let visible = true, running = false, last = performance.now();

    if (finePointer && !reduce) {
      hero.addEventListener("pointermove", (e) => {
        tgt.x = e.clientX / window.innerWidth - 0.5;
        tgt.y = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
      hero.addEventListener("pointerleave", () => { tgt.x = 0; tgt.y = 0; });
    }

    function place(dt) {
      const w = stage.clientWidth, h = stage.clientHeight;
      const narrow = window.innerWidth < 600;
      const a = narrow ? w * 0.27 : Math.min(w * 0.4, 300), b = Math.max(24, h * 0.1), cy = h * (narrow ? 0.28 : 0.3);
      chips.forEach((c, i) => {
        th[i] += 0.004 * dt;
        const s = Math.sin(th[i]), co = Math.cos(th[i]);
        const sc = (0.93 + 0.12 * s) * (0.4 + 0.6 * state.v);
        c.style.transform = `translate(-50%,-50%) translate(${(a * co).toFixed(1)}px,${(cy + b * s).toFixed(1)}px) scale(${sc.toFixed(3)})`;
        c.style.opacity = (state.v * (0.6 + 0.4 * ((s + 1) / 2))).toFixed(2);
        c.style.zIndex = s < 0 ? 1 : 3;
      });
    }
    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      cur.x += (tgt.x - cur.x) * 0.08;
      cur.y += (tgt.y - cur.y) * 0.08;
      hero.style.setProperty("--mx", cur.x.toFixed(3));
      hero.style.setProperty("--my", cur.y.toFixed(3));
      place(dt);
      requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduce) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    place(0);
    if (reduce) { state.v = 1; place(0); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
    window.addEventListener("resize", () => place(0));
    start();
  }

  /* ---------- Cintas: duplicar el contenido para el bucle ---------- */
  function initRibbons() {
    $$(".ribbon__track").forEach((t) => {
      const g = $(".ribbon__group", t);
      if (g) t.appendChild(g.cloneNode(true));
    });
  }

  /* ---------- Manifiesto líquido ---------- */
  function wrapWords(node) {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) wrapWords(n);
    });
  }
  function initManifest() {
    const text = $("[data-words]");
    if (text) wrapWords(text);
    const words = $$(".w", text || document);
    const water = $("#mWater");
    const lit = $("#mLit");
    const cta = $("#mCta");
    hooks["promesa"] = (p) => {
      const lvl = p * 0.92;
      if (water) water.style.transform = `translateY(${(420 - lvl * 372).toFixed(1)}px)`;
      if (lit) lit.textContent = (p * 20).toFixed(1);
      const n = words.length;
      words.forEach((w, i) => w.classList.toggle("on", p > (i / n) * 0.85));
      if (cta) cta.classList.toggle("on", p > 0.9);
    };
    if (!root.classList.contains("js")) return;
    // estado inicial (por si el motor tarda): todo apagado
  }

  /* ---------- Bento: tilt + spotlight ---------- */
  function initTilt() {
    if (!finePointer || reduce) return;
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--ty", ((x / r.width - 0.5) * 12).toFixed(2) + "deg");
        el.style.setProperty("--tx", (-(y / r.height - 0.5) * 12).toFixed(2) + "deg");
        el.style.setProperty("--mx", x.toFixed(0) + "px");
        el.style.setProperty("--my", y.toFixed(0) + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--ty", "0deg");
        el.style.setProperty("--tx", "0deg");
      });
    });
  }

  /* ---------- La ruta ---------- */
  function initRoute() {
    const route = $("#como-pedir");
    if (!route) return;
    const draw = $("#rDraw");
    const base = $("#rBase");
    const truck = $("#truck");
    const pins = $$(".pin", route);
    const stops = $$(".stop", route);
    const stopsList = $(".stops", route);
    let len = 0, pinsPlaced = false;

    // camión pequeño para la línea vertical (móvil)
    if (stopsList) {
      const ns = "http://www.w3.org/2000/svg";
      const s = document.createElementNS(ns, "svg");
      s.setAttribute("class", "mtruck");
      s.setAttribute("viewBox", "0 0 96 56");
      s.setAttribute("aria-hidden", "true");
      s.innerHTML = '<rect x="2" y="6" width="58" height="34" rx="5" fill="#F4672F"/><path d="M12 32 L24 14 L32 24 L38 18 L48 32Z" fill="#FFF1E8"/><path d="M60 16 H78 L90 28 V40 H60 Z" fill="#fff" stroke="#14306B" stroke-width="2"/><circle cx="20" cy="42" r="8" fill="#0B1B45"/><circle cx="74" cy="42" r="8" fill="#0B1B45"/>';
      stopsList.appendChild(s);
    }

    function geom() {
      if (!draw || !truck) return false;
      try {
        if (!len) {
          len = draw.getTotalLength();
          if (!len) return false;
          draw.style.strokeDasharray = len;
        }
        if (!pinsPlaced) {
          pins.forEach((pin) => {
            const pt = draw.getPointAtLength(parseFloat(pin.dataset.t) * len);
            pin.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
          });
          pinsPlaced = true;
        }
        return true;
      } catch (e) { return false; }
    }
    hooks["como-pedir"] = (p) => {
      stops.forEach((s) => s.classList.toggle("is-on", p >= parseFloat(s.dataset.stop)));
      if (!geom()) return;
      draw.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
      const at = p * len;
      const a = draw.getPointAtLength(clamp(at - 2, 0, len));
      const b = draw.getPointAtLength(clamp(at + 2, 0, len));
      const pt = draw.getPointAtLength(at);
      const ang = clamp((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, -35, 35);
      truck.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    };
    if (base) window.addEventListener("resize", () => { pinsPlaced = false; len = 0; });
  }

  /* ---------- Zonas en selects ---------- */
  function fillZones() {
    $$("select[data-zones]").forEach((sel) => {
      ZONES.forEach((z) => {
        const o = document.createElement("option");
        o.value = z.n; o.textContent = z.n;
        sel.appendChild(o);
      });
      const o = document.createElement("option");
      o.value = "Otra colonia"; o.textContent = "Otra colonia";
      sel.appendChild(o);
    });
  }

  /* ---------- Calculadora ---------- */
  function initCalc() {
    const qty = $("#qty");
    if (!qty) return;
    const val = $("#qVal"), stack = $("#stack"), total = $("#total");
    const cta = $("#cCta"), ctaTxt = $("#cCtaTxt"), zona = $("#cZona");
    const PRICE = 59, MAX = 20;
    const MINI = '<svg viewBox="0 0 300 440" aria-hidden="true"><path d="M112 48 L112 78 C112 96 62 112 52 150 C44 180 40 230 40 290 L40 372 C40 402 62 420 96 420 L204 420 C238 420 260 402 260 372 L260 290 C260 230 256 180 248 150 C238 112 188 96 188 78 L188 48 Z" fill="#3BA9E6" fill-opacity=".55" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><path d="M52 200 Q150 180 248 200 L260 290 L260 372 C260 402 238 420 204 420 L96 420 C62 420 40 402 40 372 L40 290 Z" fill="#6CC3F2" fill-opacity=".7"/><rect x="104" y="14" width="92" height="38" rx="8" fill="#F4672F"/></svg>';
    let n = parseInt(qty.value, 10) || 5;
    let shown = 0, shownMoney = n * PRICE;
    const tipoLabel = { hogar: "hogar", oficina: "oficina", negocio: "negocio" };

    function render(first) {
      n = clamp(n, 1, MAX);
      qty.value = n;
      val.textContent = n;
      // pila de garrafones
      if (n > shown) {
        for (let i = shown; i < n; i++) {
          const m = document.createElement("span");
          m.className = "mini";
          m.style.setProperty("--k", i - shown);
          m.innerHTML = MINI;
          stack.appendChild(m);
        }
      } else {
        while (stack.children.length > n) stack.removeChild(stack.lastChild);
      }
      shown = n;
      const money = n * PRICE;
      tweenNumber(shownMoney, money, first ? 900 : 700, (v) => { total.textContent = fmtMoney(v); });
      shownMoney = money;
      ctaTxt.textContent = n === 1 ? "Pedir mi garrafón" : `Pedir mis ${n} garrafones`;
      const tipo = ($("input[name=ctipo]:checked") || {}).value || "hogar";
      const col = zona.value && zona.value !== "Otra colonia" ? zona.value : zona.value === "Otra colonia" ? "otra colonia (te la confirmo)" : "(colonia por confirmar)";
      setWa(cta, `Hola, quiero pedir ${n} garrafón${n > 1 ? "es" : ""} Bonafont de 20 L para mi ${tipoLabel[tipo]}, para entregar en ${col}. Estimado: ${fmtMoney(money).replace("$ ", "$")}. ¿Me confirman?`);
    }
    qty.addEventListener("input", () => { n = parseInt(qty.value, 10) || 1; render(false); });
    $("#qMinus").addEventListener("click", () => { n--; render(false); });
    $("#qPlus").addEventListener("click", () => { n++; render(false); });
    $$("input[name=ctipo]").forEach((r) => r.addEventListener("change", () => render(false)));
    zona.addEventListener("change", () => render(false));
    // arranque: se muestra al entrar en pantalla (con respaldo)
    total.textContent = fmtMoney(n * PRICE);
    for (let i = 0; i < n; i++) {
      const m = document.createElement("span");
      m.className = "mini"; m.style.setProperty("--k", i); m.innerHTML = MINI;
      stack.appendChild(m);
    }
    shown = n;
    render(true);
  }

  /* ---------- Razones: tarjeta activa ---------- */
  let razCards = [];
  function updateRaz(force) {
    if (!razCards.length) razCards = $$(".raz__card");
    if (!razCards.length) return;
    const vh = window.innerHeight;
    const list = $("#razList");
    const lr = list.getBoundingClientRect();
    if (!force && (lr.bottom < 0 || lr.top > vh)) return;
    let best = null, bd = 1e9;
    razCards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.5);
      if (d < bd) { bd = d; best = c; }
    });
    razCards.forEach((c) => c.classList.toggle("is-active", c === best));
    root.classList.add("has-active");
  }

  /* ---------- Muro de carteles + lightbox ---------- */
  function initWall() {
    const wall = $(".wall");
    if (!wall) return;
    $$(".marquee").forEach((m) => {
      const g = $(".marquee__group", m);
      if (!g) return;
      const c = g.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      $$("button", c).forEach((b) => b.setAttribute("tabindex", "-1"));
      m.appendChild(c);
    });
    const items = [];
    $$(".marquee__group:first-child .poster", wall).forEach((b) => {
      const i = Number(b.dataset.i);
      const img = $("img", b);
      if (!items[i] && img && img.alt) items[i] = { src: img.getAttribute("src"), alt: img.alt, w: img.getAttribute("width"), h: img.getAttribute("height") };
    });
    const dlg = $("#lightbox");
    const lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCta = $("#lbCta");
    let idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      const it = items[idx];
      if (!it) return;
      lbImg.src = it.src; lbImg.alt = it.alt;
      lbImg.setAttribute("width", it.w); lbImg.setAttribute("height", it.h);
      lbCap.textContent = it.alt;
      setWa(lbCta, `Hola, vi el cartel «${it.alt.replace(/^Cartel( de Jorge Bonafont)?:? ?/, "")}» y quiero mi garrafón Bonafont de 20 L.`);
    }
    function open(i) {
      if (!dlg) return;
      lastFocus = document.activeElement;
      show(i);
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      if (lenis) lenis.stop();
      $("#lbClose").focus();
    }
    function close() {
      if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
    }
    wall.addEventListener("click", (e) => {
      const b = e.target.closest(".poster");
      if (b) open(Number(b.dataset.i));
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => show(idx - 1));
    $("#lbNext").addEventListener("click", () => show(idx + 1));
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("lightbox__in")) close(); });
    dlg.addEventListener("close", () => { if (lenis && !root.classList.contains("menu-open")) lenis.start(); if (lastFocus) lastFocus.focus(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    $("#lbCta").addEventListener("click", () => { if (!WHATSAPP) return; });

    // cursor «Ver en grande»
    const tag = $("#cursorTag");
    if (tag && finePointer) {
      wall.addEventListener("pointermove", (e) => {
        const over = e.target.closest(".poster");
        tag.classList.toggle("on", !!over);
        if (over) tag.style.translate = `${e.clientX}px ${e.clientY}px`;
      }, { passive: true });
      wall.addEventListener("pointerleave", () => tag.classList.remove("on"));
    }
  }

  /* ---------- Cobertura + radar ---------- */
  function initCoverage() {
    const nodesWrap = $("#radarNodes");
    if (!nodesWrap) return;
    const input = $("#zSearch"), res = $("#zRes"), btn = $("#zBtn"), btnTxt = $("#zBtnTxt");
    const chips = $$("#zChips button");
    const nodes = [];
    const R = 35.4;
    ZONES.forEach((z, i) => {
      const th = (i * 2 * Math.PI) / ZONES.length;
      const x = 50 + R * Math.sin(th), y = 50 - R * Math.cos(th);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "node" + (x < 30 ? " n-l" : x > 70 ? " n-r" : "");
      b.style.left = x.toFixed(2) + "%";
      b.style.top = y.toFixed(2) + "%";
      b.setAttribute("aria-label", z.n);
      b.innerHTML = `<i style="--d:${((th / (2 * Math.PI)) * 6).toFixed(2)}s"></i><span>${z.n}</span>`;
      b.addEventListener("click", () => select([i], true));
      nodesWrap.appendChild(b);
      nodes.push(b);
    });

    function select(list, fill) {
      nodes.forEach((n, i) => n.classList.toggle("is-hit", list.includes(i)));
      chips.forEach((c) => c.classList.toggle("is-on", list.includes(Number(c.dataset.z))));
      if (!list.length) return;
      const names = list.map((i) => ZONES[i].n);
      const joined = names.length > 1 ? names.slice(0, -1).join(", ") + " y " + names[names.length - 1] : names[0];
      if (fill && input) input.value = names.length === 1 ? names[0] : input.value;
      res.className = "cov__res ok";
      res.innerHTML = `<strong>¡Sí llegamos a ${joined}!</strong>`;
      btn.hidden = !WHATSAPP;
      btnTxt.textContent = "Confirmar mi colonia por WhatsApp";
      setWa(btn, `Hola, quiero confirmar mi pedido de garrafón Bonafont de 20 L. Mi colonia es ${joined}.`);
    }
    function search() {
      const q = norm(input.value);
      if (q.length < 3) {
        nodes.forEach((n) => n.classList.remove("is-hit"));
        chips.forEach((c) => c.classList.remove("is-on"));
        res.className = "cov__res";
        res.innerHTML = "<p>Escribe el nombre de tu colonia y te decimos si llegamos.</p>";
        btn.hidden = true;
        return;
      }
      const hits = [];
      ZONES.forEach((z, i) => {
        const hay = [norm(z.n), ...z.a.map(norm)];
        const ok = hay.some((h) => h.includes(q) || (" " + q + " ").includes(" " + h + " "));
        if (ok) hits.push(i);
      });
      if (hits.length) select(hits, false);
      else {
        nodes.forEach((n) => n.classList.remove("is-hit"));
        chips.forEach((c) => c.classList.remove("is-on"));
        res.className = "cov__res no";
        res.innerHTML = "<strong>No aparece en nuestra lista, pero escríbenos: quizá llegamos.</strong>";
        btn.hidden = !WHATSAPP;
        btnTxt.textContent = "Preguntar por mi colonia";
        setWa(btn, `Hola, quiero preguntar si llegan a mi colonia: ${input.value.trim()}.`);
      }
    }
    input.addEventListener("input", search);
    chips.forEach((c) => c.addEventListener("click", () => select([Number(c.dataset.z)], true)));
  }

  /* ---------- Formulario → WhatsApp ---------- */
  function initForm() {
    const form = $("#pedido");
    if (!form) return;
    const nombre = $("#fNombre"), zona = $("#fZona"), nIn = $("#fN"), dir = $("#fDir");
    const eN = $("#eNombre"), eZ = $("#eZona"), send = $("#fSend"), sendTxt = $("#fSendTxt");
    const setN = (v) => { nIn.value = clamp(parseInt(v, 10) || 1, 1, 50); };
    $("#fMinus").addEventListener("click", () => setN(parseInt(nIn.value, 10) - 1));
    $("#fPlus").addEventListener("click", () => setN(parseInt(nIn.value, 10) + 1));
    nIn.addEventListener("change", () => setN(nIn.value));
    const tipos = { hogar: "mi hogar", oficina: "mi oficina", negocio: "mi negocio" };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      eN.textContent = ""; eZ.textContent = "";
      let ok = true;
      if (!nombre.value.trim()) { eN.textContent = "Dinos tu nombre para atenderte."; ok = false; }
      if (!zona.value) { eZ.textContent = "Elige tu colonia (o «Otra colonia»)."; ok = false; }
      if (!ok) { (nombre.value.trim() ? zona : nombre).focus(); return; }
      if (!WHATSAPP) return;
      setN(nIn.value);
      const n = parseInt(nIn.value, 10);
      const tipo = ($("input[name=ftipo]:checked") || {}).value || "hogar";
      let msg = `Hola, soy ${nombre.value.trim()}. Quiero pedir ${n} garrafón${n > 1 ? "es" : ""} Bonafont de 20 L para ${tipos[tipo]}.\nColonia: ${zona.value}`;
      if (dir.value.trim()) msg += `\nDirección/referencias: ${dir.value.trim()}`;
      const r = send.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      sendTxt.textContent = "¡Listo! Abriendo WhatsApp…";
      send.classList.add("is-done");
      const w = window.open(waLink(msg), "_blank", "noopener");
      if (!w) window.location.href = waLink(msg);
      setTimeout(() => { sendTxt.textContent = "Mándame mi agua por WhatsApp"; send.classList.remove("is-done"); }, 4500);
    });
  }

  /* ---------- Lenis (solo puntero fino) y anclas ---------- */
  function initSmooth() {
    if (!finePointer || reduce || typeof window.Lenis !== "function") return;
    try {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    } catch (e) { lenis = null; }
  }
  function initAnchors() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      if (lenis) { e.preventDefault(); lenis.scrollTo(t, { offset: -72 }); }
    });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    wireWhatsApp();
    fillZones();
    initLoader();
    initMenu();
    initSmooth();
    initAnchors();
    initRibbons();
    initManifest();
    initRoute();
    initCalc();
    initWall();
    initCoverage();
    initForm();
    initTilt();
    initStatus();
    initFloat();
    initReveal();
    initScrollEngine();
    initHero();
    Drops($("#gotas"), { n: 28, nMobile: 16, rgb: "59,169,230", pointer: true, host: $("#inicio") });
    Drops($("#gotas2"), { n: 36, nMobile: 18, rgb: "120,200,255", pointer: false });
    // Respaldos finales: nada queda oculto
    setTimeout(() => { ready(); revealGeometry(); if (window.__bonaReq) window.__bonaReq(); }, 2600);
  }
  try { boot(); } catch (err) {
    // Si algo falla, se muestra todo el contenido
    root.classList.add("is-ready");
    $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    const l = $("#loader"); if (l) l.style.display = "none";
    if (window.console) console.error(err);
  }
})();

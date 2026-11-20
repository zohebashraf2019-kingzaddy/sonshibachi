/* Son's Hibachi — site logic (menu, Build-a-Box, live status, reels, event inquiry) */
(() => {
  "use strict";

  /* ---------- MENU DATA (single source of truth — edit prices here) ---------- */
  const PROTEINS = [
    { id: "steak", name: "New York Steak", short: "NY Steak", ico: "🥩", note: "Seared, cubed, buttery" },
    { id: "spicy", name: "Spicy Chicken", short: "Spicy Chicken", ico: "🌶️", note: "Brings the heat" },
    { id: "chicken", name: "Chicken", short: "Chicken", ico: "🍗", note: "Classic hibachi glaze" },
    { id: "shrimp", name: "Shrimp", short: "Shrimp", ico: "🍤", note: "Garlic butter seared" },
  ];

  // Builder formats. `bowlPrices` = single-protein bowls priced by protein.
  const FORMATS = [
    { id: "single", name: "Single Protein Plate", price: 23, picks: 1, desc: "1 protein" },
    { id: "double", name: "Double Protein Plate", price: 28, picks: 2, desc: "2 proteins", hot: true },
    { id: "triple", name: "Triple Protein Plate", price: 34, picks: 3, desc: "3 proteins" },
    { id: "bowl", name: "Bowl", price: null, picks: 1, desc: "Steak / Shrimp $20 · Chicken $15", bowlPrices: { steak: 20, shrimp: 20, chicken: 15 } },
    { id: "dbowl", name: "Double Protein Bowl", price: 25, picks: 2, desc: "Any 2 · rice OR noodles", base: true, isNew: true },
  ];

  const SAUCES = [
    { id: "yumyum", name: "Yum-Yum", price: 0.5 },
    { id: "teriyaki", name: "Teriyaki", price: 0.5 },
    { id: "sriracha", name: "Sriracha", price: 0.5 },
    { id: "chilioil", name: "Chili Oil", price: 0.5 },
    { id: "garlicbutter", name: "Garlic Butter", price: 0.5 },
  ];

  const EXTRAS = [
    { id: "friedrice", name: "Fried Rice", price: 5, kind: "side" },
    { id: "noodles", name: "Noodles", price: 6, kind: "side" },
    { id: "spicynoodles", name: "Spicy Noodles", price: 6, kind: "side" },
    { id: "veggies", name: "Stir Fry Veggies", price: 5, kind: "side" },
    { id: "gina", name: "Gina Punch", sub: "Dragon fruit lemonade", price: 7, kind: "drink" },
    { id: "tony", name: "Tony's Dream", sub: "Strawberry lemonade", price: 7, kind: "drink" },
    { id: "coke", name: "Coke", price: 2, kind: "drink" },
    { id: "sprite", name: "Sprite", price: 2, kind: "drink" },
    { id: "water", name: "Water", price: 1, kind: "drink" },
  ];

  const IMG = "/assets/img/";
  const MENU = {
    Plates: [
      { name: "Single Protein Plate", price: 23, img: IMG + "plate-chicken-shrimp.jpg", desc: "Your choice of protein over fried rice with stir-fry veggies.", preset: { format: "single" } },
      { name: "Double Protein Plate", price: 28, img: IMG + "dd-double.jpg", desc: "Two proteins on one box. Steak and shrimp is the move.", tag: "Most Ordered", preset: { format: "double", proteins: ["steak", "shrimp"] } },
      { name: "Triple Protein Plate", price: 34, img: IMG + "dd-triple.jpg", desc: "Three proteins, fried rice and veggies. Bring an appetite.", tag: "Big Boy Plate", preset: { format: "triple", proteins: ["steak", "chicken", "shrimp"] } },
    ],
    Bowls: [
      { name: "Double Protein Bowl", price: 25, img: IMG + "bowl-steak-shrimp.jpg", desc: "Any 2 proteins over fried rice or noodles.", tag: "New", preset: { format: "dbowl" } },
      { name: "Steak Bowl", price: 20, img: "/assets/video/steak-shrimp.jpg", desc: "New York steak, fried rice and stir-fry veggies.", preset: { format: "bowl", proteins: ["steak"] } },
      { name: "Shrimp Bowl", price: 20, img: "/assets/video/lemon-plate.jpg", desc: "Seared shrimp, fried rice and stir-fry veggies.", preset: { format: "bowl", proteins: ["shrimp"] } },
      { name: "Chicken Bowl", price: 15, img: IMG + "dd-chicken-bowl.jpg", desc: "Hibachi chicken, fried rice and stir-fry veggies.", preset: { format: "bowl", proteins: ["chicken"] } },
    ],
    Sides: [
      { name: "Fried Rice", price: 5, desc: "Savory hibachi fried rice with egg.", extra: "friedrice" },
      { name: "Noodles", price: 6, desc: "Stir-fried noodles with Japanese spices.", extra: "noodles" },
      { name: "Spicy Noodles", price: 6, desc: "Big enough to share. Seriously spicy.", tag: "🔥 Hot", extra: "spicynoodles" },
      { name: "Stir Fry Veggies", price: 5, desc: "Zucchini, broccoli, carrots and onion off the grill.", extra: "veggies" },
    ],
    Sauces: SAUCES.map((s) => ({ name: s.name, price: 0.5, desc: "House sauce · $0.50 each", sauce: s.id })),
    Drinks: [
      { name: "Gina Punch", price: 7, img: IMG + "dd-gina-punch.jpg", desc: "Dragon fruit lemonade.", tag: "Specialty", extra: "gina" },
      { name: "Tony's Dream", price: 7, img: IMG + "dd-tonys-dream.jpg", desc: "Strawberry lemonade.", tag: "Specialty", extra: "tony" },
      { name: "Soda", price: 2, desc: "Coke or Sprite.", extra: "coke" },
      { name: "Water", price: 1, desc: "Bottled water.", extra: "water" },
    ],
  };

  const IG_DM = "https://ig.me/m/sonshibachi";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => "$" + n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); return ok;
    }
  }

  /* ---------- NAV ---------- */
  const burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  $$("a", links).forEach((a) => a.addEventListener("click", () => { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));
  $("#year").textContent = new Date().getFullYear();

  // Logo always scrolls back to the very top (works on every click, not just the first)
  $(".nav__brand").addEventListener("click", (e) => {
    e.preventDefault();
    links.classList.remove("open"); burger.setAttribute("aria-expanded", false);
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });

  /* ---------- LIVE STATUS + HOURS (America/Los_Angeles) ---------- */
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Los_Angeles" }).format(new Date());
  const todayIdx = DAYS.indexOf(todayName);
  const openToday = todayIdx >= 2 && todayIdx <= 6;
  $$("[data-status]").forEach((chip) => {
    chip.classList.add(openToday ? "is-open" : "is-closed");
    chip.querySelector("span").textContent = openToday ? "Open today · check story for hours" : "Closed today · back Tuesday";
  });
  $("#hoursList").innerHTML = [2, 3, 4, 5, 6, 0, 1].map((i) => {
    const open = i >= 2 && i <= 6;
    return `<div class="${i === todayIdx ? "today" : ""}"><span>${DAYS[i]}${i === todayIdx ? " · Today" : ""}</span><span class="${open ? "" : "closed"}">${open ? "Open · see story" : "Closed"}</span></div>`;
  }).join("");

  /* ---------- MENU RENDER ---------- */
  $("#proteinStrip").innerHTML = PROTEINS.map((p) => `<div class="protein"><span class="ico">${p.ico}</span><strong>${p.name}</strong><span>${p.note}</span></div>`).join("");
  const tabs = Object.keys(MENU);
  $("#menuTabs").innerHTML = tabs.map((t, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-tab="${t}">${t}</button>`).join("");
  function renderMenu(tab) {
    $("#menuGrid").innerHTML = MENU[tab].map((it, i) => `
      <article class="item ${it.img ? "" : "item--text"}" style="animation-delay:${i * 60}ms">
        ${it.img ? `<img class="item__img" src="${it.img}" alt="${esc(it.name)}" loading="lazy" />` : ""}
        <div class="item__body">
          ${it.tag ? `<span class="item__tag">${esc(it.tag)}</span>` : ""}
          <div class="item__top"><span class="item__name">${esc(it.name)}</span><span class="item__price">${it.price < 1 ? "50¢" : "$" + it.price}</span></div>
          <p class="item__desc">${esc(it.desc)}</p>
          <button class="btn btn--ghost btn--sm item__add" data-tab="${tab}" data-i="${i}">${it.preset ? "Build this →" : "+ Add to box"}</button>
        </div>
      </article>`).join("");
  }
  $("#menuTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", t === b)); renderMenu(b.dataset.tab);
  });
  $("#menuGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".item__add"); if (!b) return;
    const it = MENU[b.dataset.tab][+b.dataset.i];
    if (it.preset) { applyPreset(it.preset); }
    else if (it.extra) { box.extras[it.extra] = (box.extras[it.extra] || 0) + 1; renderBuilder(); flash(`${it.name} added to your box`); }
    else if (it.sauce) { box.sauces[it.sauce] = (box.sauces[it.sauce] || 0) + 1; renderBuilder(); flash(`${it.name} added to your box`); }
    $("#build").scrollIntoView({ behavior: "smooth" });
  });
  renderMenu(tabs[0]);

  /* ---------- BUILD-A-BOX ---------- */
  const fresh = () => ({ format: "double", proteins: [], base: "Fried Rice", sauces: {}, extras: {} });
  let box = fresh();
  let order = store.get("sons-order", []);
  $("#pickupName").value = store.get("sons-name", "");

  const fmt = () => FORMATS.find((f) => f.id === box.format);
  function boxPrice(b = box) {
    const f = FORMATS.find((x) => x.id === b.format);
    let p = f.bowlPrices ? (b.proteins[0] ? f.bowlPrices[b.proteins[0]] : 0) : f.price;
    for (const [id, q] of Object.entries(b.sauces)) p += (SAUCES.find((s) => s.id === id)?.price || 0) * q;
    for (const [id, q] of Object.entries(b.extras)) p += (EXTRAS.find((s) => s.id === id)?.price || 0) * q;
    return p;
  }
  function describe(b) {
    const f = FORMATS.find((x) => x.id === b.format);
    const prot = b.proteins.map((id) => PROTEINS.find((p) => p.id === id).short).join(" + ");
    const title = f.id === "bowl" ? `${prot} Bowl` : f.name;
    const parts = [];
    if (f.id !== "bowl" && prot) parts.push(prot);
    if (f.base) parts.push(`over ${b.base}`);
    const sauces = Object.entries(b.sauces).filter(([, q]) => q).map(([id, q]) => SAUCES.find((s) => s.id === id).name + (q > 1 ? ` x${q}` : ""));
    const extras = Object.entries(b.extras).filter(([, q]) => q).map(([id, q]) => EXTRAS.find((s) => s.id === id).name + (q > 1 ? ` x${q}` : ""));
    if (sauces.length) parts.push("Sauce: " + sauces.join(", "));
    if (extras.length) parts.push("Add: " + extras.join(", "));
    return { title, detail: parts.join(" · ") };
  }

  function counterHTML(list, bag, group) {
    return list.map((x) => {
      const q = bag[x.id] || 0;
      return `<div class="counter ${q ? "is-on" : ""}"><span class="counter__label">${esc(x.name)}<small>${x.sub ? esc(x.sub) + " · " : ""}${money(x.price)}</small></span>
        <span class="counter__ctl"><button type="button" data-g="${group}" data-id="${x.id}" data-d="-1" aria-label="Remove ${esc(x.name)}">−</button><output>${q}</output><button type="button" data-g="${group}" data-id="${x.id}" data-d="1" aria-label="Add ${esc(x.name)}">+</button></span></div>`;
    }).join("");
  }

  function renderBuilder() {
    const f = fmt();
    $("#formatChoices").innerHTML = FORMATS.map((x) => `
      <button type="button" class="choice ${x.id === box.format ? "is-on" : ""}" data-format="${x.id}">
        <strong>${x.name}${x.isNew ? " 🆕" : ""}${x.hot ? " 🔥" : ""}</strong><span>${x.desc}</span>${x.price ? `<b>$${x.price}</b>` : ""}
      </button>`).join("");
    const full = box.proteins.length >= f.picks;
    $("#proteinHint").textContent = f.picks > 1 ? `· pick ${f.picks} (${box.proteins.length}/${f.picks})` : "· pick 1";
    $("#proteinChoices").innerHTML = PROTEINS.map((p) => {
      const on = box.proteins.includes(p.id);
      const notOnBowl = f.bowlPrices && !(p.id in f.bowlPrices);
      const priceTag = f.bowlPrices && !notOnBowl ? `<b>$${f.bowlPrices[p.id]}</b>` : "";
      return `<button type="button" class="choice ${on ? "is-on" : ""}" data-protein="${p.id}" ${notOnBowl || (!on && full && f.picks > 1) ? "disabled" : ""}>
        <strong>${p.ico} ${p.short}</strong><span>${notOnBowl ? "Try it in a plate" : p.note}</span>${priceTag}</button>`;
    }).join("");
    $("#baseToggle").hidden = !f.base;
    $$("#baseToggle .pill").forEach((b) => b.classList.toggle("is-on", b.dataset.base === box.base));
    $("#sauceChoices").innerHTML = counterHTML(SAUCES, box.sauces, "sauces");
    $("#extraChoices").innerHTML = counterHTML(EXTRAS, box.extras, "extras");

    const d = describe(box);
    const ready = box.proteins.length === f.picks;
    $("#boxPreview").innerHTML = `<div class="small" style="opacity:.7">This box</div><strong>${esc(d.title)}</strong><div class="small">${esc(d.detail || "Fried rice + stir-fry veggies included")}</div>
      <div style="margin-top:.4rem;font-weight:800">${ready ? money(boxPrice()) : `Pick ${f.picks - box.proteins.length} more protein${f.picks - box.proteins.length > 1 ? "s" : ""}`}</div>`;
    renderOrder();
  }

  function renderOrder() {
    const list = $("#orderList");
    if (!order.length) list.innerHTML = `<li class="muted small" style="list-style:none;margin-left:-1.2rem">No boxes yet. Build one on the left.</li>`;
    else list.innerHTML = order.map((b, i) => {
      const d = describe(b);
      return `<li><div class="line"><span>${esc(d.title)}</span><span>${money(boxPrice(b))}</span></div><div class="sub">${esc(d.detail)}</div><button class="rm" data-rm="${i}">Remove</button></li>`;
    }).join("");
    $("#orderTotal").textContent = money(order.reduce((s, b) => s + boxPrice(b), 0));
    store.set("sons-order", order);
  }

  function flash(msg) { const m = $("#builderMsg"); m.textContent = msg; clearTimeout(flash._t); flash._t = setTimeout(() => (m.textContent = ""), 3000); }

  function applyPreset(p) {
    box = fresh(); box.format = p.format; box.proteins = [...(p.proteins || [])];
    renderBuilder(); flash(p.proteins?.length ? "Loaded. Add sauces, then add the box to your order." : "Now pick your protein.");
  }

  $("#formatChoices").addEventListener("click", (e) => {
    const b = e.target.closest("[data-format]"); if (!b) return;
    box.format = b.dataset.format;
    const f = fmt();
    box.proteins = box.proteins.filter((id) => !f.bowlPrices || id in f.bowlPrices).slice(0, f.picks);
    renderBuilder();
  });
  $("#proteinChoices").addEventListener("click", (e) => {
    const b = e.target.closest("[data-protein]"); if (!b || b.disabled) return;
    const id = b.dataset.protein, f = fmt();
    if (box.proteins.includes(id)) box.proteins = box.proteins.filter((x) => x !== id);
    else if (f.picks === 1) box.proteins = [id];
    else if (box.proteins.length < f.picks) box.proteins.push(id);
    renderBuilder();
  });
  $("#baseToggle").addEventListener("click", (e) => { const b = e.target.closest("[data-base]"); if (b) { box.base = b.dataset.base; renderBuilder(); } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".counter__ctl button"); if (!b) return;
    const bag = box[b.dataset.g]; const id = b.dataset.id;
    bag[id] = Math.max(0, (bag[id] || 0) + +b.dataset.d); if (!bag[id]) delete bag[id];
    renderBuilder();
  });
  $("#addToOrder").addEventListener("click", () => {
    const f = fmt();
    if (box.proteins.length !== f.picks) { flash(`Pick ${f.picks} protein${f.picks > 1 ? "s" : ""} first 👆`); return; }
    order.push(JSON.parse(JSON.stringify(box)));
    toast(`✅ ${describe(box).title} added`);
    box = fresh(); renderBuilder();
  });
  $("#orderList").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { order.splice(+b.dataset.rm, 1); renderOrder(); } });
  $("#clearOrder").addEventListener("click", () => { order = []; renderOrder(); });
  $("#pickupName").addEventListener("input", (e) => store.set("sons-name", e.target.value));

  $("#chefPick").addEventListener("click", () => {
    const pickFrom = ["double", "triple", "dbowl", "double", "single"];
    const format = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const f = FORMATS.find((x) => x.id === format);
    const prots = [...PROTEINS].sort(() => Math.random() - 0.5).slice(0, f.picks).map((p) => p.id);
    box = fresh(); box.format = format; box.proteins = prots;
    if (f.base) box.base = Math.random() > 0.5 ? "Noodles" : "Fried Rice";
    const s = [...SAUCES].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 2));
    s.forEach((x) => (box.sauces[x.id] = 1));
    if (Math.random() > 0.4) box.extras[Math.random() > 0.5 ? "gina" : "tony"] = 1;
    renderBuilder(); flash("🎲 Chef's Pick loaded. Like it? Add it to your order.");
  });

  function orderText() {
    const name = $("#pickupName").value.trim();
    const lines = order.map((b, i) => { const d = describe(b); return `${i + 1}) ${d.title}${d.detail ? " (" + d.detail + ")" : ""}: ${money(boxPrice(b))}`; });
    return `Hi Son's Hibachi! 🔥 Pickup order${name ? " for " + name : ""}:\n${lines.join("\n")}\nEst. total: ${money(order.reduce((s, b) => s + boxPrice(b), 0))} (before tax)\nWhat time can I pick it up? (Sent from your website)`;
  }
  $("#sendIG").addEventListener("click", async () => {
    if (!order.length) {
      const f = fmt();
      if (box.proteins.length === f.picks) { order.push(JSON.parse(JSON.stringify(box))); box = fresh(); renderBuilder(); }
      else { flash("Add at least one box to your order first."); return; }
    }
    const ok = await copy(orderText());
    toast(ok ? "📋 Order copied. Paste it into the DM." : "Opening Instagram…");
    setTimeout(() => window.open(IG_DM, "_blank", "noopener"), 600);
  });

  renderBuilder();

  /* ---------- REELS ---------- */
  const reels = $$(".reel");
  reels.forEach((r) => {
    const v = $("video", r), s = $(".reel__sound", r);
    const sync = () => r.classList.toggle("is-playing", !v.paused);
    v.addEventListener("play", sync); v.addEventListener("pause", sync);
    r.addEventListener("click", (e) => {
      if (e.target === s) return;
      v.paused ? v.play().catch(() => {}) : v.pause();
    });
    s.addEventListener("click", (e) => {
      e.stopPropagation();
      reels.forEach((o) => { if (o !== r) { $("video", o).muted = true; $(".reel__sound", o).textContent = "🔇"; } });
      v.muted = !v.muted; s.textContent = v.muted ? "🔇" : "🔊"; if (v.paused) v.play().catch(() => {});
    });
  });
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      const v = $("video", en.target);
      if (en.isIntersecting && en.intersectionRatio > 0.6) v.play().catch(() => {}); else v.pause();
    }), { threshold: [0, 0.6] });
    reels.forEach((r) => io.observe(r));
  }

  /* ---------- EVENT ESTIMATOR ---------- */
  const g = $("#estGuests"), plate = $("#estPlate"), drinks = $("#estDrinks");
  function est() {
    $("#estGuestsOut").textContent = g.value;
    const total = +g.value * (+plate.value + (drinks.checked ? 7 : 0));
    $("#estTotal").textContent = "$" + total.toLocaleString();
    return total;
  }
  [g, plate, drinks].forEach((el) => el.addEventListener("input", est)); est();
  $("#estUse").addEventListener("click", () => {
    const form = $("#inquiryForm");
    form.guests.value = g.value;
    form.menu.value = plate.options[plate.selectedIndex].text.replace(/\s*\(.*\)/, "") + (drinks.checked ? " + specialty lemonade" : "");
    const m = form.message;
    const note = `Ballpark from website: ${$("#estTotal").textContent} for ${g.value} guests.`;
    if (!m.value.includes("Ballpark from website")) m.value = (m.value ? m.value + "\n" : "") + note;
    form.name.focus({ preventScroll: true }); form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- INQUIRY FORM ---------- */
  const form = $("#inquiryForm"), status = $("#formStatus"), btn = $("#inquirySubmit");
  const minDate = new Date(); form.date.min = minDate.toISOString().slice(0, 10);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status"; status.textContent = "";
    let bad = null;
    ["name", "phone", "email"].forEach((n) => {
      const el = form[n]; const ok = el.value.trim() && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest(".field").classList.toggle("invalid", !ok); if (!ok && !bad) bad = el;
    });
    if (bad) { status.classList.add("err"); status.textContent = "Please add your name, phone and a valid email."; bad.focus(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "send failed");
      form.reset(); status.classList.add("ok");
      status.textContent = "🔥 Got it! The Son's Hibachi family will reach out soon. For a quick answer, DM @sonshibachi.";
      toast("Inquiry sent 🎉");
    } catch (err) {
      const text = `Event inquiry from ${data.name} (${data.phone}, ${data.email})\nType: ${data.inquiryType}\nDate: ${data.date || "TBD"} ${data.time || ""}\nGuests: ${data.guests || "?"}\nLocation: ${data.location || "?"}\nMenu: ${data.menu || "?"}\n${data.message || ""}`;
      const copied = await copy(text);
      status.classList.add("err");
      status.innerHTML = `We couldn't send that right now. ${copied ? "Your details are copied, so you can " : "You can "}<a href="${IG_DM}" target="_blank" rel="noopener">paste them in an Instagram DM</a> or call <a href="tel:+15627609851">562-760-9851</a>.`;
    } finally { btn.disabled = false; btn.textContent = "Send Inquiry"; }
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  if ("IntersectionObserver" in window) {
    const els = $$(".section__head, .step, .ticket, .quote, .story__copy, .story__media, .events__intro, .form, .find > *, .vms__inner, .menu-note");
    els.forEach((el) => el.classList.add("reveal"));
    const ro = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } }), { threshold: 0.12 });
    els.forEach((el) => ro.observe(el));
  }
})();

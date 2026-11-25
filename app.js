let currentView = "family";
let currentUser = null;
let isAdminUnlocked = false;
let draftMatches = [];
let draggedIndex = null;
let currentLang = localStorage.getItem("xmas_lang") || "es";

// ==================== 12 PREDEFINED CATEGORIES ====================
const CATEGORIES = [
  {
    id: "clothes",
    es: "Ropa",
    en: "Clothes",
    phEs: "Colores, estilos o marcas preferidas...",
    phEn: "Favorite colors, styles, or brands...",
  },
  {
    id: "gift_cards",
    es: "Tarjetas de Regalo",
    en: "Gift Cards",
    phEs: "Tiendas, restaurantes o apps favoritas...",
    phEn: "Favorite stores, restaurants, or apps...",
  },
  {
    id: "electronics",
    es: "Electrónica y Tecnología",
    en: "Electronics & Tech",
    phEs: "Accesorios, audífonos, gadgets...",
    phEn: "Gadgets, phone accessories, headphones...",
  },
  {
    id: "toys_games",
    es: "Juguetes y Juegos",
    en: "Toys & Games",
    phEs: "Juegos de mesa, videojuegos, figuras...",
    phEn: "Board games, video games, figures...",
  },
  {
    id: "makeup_skincare",
    es: "Maquillaje y Cuidado Personal",
    en: "Makeup & Skincare",
    phEs: "Marcas, tonos, tipo de piel...",
    phEn: "Favorite brands, shades, skin type...",
  },
  {
    id: "perfumes",
    es: "Perfumes y Fragancias",
    en: "Perfumes & Fragrances",
    phEs: "Aromas o marcas preferidas...",
    phEn: "Preferred scents or brands...",
  },
  {
    id: "jewelry",
    es: "Joyería y Accesorios",
    en: "Jewelry & Accessories",
    phEs: "Oro/plata, talla de anillo, relojes, bolsas...",
    phEn: "Gold/silver, ring size, watches, bags...",
  },
  {
    id: "sporting_goods",
    es: "Deportes y Ejercicio",
    en: "Sporting Goods & Fitness",
    phEs: "Equipos favoritos, ropa deportiva, tallas...",
    phEn: "Favorite teams, gear, workout items, sizes...",
  },
  {
    id: "home_kitchen",
    es: "Hogar y Cocina",
    en: "Home & Kitchen",
    phEs: "Decoración, tazas, velas, utensilios...",
    phEn: "Decor, mugs, candles, appliances...",
  },
  {
    id: "books_media",
    es: "Libros y Entretenimiento",
    en: "Books & Media",
    phEs: "Géneros, autores, vinilos, películas...",
    phEn: "Genres, authors, vinyl, movies...",
  },
  {
    id: "snacks_drinks",
    es: "Dulces, Café y Bebidas",
    en: "Snacks, Coffee & Drinks",
    phEs: "Chocolates, café, vino o botanas favoritas...",
    phEn: "Favorite treats, coffee, wine, or snacks...",
  },
  {
    id: "hobbies",
    es: "Pasatiempos y Manualidades",
    en: "Hobbies & Crafts",
    phEs: "Arte, herramientas, jardinería, etc...",
    phEn: "Art supplies, tools, gardening, etc...",
  },
];

// ==================== TRANSLATIONS (ES / EN) ====================
const I18N = {
  es: {
    appTitle: "Intercambio Navideño",
    demoBanner: "Modo Demo (guardado solo en este navegador). Agrega tus claves de Supabase en db.js.",
    navSanta: "Intercambio",
    navAdmin: "Admin",
    logout: "Salir",
    comingSoonTitle: "Próximamente",
    notStartedDesc: "El organizador aún está preparando el intercambio de este año. ¡Vuelve pronto!",
    loginTitle: "Bienvenido",
    loginDesc: "Elige tu nombre para comenzar.",
    whoAreYou: "¿Quién eres?",
    selectPlaceholder: "-- Selecciona tu nombre --",
    createPinPrompt: "¡Primera vez aquí! Crea tu PIN de 4 dígitos:",
    enterPinPrompt: "Ingresa tu PIN de 4 dígitos:",
    createPinBtn: "Crear PIN y Entrar",
    loginBtn: "Entrar",
    pinError: "Por favor ingresa un PIN de 4 dígitos.",
    wrongPin: "PIN incorrecto. Intenta de nuevo o pídele al organizador que lo reinicie.",
    santaCardTitle: "Intercambio",
    santaLockedMsg: "Completa y guarda todas las categorías del cuestionario abajo antes de ver tu intercambio.",
    santaReady: "¿Listo para ver quién te tocó?",
    buyingFor: "Le vas a comprar un regalo a:",
    revealBtn: "Ver Mi Intercambio",
    noMatchYet: "Aún no hay pareja asignada. Consulta con el organizador.",
    voteCardTitle: "Votación del Límite de Regalo",
    voteDesc: "Vota una sola vez por el límite del regalo de este año. Tu voto va directo al organizador.",
    voteRecorded: "Voto registrado. Votaste por ",
    qCardTitle: "Cuestionario de Regalos",
    qDesc: "Marca 'Me gusta' o 'No me gusta' en cada categoría para desbloquear tu intercambio. Puedes volver y editarlo cuando quieras.",
    budgetReminder: "Recordatorio: Ten en cuenta el límite de regalo ($80–$100) y deja espacio para la sorpresa para que sea más divertido.",
    likeLabel: "Me gusta",
    dislikeLabel: "No me gusta",
    sizeShirt: "Camisa",
    sizePants: "Pantalón",
    sizeJacket: "Chamarra",
    sizeShoes: "Zapatos",
    sizeOther: "Otra talla",
    detailsHint: "Detalles (incluye tallas si aplica)",
    qNotesLabel: "Notas Adicionales (Opcional)",
    qNotesPh: "Alergias, marcas favoritas, o cualquier detalle extra...",
    qMissingError: "Por favor marca 'Me gusta' o 'No me gusta' en todas las categorías resaltadas en rojo.",
    saveQBtn: "Guardar Cuestionario",
    savedMsg: "Guardado",
    noQYet: "aún no ha completado su cuestionario.",
    profileLikes: "Le gusta",
    profileDislikes: "Prefiere NO recibir",
    profileNotes: "Notas adicionales",
    editLogPrefix: "Registro de ediciones:",
  },
  en: {
    appTitle: "Christmas Secret Santa",
    demoBanner: "Demo Mode (saved only in this browser). Add your Supabase keys in db.js to sync with family.",
    navSanta: "Secret Santa",
    navAdmin: "Admin",
    logout: "Log Out",
    comingSoonTitle: "Coming Soon",
    notStartedDesc: "The organizer is still setting up this year's Secret Santa. Check back once it's started!",
    loginTitle: "Welcome",
    loginDesc: "Pick your name to get started.",
    whoAreYou: "Who are you?",
    selectPlaceholder: "-- Select your name --",
    createPinPrompt: "First time here! Create your 4-digit PIN:",
    enterPinPrompt: "Enter your 4-digit PIN:",
    createPinBtn: "Create PIN & Enter",
    loginBtn: "Log In",
    pinError: "Please enter a 4-digit PIN.",
    wrongPin: "Incorrect PIN. Try again or ask the organizer to reset it.",
    santaCardTitle: "Secret Santa",
    santaLockedMsg: "Please complete and save all categories in the questionnaire below before viewing your Secret Santa.",
    santaReady: "Ready to see who you got?",
    buyingFor: "You are buying a gift for:",
    revealBtn: "Reveal My Secret Santa",
    noMatchYet: "No match found yet. Check with the organizer.",
    voteCardTitle: "Gift Limit Vote",
    voteDesc: "Vote once on this year's gift limit. Your vote goes directly to the organizer.",
    voteRecorded: "Vote recorded. You voted for ",
    qCardTitle: "Gift Questionnaire",
    qDesc: "Check 'Like' or 'Dislike' for every category to unlock your Secret Santa. You can come back and edit anytime.",
    budgetReminder: "Reminder: Please keep the selected gift limit ($80–$100) in mind and leave room to be surprised to keep it fun!",
    likeLabel: "Like",
    dislikeLabel: "Dislike",
    sizeShirt: "Shirt",
    sizePants: "Pants",
    sizeJacket: "Jacket",
    sizeShoes: "Shoes",
    sizeOther: "Other size",
    detailsHint: "Details (include sizes if applicable)",
    qNotesLabel: "Additional Notes (Optional)",
    qNotesPh: "Allergies, favorite brands, or any extra details...",
    qMissingError: "Please select 'Like' or 'Dislike' for all categories highlighted in red.",
    saveQBtn: "Save Questionnaire",
    savedMsg: "Saved",
    noQYet: "hasn't filled out their questionnaire yet.",
    profileLikes: "Likes",
    profileDislikes: "Dislikes",
    profileNotes: "Additional Notes",
    editLogPrefix: "Questionnaire edit log:",
  },
};

function t(key) {
  return I18N[currentLang][key] || I18N.es[key] || key;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isQuestionnaireComplete(q) {
  if (!q || !q.categories) return false;
  return CATEGORIES.every(
    (cat) => q.categories[cat.id]?.choice === "like" || q.categories[cat.id]?.choice === "dislike"
  );
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.title = t("appTitle");
  document.getElementById("lang-toggle").textContent = currentLang === "es" ? "EN" : "ES";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  if (currentView === "family" && currentUser) {
    renderQuestionnaireForm(readQuestionnaireFromDOM());
    renderAdultVoteBox();
    renderEditLog(currentUser.questionnaire?.edit_log || []);
    updateSantaGateUI();
  }
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  currentLang = currentLang === "es" ? "en" : "es";
  localStorage.setItem("xmas_lang", currentLang);
  applyLanguage();
});

// --- Navigation ---
function switchView(view) {
  currentView = view;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("view-family").classList.toggle("hidden", view !== "family");
  document.getElementById("view-admin").classList.toggle("hidden", view !== "admin");

  if (view === "family") renderFamilyView();
  if (view === "admin") renderAdminView();
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

document.getElementById("logout-btn").addEventListener("click", () => {
  currentUser = null;
  sessionStorage.removeItem("xmas_user");
  document.getElementById("user-pill").classList.add("hidden");
  renderFamilyView();
});

// ==================== SECRET SANTA / INTERCAMBIO VIEW ====================
async function renderFamilyView() {
  const isStarted = (await DB.getSetting("is_started")) === "true";
  const notStartedCard = document.getElementById("not-started-card");
  const loginCard = document.getElementById("family-login-card");
  const dashboard = document.getElementById("family-dashboard");

  if (!isStarted) {
    notStartedCard.classList.remove("hidden");
    loginCard.classList.add("hidden");
    dashboard.classList.add("hidden");
    return;
  }

  notStartedCard.classList.add("hidden");

  if (!currentUser) {
    loginCard.classList.remove("hidden");
    dashboard.classList.add("hidden");
    await populateLoginDropdown();
    return;
  }

  const members = await DB.getMembers();
  currentUser = members.find((m) => m.name === currentUser.name) || currentUser;

  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  document.getElementById("user-pill").classList.remove("hidden");
  document.getElementById("current-user-label").textContent = currentUser.name;

  // Reset reveal display & check questionnaire gate
  document.getElementById("santa-result").classList.add("hidden");
  updateSantaGateUI();

  // Render questionnaire from saved DB data
  renderQuestionnaireForm(currentUser.questionnaire || {});
  renderEditLog(currentUser.questionnaire?.edit_log || []);

  // Adult-only Vote
  const voteCard = document.getElementById("adult-vote-card");
  if (currentUser.role === "adult") {
    voteCard.classList.remove("hidden");
    await renderAdultVoteBox();
  } else {
    voteCard.classList.add("hidden");
  }
}

function updateSantaGateUI() {
  const complete = isQuestionnaireComplete(currentUser?.questionnaire);
  const lockedMsg = document.getElementById("santa-locked-msg");
  const statusEl = document.getElementById("santa-status");
  const revealBtn = document.getElementById("reveal-btn");
  const resultEl = document.getElementById("santa-result");

  if (!complete) {
    lockedMsg.classList.remove("hidden");
    statusEl.classList.add("hidden");
    resultEl.classList.add("hidden");
    revealBtn.classList.remove("hidden");
    revealBtn.disabled = true;
  } else {
    lockedMsg.classList.add("hidden");
    revealBtn.disabled = false;
    if (resultEl.classList.contains("hidden")) {
      statusEl.classList.remove("hidden");
      statusEl.textContent = t("santaReady");
      revealBtn.classList.remove("hidden");
    }
  }
}

// --- Questionnaire Rendering & Reading ---
function renderQuestionnaireForm(qData) {
  const grid = document.getElementById("questionnaire-grid");
  const cats = qData?.categories || {};

  grid.innerHTML = CATEGORIES.map((cat) => {
    const saved = cats[cat.id] || {};
    const isLike = saved.choice === "like";
    const isDislike = saved.choice === "dislike";
    const label = currentLang === "es" ? cat.es : cat.en;
    const ph = currentLang === "es" ? cat.phEs : cat.phEn;

    let detailsHtml = "";
    if (cat.id === "clothes") {
      const sz = saved.sizes || {};
      detailsHtml = `
        <div class="q-details-box ${isLike ? "" : "hidden"}" data-details="${cat.id}">
          <div class="size-grid">
            <label class="size-field">
              ${escapeHtml(t("sizeShirt"))}
              <input type="text" data-size="shirt" value="${escapeHtml(sz.shirt || "")}" placeholder="S / M / L" />
            </label>
            <label class="size-field">
              ${escapeHtml(t("sizePants"))}
              <input type="text" data-size="pants" value="${escapeHtml(sz.pants || "")}" placeholder="32x30 / M" />
            </label>
            <label class="size-field">
              ${escapeHtml(t("sizeJacket"))}
              <input type="text" data-size="jacket" value="${escapeHtml(sz.jacket || "")}" placeholder="M / L" />
            </label>
            <label class="size-field">
              ${escapeHtml(t("sizeShoes"))}
              <input type="text" data-size="shoes" value="${escapeHtml(sz.shoes || "")}" placeholder="9 / 10" />
            </label>
          </div>
          <label class="size-field">
            ${escapeHtml(t("sizeOther"))}
            <input type="text" data-size="other" value="${escapeHtml(sz.other || "")}" placeholder="..." />
          </label>
          <textarea rows="2" data-note="${cat.id}" placeholder="${escapeHtml(ph)}">${escapeHtml(saved.details || "")}</textarea>
        </div>`;
    } else {
      detailsHtml = `
        <div class="q-details-box ${isLike ? "" : "hidden"}" data-details="${cat.id}">
          <textarea rows="2" data-note="${cat.id}" placeholder="${escapeHtml(ph)} (${escapeHtml(t("detailsHint"))})">${escapeHtml(saved.details || "")}</textarea>
        </div>`;
    }

    return `
      <div class="q-cat-card" data-cat-id="${cat.id}">
        <div class="q-cat-title">${escapeHtml(label)}</div>
        <div class="q-check-row">
          <label class="q-check-label like">
            <input type="checkbox" class="cat-cb" data-cat="${cat.id}" data-val="like" ${isLike ? "checked" : ""} />
            <span>${escapeHtml(t("likeLabel"))}</span>
          </label>
          <label class="q-check-label dislike">
            <input type="checkbox" class="cat-cb" data-cat="${cat.id}" data-val="dislike" ${isDislike ? "checked" : ""} />
            <span>${escapeHtml(t("dislikeLabel"))}</span>
          </label>
        </div>
        ${detailsHtml}
      </div>`;
  }).join("");

  document.getElementById("q-notes").value = qData?.additional_notes || "";

  // Attach mutually exclusive checkbox logic
  grid.querySelectorAll(".cat-cb").forEach((cb) => {
    cb.addEventListener("change", () => {
      const catId = cb.dataset.cat;
      const val = cb.dataset.val;
      const card = grid.querySelector(`.q-cat-card[data-cat-id="${catId}"]`);
      const otherVal = val === "like" ? "dislike" : "like";
      const otherCb = card.querySelector(`.cat-cb[data-val="${otherVal}"]`);

      if (cb.checked) {
        otherCb.checked = false;
        card.classList.remove("missing");
      }

      const likeChecked = card.querySelector('.cat-cb[data-val="like"]').checked;
      card.querySelector(`[data-details="${catId}"]`).classList.toggle("hidden", !likeChecked);
    });
  });
}

function readQuestionnaireFromDOM() {
  const grid = document.getElementById("questionnaire-grid");
  const categories = {};

  CATEGORIES.forEach((cat) => {
    const card = grid.querySelector(`.q-cat-card[data-cat-id="${cat.id}"]`);
    if (!card) return;
    const like = card.querySelector('.cat-cb[data-val="like"]').checked;
    const dislike = card.querySelector('.cat-cb[data-val="dislike"]').checked;
    const choice = like ? "like" : dislike ? "dislike" : null;
    const details = card.querySelector(`[data-note="${cat.id}"]`)?.value.trim() || "";

    const entry = { choice, details };
    if (cat.id === "clothes") {
      entry.sizes = {
        shirt: card.querySelector('[data-size="shirt"]')?.value.trim() || "",
        pants: card.querySelector('[data-size="pants"]')?.value.trim() || "",
        jacket: card.querySelector('[data-size="jacket"]')?.value.trim() || "",
        shoes: card.querySelector('[data-size="shoes"]')?.value.trim() || "",
        other: card.querySelector('[data-size="other"]')?.value.trim() || "",
      };
    }
    categories[cat.id] = entry;
  });

  return {
    categories,
    additional_notes: document.getElementById("q-notes")?.value.trim() || "",
  };
}

document.getElementById("questionnaire-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("q-error-msg");
  errEl.classList.add("hidden");

  const draft = readQuestionnaireFromDOM();
  const grid = document.getElementById("questionnaire-grid");
  let missingCount = 0;

  CATEGORIES.forEach((cat) => {
    const card = grid.querySelector(`.q-cat-card[data-cat-id="${cat.id}"]`);
    const answered = draft.categories[cat.id]?.choice !== null;
    card.classList.toggle("missing", !answered);
    if (!answered) missingCount++;
  });

  if (missingCount > 0) {
    errEl.textContent = t("qMissingError");
    errEl.classList.remove("hidden");
    return;
  }

  const existingLog = currentUser.questionnaire?.edit_log || [];
  const timestamp = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const updatedQ = {
    ...draft,
    edit_log: [...existingLog, timestamp].slice(-10),
  };

  await DB.updateQuestionnaire(currentUser.name, updatedQ);
  currentUser.questionnaire = updatedQ;
  renderEditLog(updatedQ.edit_log);
  updateSantaGateUI();

  const saved = document.getElementById("q-saved-msg");
  saved.classList.remove("hidden");
  setTimeout(() => saved.classList.add("hidden"), 2500);
});

function renderEditLog(logArr) {
  const footer = document.getElementById("edit-log-footer");
  if (!logArr || logArr.length === 0) {
    footer.classList.add("hidden");
    return;
  }
  footer.classList.remove("hidden");
  const recent = logArr.slice(-4).reverse().join(" · ");
  footer.textContent = `${t("editLogPrefix")} ${recent}`;
}

// --- Family Login ---
async function populateLoginDropdown() {
  const members = await DB.getMembers();
  const select = document.getElementById("login-name-select");
  select.innerHTML =
    `<option value="">${escapeHtml(t("selectPlaceholder"))}</option>` +
    members
      .map((m) => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`)
      .join("");

  document.getElementById("pin-label").classList.add("hidden");
  document.getElementById("family-login-btn").classList.add("hidden");
  document.getElementById("family-pin-input").value = "";
  document.getElementById("family-login-error").classList.add("hidden");
}

document.getElementById("login-name-select").addEventListener("change", async (e) => {
  const name = e.target.value;
  const pinLabel = document.getElementById("pin-label");
  const loginBtn = document.getElementById("family-login-btn");
  const promptText = document.getElementById("pin-prompt-text");
  document.getElementById("family-login-error").classList.add("hidden");

  if (!name) {
    pinLabel.classList.add("hidden");
    loginBtn.classList.add("hidden");
    return;
  }

  const members = await DB.getMembers();
  const member = members.find((m) => m.name === name);
  if (!member.pin) {
    promptText.textContent = t("createPinPrompt");
    loginBtn.textContent = t("createPinBtn");
  } else {
    promptText.textContent = t("enterPinPrompt");
    loginBtn.textContent = t("loginBtn");
  }

  pinLabel.classList.remove("hidden");
  loginBtn.classList.remove("hidden");
  document.getElementById("family-pin-input").focus();
});

document.getElementById("family-login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("login-name-select").value;
  const pin = document.getElementById("family-pin-input").value.trim();
  const errEl = document.getElementById("family-login-error");
  errEl.classList.add("hidden");

  if (!name || !/^\d{4}$/.test(pin)) {
    errEl.textContent = t("pinError");
    errEl.classList.remove("hidden");
    return;
  }

  const members = await DB.getMembers();
  const member = members.find((m) => m.name === name);
  if (!member) return;

  if (!member.pin) {
    await DB.setMemberPin(member.name, pin);
    member.pin = pin;
  } else if (member.pin !== pin) {
    errEl.textContent = t("wrongPin");
    errEl.classList.remove("hidden");
    return;
  }

  currentUser = member;
  sessionStorage.setItem("xmas_user", member.name);
  renderFamilyView();
});

// --- Reveal Secret Santa Match ---
document.getElementById("reveal-btn").addEventListener("click", async () => {
  if (!isQuestionnaireComplete(currentUser?.questionnaire)) {
    updateSantaGateUI();
    return;
  }

  const matchName = await DB.getMyMatch(currentUser.name);
  if (!matchName) {
    document.getElementById("santa-status").textContent = t("noMatchYet");
    return;
  }

  const members = await DB.getMembers();
  const matchMember = members.find((m) => m.name === matchName);
  const q = matchMember?.questionnaire || {};

  document.getElementById("santa-match-name").textContent = matchName;
  const profileEl = document.getElementById("santa-match-profile");

  if (!isQuestionnaireComplete(q)) {
    profileEl.innerHTML = `<span class="muted">${escapeHtml(matchName)} ${escapeHtml(t("noQYet"))}</span>`;
  } else {
    const likedItems = [];
    const dislikedNames = [];

    CATEGORIES.forEach((cat) => {
      const entry = q.categories[cat.id];
      const catLabel = currentLang === "es" ? cat.es : cat.en;
      if (entry?.choice === "like") {
        let extra = [];
        if (cat.id === "clothes" && entry.sizes) {
          const s = entry.sizes;
          if (s.shirt) extra.push(`${t("sizeShirt")}: ${s.shirt}`);
          if (s.pants) extra.push(`${t("sizePants")}: ${s.pants}`);
          if (s.jacket) extra.push(`${t("sizeJacket")}: ${s.jacket}`);
          if (s.shoes) extra.push(`${t("sizeShoes")}: ${s.shoes}`);
          if (s.other) extra.push(`${t("sizeOther")}: ${s.other}`);
        }
        if (entry.details) extra.push(entry.details);
        likedItems.push(
          `<li><strong>${escapeHtml(catLabel)}</strong>${extra.length ? `: ${escapeHtml(extra.join(" | "))}` : ""}</li>`
        );
      } else if (entry?.choice === "dislike") {
        dislikedNames.push(catLabel);
      }
    });

    profileEl.innerHTML = `
      <div class="match-profile-item">
        <strong>${escapeHtml(t("profileLikes"))}</strong>
        ${likedItems.length ? `<ul class="match-profile-list">${likedItems.join("")}</ul>` : "<div>—</div>"}
      </div>
      <div class="match-profile-item">
        <strong>${escapeHtml(t("profileDislikes"))}</strong>
        <div>${dislikedNames.length ? escapeHtml(dislikedNames.join(", ")) : "—"}</div>
      </div>
      ${
        q.additional_notes
          ? `<div class="match-profile-item">
               <strong>${escapeHtml(t("profileNotes"))}</strong>
               <div>${escapeHtml(q.additional_notes)}</div>
             </div>`
          : ""
      }
    `;
  }

  document.getElementById("santa-status").classList.add("hidden");
  document.getElementById("reveal-btn").classList.add("hidden");
  document.getElementById("santa-result").classList.remove("hidden");
});

// --- Adult Vote ($80 / $100) ---
async function renderAdultVoteBox() {
  if (!currentUser || currentUser.role !== "adult") return;
  const votes = await DB.getVotes();
  const myVote = votes.find((v) => v.member_name === currentUser.name);
  const buttons = document.querySelectorAll(".vote-btn");
  const msg = document.getElementById("vote-confirmed-msg");

  buttons.forEach((btn) => {
    btn.classList.remove("chosen");
    btn.disabled = Boolean(myVote);
    if (myVote && btn.dataset.amount === myVote.choice) {
      btn.classList.add("chosen");
    }
  });

  if (myVote) {
    msg.textContent = `${t("voteRecorded")}${myVote.choice}.`;
    msg.classList.remove("hidden");
  } else {
    msg.classList.add("hidden");
  }
}

document.querySelectorAll(".vote-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    await DB.castVoteOnce(currentUser.name, btn.dataset.amount);
    renderAdultVoteBox();
  });
});

// ==================== ADMIN VIEW ====================
async function renderAdminView() {
  const gateCard = document.getElementById("admin-gate-card");
  const dash = document.getElementById("admin-dashboard");

  if (!isAdminUnlocked) {
    gateCard.classList.remove("hidden");
    dash.classList.add("hidden");
    const existingPin = await DB.getSetting("admin_pin");
    if (!existingPin) {
      document.getElementById("admin-gate-title").textContent = "Set Up Your Admin PIN";
      document.getElementById("admin-gate-desc").textContent = "Create a PIN to protect your Admin Hub.";
      document.getElementById("admin-gate-btn").textContent = "Save Admin PIN";
    } else {
      document.getElementById("admin-gate-title").textContent = "Admin Hub";
      document.getElementById("admin-gate-desc").textContent = "Enter your Admin PIN to continue.";
      document.getElementById("admin-gate-btn").textContent = "Unlock Admin Hub";
    }
    return;
  }

  gateCard.classList.add("hidden");
  dash.classList.remove("hidden");

  await renderAdminStatus();
  await renderAdminRoster();
  await loadDraftBoard();
  await renderAdminVotes();
}

document.getElementById("admin-gate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pin = document.getElementById("admin-pin-input").value.trim();
  const errEl = document.getElementById("admin-gate-error");
  errEl.classList.add("hidden");

  const existingPin = await DB.getSetting("admin_pin");
  if (!existingPin) {
    await DB.setSetting("admin_pin", pin);
    isAdminUnlocked = true;
    document.getElementById("admin-pin-input").value = "";
    renderAdminView();
  } else if (existingPin === pin) {
    isAdminUnlocked = true;
    document.getElementById("admin-pin-input").value = "";
    renderAdminView();
  } else {
    errEl.textContent = "Incorrect Admin PIN.";
    errEl.classList.remove("hidden");
  }
});

async function renderAdminStatus() {
  const isStarted = (await DB.getSetting("is_started")) === "true";
  const badge = document.getElementById("process-status-badge");
  const toggleBtn = document.getElementById("toggle-status-btn");

  badge.textContent = isStarted ? "Started (Live)" : "Setup Mode";
  badge.className = `badge ${isStarted ? "live" : "draft"}`;
  toggleBtn.textContent = isStarted ? "Pause Process" : "Resume / Start";
}

document.getElementById("toggle-status-btn").addEventListener("click", async () => {
  const isStarted = (await DB.getSetting("is_started")) === "true";
  await DB.setSetting("is_started", !isStarted);
  renderAdminStatus();
});

async function renderAdminRoster() {
  const members = await DB.getMembers();
  const list = document.getElementById("admin-member-list");

  if (members.length === 0) {
    list.innerHTML = `<p class="muted">No family members added yet.</p>`;
    return;
  }

  list.innerHTML = members
    .map(
      (m) => `
      <div class="member-row">
        <div class="member-info">
          <strong>${escapeHtml(m.name)}</strong>
          <span class="badge ${m.role}">${m.role === "adult" ? "Adult" : "Child"}</span>
          <span class="muted">${m.pin ? "PIN set" : "No PIN yet"}</span>
        </div>
        <div class="member-actions">
          ${m.pin ? `<button class="btn secondary small reset-pin-btn" data-name="${escapeHtml(m.name)}">Reset PIN</button>` : ""}
          <button class="btn danger small del-member-btn" data-name="${escapeHtml(m.name)}">Remove</button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll(".reset-pin-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await DB.setMemberPin(btn.dataset.name, null);
      renderAdminRoster();
    });
  });

  list.querySelectorAll(".del-member-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await DB.deleteMember(btn.dataset.name);
      draftMatches = [];
      renderAdminRoster();
      loadDraftBoard();
    });
  });
}

document.getElementById("add-member-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("new-member-name").value.trim();
  const role = document.getElementById("new-member-role").value;
  if (!name) return;

  try {
    await DB.addMember(name, role);
    e.target.reset();
    draftMatches = [];
    await renderAdminRoster();
    await loadDraftBoard();
  } catch (err) {
    alert(err.message || "Could not add member (name may already exist).");
  }
});

async function loadDraftBoard() {
  const members = await DB.getMembers();
  const saved = await DB.getAllMatches();

  if (draftMatches.length !== members.length) {
    if (saved.length === members.length && members.length > 0) {
      draftMatches = saved.map((s) => ({
        giver_name: s.giver_name,
        receiver_name: s.receiver_name,
      }));
    } else {
      draftMatches = [];
    }
  }
  renderSantaBoard();
}

function renderSantaBoard() {
  const board = document.getElementById("santa-board");
  if (draftMatches.length === 0) {
    board.innerHTML = `<p class="muted">Click "Auto-Generate Matches" once your roster is ready.</p>`;
    return;
  }

  board.innerHTML = draftMatches
    .map((pair, idx) => {
      const isSelf = pair.giver_name === pair.receiver_name;
      return `
        <div class="match-row ${isSelf ? "invalid" : ""}">
          <div class="giver-box">${escapeHtml(pair.giver_name)}</div>
          <div class="arrow">→</div>
          <div class="receiver-card" draggable="true" data-index="${idx}">
            <span>${escapeHtml(pair.receiver_name)} ${isSelf ? "(Self)" : ""}</span>
            <span class="muted">:::</span>
          </div>
        </div>`;
    })
    .join("");

  board.querySelectorAll(".receiver-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedIndex = Number(card.dataset.index);
    });
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over");
    });
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const targetIndex = Number(card.dataset.index);
      if (draggedIndex === null || draggedIndex === targetIndex) return;

      const temp = draftMatches[draggedIndex].receiver_name;
      draftMatches[draggedIndex].receiver_name = draftMatches[targetIndex].receiver_name;
      draftMatches[targetIndex].receiver_name = temp;
      draggedIndex = null;
      renderSantaBoard();
    });
  });
}

document.getElementById("auto-gen-btn").addEventListener("click", async () => {
  const members = await DB.getMembers();
  const msg = document.getElementById("santa-board-msg");
  if (members.length < 2) {
    msg.textContent = "Add at least 2 family members first.";
    return;
  }

  const names = members.map((m) => m.name);
  let receivers = [...names];

  for (let attempt = 0; attempt < 200; attempt++) {
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    if (names.every((n, i) => n !== receivers[i])) break;
  }

  draftMatches = names.map((giver, i) => ({
    giver_name: giver,
    receiver_name: receivers[i],
  }));

  msg.textContent = "Shuffled. Drag any receiver onto another to adjust, then click Confirm & Start.";
  renderSantaBoard();
});

document.getElementById("confirm-start-btn").addEventListener("click", async () => {
  const msg = document.getElementById("santa-board-msg");
  if (draftMatches.length < 2) {
    msg.textContent = "Generate matches first before starting.";
    return;
  }
  if (draftMatches.some((p) => p.giver_name === p.receiver_name)) {
    msg.textContent = "Fix any red self-matches by dragging them to swap before starting.";
    return;
  }

  await DB.saveMatches(draftMatches);
  await DB.setSetting("is_started", "true");
  msg.textContent = "Matches saved and process started. Family members can now log in.";
  renderAdminStatus();
});

async function renderAdminVotes() {
  const [members, votes] = await Promise.all([DB.getMembers(), DB.getVotes()]);
  const adults = members.filter((m) => m.role === "adult");
  const container = document.getElementById("admin-vote-results");

  const v80 = votes.filter((v) => v.choice === "$80");
  const v100 = votes.filter((v) => v.choice === "$100");
  const total = votes.length;
  const pct80 = total ? Math.round((v80.length / total) * 100) : 0;
  const pct100 = total ? Math.round((v100.length / total) * 100) : 0;

  const votedNames = new Set(votes.map((v) => v.member_name));
  const pendingAdults = adults.filter((a) => !votedNames.has(a.name)).map((a) => a.name);

  container.innerHTML = `
    <div>
      <div class="status-card"><strong>$80</strong><span>${v80.length} vote${v80.length === 1 ? "" : "s"} (${pct80}%)</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct80}%"></div></div>
      <div class="muted">${v80.length ? v80.map((v) => escapeHtml(v.member_name)).join(", ") : "No votes yet"}</div>
    </div>
    <div>
      <div class="status-card"><strong>$100</strong><span>${v100.length} vote${v100.length === 1 ? "" : "s"} (${pct100}%)</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct100}%"></div></div>
      <div class="muted">${v100.length ? v100.map((v) => escapeHtml(v.member_name)).join(", ") : "No votes yet"}</div>
    </div>
    <p class="muted">
      <strong>Still waiting on (${pendingAdults.length}):</strong>
      ${pendingAdults.length ? pendingAdults.map(escapeHtml).join(", ") : "All adults have voted."}
    </p>
  `;
}

// --- Boot ---
async function init() {
  applyLanguage();

  if (DB.isDemoMode) {
    document.getElementById("demo-banner").classList.remove("hidden");
  }
  const savedName = sessionStorage.getItem("xmas_user");
  if (savedName) {
    const members = await DB.getMembers();
    currentUser = members.find((m) => m.name === savedName) || null;
  }
  switchView("family");
}

init();

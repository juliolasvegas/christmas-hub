let currentView = "family";
let currentUser = null;
let isAdminUnlocked = false;
let draftMatches = []; // [{ giver_name, receiver_name }]
let draggedIndex = null;

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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

// ==================== FAMILY VIEW ====================
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

  // Logged-in Family Dashboard
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  document.getElementById("user-pill").classList.remove("hidden");
  document.getElementById("current-user-label").textContent = `Hi, ${currentUser.name}`;

  // Reset reveal box
  document.getElementById("santa-result").classList.add("hidden");
  document.getElementById("santa-status").classList.remove("hidden");
  document.getElementById("santa-status").textContent = "Ready to see who you got?";
  document.getElementById("reveal-btn").classList.remove("hidden");

  // Load wishlist
  const members = await DB.getMembers();
  const me = members.find((m) => m.name === currentUser.name);
  document.getElementById("my-wishlist").value = me?.wishlist || "";

  // Adult-only Gift Amount Vote
  const voteCard = document.getElementById("adult-vote-card");
  if (currentUser.role === "adult") {
    voteCard.classList.remove("hidden");
    await renderAdultVoteBox();
  } else {
    voteCard.classList.add("hidden");
  }
}

async function populateLoginDropdown() {
  const members = await DB.getMembers();
  const select = document.getElementById("login-name-select");
  select.innerHTML =
    `<option value="">-- Select your name --</option>` +
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
    promptText.textContent = "First time here! Create your 4-digit PIN:";
    loginBtn.textContent = "Create PIN & Enter";
  } else {
    promptText.textContent = "Enter your 4-digit PIN:";
    loginBtn.textContent = "Log In";
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
    errEl.textContent = "Please enter a 4-digit PIN.";
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
    errEl.textContent = "Incorrect PIN. Try again or ask the organizer to reset it.";
    errEl.classList.remove("hidden");
    return;
  }

  currentUser = member;
  sessionStorage.setItem("xmas_user", member.name);
  renderFamilyView();
});

document.getElementById("reveal-btn").addEventListener("click", async () => {
  const matchName = await DB.getMyMatch(currentUser.name);
  if (!matchName) {
    document.getElementById("santa-status").textContent = "No match found yet—check with the organizer.";
    return;
  }
  const members = await DB.getMembers();
  const matchMember = members.find((m) => m.name === matchName);

  document.getElementById("santa-match-name").textContent = matchName;
  document.getElementById("santa-match-wishlist").textContent =
    matchMember?.wishlist?.trim()
      ? `🎁 ${matchName}'s Gift Hints:\n${matchMember.wishlist}`
      : `${matchName} hasn't added gift hints yet.`;

  document.getElementById("santa-status").classList.add("hidden");
  document.getElementById("reveal-btn").classList.add("hidden");
  document.getElementById("santa-result").classList.remove("hidden");
});

async function renderAdultVoteBox() {
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
    msg.textContent = `✅ Vote recorded! You voted for ${myVote.choice}.`;
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

document.getElementById("wishlist-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await DB.updateWishlist(currentUser.name, document.getElementById("my-wishlist").value.trim());
  const saved = document.getElementById("wishlist-saved");
  saved.classList.remove("hidden");
  setTimeout(() => saved.classList.add("hidden"), 2000);
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
      document.getElementById("admin-gate-title").textContent = "⚙️ Set Up Your Admin PIN";
      document.getElementById("admin-gate-desc").textContent =
        "Create a PIN to protect your Admin Hub (you'll use this every time you manage the site).";
      document.getElementById("admin-gate-btn").textContent = "Save Admin PIN";
    } else {
      document.getElementById("admin-gate-title").textContent = "⚙️ Admin Hub";
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
          <span class="muted">${m.pin ? "🔒 PIN set" : "⏳ No PIN yet"}</span>
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

// --- Secret Santie Auto-Generator + Drag & Drop ---
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
            <span>${escapeHtml(pair.receiver_name)} ${isSelf ? "⚠️ (Self)" : ""}</span>
            <span class="muted">⠿</span>
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

      // Swap receivers
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

  // Derangement shuffle (guarantees nobody draws themselves)
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

  msg.textContent = "Shuffled! Drag any receiver onto another to adjust, then click Confirm & Start.";
  renderSantaBoard();
});

document.getElementById("confirm-start-btn").addEventListener("click", async () => {
  const msg = document.getElementById("santa-board-msg");
  if (draftMatches.length < 2) {
    msg.textContent = "Generate matches first before starting.";
    return;
  }
  const hasSelfMatch = draftMatches.some((p) => p.giver_name === p.receiver_name);
  if (hasSelfMatch) {
    msg.textContent = "⚠️ Fix any red self-matches by dragging them to swap before starting.";
    return;
  }

  await DB.saveMatches(draftMatches);
  await DB.setSetting("is_started", "true");
  msg.textContent = "✅ Matches saved and process started! Family members can now log in.";
  renderAdminStatus();
});

// --- Admin Vote Results ---
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
      ${pendingAdults.length ? pendingAdults.map(escapeHtml).join(", ") : "All adults have voted!"}
    </p>
  `;
}

// --- Boot ---
async function init() {
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

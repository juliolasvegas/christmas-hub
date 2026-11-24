// ============================================================
// PASTE YOUR SUPABASE CREDENTIALS HERE
// ============================================================
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
// ============================================================

const USE_SUPABASE =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_SUPABASE");

const supabaseClient = USE_SUPABASE
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function loadLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const DB = {
  isDemoMode: !USE_SUPABASE,

  // --- SETTINGS (admin_pin, is_started) ---
  async getSetting(key) {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient
        .from("settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data ? data.value : null;
    }
    const settings = loadLocal("xmas_settings", {});
    return settings[key] ?? null;
  },

  async setSetting(key, value) {
    const strVal = String(value);
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("settings")
        .upsert({ key, value: strVal }, { onConflict: "key" });
      if (error) throw error;
      return;
    }
    const settings = loadLocal("xmas_settings", {});
    settings[key] = strVal;
    saveLocal("xmas_settings", settings);
  },

  // --- MEMBERS ---
  async getMembers() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient
        .from("members")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_members", []);
  },

  async addMember(name, role) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("members")
        .insert({ name, role, pin: null, wishlist: "" });
      if (error) throw error;
      return;
    }
    const members = loadLocal("xmas_members", []);
    if (members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Name already exists");
    }
    members.push({ name, role, pin: null, wishlist: "" });
    saveLocal("xmas_members", members);
  },

  async deleteMember(name) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("members")
        .delete()
        .eq("name", name);
      if (error) throw error;
      return;
    }
    const members = loadLocal("xmas_members", []).filter((m) => m.name !== name);
    saveLocal("xmas_members", members);
  },

  async setMemberPin(name, pin) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("members")
        .update({ pin })
        .eq("name", name);
      if (error) throw error;
      return;
    }
    const members = loadLocal("xmas_members", []);
    const m = members.find((x) => x.name === name);
    if (m) m.pin = pin;
    saveLocal("xmas_members", members);
  },

  async updateWishlist(name, wishlist) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("members")
        .update({ wishlist })
        .eq("name", name);
      if (error) throw error;
      return;
    }
    const members = loadLocal("xmas_members", []);
    const m = members.find((x) => x.name === name);
    if (m) m.wishlist = wishlist;
    saveLocal("xmas_members", members);
  },

  // --- SECRET SANTIE ---
  async getAllMatches() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient
        .from("secret_santa")
        .select("*");
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_santa", []);
  },

  async getMyMatch(giverName) {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient
        .from("secret_santa")
        .select("receiver_name")
        .eq("giver_name", giverName)
        .maybeSingle();
      if (error) throw error;
      return data ? data.receiver_name : null;
    }
    const matches = loadLocal("xmas_santa", []);
    return matches.find((m) => m.giver_name === giverName)?.receiver_name ?? null;
  },

  async saveMatches(pairs) {
    if (USE_SUPABASE) {
      const { error: delErr } = await supabaseClient
        .from("secret_santa")
        .delete()
        .neq("giver_name", "");
      if (delErr) throw delErr;
      if (pairs.length > 0) {
        const { error: insErr } = await supabaseClient
          .from("secret_santa")
          .insert(pairs);
        if (insErr) throw insErr;
      }
      return;
    }
    saveLocal("xmas_santa", pairs);
  },

  // --- ADULT VOTES ($80 / $100) ---
  async getVotes() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient.from("votes").select("*");
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_votes", []);
  },

  async castVoteOnce(memberName, choice) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("votes")
        .insert({ member_name: memberName, choice });
      if (error) throw error;
      return;
    }
    const votes = loadLocal("xmas_votes", []);
    if (votes.some((v) => v.member_name === memberName)) return;
    votes.push({ member_name: memberName, choice });
    saveLocal("xmas_votes", votes);
  },
};

// ============================================================
// PASTE YOUR SUPABASE CREDENTIALS HERE
// ============================================================
const SUPABASE_URL = "https://poaelldmuzifcpwmckce.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWVsbGRtdXppZmNwd21ja2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NTI0NDEsImV4cCI6MjExMTEyODQ0MX0.rUsveCmsaifhsviWbunbMXwZVlQRfiONW1XMUUn7xI4";
// ============================================================

const USE_SUPABASE =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_SUPABASE");

const supabaseClient = USE_SUPABASE
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- Local Demo Storage Helpers (used until Supabase keys are added) ---
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

  // --- MEMBERS ---
  async getMembers() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient.from("members").select("*").order("name");
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_members", []);
  },

  async upsertMember(name, pin, wishlist = undefined) {
    if (USE_SUPABASE) {
      const payload = { name, pin };
      if (wishlist !== undefined) payload.wishlist = wishlist;
      const { error } = await supabaseClient
        .from("members")
        .upsert(payload, { onConflict: "name" });
      if (error) throw error;
      return;
    }
    const members = loadLocal("xmas_members", []);
    const idx = members.findIndex((m) => m.name.toLowerCase() === name.toLowerCase());
    if (idx >= 0) {
      members[idx].pin = pin;
      if (wishlist !== undefined) members[idx].wishlist = wishlist;
    } else {
      members.push({ name, pin, wishlist: wishlist ?? "" });
    }
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

  // --- POLLS & VOTES ---
  async getPolls() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient
        .from("polls")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_polls", []);
  },

  async createPoll(question, options) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("polls")
        .insert({ question, options });
      if (error) throw error;
      return;
    }
    const polls = loadLocal("xmas_polls", []);
    polls.push({
      id: "poll-" + Date.now(),
      question,
      options,
      is_open: true,
    });
    saveLocal("xmas_polls", polls);
  },

  async getVotes() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient.from("votes").select("*");
      if (error) throw error;
      return data;
    }
    return loadLocal("xmas_votes", []);
  },

  async castVote(pollId, memberName, choice) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient
        .from("votes")
        .upsert(
          { poll_id: pollId, member_name: memberName, choice },
          { onConflict: "poll_id,member_name" }
        );
      if (error) throw error;
      return;
    }
    const votes = loadLocal("xmas_votes", []);
    const idx = votes.findIndex(
      (v) => v.poll_id === pollId && v.member_name === memberName
    );
    if (idx >= 0) {
      votes[idx].choice = choice;
    } else {
      votes.push({ poll_id: pollId, member_name: memberName, choice });
    }
    saveLocal("xmas_votes", votes);
  },

  // --- SECRET SANTA ---
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
    const found = matches.find((m) => m.giver_name === giverName);
    return found ? found.receiver_name : null;
  },

  async saveMatches(pairs) {
    // pairs: [{ giver_name, receiver_name, year }]
    if (USE_SUPABASE) {
      const { error: delErr } = await supabaseClient
        .from("secret_santa")
        .delete()
        .neq("giver_name", "");
      if (delErr) throw delErr;

      const { error: insErr } = await supabaseClient
        .from("secret_santa")
        .insert(pairs);
      if (insErr) throw insErr;
      return;
    }
    saveLocal("xmas_santa", pairs);
  },
};

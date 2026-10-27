/**
 * SapaTamu — Supabase Authentication & Multi-Role Authorization Controller
 * Dual Mode: Live Supabase Cloud Auth + Instant Zero-Config Trial Mode
 */

const STORAGE_SUPABASE_CONFIG = "vow_supabase_config_v1";
const STORAGE_CURRENT_USER = "vow_current_user_v1";
const STORAGE_LOCAL_USERS = "vow_local_users_v1";

// 11 Pre-configured Trial Accounts specified by User
const SEED_TRIAL_ACCOUNTS = [
  // 1. Superadmin (Master Access)
  {
    id: "sa_001",
    username: "superadmin",
    email: "superadmin@sapatamu.id",
    password: "Hu33cw56",
    fullName: "Master Superadministrator",
    role: "superadmin", // Access everything: Planner, Resepsionis, Settings, Database
    badge: "👑 Superadmin"
  },

  // 2. 5 Admin Accounts (Trial: Bisa membuka Mode Planner dan Mode Resepsionis)
  {
    id: "adm_001",
    username: "admin1",
    email: "admin1@sapatamu.id",
    password: "Admin@Trial1",
    fullName: "WO Captain 1",
    role: "admin",
    badge: "🛡️ Admin"
  },
  {
    id: "adm_002",
    username: "admin2",
    email: "admin2@sapatamu.id",
    password: "Admin@Trial2",
    fullName: "WO Captain 2",
    role: "admin",
    badge: "🛡️ Admin"
  },
  {
    id: "adm_003",
    username: "admin3",
    email: "admin3@sapatamu.id",
    password: "Admin@Trial3",
    fullName: "WO Planner 1",
    role: "admin",
    badge: "🛡️ Admin"
  },
  {
    id: "adm_004",
    username: "admin4",
    email: "admin4@sapatamu.id",
    password: "Admin@Trial4",
    fullName: "WO Planner 2",
    role: "admin",
    badge: "🛡️ Admin"
  },
  {
    id: "adm_005",
    username: "admin5",
    email: "admin5@sapatamu.id",
    password: "Admin@Trial5",
    fullName: "WO Coordinator",
    role: "admin",
    badge: "🛡️ Admin"
  },

  // 3. 5 User Accounts (Trial: HANYA bisa membuka Mode Resepsionis)
  {
    id: "usr_001",
    username: "user1",
    email: "user1@sapatamu.id",
    password: "User@Trial1",
    fullName: "Front Desk Crew 1",
    role: "user", // Strictly limited to Reception mode
    badge: "👤 Resepsionis"
  },
  {
    id: "usr_002",
    username: "user2",
    email: "user2@sapatamu.id",
    password: "User@Trial2",
    fullName: "Front Desk Crew 2",
    role: "user",
    badge: "👤 Resepsionis"
  },
  {
    id: "usr_003",
    username: "user3",
    email: "user3@sapatamu.id",
    password: "User@Trial3",
    fullName: "Resepsionis Pria",
    role: "user",
    badge: "👤 Resepsionis"
  },
  {
    id: "usr_004",
    username: "user4",
    email: "user4@sapatamu.id",
    password: "User@Trial4",
    fullName: "Resepsionis Wanita",
    role: "user",
    badge: "👤 Resepsionis"
  },
  {
    id: "usr_005",
    username: "user5",
    email: "user5@sapatamu.id",
    password: "User@Trial5",
    fullName: "Kru Souvenir & Angpao",
    role: "user",
    badge: "👤 Resepsionis"
  }
];

const SapaAuth = {
  client: null,
  currentUser: null,
  accounts: [],

  init() {
    this.loadAccounts();
    this.initSupabaseClient();
    this.restoreSession();
  },

  // Load and merge trial accounts with custom user sign-ups
  loadAccounts() {
    try {
      const saved = localStorage.getItem(STORAGE_LOCAL_USERS);
      if (!saved) {
        localStorage.setItem(STORAGE_LOCAL_USERS, JSON.stringify(SEED_TRIAL_ACCOUNTS));
        this.accounts = [...SEED_TRIAL_ACCOUNTS];
      } else {
        const parsed = JSON.parse(saved);
        // Ensure superadmin has the exact user-specified password Hu33cw56
        const sa = parsed.find(a => a.username === "superadmin");
        if (!sa) {
          parsed.unshift(SEED_TRIAL_ACCOUNTS[0]);
        } else {
          sa.password = "Hu33cw56";
        }
        // Ensure all 5 admin and 5 user seed accounts exist
        SEED_TRIAL_ACCOUNTS.forEach(seed => {
          if (!parsed.some(p => p.username === seed.username)) {
            parsed.push(seed);
          }
        });
        localStorage.setItem(STORAGE_LOCAL_USERS, JSON.stringify(parsed));
        this.accounts = parsed;
      }
    } catch (e) {
      console.warn("Failed loading accounts, using seed defaults:", e);
      this.accounts = [...SEED_TRIAL_ACCOUNTS];
    }
  },

  initSupabaseClient() {
    try {
      const config = this.getSupabaseConfig();
      if (config.url && config.anonKey && window.supabase && window.supabase.createClient) {
        this.client = window.supabase.createClient(config.url, config.anonKey);
        console.log("Supabase Client initialized with cloud endpoint:", config.url);
      } else {
        this.client = null;
      }
    } catch (e) {
      console.warn("Could not initialize Supabase client:", e);
      this.client = null;
    }
  },

  getSupabaseConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_SUPABASE_CONFIG);
      return saved ? JSON.parse(saved) : { url: "", anonKey: "" };
    } catch (e) {
      return { url: "", anonKey: "" };
    }
  },

  saveSupabaseConfig(url, anonKey) {
    const config = { url: (url || "").trim(), anonKey: (anonKey || "").trim() };
    localStorage.setItem(STORAGE_SUPABASE_CONFIG, JSON.stringify(config));
    this.initSupabaseClient();
    return this.isSupabaseConnected();
  },

  isSupabaseConnected() {
    return !!(this.client && this.getSupabaseConfig().url);
  },

  restoreSession() {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER) || sessionStorage.getItem(STORAGE_CURRENT_USER);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  },

  // Sign In: Dual mode (Supabase Cloud or Local Trial Database)
  async signIn(identifier, password, rememberMe = true) {
    const idClean = (identifier || "").trim().toLowerCase();
    const passClean = (password || "").trim();

    if (!idClean || !passClean) {
      throw new Error("Username/Email dan password wajib diisi!");
    }

    // 1. Try Live Supabase Cloud Auth if configured
    if (this.isSupabaseConnected()) {
      try {
        const email = idClean.includes("@") ? idClean : `${idClean}@sapatamu.id`;
        const { data, error } = await this.client.auth.signInWithPassword({
          email: email,
          password: passClean
        });

        if (!error && data && data.user) {
          const userMeta = data.user.user_metadata || {};
          const role = userMeta.role || (idClean.includes("admin") ? "admin" : "user");
          const userObj = {
            id: data.user.id,
            username: userMeta.username || idClean.split("@")[0],
            email: data.user.email,
            fullName: userMeta.full_name || idClean.split("@")[0],
            role: role,
            badge: role === "superadmin" ? "👑 Superadmin" : role === "admin" ? "🛡️ Admin" : "👤 Resepsionis",
            provider: "supabase"
          };

          this.setCurrentUser(userObj, rememberMe);
          return userObj;
        }
      } catch (cloudErr) {
        console.warn("Supabase Cloud Auth failed, checking local accounts database:", cloudErr);
      }
    }

    // 2. Check Local Accounts Database (Superadmin, 5 Admins, 5 Users, and custom sign-ups)
    const match = this.accounts.find(a => 
      (a.username.toLowerCase() === idClean || a.email.toLowerCase() === idClean) && 
      a.password === passClean
    );

    if (match) {
      const userObj = {
        id: match.id,
        username: match.username,
        email: match.email,
        fullName: match.fullName,
        role: match.role,
        badge: match.badge || (match.role === "superadmin" ? "👑 Superadmin" : match.role === "admin" ? "🛡️ Admin" : "👤 Resepsionis"),
        provider: "trial_local"
      };

      this.setCurrentUser(userObj, rememberMe);
      return userObj;
    }

    throw new Error("Username atau password salah! Silakan periksa kembali.");
  },

  // Sign Up: Register new user
  async signUp(fullName, username, email, password, role = "user") {
    const fnClean = (fullName || "").trim();
    const unClean = (username || "").trim().toLowerCase();
    const emClean = (email || "").trim().toLowerCase();
    const passClean = (password || "").trim();

    if (!fnClean || !unClean || !emClean || !passClean) {
      throw new Error("Semua bidang wajib diisi untuk pendaftaran!");
    }

    // Check duplicate in local accounts
    if (this.accounts.some(a => a.username.toLowerCase() === unClean)) {
      throw new Error(`Username "${unClean}" sudah digunakan. Gunakan username lain.`);
    }

    // Register on Supabase if connected
    if (this.isSupabaseConnected()) {
      try {
        await this.client.auth.signUp({
          email: emClean,
          password: passClean,
          options: {
            data: {
              full_name: fnClean,
              username: unClean,
              role: role
            }
          }
        });
      } catch (cloudErr) {
        console.warn("Supabase cloud sign-up notice:", cloudErr);
      }
    }

    // Add to local database
    const newAccount = {
      id: "usr_" + Date.now(),
      username: unClean,
      email: emClean,
      password: passClean,
      fullName: fnClean,
      role: role,
      badge: role === "superadmin" ? "👑 Superadmin" : role === "admin" ? "🛡️ Admin" : "👤 Resepsionis",
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    localStorage.setItem(STORAGE_LOCAL_USERS, JSON.stringify(this.accounts));

    return newAccount;
  },

  // Sign in with Google (OAuth or simulated trial flow)
  async signInWithGoogle() {
    if (this.isSupabaseConnected()) {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
      return data;
    }

    // Zero-config Demo Google Sign-In
    const googleUser = {
      id: "g_user_" + Date.now(),
      username: "google_trial",
      email: "planner.demo@gmail.com",
      fullName: "Google Account (WO Trial)",
      role: "admin", // Demo google signs in as Admin
      badge: "🛡️ Admin (Google)",
      provider: "google_demo"
    };

    this.setCurrentUser(googleUser, true);
    return googleUser;
  },

  setCurrentUser(userObj, rememberMe = true) {
    this.currentUser = userObj;
    if (rememberMe) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(userObj));
    } else {
      sessionStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(userObj));
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  },

  signOut() {
    if (this.isSupabaseConnected()) {
      try {
        this.client.auth.signOut();
      } catch (e) {}
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_CURRENT_USER);
    sessionStorage.removeItem(STORAGE_CURRENT_USER);
  }
};

// Auto-initialize on load
if (typeof window !== "undefined") {
  window.SapaAuth = SapaAuth;
  SapaAuth.init();
}

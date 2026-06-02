import { useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const GROUPS = {
  A: ["México", "Ecuador", "Países Bajos", "Senegal"],
  B: ["Argentina", "Chile", "Polonia", "Arabia Saudita"],
  C: ["Brasil", "Uruguay", "Noruega", "Marruecos"],
  D: ["Francia", "Croacia", "Canadá", "Camerún"],
  E: ["España", "Portugal", "Irlanda", "Costa Rica"],
  F: ["Alemania", "Japón", "Colombia", "Túnez"],
  G: ["Inglaterra", "EE.UU.", "Irán", "Gales"],
  H: ["Bélgica", "Australia", "Ghana", "Suiza"],
};

const FLAGS = {
  "México": "🇲🇽", "Ecuador": "🇪🇨", "Países Bajos": "🇳🇱", "Senegal": "🇸🇳",
  "Argentina": "🇦🇷", "Chile": "🇨🇱", "Polonia": "🇵🇱", "Arabia Saudita": "🇸🇦",
  "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Noruega": "🇳🇴", "Marruecos": "🇲🇦",
  "Francia": "🇫🇷", "Croacia": "🇭🇷", "Canadá": "🇨🇦", "Camerún": "🇨🇲",
  "España": "🇪🇸", "Portugal": "🇵🇹", "Irlanda": "🇮🇪", "Costa Rica": "🇨🇷",
  "Alemania": "🇩🇪", "Japón": "🇯🇵", "Colombia": "🇨🇴", "Túnez": "🇹🇳",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "EE.UU.": "🇺🇸", "Irán": "🇮🇷", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Bélgica": "🇧🇪", "Australia": "🇦🇺", "Ghana": "🇬🇭", "Suiza": "🇨🇭",
};

// Generate group stage matches
const generateMatches = () => {
  let id = 1;
  const matches = [];
  const dates = [
    "11 Jun", "12 Jun", "13 Jun", "14 Jun", "15 Jun", "16 Jun",
    "17 Jun", "18 Jun", "19 Jun", "20 Jun", "21 Jun", "22 Jun",
  ];
  let dateIdx = 0;
  Object.entries(GROUPS).forEach(([group, teams]) => {
    const pairs = [
      [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
    ];
    pairs.forEach(([a, b]) => {
      matches.push({
        id: id++,
        group,
        home: teams[a],
        away: teams[b],
        date: dates[dateIdx % dates.length],
        stage: "Fase de Grupos",
        realHome: null,
        realAway: null,
      });
      dateIdx++;
    });
  });
  return matches;
};

const MATCHES = generateMatches();

// ─── SCORING ─────────────────────────────────────────────────────────────────
function calcPoints(pred, real) {
  if (real.home === null || real.away === null) return null;
  if (pred.home === real.home && pred.away === real.away) return 3;
  const predResult = pred.home > pred.away ? "H" : pred.home < pred.away ? "A" : "D";
  const realResult = real.home > real.away ? "H" : real.home < real.away ? "A" : "D";
  if (predResult === realResult) return 1;
  return 0;
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
async function loadStorage(key) {
  try {
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveStorage(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login"); // login | home | predict | ranking | admin
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});       // { name: { name, predictions:{matchId:{home,away}} } }
  const [results, setResults] = useState({});   // { matchId: {home, away} }
  const [adminPwd] = useState("mundial2026");
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [predictions, setPredictions] = useState({});
  const [saved, setSaved] = useState(false);
  const [adminInput, setAdminInput] = useState({});
  const [adminGroup, setAdminGroup] = useState("A");
  const [loading, setLoading] = useState(true);
  const [adminPwdInput, setAdminPwdInput] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);

  // Load data
  useEffect(() => {
    (async () => {
      const u = await loadStorage("wc2026_users");
      const r = await loadStorage("wc2026_results");
      if (u) setUsers(u);
      if (r) setResults(r);
      setLoading(false);
    })();
  }, []);

  // Persist users
  useEffect(() => {
    if (!loading) saveStorage("wc2026_users", users);
  }, [users]);

  // Persist results
  useEffect(() => {
    if (!loading) saveStorage("wc2026_results", results);
  }, [results]);

  // Compute rankings
  const getRanking = () => {
    return Object.values(users).map(u => {
      let pts = 0, exact = 0, correct = 0;
      MATCHES.forEach(m => {
        const pred = u.predictions?.[m.id];
        const real = results[m.id];
        if (!pred || !real) return;
        const p = calcPoints(pred, real);
        if (p === 3) { pts += 3; exact++; }
        else if (p === 1) { pts += 1; correct++; }
      });
      return { name: u.name, pts, exact, correct };
    }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);
  };

  // Login
  const handleLogin = () => {
    const name = loginName.trim();
    if (!name) { setLoginError("Ingresa tu nombre"); return; }
    if (name.toLowerCase() === "admin") {
      if (!adminAuth) { setAdminAuth(false); setScreen("adminlogin"); return; }
    }
    if (!users[name]) {
      const newUsers = { ...users, [name]: { name, predictions: {} } };
      setUsers(newUsers);
    }
    setCurrentUser(name);
    setPredictions(users[name]?.predictions || {});
    setScreen("home");
    setLoginError("");
  };

  const handleAdminLogin = () => {
    if (adminPwdInput === adminPwd) {
      setAdminAuth(true);
      setCurrentUser("admin");
      setScreen("admin");
    } else {
      setLoginError("Contraseña incorrecta");
    }
  };

  // Save predictions
  const savePredictions = () => {
    const updated = {
      ...users,
      [currentUser]: { ...users[currentUser], predictions: { ...predictions } },
    };
    setUsers(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Admin save result
  const saveResult = (matchId) => {
    const inp = adminInput[matchId];
    if (inp?.home === undefined || inp?.away === undefined) return;
    setResults(r => ({ ...r, [matchId]: { home: Number(inp.home), away: Number(inp.away) } }));
  };

  const groupMatches = MATCHES.filter(m => m.group === selectedGroup);
  const ranking = getRanking();

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.ball}>⚽</div>
      <p style={styles.loadingText}>Cargando...</p>
    </div>
  );

  // ── SCREENS ──────────────────────────────────────────────────────────────
  if (screen === "login" || screen === "adminlogin") return (
    <div style={styles.root}>
      <div style={styles.loginWrap}>
        <div style={styles.trophy}>🏆</div>
        <h1 style={styles.title}>MUNDIAL</h1>
        <h2 style={styles.subtitle}>2026 · Pronósticos</h2>
        <p style={styles.tagline}>¿Quién tiene mejor ojo para el fútbol?</p>
        {screen === "login" ? (
          <>
            <input
              style={styles.input}
              placeholder="Tu nombre de usuario"
              value={loginName}
              onChange={e => setLoginName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            {loginError && <p style={styles.error}>{loginError}</p>}
            <button style={styles.btn} onClick={handleLogin}>Entrar al torneo</button>
            <p style={styles.hint}>¿Eres administrador? Ingresa como "admin"</p>
          </>
        ) : (
          <>
            <p style={styles.adminLabel}>Contraseña de administrador</p>
            <input
              style={styles.input}
              type="password"
              placeholder="Contraseña"
              value={adminPwdInput}
              onChange={e => { setAdminPwdInput(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
            />
            {loginError && <p style={styles.error}>{loginError}</p>}
            <button style={styles.btn} onClick={handleAdminLogin}>Acceder</button>
            <button style={{ ...styles.btn, background: "#333", marginTop: 8 }} onClick={() => { setScreen("login"); setLoginError(""); }}>Volver</button>
          </>
        )}
      </div>
    </div>
  );

  if (screen === "home") return (
    <div style={styles.root}>
      <Nav user={currentUser} setScreen={setScreen} onLogout={() => { setCurrentUser(null); setScreen("login"); }} />
      <div style={styles.homeWrap}>
        <h2 style={styles.welcome}>¡Hola, {currentUser}! 👋</h2>
        <p style={styles.welcomeSub}>Ingresa tus pronósticos y sube al ranking</p>
        <div style={styles.cardGrid}>
          <HomeCard icon="⚽" title="Mis Pronósticos" desc="Predice los marcadores de cada partido" color="#00c853" onClick={() => setScreen("predict")} />
          <HomeCard icon="🏆" title="Ranking" desc="Ve quién va ganando el torneo de pronósticos" color="#ffd600" onClick={() => setScreen("ranking")} />
        </div>
        <div style={styles.statsRow}>
          {(() => {
            const u = users[currentUser];
            let pts = 0, done = 0;
            MATCHES.forEach(m => {
              const pred = u?.predictions?.[m.id];
              const real = results[m.id];
              if (pred) done++;
              if (pred && real) {
                const p = calcPoints(pred, real);
                if (p) pts += p;
              }
            });
            const myRank = ranking.findIndex(r => r.name === currentUser) + 1;
            return (
              <>
                <Stat label="Puntos" value={pts} />
                <Stat label="Pronósticos" value={`${done}/${MATCHES.length}`} />
                <Stat label="Posición" value={myRank > 0 ? `#${myRank}` : "—"} />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );

  if (screen === "predict") return (
    <div style={styles.root}>
      <Nav user={currentUser} setScreen={setScreen} onLogout={() => { setCurrentUser(null); setScreen("login"); }} />
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>⚽ Mis Pronósticos</h2>
        <div style={styles.groupTabs}>
          {Object.keys(GROUPS).map(g => (
            <button key={g} style={{ ...styles.groupTab, ...(selectedGroup === g ? styles.groupTabActive : {}) }} onClick={() => setSelectedGroup(g)}>
              Grupo {g}
            </button>
          ))}
        </div>
        <div style={styles.matchList}>
          {groupMatches.map(m => {
            const pred = predictions[m.id] || {};
            const real = results[m.id];
            const pts = real && pred.home !== undefined ? calcPoints(pred, real) : null;
            return (
              <div key={m.id} style={{ ...styles.matchCard, ...(pts === 3 ? styles.exactMatch : pts === 1 ? styles.correctMatch : pts === 0 ? styles.wrongMatch : {}) }}>
                <div style={styles.matchMeta}>{m.date} · Grupo {m.group}</div>
                <div style={styles.matchRow}>
                  <span style={styles.team}>{FLAGS[m.home]} {m.home}</span>
                  <div style={styles.scoreInputs}>
                    <input type="number" min="0" max="20" style={styles.scoreInput}
                      value={pred.home ?? ""}
                      onChange={e => setPredictions(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value === "" ? undefined : Number(e.target.value) } }))}
                      placeholder="0"
                    />
                    <span style={styles.vs}>:</span>
                    <input type="number" min="0" max="20" style={styles.scoreInput}
                      value={pred.away ?? ""}
                      onChange={e => setPredictions(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value === "" ? undefined : Number(e.target.value) } }))}
                      placeholder="0"
                    />
                  </div>
                  <span style={{ ...styles.team, textAlign: "right" }}>{FLAGS[m.away]} {m.away}</span>
                </div>
                {real && (
                  <div style={styles.realScore}>
                    Resultado real: {real.home} – {real.away}
                    {pts === 3 && <span style={styles.badge3}> +3 🎯</span>}
                    {pts === 1 && <span style={styles.badge1}> +1 ✅</span>}
                    {pts === 0 && <span style={styles.badge0}> +0 ❌</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button style={{ ...styles.btn, margin: "16px auto", display: "block" }} onClick={savePredictions}>
          {saved ? "¡Guardado! ✓" : "Guardar pronósticos"}
        </button>
      </div>
    </div>
  );

  if (screen === "ranking") return (
    <div style={styles.root}>
      <Nav user={currentUser} setScreen={setScreen} onLogout={() => { setCurrentUser(null); setScreen("login"); }} />
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>🏆 Ranking</h2>
        <div style={styles.legend}>
          <span style={styles.badge3}>🎯 Marcador exacto = 3 pts</span>
          <span style={styles.badge1}>✅ Resultado correcto = 1 pt</span>
        </div>
        {ranking.length === 0 ? (
          <p style={styles.empty}>Aún no hay participantes registrados.</p>
        ) : (
          <div style={styles.rankList}>
            {ranking.map((r, i) => (
              <div key={r.name} style={{ ...styles.rankCard, ...(r.name === currentUser ? styles.rankCardMe : {}), ...(i === 0 ? styles.rankFirst : i === 1 ? styles.rankSecond : i === 2 ? styles.rankThird : {}) }}>
                <span style={styles.rankPos}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                <span style={styles.rankName}>{r.name}{r.name === currentUser ? " (tú)" : ""}</span>
                <div style={styles.rankStats}>
                  <span style={styles.rankPts}>{r.pts} pts</span>
                  <span style={styles.rankSub}>🎯 {r.exact} · ✅ {r.correct}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (screen === "admin") return (
    <div style={styles.root}>
      <Nav user="Admin ⚙️" setScreen={setScreen} onLogout={() => { setCurrentUser(null); setAdminAuth(false); setScreen("login"); }} isAdmin />
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>⚙️ Panel de Administración</h2>
        <p style={styles.adminSub}>Ingresa los resultados reales de los partidos</p>
        <div style={styles.groupTabs}>
          {Object.keys(GROUPS).map(g => (
            <button key={g} style={{ ...styles.groupTab, ...(adminGroup === g ? styles.groupTabActive : {}) }} onClick={() => setAdminGroup(g)}>
              Grupo {g}
            </button>
          ))}
        </div>
        <div style={styles.matchList}>
          {MATCHES.filter(m => m.group === adminGroup).map(m => {
            const real = results[m.id] || {};
            const inp = adminInput[m.id] || {};
            return (
              <div key={m.id} style={styles.matchCard}>
                <div style={styles.matchMeta}>{m.date} · Grupo {m.group}</div>
                <div style={styles.matchRow}>
                  <span style={styles.team}>{FLAGS[m.home]} {m.home}</span>
                  <div style={styles.scoreInputs}>
                    <input type="number" min="0" style={styles.scoreInput}
                      value={inp.home ?? real.home ?? ""}
                      onChange={e => setAdminInput(a => ({ ...a, [m.id]: { ...a[m.id], home: e.target.value } }))}
                      placeholder="0"
                    />
                    <span style={styles.vs}>:</span>
                    <input type="number" min="0" style={styles.scoreInput}
                      value={inp.away ?? real.away ?? ""}
                      onChange={e => setAdminInput(a => ({ ...a, [m.id]: { ...a[m.id], away: e.target.value } }))}
                      placeholder="0"
                    />
                  </div>
                  <span style={{ ...styles.team, textAlign: "right" }}>{FLAGS[m.away]} {m.away}</span>
                </div>
                <button style={styles.saveResultBtn} onClick={() => saveResult(m.id)}>
                  {results[m.id] ? "✓ Actualizar" : "Guardar resultado"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Nav({ user, setScreen, onLogout, isAdmin }) {
  return (
    <nav style={styles.nav}>
      <span style={styles.navLogo}>⚽ Mundial 2026</span>
      <div style={styles.navLinks}>
        {!isAdmin && <>
          <button style={styles.navBtn} onClick={() => setScreen("home")}>Inicio</button>
          <button style={styles.navBtn} onClick={() => setScreen("predict")}>Pronósticos</button>
          <button style={styles.navBtn} onClick={() => setScreen("ranking")}>Ranking</button>
        </>}
        <span style={styles.navUser}>{user}</span>
        <button style={styles.navLogout} onClick={onLogout}>Salir</button>
      </div>
    </nav>
  );
}

function HomeCard({ icon, title, desc, color, onClick }) {
  return (
    <div style={{ ...styles.hCard, borderTop: `4px solid ${color}` }} onClick={onClick}>
      <div style={styles.hCardIcon}>{icon}</div>
      <div style={styles.hCardTitle}>{title}</div>
      <div style={styles.hCardDesc}>{desc}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statVal}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  root: { minHeight: "100vh", background: "#0a0e1a", color: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0e1a" },
  ball: { fontSize: 64, animation: "spin 1s linear infinite" },
  loadingText: { color: "#aaa", marginTop: 16 },

  // Login
  loginWrap: { maxWidth: 400, margin: "0 auto", padding: "60px 24px", textAlign: "center" },
  trophy: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 48, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: 4 },
  subtitle: { fontSize: 20, color: "#ffd600", margin: "4px 0 16px", fontWeight: 600 },
  tagline: { color: "#aaa", marginBottom: 32, fontSize: 14 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 10, border: "2px solid #333", background: "#141824", color: "#fff", fontSize: 16, marginBottom: 12, boxSizing: "border-box", outline: "none" },
  btn: { width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "#00c853", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 1 },
  error: { color: "#ff5252", fontSize: 13, marginBottom: 8 },
  hint: { color: "#666", fontSize: 12, marginTop: 16 },
  adminLabel: { color: "#aaa", marginBottom: 8, fontSize: 14 },

  // Nav
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#111827", borderBottom: "1px solid #1f2937", flexWrap: "wrap", gap: 8 },
  navLogo: { fontWeight: 900, fontSize: 18, color: "#ffd600" },
  navLinks: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  navBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: "6px 10px", borderRadius: 6 },
  navUser: { color: "#ffd600", fontSize: 13, fontWeight: 600, padding: "0 8px" },
  navLogout: { background: "#1f2937", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13, padding: "6px 12px", borderRadius: 6 },

  // Home
  homeWrap: { maxWidth: 700, margin: "0 auto", padding: "32px 16px" },
  welcome: { fontSize: 28, fontWeight: 800, margin: 0 },
  welcomeSub: { color: "#aaa", marginTop: 6, marginBottom: 32 },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 },
  hCard: { background: "#141824", borderRadius: 14, padding: "24px 20px", cursor: "pointer", transition: "transform .15s", userSelect: "none" },
  hCardIcon: { fontSize: 36, marginBottom: 10 },
  hCardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  hCardDesc: { color: "#aaa", fontSize: 13 },
  statsRow: { display: "flex", gap: 16 },
  stat: { flex: 1, background: "#141824", borderRadius: 12, padding: "16px", textAlign: "center" },
  statVal: { fontSize: 28, fontWeight: 800, color: "#ffd600" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

  // Content
  content: { maxWidth: 700, margin: "0 auto", padding: "24px 16px" },
  sectionTitle: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  groupTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 },
  groupTab: { padding: "6px 14px", borderRadius: 20, border: "2px solid #333", background: "none", color: "#aaa", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  groupTabActive: { background: "#ffd600", borderColor: "#ffd600", color: "#0a0e1a" },

  // Match card
  matchList: { display: "flex", flexDirection: "column", gap: 12 },
  matchCard: { background: "#141824", borderRadius: 12, padding: "14px 16px", border: "2px solid transparent" },
  exactMatch: { border: "2px solid #00c853", background: "#0a1f10" },
  correctMatch: { border: "2px solid #ffd600", background: "#1a1800" },
  wrongMatch: { border: "2px solid #444" },
  matchMeta: { color: "#666", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  matchRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  team: { flex: 1, fontSize: 14, fontWeight: 600 },
  scoreInputs: { display: "flex", alignItems: "center", gap: 6 },
  scoreInput: { width: 44, padding: "8px 4px", textAlign: "center", borderRadius: 8, border: "2px solid #333", background: "#0d1117", color: "#fff", fontSize: 16, fontWeight: 700, outline: "none" },
  vs: { color: "#555", fontWeight: 700 },
  realScore: { marginTop: 10, fontSize: 12, color: "#888", textAlign: "center" },
  badge3: { background: "#00c853", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700 },
  badge1: { background: "#ffd600", color: "#000", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700 },
  badge0: { background: "#444", color: "#ccc", borderRadius: 4, padding: "2px 6px", fontSize: 11 },

  // Ranking
  legend: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, fontSize: 12 },
  empty: { color: "#666", textAlign: "center", marginTop: 40 },
  rankList: { display: "flex", flexDirection: "column", gap: 10 },
  rankCard: { display: "flex", alignItems: "center", gap: 14, background: "#141824", borderRadius: 12, padding: "14px 18px", border: "2px solid transparent" },
  rankCardMe: { border: "2px solid #4fc3f7" },
  rankFirst: { background: "#1a1400", border: "2px solid #ffd600" },
  rankSecond: { background: "#141820", border: "2px solid #90a4ae" },
  rankThird: { background: "#170f00", border: "2px solid #ff8f00" },
  rankPos: { fontSize: 22, minWidth: 36, textAlign: "center" },
  rankName: { flex: 1, fontWeight: 700, fontSize: 15 },
  rankStats: { textAlign: "right" },
  rankPts: { display: "block", fontWeight: 800, fontSize: 20, color: "#ffd600" },
  rankSub: { display: "block", fontSize: 11, color: "#666", marginTop: 2 },

  // Admin
  adminSub: { color: "#aaa", marginBottom: 20, fontSize: 14 },
  saveResultBtn: { display: "block", marginTop: 10, padding: "8px 20px", borderRadius: 8, border: "none", background: "#1565c0", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};

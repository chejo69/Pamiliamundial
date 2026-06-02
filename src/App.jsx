import { useState, useEffect } from "react";

// ─── DATOS OFICIALES MUNDIAL 2026 ────────────────────────────────────────────
const GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Rep. Checa"],
  B: ["Canadá", "Bosnia y Herz.", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Arabia Saudí", "Uruguay"],
  H: ["España", "Cabo Verde", "RI de Irán", "Nueva Zelanda"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

const FLAGS = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "Rep. Checa": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia y Herz.": "🇧🇦", "Catar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Turquía": "🇹🇷",
  "Alemania": "🇩🇪", "Curazao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Arabia Saudí": "🇸🇦", "Uruguay": "🇺🇾",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "RI de Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

// Calendario oficial fase de grupos Mundial 2026
const MATCHES = [
  // Grupo A
  { id: 1,  group: "A", home: "México",         away: "Sudáfrica",      date: "11 Jun", sede: "Cd. de México" },
  { id: 2,  group: "A", home: "Corea del Sur",   away: "Rep. Checa",    date: "11 Jun", sede: "Guadalajara" },
  { id: 3,  group: "A", home: "Rep. Checa",      away: "Sudáfrica",     date: "18 Jun", sede: "Atlanta" },
  { id: 4,  group: "A", home: "México",           away: "Corea del Sur", date: "18 Jun", sede: "Guadalajara" },
  { id: 5,  group: "A", home: "México",           away: "Rep. Checa",   date: "25 Jun", sede: "Cd. de México" },
  { id: 6,  group: "A", home: "Sudáfrica",        away: "Corea del Sur", date: "25 Jun", sede: "Dallas" },
  // Grupo B
  { id: 7,  group: "B", home: "Canadá",           away: "Bosnia y Herz.", date: "12 Jun", sede: "Toronto" },
  { id: 8,  group: "B", home: "Catar",            away: "Suiza",          date: "13 Jun", sede: "San Francisco" },
  { id: 9,  group: "B", home: "Suiza",            away: "Bosnia y Herz.", date: "18 Jun", sede: "Los Ángeles" },
  { id: 10, group: "B", home: "Canadá",           away: "Catar",          date: "18 Jun", sede: "Vancouver" },
  { id: 11, group: "B", home: "Bosnia y Herz.",   away: "Catar",          date: "25 Jun", sede: "Seattle" },
  { id: 12, group: "B", home: "Canadá",           away: "Suiza",          date: "25 Jun", sede: "Kansas City" },
  // Grupo C
  { id: 13, group: "C", home: "Brasil",           away: "Marruecos",      date: "13 Jun", sede: "Nueva York" },
  { id: 14, group: "C", home: "Haití",            away: "Escocia",        date: "13 Jun", sede: "Boston" },
  { id: 15, group: "C", home: "Escocia",          away: "Marruecos",      date: "19 Jun", sede: "Boston" },
  { id: 16, group: "C", home: "Brasil",           away: "Haití",          date: "19 Jun", sede: "Filadelfia" },
  { id: 17, group: "C", home: "Brasil",           away: "Escocia",        date: "26 Jun", sede: "Houston" },
  { id: 18, group: "C", home: "Marruecos",        away: "Haití",          date: "26 Jun", sede: "Miami" },
  // Grupo D
  { id: 19, group: "D", home: "Estados Unidos",   away: "Paraguay",       date: "12 Jun", sede: "Los Ángeles" },
  { id: 20, group: "D", home: "Australia",        away: "Turquía",        date: "13 Jun", sede: "Vancouver" },
  { id: 21, group: "D", home: "Estados Unidos",   away: "Australia",      date: "19 Jun", sede: "Seattle" },
  { id: 22, group: "D", home: "Turquía",          away: "Paraguay",       date: "19 Jun", sede: "San Francisco" },
  { id: 23, group: "D", home: "Estados Unidos",   away: "Turquía",        date: "26 Jun", sede: "Dallas" },
  { id: 24, group: "D", home: "Paraguay",         away: "Australia",      date: "26 Jun", sede: "Atlanta" },
  // Grupo E
  { id: 25, group: "E", home: "Alemania",         away: "Curazao",        date: "14 Jun", sede: "Houston" },
  { id: 26, group: "E", home: "Costa de Marfil",  away: "Ecuador",        date: "14 Jun", sede: "Filadelfia" },
  { id: 27, group: "E", home: "Alemania",         away: "Costa de Marfil", date: "20 Jun", sede: "Toronto" },
  { id: 28, group: "E", home: "Ecuador",          away: "Curazao",        date: "20 Jun", sede: "Kansas City" },
  { id: 29, group: "E", home: "Alemania",         away: "Ecuador",        date: "27 Jun", sede: "Los Ángeles" },
  { id: 30, group: "E", home: "Curazao",          away: "Costa de Marfil", date: "27 Jun", sede: "Nueva York" },
  // Grupo F
  { id: 31, group: "F", home: "Países Bajos",     away: "Japón",          date: "14 Jun", sede: "Dallas" },
  { id: 32, group: "F", home: "Suecia",           away: "Túnez",          date: "14 Jun", sede: "Monterrey" },
  { id: 33, group: "F", home: "Países Bajos",     away: "Suecia",         date: "20 Jun", sede: "Houston" },
  { id: 34, group: "F", home: "Túnez",            away: "Japón",          date: "20 Jun", sede: "Monterrey" },
  { id: 35, group: "F", home: "Países Bajos",     away: "Túnez",          date: "27 Jun", sede: "Seattle" },
  { id: 36, group: "F", home: "Japón",            away: "Suecia",         date: "27 Jun", sede: "Toronto" },
  // Grupo G
  { id: 37, group: "G", home: "Bélgica",          away: "Egipto",         date: "15 Jun", sede: "Seattle" },
  { id: 38, group: "G", home: "Arabia Saudí",     away: "Uruguay",        date: "15 Jun", sede: "Miami" },
  { id: 39, group: "G", home: "Bélgica",          away: "Arabia Saudí",   date: "21 Jun", sede: "Vancouver" },
  { id: 40, group: "G", home: "Uruguay",          away: "Egipto",         date: "21 Jun", sede: "Dallas" },
  { id: 41, group: "G", home: "Bélgica",          away: "Uruguay",        date: "28 Jun", sede: "Houston" },
  { id: 42, group: "G", home: "Egipto",           away: "Arabia Saudí",   date: "28 Jun", sede: "Boston" },
  // Grupo H
  { id: 43, group: "H", home: "España",           away: "Cabo Verde",     date: "15 Jun", sede: "Atlanta" },
  { id: 44, group: "H", home: "RI de Irán",       away: "Nueva Zelanda",  date: "15 Jun", sede: "Los Ángeles" },
  { id: 45, group: "H", home: "España",           away: "RI de Irán",     date: "21 Jun", sede: "Miami" },
  { id: 46, group: "H", home: "Nueva Zelanda",    away: "Cabo Verde",     date: "21 Jun", sede: "San Francisco" },
  { id: 47, group: "H", home: "España",           away: "Nueva Zelanda",  date: "28 Jun", sede: "Filadelfia" },
  { id: 48, group: "H", home: "Cabo Verde",       away: "RI de Irán",     date: "28 Jun", sede: "Kansas City" },
  // Grupo I
  { id: 49, group: "I", home: "Francia",          away: "Senegal",        date: "16 Jun", sede: "Nueva York" },
  { id: 50, group: "I", home: "Irak",             away: "Noruega",        date: "16 Jun", sede: "Boston" },
  { id: 51, group: "I", home: "Francia",          away: "Irak",           date: "22 Jun", sede: "Toronto" },
  { id: 52, group: "I", home: "Noruega",          away: "Senegal",        date: "22 Jun", sede: "Los Ángeles" },
  { id: 53, group: "I", home: "Francia",          away: "Noruega",        date: "29 Jun", sede: "Seattle" },
  { id: 54, group: "I", home: "Senegal",          away: "Irak",           date: "29 Jun", sede: "Atlanta" },
  // Grupo J
  { id: 55, group: "J", home: "Argentina",        away: "Argelia",        date: "16 Jun", sede: "Kansas City" },
  { id: 56, group: "J", home: "Austria",          away: "Jordania",       date: "16 Jun", sede: "San Francisco" },
  { id: 57, group: "J", home: "Argentina",        away: "Austria",        date: "22 Jun", sede: "Dallas" },
  { id: 58, group: "J", home: "Jordania",         away: "Argelia",        date: "22 Jun", sede: "Miami" },
  { id: 59, group: "J", home: "Argentina",        away: "Jordania",       date: "29 Jun", sede: "Houston" },
  { id: 60, group: "J", home: "Argelia",          away: "Austria",        date: "29 Jun", sede: "Filadelfia" },
  // Grupo K
  { id: 61, group: "K", home: "Portugal",         away: "RD Congo",       date: "17 Jun", sede: "Houston" },
  { id: 62, group: "K", home: "Uzbekistán",       away: "Colombia",       date: "17 Jun", sede: "Cd. de México" },
  { id: 63, group: "K", home: "Portugal",         away: "Uzbekistán",     date: "23 Jun", sede: "Los Ángeles" },
  { id: 64, group: "K", home: "Colombia",         away: "RD Congo",       date: "23 Jun", sede: "Miami" },
  { id: 65, group: "K", home: "Portugal",         away: "Colombia",       date: "30 Jun", sede: "Seattle" },
  { id: 66, group: "K", home: "RD Congo",         away: "Uzbekistán",     date: "30 Jun", sede: "Vancouver" },
  // Grupo L
  { id: 67, group: "L", home: "Inglaterra",       away: "Croacia",        date: "17 Jun", sede: "Dallas" },
  { id: 68, group: "L", home: "Ghana",            away: "Panamá",         date: "17 Jun", sede: "Toronto" },
  { id: 69, group: "L", home: "Inglaterra",       away: "Ghana",          date: "23 Jun", sede: "Nueva York" },
  { id: 70, group: "L", home: "Panamá",           away: "Croacia",        date: "23 Jun", sede: "Boston" },
  { id: 71, group: "L", home: "Inglaterra",       away: "Panamá",         date: "30 Jun", sede: "Filadelfia" },
  { id: 72, group: "L", home: "Croacia",          away: "Ghana",          date: "30 Jun", sede: "Kansas City" },
];

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
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [results, setResults] = useState({});
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

  useEffect(() => {
    (async () => {
      const u = await loadStorage("wc2026_users");
      const r = await loadStorage("wc2026_results");
      if (u) setUsers(u);
      if (r) setResults(r);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) saveStorage("wc2026_users", users);
  }, [users]);

  useEffect(() => {
    if (!loading) saveStorage("wc2026_results", results);
  }, [results]);

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

  const handleLogin = () => {
    const name = loginName.trim();
    if (!name) { setLoginError("Ingresa tu nombre"); return; }
    if (name.toLowerCase() === "admin") {
      setScreen("adminlogin"); return;
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

  const savePredictions = () => {
    const updated = {
      ...users,
      [currentUser]: { ...users[currentUser], predictions: { ...predictions } },
    };
    setUsers(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveResult = (matchId) => {
    const inp = adminInput[matchId];
    if (inp?.home === undefined || inp?.home === "" || inp?.away === undefined || inp?.away === "") return;
    setResults(r => ({ ...r, [matchId]: { home: Number(inp.home), away: Number(inp.away) } }));
    setAdminInput(a => {
      const n = { ...a }; delete n[matchId]; return n;
    });
  };

  const groupMatches = MATCHES.filter(m => m.group === selectedGroup);
  const ranking = getRanking();

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={{ fontSize: 64 }}>⚽</div>
      <p style={{ color: "#aaa", marginTop: 16 }}>Cargando...</p>
    </div>
  );

  if (screen === "login" || screen === "adminlogin") return (
    <div style={styles.root}>
      <div style={styles.loginWrap}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>🏆</div>
        <h1 style={styles.title}>MUNDIAL</h1>
        <h2 style={styles.subtitle}>2026 · Pronósticos</h2>
        <p style={{ color: "#aaa", marginBottom: 32, fontSize: 14 }}>México · Estados Unidos · Canadá</p>
        {screen === "login" ? (
          <>
            <input style={styles.input} placeholder="Tu nombre de usuario"
              value={loginName} onChange={e => setLoginName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
            {loginError && <p style={styles.error}>{loginError}</p>}
            <button style={styles.btn} onClick={handleLogin}>Entrar al torneo</button>
            <p style={{ color: "#666", fontSize: 12, marginTop: 16 }}>¿Eres administrador? Ingresa como "admin"</p>
          </>
        ) : (
          <>
            <p style={{ color: "#aaa", marginBottom: 8, fontSize: 14 }}>Contraseña de administrador</p>
            <input style={styles.input} type="password" placeholder="Contraseña"
              value={adminPwdInput} onChange={e => { setAdminPwdInput(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            {loginError && <p style={styles.error}>{loginError}</p>}
            <button style={styles.btn} onClick={handleAdminLogin}>Acceder</button>
            <button style={{ ...styles.btn, background: "#333", marginTop: 8 }} onClick={() => { setScreen("login"); setLoginError(""); setAdminPwdInput(""); }}>Volver</button>
          </>
        )}
      </div>
    </div>
  );

  if (screen === "home") return (
    <div style={styles.root}>
      <Nav user={currentUser} setScreen={setScreen} onLogout={() => { setCurrentUser(null); setScreen("login"); }} />
      <div style={styles.homeWrap}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>¡Hola, {currentUser}! 👋</h2>
        <p style={{ color: "#aaa", marginTop: 6, marginBottom: 32 }}>Ingresa tus pronósticos y sube al ranking</p>
        <div style={styles.cardGrid}>
          <HomeCard icon="⚽" title="Mis Pronósticos" desc="Predice los marcadores de los 72 partidos de grupo" color="#00c853" onClick={() => setScreen("predict")} />
          <HomeCard icon="🏆" title="Ranking" desc="Ve quién va ganando el torneo de pronósticos" color="#ffd600" onClick={() => setScreen("ranking")} />
        </div>
        <div style={styles.statsRow}>
          {(() => {
            const u = users[currentUser];
            let pts = 0, done = 0;
            MATCHES.forEach(m => {
              const pred = u?.predictions?.[m.id];
              const real = results[m.id];
              if (pred && pred.home !== undefined) done++;
              if (pred && real) { const p = calcPoints(pred, real); if (p) pts += p; }
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
        <div style={{ marginTop: 24, background: "#141824", borderRadius: 12, padding: "14px 18px" }}>
          <p style={{ color: "#888", fontSize: 12, margin: 0 }}>⚽ <b style={{color:"#ffd600"}}>72 partidos</b> · Fase de grupos · 12 Grupos (A–L) · Del 11 Jun al 30 Jun 2026</p>
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
              <div key={m.id} style={{ ...styles.matchCard, ...(pts === 3 ? styles.exactMatch : pts === 1 ? styles.correctMatch : pts === 0 && real ? styles.wrongMatch : {}) }}>
                <div style={styles.matchMeta}>{m.date} · {m.sede}</div>
                <div style={styles.matchRow}>
                  <span style={styles.team}>{FLAGS[m.home]} {m.home}</span>
                  <div style={styles.scoreInputs}>
                    <input type="number" min="0" max="20" style={styles.scoreInput}
                      value={pred.home ?? ""}
                      onChange={e => setPredictions(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value === "" ? undefined : Number(e.target.value) } }))}
                      placeholder="0" />
                    <span style={styles.vs}>:</span>
                    <input type="number" min="0" max="20" style={styles.scoreInput}
                      value={pred.away ?? ""}
                      onChange={e => setPredictions(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value === "" ? undefined : Number(e.target.value) } }))}
                      placeholder="0" />
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, fontSize: 12 }}>
          <span style={styles.badge3}>🎯 Marcador exacto = 3 pts</span>
          <span style={styles.badge1}>✅ Resultado correcto = 1 pt</span>
        </div>
        {ranking.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: 40 }}>Aún no hay participantes registrados.</p>
        ) : (
          <div style={styles.rankList}>
            {ranking.map((r, i) => (
              <div key={r.name} style={{ ...styles.rankCard, ...(r.name === currentUser ? styles.rankCardMe : {}), ...(i === 0 ? styles.rankFirst : i === 1 ? styles.rankSecond : i === 2 ? styles.rankThird : {}) }}>
                <span style={styles.rankPos}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                <span style={styles.rankName}>{r.name}{r.name === currentUser ? " (tú)" : ""}</span>
                <div style={styles.rankStats}>
                  <span style={styles.rankPts}>{r.pts} pts</span>
                  <span style={{ display: "block", fontSize: 11, color: "#666", marginTop: 2 }}>🎯 {r.exact} · ✅ {r.correct}</span>
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
        <p style={{ color: "#aaa", marginBottom: 20, fontSize: 14 }}>Ingresa los resultados reales de los partidos</p>
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
            const saved = results[m.id] !== undefined && adminInput[m.id] === undefined;
            return (
              <div key={m.id} style={{ ...styles.matchCard, ...(saved ? { borderColor: "#00c853" } : {}) }}>
                <div style={styles.matchMeta}>{m.date} · {m.sede} {saved && <span style={{ color: "#00c853" }}>✓ Guardado</span>}</div>
                <div style={styles.matchRow}>
                  <span style={styles.team}>{FLAGS[m.home]} {m.home}</span>
                  <div style={styles.scoreInputs}>
                    <input type="number" min="0" style={styles.scoreInput}
                      value={inp.home !== undefined ? inp.home : (real.home !== undefined ? real.home : "")}
                      onChange={e => setAdminInput(a => ({ ...a, [m.id]: { ...a[m.id], home: e.target.value } }))}
                      placeholder="0" />
                    <span style={styles.vs}>:</span>
                    <input type="number" min="0" style={styles.scoreInput}
                      value={inp.away !== undefined ? inp.away : (real.away !== undefined ? real.away : "")}
                      onChange={e => setAdminInput(a => ({ ...a, [m.id]: { ...a[m.id], away: e.target.value } }))}
                      placeholder="0" />
                  </div>
                  <span style={{ ...styles.team, textAlign: "right" }}>{FLAGS[m.away]} {m.away}</span>
                </div>
                <button style={{ display: "block", marginTop: 10, padding: "8px 20px", borderRadius: 8, border: "none", background: "#1565c0", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => saveResult(m.id)}>
                  {results[m.id] ? "✓ Actualizar resultado" : "Guardar resultado"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Nav({ user, setScreen, onLogout, isAdmin }) {
  return (
    <nav style={styles.nav}>
      <span style={styles.navLogo}>⚽ Mundial 2026</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {!isAdmin && <>
          <button style={styles.navBtn} onClick={() => setScreen("home")}>Inicio</button>
          <button style={styles.navBtn} onClick={() => setScreen("predict")}>Pronósticos</button>
          <button style={styles.navBtn} onClick={() => setScreen("ranking")}>Ranking</button>
        </>}
        <span style={{ color: "#ffd600", fontSize: 13, fontWeight: 600, padding: "0 8px" }}>{user}</span>
        <button style={{ background: "#1f2937", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13, padding: "6px 12px", borderRadius: 6 }} onClick={onLogout}>Salir</button>
      </div>
    </nav>
  );
}

function HomeCard({ icon, title, desc, color, onClick }) {
  return (
    <div style={{ ...styles.hCard, borderTop: `4px solid ${color}` }} onClick={onClick}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#aaa", fontSize: 13 }}>{desc}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#ffd600" }}>{value}</div>
      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0a0e1a", color: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0e1a" },
  loginWrap: { maxWidth: 400, margin: "0 auto", padding: "60px 24px", textAlign: "center" },
  title: { fontSize: 48, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: 4 },
  subtitle: { fontSize: 20, color: "#ffd600", margin: "4px 0 16px", fontWeight: 600 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 10, border: "2px solid #333", background: "#141824", color: "#fff", fontSize: 16, marginBottom: 12, boxSizing: "border-box", outline: "none" },
  btn: { width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "#00c853", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 1 },
  error: { color: "#ff5252", fontSize: 13, marginBottom: 8 },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#111827", borderBottom: "1px solid #1f2937", flexWrap: "wrap", gap: 8 },
  navLogo: { fontWeight: 900, fontSize: 18, color: "#ffd600" },
  navBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: "6px 10px", borderRadius: 6 },
  homeWrap: { maxWidth: 700, margin: "0 auto", padding: "32px 16px" },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 },
  hCard: { background: "#141824", borderRadius: 14, padding: "24px 20px", cursor: "pointer", userSelect: "none" },
  statsRow: { display: "flex", gap: 16 },
  stat: { flex: 1, background: "#141824", borderRadius: 12, padding: "16px", textAlign: "center" },
  content: { maxWidth: 700, margin: "0 auto", padding: "24px 16px" },
  sectionTitle: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  groupTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 },
  groupTab: { padding: "6px 14px", borderRadius: 20, border: "2px solid #333", background: "none", color: "#aaa", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  groupTabActive: { background: "#ffd600", borderColor: "#ffd600", color: "#0a0e1a" },
  matchList: { display: "flex", flexDirection: "column", gap: 12 },
  matchCard: { background: "#141824", borderRadius: 12, padding: "14px 16px", border: "2px solid transparent" },
  exactMatch: { border: "2px solid #00c853", background: "#0a1f10" },
  correctMatch: { border: "2px solid #ffd600", background: "#1a1800" },
  wrongMatch: { border: "2px solid #444" },
  matchMeta: { color: "#666", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  matchRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  team: { flex: 1, fontSize: 13, fontWeight: 600 },
  scoreInputs: { display: "flex", alignItems: "center", gap: 6 },
  scoreInput: { width: 44, padding: "8px 4px", textAlign: "center", borderRadius: 8, border: "2px solid #333", background: "#0d1117", color: "#fff", fontSize: 16, fontWeight: 700, outline: "none" },
  vs: { color: "#555", fontWeight: 700 },
  realScore: { marginTop: 10, fontSize: 12, color: "#888", textAlign: "center" },
  badge3: { background: "#00c853", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700 },
  badge1: { background: "#ffd600", color: "#000", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700 },
  badge0: { background: "#444", color: "#ccc", borderRadius: 4, padding: "2px 6px", fontSize: 11 },
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
};

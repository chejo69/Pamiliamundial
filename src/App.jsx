import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modoLogin, setModoLogin] = useState(true)
  const [errorAuth, setErrorAuth] = useState('')
  const [pronosticos, setPronosticos] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [mostrarSettings, setMostrarSettings] = useState(false)
  const [esAdmin, setEsAdmin] = useState(false)

  // Estados para los valores de los inputs (usando un objeto)
  const [valoresLocales, setValoresLocales] = useState({})
  const [valoresVisitantes, setValoresVisitantes] = useState({})

  // Cargar partidos y verificar sesión al iniciar
  useEffect(() => {
    cargarPartidos()
    verificarSesion()
  }, [])

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUsuario(session.user)
      await verificarRolAdmin(session.user.id)
      await cargarPronosticosUsuario(session.user.id)
    }
    setCargando(false)
  }

  async function verificarRolAdmin(userId) {
    const { data } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()
    
    if (data?.rol === 'admin') {
      setEsAdmin(true)
    }
  }

  async function cargarPartidos() {
    const { data, error } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: true })
    
    if (!error && data) {
      setPartidos(data)
    }
  }

  async function cargarPronosticosUsuario(userId) {
    const { data, error } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('usuario_id', userId)
    
    if (!error && data) {
      const pronosMap = {}
      const localesMap = {}
      const visitantesMap = {}
      
      data.forEach(p => {
        pronosMap[p.partido_id] = {
          local: p.goles_local_pronostico,
          visitante: p.goles_visitante_pronostico
        }
        localesMap[p.partido_id] = p.goles_local_pronostico
        visitantesMap[p.partido_id] = p.goles_visitante_pronostico
      })
      
      setPronosticos(pronosMap)
      setValoresLocales(localesMap)
      setValoresVisitantes(visitantesMap)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setErrorAuth('')
    
    let result
    if (modoLogin) {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
      if (!result.error) {
        await supabase.from('usuarios').insert([
          { id: result.data.user.id, email, nombre: email.split('@')[0], rol: 'usuario', activo: true }
        ])
      }
    }
    
    if (result.error) {
      setErrorAuth(result.error.message)
    } else {
      setUsuario(result.data.user)
      await verificarRolAdmin(result.data.user.id)
      await cargarPronosticosUsuario(result.data.user.id)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUsuario(null)
    setPronosticos({})
    setEsAdmin(false)
    setValoresLocales({})
    setValoresVisitantes({})
  }

  function actualizarValorLocal(partidoId, valor) {
    setValoresLocales(prev => ({ ...prev, [partidoId]: valor }))
  }

  function actualizarValorVisitante(partidoId, valor) {
    setValoresVisitantes(prev => ({ ...prev, [partidoId]: valor }))
  }

  async function guardarPronostico(partidoId) {
    const partido = partidos.find(p => p.id === partidoId)
    if (!partido) return

    const golesLocal = valoresLocales[partidoId]
    const golesVisitante = valoresVisitantes[partidoId]

    if (golesLocal === undefined || golesVisitante === undefined) {
      setMensaje('⚠️ Ingresa ambos marcadores')
      setTimeout(() => setMensaje(''), 2000)
      return
    }

    // Verificar si faltan menos de 10 minutos para el partido
    const ahora = new Date()
    const fechaHoraPartido = new Date(`${partido.fecha}T${partido.hora_guatemala}:00`)
    const minutosDiferencia = (fechaHoraPartido - ahora) / 1000 / 60
    
    if (minutosDiferencia < 10 && minutosDiferencia > 0) {
      setMensaje('⚠️ No se puede modificar el pronóstico 10 minutos antes del partido')
      setTimeout(() => setMensaje(''), 3000)
      return
    }

    const { error } = await supabase
      .from('pronosticos')
      .upsert({
        usuario_id: usuario.id,
        partido_id: partidoId,
        goles_local_pronostico: parseInt(golesLocal),
        goles_visitante_pronostico: parseInt(golesVisitante),
        fecha_pronostico: new Date(),
        bloqueado: minutosDiferencia < 10
      })
    
    if (error) {
      setMensaje('❌ Error al guardar')
      console.error(error)
    } else {
      setMensaje('✅ Pronóstico guardado')
      await cargarPronosticosUsuario(usuario.id)
    }
    setTimeout(() => setMensaje(''), 2000)
  }

  // Pantalla de login
  if (!usuario) {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h1>🏆 Mundial 2026</h1>
          <h3>{modoLogin ? 'Iniciar Sesión' : 'Registrarse'}</h3>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            {errorAuth && <p style={styles.error}>{errorAuth}</p>}
            <button type="submit" style={styles.button}>
              {modoLogin ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>
          <p style={styles.link} onClick={() => setModoLogin(!modoLogin)}>
            {modoLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </p>
        </div>
      </div>
    )
  }

  // Pantalla principal
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1>🏆 Mundial 2026</h1>
        <div style={styles.headerRight}>
          <span>👤 {usuario.email}</span>
          {esAdmin && (
            <button 
              style={styles.settingsButton}
              onClick={() => setMostrarSettings(!mostrarSettings)}
            >
              ⚙️ Settings
            </button>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            Salir
          </button>
        </div>
      </div>

      {/* Panel de Settings (solo admin) */}
      {mostrarSettings && esAdmin && (
        <div style={styles.settingsPanel}>
          <h3>⚙️ Panel de Administrador</h3>
          <p>✅ Aquí podrás gestionar partidos y usuarios en la próxima versión.</p>
          <p><strong>Funcionalidades próximas:</strong></p>
          <ul>
            <li>Agregar/Editar partidos</li>
            <li>Ver todos los pronósticos de los usuarios</li>
            <li>Gestionar usuarios (activar/desactivar)</li>
          </ul>
        </div>
      )}

      {/* Mensaje flotante */}
      {mensaje && <div style={styles.toast}>{mensaje}</div>}

      {/* Lista de partidos */}
      <div style={styles.partidosContainer}>
        <h2>📅 Partidos del Mundial 2026</h2>
        {cargando ? (
          <p>Cargando...</p>
        ) : (
          <div style={styles.grid}>
            {partidos.map(partido => {
              const pronostico = pronosticos[partido.id]
              
              return (
                <div key={partido.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.fecha}>📅 {partido.fecha}</span>
                    <span style={styles.hora}>🕐 {partido.hora_guatemala}</span>
                  </div>
                  <div style={styles.equipos}>
                    <div style={styles.equipo}>{partido.equipo_local}</div>
                    <div style={styles.vs}>vs</div>
                    <div style={styles.equipo}>{partido.equipo_visitante}</div>
                  </div>
                  <div style={styles.lugar}>📍 {partido.lugar}</div>
                  
                  <div style={styles.pronostico}>
                    <input
                      type="number"
                      placeholder="0"
                      value={valoresLocales[partido.id] || ''}
                      onChange={(e) => actualizarValorLocal(partido.id, e.target.value)}
                      style={styles.scoreInput}
                      min="0"
                    />
                    <span style={styles.guion}>-</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={valoresVisitantes[partido.id] || ''}
                      onChange={(e) => actualizarValorVisitante(partido.id, e.target.value)}
                      style={styles.scoreInput}
                      min="0"
                    />
                    <button 
                      onClick={() => guardarPronostico(partido.id)}
                      style={styles.guardarButton}
                    >
                      Guardar
                    </button>
                  </div>
                  
                  {pronostico && (
                    <div style={styles.guardado}>
                      ✅ Tu pronóstico: {pronostico.local} - {pronostico.visitante}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos CSS
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(0,0,0,0.3)',
    flexWrap: 'wrap',
    gap: '15px',
  },
  headerRight: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logoutButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  settingsButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  settingsPanel: {
    background: '#2c3e50',
    margin: '20px 40px',
    padding: '20px',
    borderRadius: '10px',
  },
  partidosContainer: {
    padding: '20px 40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '15px',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#ccc',
  },
  equipos: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  equipo: {
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    padding: '0 10px',
    color: '#f39c12',
  },
  lugar: {
    fontSize: '12px',
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '15px',
  },
  pronostico: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  scoreInput: {
    width: '60px',
    padding: '8px',
    textAlign: 'center',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
  },
  guion: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  guardarButton: {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  guardado: {
    fontSize: '12px',
    textAlign: 'center',
    color: '#2ecc71',
    marginTop: '10px',
  },
  loginBox: {
    background: 'rgba(255,255,255,0.1)',
    padding: '40px',
    borderRadius: '10px',
    width: '350px',
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },
  input: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    color: '#e74c3c',
    fontSize: '14px',
    margin: '0',
  },
  link: {
    marginTop: '15px',
    color: '#3498db',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#2ecc71',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '5px',
    zIndex: 1000,
  },
}

export default App
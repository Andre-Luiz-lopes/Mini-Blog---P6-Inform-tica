import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('username')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <div className="nav">
      <div className="nav-inner">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/posts"><strong>MiniBlog N1</strong></Link>
          <span className="badge">React + Node</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/posts">Todos os Posts</Link>
          {token && <Link to="/create">Criar Post</Link>}
          {!token && <Link to="/signup">Cadastro</Link>}
          {!token && <Link to="/login">Login</Link>}
          {token && <button className="btn secondary" onClick={logout}>Sair ({user})</button>}
        </div>
      </div>
    </div>
  )
}

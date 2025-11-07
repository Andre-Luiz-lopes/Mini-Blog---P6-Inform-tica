import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim()) return setError('Informe um username.')
    if (!password) return setError('Informe a senha.')

    try {
      setLoading(true)
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      navigate('/posts')
    } catch (e) {
      setError(e?.response?.data?.error || 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  )
}

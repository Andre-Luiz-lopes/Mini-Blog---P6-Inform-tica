import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Título é obrigatório.')
    if (!body.trim()) return setError('Texto é obrigatório.')

    try {
      setLoading(true)
      await api.post('/posts', { title, body })
      navigate('/posts')
    } catch (e) {
      setError(e?.response?.data?.error || 'Falha ao criar post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Criar Post</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        <input className="input" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="textarea" placeholder="Conteúdo" rows={8} value={body} onChange={e => setBody(e.target.value)} />
        <button className="btn primary" disabled={loading}>{loading ? 'Enviando...' : 'Publicar'}</button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')

  async function load() {
    try {
      setLoading(true)
      setError('')
      const p = await api.get(`/posts/${id}`)
      setPost(p.data)
      const c = await api.get(`/comments/${id}`)
      setComments(c.data)
    } catch (e) {
      setError('Falha ao carregar post.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function submitComment(e) {
    e.preventDefault()
    setError('')
    if (!text.trim()) return setError('Comentário não pode ser vazio.')
    try {
      await api.post('/comments', { text, postId: Number(id) })
      setText('')
      load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Falha ao comentar.')
    }
  }

  if (loading) return <p>Carregando...</p>
  if (!post) return <p>Post não encontrado.</p>

  return (
    <div>
      <div className="card">
        <h2 style={{ margin: '6px 0' }}>{post.title}</h2>
        <p style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>{post.body}</p>
        <small className="muted">por {post.author} • {new Date(post.createdAt).toLocaleString()}</small>
      </div>

      <div className="card">
        <h3>Comentários ({comments.length})</h3>
        {comments.length === 0 && <p>Seja o primeiro a comentar.</p>}
        {comments.map(c => (
          <div key={c.id} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
            <p style={{ marginBottom: 4 }}>{c.text}</p>
            <small className="muted">por {c.author} • {new Date(c.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {token && (
        <div className="card">
          <h3>Novo comentário</h3>
          <ErrorMessage message={error} />
          <form onSubmit={submitComment}>
            <textarea className="textarea" rows={4} placeholder="Digite seu comentário..." value={text} onChange={e => setText(e.target.value)} />
            <button className="btn primary">Comentar</button>
          </form>
        </div>
      )}
      {!token && <p>Faça login para comentar.</p>}
    </div>
  )
}

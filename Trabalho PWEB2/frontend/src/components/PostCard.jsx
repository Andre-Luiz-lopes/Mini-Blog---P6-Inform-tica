import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  return (
    <div className="card">
      <h3 style={{ margin: '6px 0' }}>{post.title}</h3>
      <p style={{ marginTop: 0 }}>{post.body.slice(0, 160)}{post.body.length > 160 ? '...' : ''}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small className="muted">por {post.author} • {new Date(post.createdAt).toLocaleString()}</small>
        <Link to={`/posts/${post.id}`}>Ler mais</Link>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import ErrorMessage from '../components/ErrorMessage'

export default function AllPosts() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get(`/posts?page=${page}&limit=5`)
      setPosts(data.data)
      setTotalPages(data.totalPages)
    } catch (e) {
      setError('Falha ao carregar posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  return (
    <div>
      <h2>Todos os Posts</h2>
      <ErrorMessage message={error} />
      {loading && <p>Carregando...</p>}
      {!loading && posts.map(p => <PostCard key={p.id} post={p} />)}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => (p < totalPages ? p + 1 : p))}
      />
    </div>
  )
}

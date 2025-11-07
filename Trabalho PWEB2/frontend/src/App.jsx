import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AllPosts from './pages/AllPosts'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Signup from './pages/Signup'
import Login from './pages/Login'

function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<AllPosts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

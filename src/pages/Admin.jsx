import React, { useState, useEffect, useRef } from 'react'
import './Admin.css'
import { api } from '../lib/api'

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('ko-KR')
  } catch {
    return value
  }
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState({ loading: true, error: '' })
  const [currentAdminId, setCurrentAdminId] = useState(null)
  const tokenRef = useRef('')

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const token = localStorage.getItem('authToken') || ''
    if (!userInfo?.isAdmin || !token) {
      alert('관리자 권한이 필요합니다.')
      window.location.href = '/'
      return
    }
    tokenRef.current = token
    setCurrentAdminId(userInfo.id || null)
    loadInitialData(token)
  }, [])

  const loadInitialData = async (token = tokenRef.current) => {
    setStatus(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const [usersRes, productsRes, reviewsRes, postsRes] = await Promise.all([
        api.admin.listUsers(token),
        api.admin.listProducts(token),
        api.admin.listReviews(token),
        api.admin.listPosts(token)
      ])

      setUsers(
        (usersRes || []).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.is_admin === 1 ? 'admin' : 'customer',
          isAdmin: u.is_admin === 1,
          isBlocked: u.is_blocked === 1,
          joinDate: (u.created_at || '').slice(0, 10)
        }))
      )

      setProducts(
        (productsRes || []).map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price_cents || 0,
          category: p.category_name || p.category || '미분류',
          isActive: p.is_active === 1,
          createdAt: p.created_at
        }))
      )

      setReviews(
        (reviewsRes || []).map(r => ({
          id: r.id,
          productId: r.product_id,
          productName: r.product_name,
          userName: r.user_name,
          userEmail: r.user_email,
          rating: r.rating,
          comment: r.content,
          isActive: r.is_active === 1,
          date: formatDate(r.created_at)
        }))
      )

      setPosts(
        (postsRes || []).map(p => ({
          id: p.id,
          title: p.title,
          authorName: p.author_name,
          authorEmail: p.author_email,
          isActive: p.is_active === 1,
          date: formatDate(p.created_at)
        }))
      )

      setStatus({ loading: false, error: '' })
    } catch (err) {
      console.error(err)
      setStatus({ loading: false, error: err?.message || '데이터를 불러오지 못했습니다.' })
    }
  }

  const handleUserBlockToggle = async (userId) => {
    const token = tokenRef.current
    const user = users.find(u => u.id === userId)
    if (!token || !user) return
    try {
      await api.admin.setUserBlocked(token, userId, !user.isBlocked)
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
      )
    } catch (err) {
      alert(err?.message || '차단 상태 변경에 실패했습니다.')
    }
  }

  const handleRoleToggle = async (userId) => {
    const token = tokenRef.current
    const user = users.find(u => u.id === userId)
    if (!token || !user) return
    if (userId === currentAdminId && user.isAdmin) {
      alert('본인 계정의 관리자 권한은 다른 관리자가 해제해야 합니다.')
      return
    }
    const nextRole = user.isAdmin ? 'customer' : 'admin'
    try {
      await api.admin.setUserRole(token, userId, nextRole)
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isAdmin: !u.isAdmin, role: nextRole } : u
        )
      )
    } catch (err) {
      alert(err?.message || '권한 변경에 실패했습니다.')
    }
  }

  const toggleProductStatus = async (productId) => {
    const token = tokenRef.current
    const product = products.find(p => p.id === productId)
    if (!token || !product) return
    try {
      await api.admin.setProductStatus(token, productId, !product.isActive)
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
      )
    } catch (err) {
      alert(err?.message || '상품 상태 변경에 실패했습니다.')
    }
  }

  const deleteReview = async (reviewId) => {
    const token = tokenRef.current
    if (!token) return
    if (!window.confirm('해당 리뷰를 비활성화하시겠습니까?')) return
    try {
      await api.admin.deleteReview(token, reviewId)
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (err) {
      alert(err?.message || '리뷰 삭제에 실패했습니다.')
    }
  }

  const togglePostStatus = async (postId) => {
    const token = tokenRef.current
    const post = posts.find(p => p.id === postId)
    if (!token || !post) return
    try {
      await api.admin.setPostStatus(token, postId, !post.isActive)
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, isActive: !p.isActive } : p))
      )
    } catch (err) {
      alert(err?.message || '게시글 상태 변경에 실패했습니다.')
    }
  }

  const renderUsersTab = () => (
    <div className="admin-content">
      <h3>회원 관리</h3>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>권한</th>
              <th>상태</th>
              <th>가입일</th>
              <th>권한 관리</th>
              <th>차단</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? '관리자' : '일반'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                    {user.isBlocked ? '차단' : '활성'}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    disabled={user.id === currentAdminId && user.isAdmin}
                    onClick={() => handleRoleToggle(user.id)}
                  >
                    {user.isAdmin ? '관리자 해제' : '관리자 지정'}
                  </button>
                </td>
                <td>
                  <button
                    className={`btn ${user.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                    onClick={() => handleUserBlockToggle(user.id)}
                  >
                    {user.isBlocked ? '차단 해제' : '차단'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProductsTab = () => (
    <div className="admin-content">
      <h3>상품 관리</h3>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>상품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price.toLocaleString()}원</td>
                <td>
                  <span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>{formatDate(product.createdAt)}</td>
                <td>
                  <button
                    className={`btn ${product.isActive ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleProductStatus(product.id)}
                  >
                    {product.isActive ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderReviewsTab = () => (
    <div className="admin-content">
      <h3>리뷰 관리</h3>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>상품</th>
              <th>사용자</th>
              <th>평점</th>
              <th>내용</th>
              <th>상태</th>
              <th>작성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.productName}</td>
                <td>
                  {review.userName}
                  <br />
                  <span className="muted">{review.userEmail}</span>
                </td>
                <td>
                  <span className="rating">⭐ {review.rating}</span>
                </td>
                <td className="comment-cell">{review.comment || '-'}</td>
                <td>
                  <span className={`badge ${review.isActive ? 'active' : 'inactive'}`}>
                    {review.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>{review.date}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => deleteReview(review.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPostsTab = () => (
    <div className="admin-content">
      <h3>게시글 관리</h3>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>작성자</th>
              <th>상태</th>
              <th>작성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>
                  {post.authorName}
                  <br />
                  <span className="muted">{post.authorEmail}</span>
                </td>
                <td>
                  <span className={`badge ${post.isActive ? 'active' : 'inactive'}`}>
                    {post.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>{post.date}</td>
                <td>
                  <button
                    className={`btn ${post.isActive ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => togglePostStatus(post.id)}
                  >
                    {post.isActive ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🔧 관리자 페이지</h1>
        <p>DevShop 관리자 도구</p>
        <button className="btn btn-secondary" onClick={() => loadInitialData()}>
          새로고침
        </button>
      </div>

      {status.error && <div className="admin-alert error">{status.error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          회원 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          상품 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          리뷰 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          게시글 관리
        </button>
      </div>

      <div className="admin-main">
        {status.loading ? (
          <div className="admin-loading">데이터를 불러오는 중...</div>
        ) : (
          <>
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'products' && renderProductsTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
            {activeTab === 'posts' && renderPostsTab()}
          </>
        )}
      </div>
    </div>
  )
}

export default Admin


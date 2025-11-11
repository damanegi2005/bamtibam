import React, { useState, useEffect } from 'react'
import './Admin.css'
import { api } from '../lib/api'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    // 관리자 권한 체크
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (!userInfo.isAdmin) {
      alert('관리자 권한이 필요합니다.')
      window.location.href = '/'
      return
    }

    // 실제 데이터 로드
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // 사용자 목록
      const token = localStorage.getItem('authToken') || ''
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const usersList = await res.json()
      const normalizedUsers = (usersList || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isAdmin: u.is_admin === 1,
        isBlocked: u.is_blocked === 1,
        joinDate: (u.created_at || '').slice(0, 10)
      }))
      setUsers(normalizedUsers)
      // 상품 목록 (간단히)
      const productsList = await api.listProducts()
      const normalizedProducts = (productsList || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price_cents || 0,
        category: p.category,
        isActive: p.is_active === 1 || p.is_active === true
      }))
      setProducts(normalizedProducts)
    } catch {
      // 무시
    }
  }

  const toggleUserBlock = (userId) => {
    const token = localStorage.getItem('authToken') || ''
    const user = users.find(u => u.id === userId)
    if (!user) return
    const endpoint = user.isBlocked ? `/users/${userId}/unblock` : `/users/${userId}/block`
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}${endpoint}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
      })
      .catch(() => {
        alert('처리 실패했습니다.')
      })
  }

  const toggleProductStatus = (productId) => {
    setProducts(products.map(product => 
      product.id === productId ? { ...product, isActive: !product.isActive } : product
    ))
  }

  const deleteReview = (reviewId) => {
    setReviews(reviews.filter(review => review.id !== reviewId))
  }

  const togglePostStatus = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isActive: !post.isActive } : post
    ))
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
              <th>액션</th>
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
                    className={`btn ${user.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                    onClick={() => toggleUserBlock(user.id)}
                  >
                    {user.isBlocked ? '차단해제' : '차단'}
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
              <th>가격</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString()}원</td>
                <td>{product.category}</td>
                <td>
                  <span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? '활성' : '비활성'}
                  </span>
                </td>
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
              <th>상품ID</th>
              <th>사용자</th>
              <th>평점</th>
              <th>댓글</th>
              <th>신고</th>
              <th>날짜</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.productId}</td>
                <td>{review.userName}</td>
                <td>
                  <span className="rating">⭐ {review.rating}</span>
                </td>
                <td className="comment-cell">{review.comment}</td>
                <td>
                  <span className={`badge ${review.isReported ? 'reported' : 'normal'}`}>
                    {review.isReported ? '신고됨' : '정상'}
                  </span>
                </td>
                <td>{review.date}</td>
                <td>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteReview(review.id)}
                  >
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
              <th>카테고리</th>
              <th>조회수</th>
              <th>상태</th>
              <th>날짜</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.author}</td>
                <td>{post.category}</td>
                <td>{post.views}</td>
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
      </div>

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
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'posts' && renderPostsTab()}
      </div>
    </div>
  )
}

export default Admin


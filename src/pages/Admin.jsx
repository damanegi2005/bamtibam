import React, { useState, useEffect } from 'react'
import './Admin.css'

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

    // 임시 데이터 로드
    loadMockData()
  }, [])

  const loadMockData = () => {
    // 임시 사용자 데이터
    const mockUsers = [
      { id: 1, name: '관리자', email: 'admin@devshop.com', isAdmin: true, isBlocked: false, joinDate: '2024-01-01' },
      { id: 2, name: '사용자', email: 'user@devshop.com', isAdmin: false, isBlocked: false, joinDate: '2024-01-15' },
      { id: 3, name: '김개발', email: 'kim@devshop.com', isAdmin: false, isBlocked: false, joinDate: '2024-02-01' },
      { id: 4, name: '박코딩', email: 'park@devshop.com', isAdmin: false, isBlocked: true, joinDate: '2024-02-10' },
      { id: 5, name: '이건강', email: 'lee@devshop.com', isAdmin: false, isBlocked: false, joinDate: '2024-02-20' }
    ]

    // 임시 상품 데이터
    const mockProducts = [
      { id: 1, name: 'ChatGPT Plus 구독', price: 20000, category: 'ai', isActive: true },
      { id: 2, name: '비타민 D3 2000IU', price: 25000, category: 'health', isActive: true },
      { id: 3, name: 'MacBook Air M2', price: 1500000, category: 'electronics', isActive: true },
      { id: 4, name: '영어 회화 마스터 코스', price: 150000, category: 'language', isActive: false }
    ]

    // 임시 리뷰 데이터
    const mockReviews = [
      { id: 1, productId: 1, userName: '김개발', rating: 5, comment: '정말 유용합니다!', date: '2024-03-01', isReported: false },
      { id: 2, productId: 1, userName: '박코딩', rating: 4, comment: '가격 대비 만족합니다.', date: '2024-03-02', isReported: false },
      { id: 3, productId: 2, userName: '이건강', rating: 5, comment: '건강이 좋아졌어요!', date: '2024-03-03', isReported: true },
      { id: 4, productId: 3, userName: '최개발', rating: 5, comment: '성능이 정말 좋습니다!', date: '2024-03-04', isReported: false }
    ]

    // 임시 게시글 데이터
    const mockPosts = [
      { id: 1, title: 'AI 도구 추천', author: '김개발', category: 'ai', views: 150, isActive: true, date: '2024-03-01' },
      { id: 2, title: '건강 관리 팁', author: '이건강', category: 'health', views: 89, isActive: true, date: '2024-03-02' },
      { id: 3, title: '스팸 게시글', author: '스팸머', category: 'electronics', views: 5, isActive: false, date: '2024-03-03' }
    ]

    setUsers(mockUsers)
    setProducts(mockProducts)
    setReviews(mockReviews)
    setPosts(mockPosts)
  }

  const toggleUserBlock = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
    ))
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


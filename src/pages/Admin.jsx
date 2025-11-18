import React, { useState, useEffect } from 'react'
import './Admin.css'
import { api } from '../lib/api'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders')
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [orders, setOrders] = useState([])

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
      const token = localStorage.getItem('authToken') || ''
      const [
        usersList,
        productsList,
        reviewsList,
        ordersList
      ] = await Promise.all([
        api.adminListUsers(token),
        api.adminListProducts(token),
        api.adminListReviews(token),
        api.adminListOrders(token)
      ])

      const normalizedUsers = (usersList || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isAdmin: u.is_admin === 1,
        isBlocked: u.is_blocked === 1,
        joinDate: (u.created_at || '').slice(0, 10)
      }))
      setUsers(normalizedUsers)

      const normalizedProducts = (productsList || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price_cents || 0,
        category: p.category,
        isActive: p.is_active === 1 || p.is_active === true
      }))
      setProducts(normalizedProducts)

      const normalizedReviews = (reviewsList || []).map(r => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        userName: r.user_name,
        rating: r.rating,
        comment: r.content,
        date: (r.created_at || '').slice(0, 16).replace('T', ' ')
      }))
      setReviews(normalizedReviews)

      const normalizedOrders = (ordersList || []).map(o => ({
        id: o.id,
        userId: o.user_id,
        userName: o.user_name || '알 수 없음',
        status: o.status,
        totalCents: o.total_cents || 0,
        date: (o.created_at || '').slice(0, 16).replace('T', ' ')
      }))
      setOrders(normalizedOrders)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleUserBlock = async (userId) => {
    const token = localStorage.getItem('authToken') || ''
    const user = users.find(u => u.id === userId)
    if (!user) return
    try {
      if (user.isBlocked) {
        await api.adminUnblockUser(token, userId)
      } else {
        await api.adminBlockUser(token, userId)
      }
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
    } catch {
      alert('처리 실패했습니다.')
    }
  }

  const toggleProductStatus = async (productId) => {
    const token = localStorage.getItem('authToken') || ''
    const product = products.find(p => p.id === productId)
    if (!product) return
    
    try {
      await api.adminToggleProduct(token, productId, !product.isActive)
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isActive: !p.isActive } : p
      ))
      alert(`상품이 ${!product.isActive ? '활성화' : '비활성화'}되었습니다.`)
    } catch (err) {
      alert(err?.message || '상품 상태 변경에 실패했습니다.')
    }
  }

  const deleteUser = async (userId) => {
    const token = localStorage.getItem('authToken') || ''
    if (!window.confirm('정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      await api.adminDeleteUser(token, userId)
      setUsers(users.filter(user => user.id !== userId))
      alert('사용자가 삭제되었습니다.')
    } catch {
      alert('사용자 삭제에 실패했습니다.')
    }
  }

  const deleteReview = async (reviewId) => {
    const token = localStorage.getItem('authToken') || ''
    if (!window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) return
    try {
      await api.adminDeleteReview(token, reviewId)
      setReviews(reviews.filter(review => review.id !== reviewId))
      alert('리뷰가 삭제되었습니다.')
    } catch {
      alert('리뷰 삭제에 실패했습니다.')
    }
  }

  const deleteProduct = async (productId) => {
    const token = localStorage.getItem('authToken') || ''
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      await api.adminDeleteProduct(token, productId)
      setProducts(products.filter(product => product.id !== productId))
      alert('상품이 삭제되었습니다.')
    } catch {
      alert('상품 삭제에 실패했습니다.')
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('authToken') || ''
    try {
      await api.adminUpdateOrderStatus(token, orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      alert('주문 상태가 업데이트되었습니다.')
    } catch {
      alert('주문 상태 변경에 실패했습니다.')
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
                    style={{ marginRight: '8px' }}
                  >
                    {user.isBlocked ? '차단해제' : '차단'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteUser(user.id)}
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
                    {product.isActive ? '활성' : '품절'}
                  </span>
                </td>
                <td>
                  <button 
                    className={`btn ${product.isActive ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleProductStatus(product.id)}
                    style={{ marginRight: '8px' }}
                  >
                    {product.isActive ? '비활성화' : '활성화'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteProduct(product.id)}
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
              <th>댓글</th>
              <th>날짜</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.productName} (#{review.productId})</td>
                <td>{review.userName}</td>
                <td>
                  <span className="rating">⭐ {review.rating}</span>
                </td>
                <td className="comment-cell">{review.comment}</td>
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

  const renderOrdersTab = () => (
    <div className="admin-content">
      <h3>주문 관리</h3>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>고객명</th>
              <th>주문금액</th>
              <th>상태</th>
              <th>주문일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.userName}</td>
                <td>{(order.totalCents || 0).toLocaleString()}원</td>
                <td>
                  <span className="status-badge" style={{ 
                    backgroundColor: 
                      order.status === '상품준비중' ? '#ff9800' :
                      order.status === '발송완료' ? '#2196f3' :
                      order.status === '배송중' ? '#9c27b0' :
                      order.status === '배송완료' ? '#4caf50' : '#666',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td>{order.date}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="상품준비중">상품준비중</option>
                    <option value="발송완료">발송완료</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                  </select>
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
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          주문 관리
        </button>
      </div>

      <div className="admin-main">
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'orders' && renderOrdersTab()}
      </div>
    </div>
  )
}

export default Admin


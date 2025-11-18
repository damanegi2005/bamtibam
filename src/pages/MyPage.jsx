import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import './MyPage.css'

const MyPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('authToken') || ''
      const orderList = await api.getOrders(token)
      setOrders(orderList || [])
    } catch (err) {
      console.error('주문 내역 로드 실패:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '상품준비중':
        return '#ff9800'
      case '발송완료':
        return '#2196f3'
      case '배송중':
        return '#9c27b0'
      case '배송완료':
        return '#4caf50'
      default:
        return '#666'
    }
  }

  if (loading) {
    return <div className="mypage">로딩 중...</div>
  }

  return (
    <div className="mypage">
      <h2>마이페이지</h2>
      <h3>주문 내역</h3>
      
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>주문 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h4>주문번호: #{order.id}</h4>
                  <p className="order-date">
                    주문일: {new Date(order.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="order-items">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <img 
                      src={item.image_url || `https://via.placeholder.com/80x80?text=${encodeURIComponent(item.name)}`} 
                      alt={item.name}
                      className="order-item-image"
                    />
                    <div className="order-item-info">
                      <h5>{item.name}</h5>
                      <p>수량: {item.quantity}개</p>
                      <p>단가: {(item.unit_price_cents || 0).toLocaleString()}원</p>
                    </div>
                    <div className="order-item-total">
                      <p>{((item.unit_price_cents || 0) * (item.quantity || 1)).toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <p className="order-total">
                  총 주문금액: <strong>{(order.total_cents || 0).toLocaleString()}원</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPage


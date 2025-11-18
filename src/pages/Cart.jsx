import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('authToken') || ''
      const items = await api.getCart(token)
      setCartItems(items || [])
    } catch (err) {
      console.error('장바구니 로드 실패:', err)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      const token = localStorage.getItem('authToken') || ''
      await api.updateCartItem(token, cartItemId, { quantity: newQuantity })
      await loadCart()
    } catch (err) {
      alert(err?.message || '수량 업데이트에 실패했습니다.')
    }
  }

  const removeItem = async (cartItemId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      const token = localStorage.getItem('authToken') || ''
      await api.deleteCartItem(token, cartItemId)
      await loadCart()
    } catch (err) {
      alert(err?.message || '삭제에 실패했습니다.')
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.price_cents || 0) * (item.quantity || 1)
  }, 0)

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    
    // 결제 확인 팝업
    const paymentConfirmed = window.confirm(
      `총 주문금액: ${totalPrice.toLocaleString()}원\n\n입금 하셨습니까?\n\n확인을 누르면 주문이 완료됩니다.`
    )
    
    if (!paymentConfirmed) {
      return
    }
    
    try {
      const token = localStorage.getItem('authToken') || ''
      await api.createOrder(token)
      alert('주문이 완료되었습니다!')
      // 장바구니 새로고침
      await loadCart()
      navigate('/mypage')
    } catch (err) {
      alert(err?.message || '주문에 실패했습니다.')
    }
  }

  if (loading) {
    return <div className="cart-page">로딩 중...</div>
  }

  return (
    <div className="cart-page">
      <h2>장바구니</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>장바구니가 비어있습니다.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={item.image_url || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`} 
                    alt={item.name} 
                  />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{(item.price_cents || 0).toLocaleString()}원</p>
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity || 1}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  <p>{((item.price_cents || 0) * (item.quantity || 1)).toLocaleString()}원</p>
                </div>
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => removeItem(item.id)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="cart-total">
              <h3>총 주문금액: {totalPrice.toLocaleString()}원</h3>
            </div>
            <button className="btn btn-primary btn-large" onClick={handleCheckout}>
              구매하기
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart


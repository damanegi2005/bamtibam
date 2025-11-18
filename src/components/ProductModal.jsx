import React, { useEffect, useState } from 'react'
import './ProductModal.css'
import { api } from '../lib/api'

const ProductModal = ({ product, onClose }) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [reviews, setReviews] = useState([])

  // 서버에서 리뷰 불러오기
  useEffect(() => {
    if (!product?.slug) return
    api.listProductReviews(product.slug)
      .then((list) => {
        // 서버 리뷰를 모달 표시용으로 변환
        const normalized = (list || []).map(r => ({
          id: r.id,
          user: r.user_name || '익명',
          rating: r.rating,
          comment: r.content || ''
        }))
        setReviews(normalized)
      })
      .catch(() => setReviews([]))
  }, [product?.slug])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const comment = (newReview.comment || '').trim()
    if (!comment) return
    const token = localStorage.getItem('authToken') || ''
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }
    try {
      await api.createReview(token, {
        productId: product.id,
        rating: newReview.rating,
        content: comment
      })
      // 작성 후 즉시 목록 재조회
      const list = await api.listProductReviews(product.slug)
      const normalized = (list || []).map(r => ({
        id: r.id,
        user: r.user_name || '익명',
        rating: r.rating,
        comment: r.content || ''
      }))
      setReviews(normalized)
      setNewReview({ rating: 5, comment: '' })
    } catch (err) {
      alert(err?.message || '리뷰 작성 실패')
    }
  }

  const handlePurchase = async () => {
    const token = localStorage.getItem('authToken') || ''
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }
    
    // 비활성화된 상품은 구매 불가
    if (product.is_active === false) {
      alert('품절된 상품입니다.')
      return
    }
    
    try {
      await api.addToCart(token, { productId: product.id, quantity: 1 })
      alert('장바구니에 담겼습니다!')
    } catch (err) {
      alert(err?.message || '장바구니 추가에 실패했습니다.')
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>⭐</span>
    ))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="product-details">
            <div className="product-image-large">
              <img src={product.image} alt={product.name} />
            </div>
            
            <div className="product-info-large">
              <div className="price-section">
                <span className="price">{(product.price_cents || product.price || 0).toLocaleString()}원</span>
              </div>
              
              <div className="rating-section">
                <div className="rating-display">
                  <span className="rating-stars">{renderStars(Math.floor(averageRating))}</span>
                  <span className="rating-text">{averageRating} ({reviews.length}개 리뷰)</span>
                </div>
              </div>
              
              <div className="description-section">
                <h3>상품 설명</h3>
                <p>{product.description}</p>
              </div>
              
              {product.is_active === false ? (
                <button className="btn btn-secondary purchase-btn" disabled>
                  품절
                </button>
              ) : (
                <button className="btn btn-primary purchase-btn" onClick={handlePurchase}>
                  구매하기
                </button>
              )}
            </div>
          </div>

          <div className="reviews-section">
            <h3>리뷰 ({reviews.length})</h3>
            
            <div className="review-form">
              <h4>리뷰 작성</h4>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>평점</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= newReview.rating ? 'active' : ''}`}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="review-comment">댓글</label>
                  <textarea
                    id="review-comment"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="상품에 대한 리뷰를 작성해주세요"
                    rows="3"
                  />
                </div>
                
                <button type="submit" className="btn btn-secondary">
                  리뷰 작성
                </button>
              </form>
            </div>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.user}</span>
                      <span className="review-rating">{renderStars(review.rating)}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal


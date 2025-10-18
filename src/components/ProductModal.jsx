import React, { useState } from 'react'
import './ProductModal.css'

const ProductModal = ({ product, onClose }) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [reviews, setReviews] = useState(product.reviews || [])

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (newReview.comment.trim()) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const review = {
        id: Date.now(),
        user: userInfo.name || '익명',
        rating: newReview.rating,
        comment: newReview.comment.trim()
      }
      setReviews([...reviews, review])
      setNewReview({ rating: 5, comment: '' })
    }
  }

  const handlePurchase = () => {
    alert('구매 기능은 백엔드와 연동 후 구현됩니다.')
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
                <span className="price">{product.price.toLocaleString()}원</span>
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
              
              <button className="btn btn-primary purchase-btn" onClick={handlePurchase}>
                구매하기
              </button>
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


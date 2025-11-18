import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import { api } from '../lib/api'
import './Home.css'

const Home = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const currentCategory = searchParams.get('category') || 'ai'

  // 임시 상품 데이터 (fallback용)
  const mockProducts = [
    {
      id: 1,
      name: 'ChatGPT Plus 구독',
      price: 20000,
      category: 'ai',
      image: 'https://via.placeholder.com/300x200/00ff88/1e1e1e?text=ChatGPT+Plus',
      description: 'AI 기반 대화형 어시스턴트 서비스. 창작, 분석, 코딩 등 다양한 작업을 도와드립니다.',
      reviews: [
        { id: 1, user: '김개발', rating: 5, comment: '정말 유용합니다!' },
        { id: 2, user: '박코딩', rating: 4, comment: '가격 대비 만족합니다.' }
      ]
    },
    {
      id: 2,
      name: '비타민 D3 2000IU',
      price: 25000,
      category: 'health',
      image: 'https://via.placeholder.com/300x200/007acc/ffffff?text=Vitamin+D3',
      description: '면역력 강화와 뼈 건강에 도움을 주는 비타민 D3 보충제입니다.',
      reviews: [
        { id: 1, user: '이건강', rating: 5, comment: '건강이 좋아졌어요!' }
      ]
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      price: 1500000,
      category: 'electronics',
      image: 'https://via.placeholder.com/300x200/c586c0/ffffff?text=MacBook+Air',
      description: 'Apple M2 칩을 탑재한 초경량 노트북. 개발자와 크리에이터를 위한 최적의 선택입니다.',
      reviews: [
        { id: 1, user: '최개발', rating: 5, comment: '성능이 정말 좋습니다!' }
      ]
    },
    {
      id: 4,
      name: '영어 회화 마스터 코스',
      price: 150000,
      category: 'language',
      image: 'https://via.placeholder.com/300x200/ff8c00/ffffff?text=English+Course',
      description: '네이티브 선생님과 함께하는 실전 영어 회화 코스입니다.',
      reviews: []
    },
    {
      id: 5,
      name: '명상 앱 프리미엄',
      price: 30000,
      category: 'stress',
      image: 'https://via.placeholder.com/300x200/00ff88/1e1e1e?text=Meditation+App',
      description: '스트레스 해소와 마음의 평화를 위한 명상 가이드 앱입니다.',
      reviews: []
    },
    {
      id: 6,
      name: 'Claude AI Pro',
      price: 30000,
      category: 'ai',
      image: 'https://via.placeholder.com/300x200/007acc/ffffff?text=Claude+AI',
      description: 'Anthropic의 고급 AI 어시스턴트. 창의적 작업과 분석에 특화되어 있습니다.',
      reviews: []
    }
  ]

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(loggedIn)
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      if (!isLoggedIn) {
        setProducts([])
        return
      }
      
      try {
        const serverProducts = await api.listProducts(currentCategory)
        // 서버 응답을 UI 형식에 맞게 변환
        const normalized = serverProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price_cents || 0,
          price_cents: p.price_cents,
          category: p.category || currentCategory,
          image: p.image || `https://via.placeholder.com/300x200/00aa88/1e1e1e?text=${encodeURIComponent(p.name)}`,
          description: p.description || '',
          slug: p.slug,
          is_active: p.is_active !== undefined ? p.is_active : true
        }))
        setProducts(normalized)
      } catch (err) {
        console.error('상품 로드 실패:', err)
        // Fallback to mock data
        const filtered = mockProducts.filter(p => p.category === currentCategory)
        setProducts(filtered)
      }
    }
    
    loadProducts()
  }, [currentCategory, isLoggedIn])

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="home-guest">
        <section className="hero">
          <div className="container">
            <h1>웰컴 투 BAMTIBAM</h1>
            <p>개발자를 위한 온라인 쇼핑몰</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                회원가입
              </Link>
              <Link to="/login" className="btn btn-secondary">
                로그인
              </Link>
            </div>
          </div>
        </section>
        
        <section className="features">
          <div className="container">
            <h2>주요 기능</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>AI 도구</h3>
                <p>최신 AI 서비스와 도구들</p>
              </div>
              <div className="feature-card">
                <h3>건강 관리</h3>
                <p>개발자의 건강을 위한 다양한 제품들</p>
              </div>
              <div className="feature-card">
                <h3>전자기기</h3>
                <p>최신 기술의 전자기기들</p>
              </div>
              <div className="feature-card">
                <h3>언어 학습</h3>
                <p>언어 학습 도구</p>
              </div>
              <div className="feature-card">
                <h3>스트레스 관리</h3>
                <p>힘든 개발 업무를 위한 스트레스 해소 도구.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="products-header">
        <h2>
          {currentCategory === 'ai' && '🤖 AI'}
          {currentCategory === 'health' && '💊 건강'}
          {currentCategory === 'electronics' && '📱 전자기기'}
          {currentCategory === 'language' && '📚 언어'}
          {currentCategory === 'stress' && '😌 스트레스'}
        </h2>
        <p>{products.length}개의 상품이 있습니다.</p>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div 
            key={product.id} 
            className={`product-card ${product.is_active === false ? 'product-soldout' : ''}`}
            onClick={() => handleProductClick(product)}
          >
            <div className="product-image">
              <img src={product.image || 'https://via.placeholder.com/300x200'} alt={product.name} />
              {product.is_active === false && (
                <div className="soldout-overlay">
                  <span className="soldout-text">품절</span>
                </div>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-price">{(product.price_cents || product.price || 0).toLocaleString()}원</p>
              <p className="product-description">{product.description}</p>
              {product.is_active === false && (
                <p className="soldout-badge">품절</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>이 카테고리에 상품이 없습니다.</p>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Home

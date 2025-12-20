import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const isAdmin = userInfo.isAdmin || false

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
    navigate('/')
  }


  return (
    <div className="layout">
      <header className={isLoggedIn ? "header header-logged-in" : "header"}>
        <div className="container">
          <Link to="/" className="logo">
            BAMTIBAM
          </Link>
          <nav className="nav">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                >
                  상품
                </Link>
                <Link 
                  to="/cart" 
                  className={location.pathname === '/cart' ? 'nav-link active' : 'nav-link'}
                >
                  장바구니
                </Link>
                <Link 
                  to="/mypage" 
                  className={location.pathname === '/mypage' ? 'nav-link active' : 'nav-link'}
                >
                  마이페이지
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
                  >
                    관리자
                  </Link>
                )}
                <div className="user-info">
                  <span className="user-name">안녕하세요, {userInfo.name}님!</span>
                  <button onClick={handleLogout} className="logout-btn">
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  className={location.pathname === '/signup' ? 'nav-link active' : 'nav-link'}
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        {isLoggedIn && (
          <aside className="sidebar">
            <h3>카테고리</h3>
            <ul className="category-list">
              <li className="category-item">
                <Link 
                  to="/?category=ai" 
                  className="category-link"
                >
                  🤖 AI
                </Link>
              </li>
              <li className="category-item">
                <Link 
                  to="/?category=health" 
                  className="category-link"
                >
                  💊 건강
                </Link>
              </li>
              <li className="category-item">
                <Link 
                  to="/?category=electronics" 
                  className="category-link"
                >
                  📱 전자기기
                </Link>
              </li>
              <li className="category-item">
                <Link 
                  to="/?category=language" 
                  className="category-link"
                >
                  📚 언어
                </Link>
              </li>
              <li className="category-item">
                <Link 
                  to="/?category=stress" 
                  className="category-link"
                >
                  😌 스트레스
                </Link>
              </li>
            </ul>
          </aside>
        )}
        <div className="content">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 DevShop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

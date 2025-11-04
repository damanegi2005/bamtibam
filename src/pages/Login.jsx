import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 기본 입력값 확인
    if (!(formData.email && formData.password)) {
      alert('이메일과 비밀번호를 입력하세요!')
      return
    }

    // 1) 하드코딩된 테스트 계정 지원
    if (formData.email === 'admin@devshop.com' && formData.password === 'admin123') {
      const user = { email: 'admin@devshop.com', name: '관리자', isAdmin: true }
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userInfo', JSON.stringify(user))
      alert('로그인 성공!')
      navigate('/')
      return
    }

    if (formData.email === 'user@devshop.com' && formData.password === 'user123') {
      const user = { email: 'user@devshop.com', name: '사용자', isAdmin: false }
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userInfo', JSON.stringify(user))
      alert('로그인 성공!')
      navigate('/')
      return
    }

    // 2) 회원가입으로 저장된 사용자 목록에서 검증
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const matched = users.find(u => u.email === formData.email && u.password === formData.password)

    if (!matched) {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.')
      return
    }

    const user = { email: matched.email, name: matched.name, isAdmin: !!matched.isAdmin }
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userInfo', JSON.stringify(user))
    alert('로그인 성공!')
    navigate('/')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>이메일</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일"
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            로그인
          </button>
        </form>

        <div className="auth-footer">
          <p>
            회원가입: <Link to="/signup" className="simple-link">여기 클릭</Link>
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: 'var(--text-secondary)' }}>
            테스트: admin@devshop.com / admin123<br/>
            또는 아무 이메일@아무것.com / 아무비밀번호
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

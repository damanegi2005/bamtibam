import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import { api } from '../lib/api'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 기본 입력값 확인
    if (!(formData.email && formData.password)) {
      alert('이메일과 비밀번호를 입력하세요!')
      return
    }
    try {
      const { token, user } = await api.login({ email: formData.email, password: formData.password })
      // role → isAdmin 변환
      const isAdmin = user?.role === 'admin' || user?.isAdmin === true
      localStorage.setItem('authToken', token)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userInfo', JSON.stringify({ ...user, isAdmin }))
      alert('로그인 성공!')
      navigate('/')
    } catch (err) {
      alert(err.message || '로그인 실패')
    }
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
            서버 연동 로그인: 가입한 이메일/비밀번호를 사용하세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

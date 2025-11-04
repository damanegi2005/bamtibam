import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import { api } from '../lib/api'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 입력 정리
    const name = (formData.name || '').trim()
    const email = (formData.email || '').trim().toLowerCase()
    const password = (formData.password || '').trim()
    const isAdmin = !!formData.isAdmin

    // 기본 검증
    if (!name || !email || !password) {
      alert('모든 항목을 입력하세요!')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 형식을 입력하세요.')
      return
    }

    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    try {
      // 백엔드 회원가입 호출 (관리자 체크는 서버 정책에 따라 무시될 수 있음)
      await api.signup({ name, email, password, isAdmin })
      alert('회원가입 완료! 이제 로그인해 주세요.')
      navigate('/login')
    } catch (err) {
      alert(err.message || '회원가입 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름"
            />
          </div>

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

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
            />
            <label>관리자로 가입</label>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            회원가입
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요? 
            <Link to="/login" className="simple-link">로그인하기</Link>
          </p>
          <p>간단하게 만들어서 검증이 없어요 ㅎㅎ</p>
        </div>
      </div>
    </div>
  )
}

export default Signup

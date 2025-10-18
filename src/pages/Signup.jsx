import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 투박한 회원가입 - 검증 거의 없음
    if (formData.name && formData.email && formData.password) {
      // 간단한 저장
      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isAdmin: formData.isAdmin
      }
      
      // localStorage에 저장 (중복 체크 없음)
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      existingUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(existingUsers))
      
      alert('회원가입 완료!')
      navigate('/login')
    } else {
      alert('모든 항목을 입력하세요!')
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

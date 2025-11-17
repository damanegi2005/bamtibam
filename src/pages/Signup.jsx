import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import { api } from '../lib/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[A-Za-z가-힣0-9][A-Za-z가-힣0-9\s._-]{1,29}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{10,64}$/
const PASSWORD_HINT = '10~64자, 대/소문자, 숫자, 특수문자 각각 1개 이상 포함'
const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateInputs = () => {
    const name = (formData.name || '').replace(/\s+/g, ' ').trim()
    const email = (formData.email || '').trim().toLowerCase()
    const password = (formData.password || '').trim()

    if (!name || !email || !password) {
      return '이름, 이메일, 비밀번호를 모두 입력하세요.'
    }
    if (!NAME_REGEX.test(name)) {
      return '이름은 2~30자이며 한글/영문/숫자와 공백, ._- 만 사용할 수 있습니다.'
    }
    if (!EMAIL_REGEX.test(email)) {
      return '올바른 이메일 형식을 입력하세요.'
    }
    if (!PASSWORD_REGEX.test(password)) {
      return PASSWORD_HINT
    }
    if (password.toLowerCase().includes(name.toLowerCase())) {
      return '비밀번호에 이름을 포함할 수 없습니다.'
    }
    if (password.toLowerCase().includes(email.split('@')[0])) {
      return '비밀번호에 이메일 앞부분을 포함할 수 없습니다.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateInputs()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      name: formData.name.replace(/\s+/g, ' ').trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    }

    try {
      await api.signup(payload)
      alert('회원가입 완료! 이제 로그인해 주세요.')
      navigate('/login')
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.')
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

          <button type="submit" className="btn btn-primary btn-full">
            회원가입
          </button>
          {error && <div className="form-error">{error}</div>}
        </form>

        <div className="password-hint">
          <p>회원정보 보안을 위해 아래 조건을 모두 만족해야 합니다.</p>
          <ul>
            <li>이름: 2~30자, 한글/영문/숫자/공백/._- 허용</li>
            <li>이메일: 표준 이메일 형식</li>
            <li>비밀번호: {PASSWORD_HINT}</li>
          </ul>
        </div>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요? 
            <Link to="/login" className="simple-link">로그인하기</Link>
          </p>
          <p>안전한 회원가입을 위해 필수 검증이 적용되어 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

export default Signup

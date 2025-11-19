import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import { api } from '../lib/api'

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [nameCheckStatus, setNameCheckStatus] = useState(null) // null, 'checking', 'available', 'duplicate'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 이름이 변경되면 중복 체크 상태 초기화
    if (name === 'name') {
      setNameCheckStatus(null)
    }
  }

  const checkNameDuplicate = async () => {
    const name = (formData.name || '').trim()
    if (!name) {
      alert('이름을 입력하세요.')
      return
    }
  
    setNameCheckStatus('checking')
    try {
      // api가 이미 JSON 파싱된 값 반환함
      const res = await api.checkNameDuplicate(name);
  
      if (res.available) {
        setNameCheckStatus('available')
        alert('사용 가능한 이름입니다.')
      } else {
        setNameCheckStatus('duplicate')
        alert('이미 사용 중인 이름입니다.')
      }
    } catch (err) {
      setNameCheckStatus(null)
      alert('이름 중복 확인 중 오류가 발생했습니다.')
    }
  }  

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 입력 정리
    const name = (formData.name || '').trim()
    const email = (formData.email || '').trim().toLowerCase()
    const password = (formData.password || '').trim()
    const confirmPassword = (formData.confirmPassword || '').trim()

    // 기본 검증
    if (!name || !email || !password || !confirmPassword) {
      alert('모든 항목을 입력하세요!')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 형식을 입력하세요.')
      return
    }

    if (!passwordRegex.test(password)) {
      alert('비밀번호는 8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    // 이름 중복 체크 (중복이면 가입 차단)
    if (nameCheckStatus === 'duplicate') {
      alert('이미 사용 중인 이름입니다. 다른 이름을 사용해주세요.')
      return
    }
    
    // 이름 중복 체크를 하지 않았으면 먼저 체크
    if (nameCheckStatus !== 'available') {
      alert('이름 중복 확인을 먼저 해주세요.')
      return
    }

    try {
      // 백엔드 회원가입 호출
      await api.signup({ name, email, password })
      alert('회원가입 완료! 이제 로그인해 주세요.')
      navigate('/login')
    } catch (err) {
      const errorMessage = err.message || '회원가입 중 오류가 발생했습니다.'
      if (errorMessage.includes('이미 사용 중인 이름') || errorMessage.includes('이미 가입된 이메일')) {
        alert(errorMessage)
        if (errorMessage.includes('이름')) {
          setNameCheckStatus('duplicate')
        }
      } else {
        alert(errorMessage)
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>이름</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={checkNameDuplicate}
                disabled={nameCheckStatus === 'checking' || !formData.name.trim()}
              >
                {nameCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {nameCheckStatus === 'available' && (
              <small style={{ color: 'green' }}>✓ 사용 가능한 이름입니다.</small>
            )}
            {nameCheckStatus === 'duplicate' && (
              <small style={{ color: 'red' }}>✗ 이미 사용 중인 이름입니다.</small>
            )}
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
            <small className="text-muted">8자 이상, 영문/숫자/특수문자 포함</small>
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 확인"
            />
          </div>

          <div className="form-group">
            <small className="text-muted" style={{ display: 'block', color: '#ff6b6b' }}>
              ⚠️ 비밀번호를 잊어버리지 않게 주의하세요. 비밀번호를 잊으셨다면 관리자에게 연락하여 계정 삭제를 요청해주세요.
            </small>
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[A-Za-z가-힣0-9][A-Za-z가-힣0-9\s._-]{1,29}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{10,64}$/

export const passwordPolicyText =
  '비밀번호는 10~64자이며 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.'

export function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

export function normalizeName(name = '') {
  return name.replace(/\s+/g, ' ').trim()
}

export function validateEmail(email = '') {
  return EMAIL_REGEX.test(email)
}

export function validateName(name = '') {
  return NAME_REGEX.test(name)
}

export function validatePassword(password = '', { disallowList = [] } = {}) {
  if (!PASSWORD_REGEX.test(password)) {
    return false
  }
  const lowered = password.toLowerCase()
  return !disallowList.some(item => item && lowered.includes(String(item).toLowerCase()))
}

export function validateSignupPayload({ name, email, password }) {
  const normalizedName = normalizeName(name || '')
  const normalizedEmail = normalizeEmail(email || '')
  const trimmedPassword = (password || '').trim()

  if (!normalizedName || !normalizedEmail || !trimmedPassword) {
    return { ok: false, message: '이름, 이메일, 비밀번호는 필수입니다.' }
  }
  if (!validateName(normalizedName)) {
    return {
      ok: false,
      message: '이름은 2~30자이며 한글/영문/숫자와 공백, ._- 만 사용할 수 있습니다.'
    }
  }
  if (!validateEmail(normalizedEmail)) {
    return { ok: false, message: '올바른 이메일 형식을 입력하세요.' }
  }
  if (
    !validatePassword(trimmedPassword, {
      disallowList: [normalizedEmail.split('@')[0], normalizedName, 'password']
    })
  ) {
    return { ok: false, message: passwordPolicyText }
  }
  return {
    ok: true,
    data: {
      name: normalizedName,
      email: normalizedEmail,
      password: trimmedPassword
    }
  }
}



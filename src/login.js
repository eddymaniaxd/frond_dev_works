import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = (props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false) // Nuevo estado para manejar el éxito del login

  const navigate = useNavigate()

  const onButtonClick = () => {
    // Resetea los errores al hacer clic
    setEmailError('')
    setPasswordError('')

    // Validaciones de los campos
    if ('' === email) {
      setEmailError('Please enter your email')
      return
    }

    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Please enter a valid email')
      return
    }

    if ('' === password) {
      setPasswordError('Please enter a password')
      return
    }

    if (password.length < 4) {
      setPasswordError('The password must be 5 characters or longer')
      return
    }

    // Verificar si la cuenta existe antes de proceder al login
    checkAccountExists((accountExists) => {
      if (accountExists) {
        logIn()
      } else if (
        window.confirm(
          'An account does not exist with this email address: ' +
            email +
            '. Do you want to create a new account?',
        )
      ) {
        logIn()
      }
    })
  }

  // Verifica si la cuenta existe
  const checkAccountExists = (callback) => {
    fetch('http://localhost:3080/check-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((r) => {
        callback(r?.userExists)
      })
  }

  // Realiza el login
  const logIn = () => {
    fetch('http://localhost:3080/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((r) => {
        if ('success' === r.message) {
          localStorage.setItem('user', JSON.stringify({ email, token: r.token }))
          props.setLoggedIn(true)
          props.setEmail(email)
          setLoginSuccess(true) // Cambia el estado a true cuando el login sea exitoso
        } else {
          window.alert('Wrong email or password')
        }
      })
  }

  // Navega después de un login exitoso
  useEffect(() => {
    if (loginSuccess) {
      navigate('/')
    }
  }, [loginSuccess, navigate])

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div>Login</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'inputBox'}
          type="password" // Tipo de input para esconder la contraseña
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input className={'inputButton'} type="button" onClick={onButtonClick} value={'Log in'} />
      </div>
    </div>
  )
}

export default Login

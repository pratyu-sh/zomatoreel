import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserRegister = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const fullName = formData.get('fullName')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/user/register',
        {
          fullName,
          email,
          password
        },
        {
          withCredentials: true
        }
      )

      console.log('Registration successful:', response.data)

      navigate('/')

    } catch (error) {
      console.error(
        'Registration failed:',
        error.response?.data || error
      )

      setError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">

      <section className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-mark">
            B
          </div>

          <span className="brand-name">
            BiteReel
          </span>
        </div>


        {/* Header */}
        <div className="auth-header">

          <h1>
            Create your account
          </h1>

          <p>
            Join BiteReel and discover something delicious.
          </p>

        </div>


        {/* Account Type */}
        <div
          className="account-switch"
          aria-label="Account type"
        >

          <button
            type="button"
            className="switch-option active"
            onClick={() => navigate('/user/register')}
          >
            Customer
          </button>

          <button
            type="button"
            className="switch-option"
            onClick={() => navigate('/food-partner/register')}
          >
            Food Partner
          </button>

        </div>


        {/* Registration Form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-fields">

            {/* Full Name */}
            <div className="input-group">

              <label htmlFor="user-register-name">
                Full Name
              </label>

              <input
                id="user-register-name"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

            </div>


            {/* Email */}
            <div className="input-group">

              <label htmlFor="user-register-email">
                Email
              </label>

              <input
                id="user-register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}
            <div className="input-group">

              <label htmlFor="user-register-password">
                Password
              </label>

              <input
                id="user-register-password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />

            </div>

          </div>


          {/* Error */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* Submit */}
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create account'
            }
          </button>

        </form>


        {/* Login Navigation */}
        <p className="auth-footer">

          Already have an account?{' '}

          <Link to="/user/login">
            Sign in
          </Link>

        </p>

      </section>

    </main>
  )
}

export default UserRegister
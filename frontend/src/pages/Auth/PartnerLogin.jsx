import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const PartnerLogin = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/foodpartner/login`,
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      )

      console.log(response.data)

      // Redirect partner after successful login
      navigate('/create/food')
      // navigate('/food-partner/profile/:id')

    } catch (error) {
      console.error(
        'Partner login failed:',
        error.response?.data || error
      )

      setError(
        error.response?.data?.message ||
        'Invalid email or password.'
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

          <span className="partner-badge">
            Food Partner
          </span>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to manage your food business.
          </p>

        </div>


        {/* Account Switch */}
        <div
          className="account-switch"
          aria-label="Account type"
        >

          <button
            type="button"
            className="switch-option"
            onClick={() => navigate('/user/login')}
          >
            Customer
          </button>

          <button
            type="button"
            className="switch-option active"
            onClick={() => navigate('/food-partner/login')}
          >
            Food Partner
          </button>

        </div>


        {/* Login Form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-fields">

            {/* Email */}
            <div className="input-group">

              <label htmlFor="partner-login-email">
                Email
              </label>

              <input
                id="partner-login-email"
                name="email"
                type="email"
                placeholder="business@example.com"
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}
            <div className="input-group">

              <label htmlFor="partner-login-password">
                Password
              </label>

              <input
                id="partner-login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
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
              ? 'Signing in...'
              : 'Sign in'
            }
          </button>

        </form>


        {/* Register */}
        <p className="auth-footer">

          Don't have a partner account?{' '}

          <Link to="/food-partner/register">
            Register
          </Link>

        </p>

      </section>

    </main>
  )
}

export default PartnerLogin
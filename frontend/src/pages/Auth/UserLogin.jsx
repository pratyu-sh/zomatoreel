import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserLogin = () => {
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

        console.log('Login data:', {
            email,
            password
        })

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/user/login`,
                {
                    email,
                    password
                },{withCredentials: true}
            )

            console.log('Login response:', response.data)

            navigate('/')

        } catch (error) {
            console.error('Login error:', error)

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

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Sign in to continue to your account.
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
                        onClick={() =>
                            navigate('/user/login')
                        }
                    >
                        Customer
                    </button>


                    <button
                        type="button"
                        className="switch-option"
                        onClick={() =>
                            navigate('/food-partner/login')
                        }
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

                            <label htmlFor="user-login-email">
                                Email
                            </label>

                            <input
                                id="user-login-email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* Password */}
                        <div className="input-group">

                            <label htmlFor="user-login-password">
                                Password
                            </label>

                            <input
                                id="user-login-password"
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

                    Don't have an account?{' '}

                    <Link to="/user/register">
                        Create account
                    </Link>

                </p>

            </section>

        </main>
    )
}

export default UserLogin
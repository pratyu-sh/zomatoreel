import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const PartnerRegister = () => {
  const navigate = useNavigate()

  const handleSubmit = async (e)=>{
    e.preventDefault();

    const formData = new FormData(e.currentTarget)

    const name = formData.get('businessName')
    const email = formData.get('email')
    const password = formData.get('password')
    const address = formData.get('address')
    const contactName = formData.get('contactName')
    const phone = formData.get('phone')

    const response = await axios.post('http://Localhost:3000/api/auth/foodpartner/register', {
      name,
      email,
      password,
      address,
      contactName,
      phone
    },{
      withCredentials: true
    })

    console.log(response.data)
    console.log('REGISTRATION SUCCESS')
    navigate('/create/food')




  }

  return (
    <main className="auth-page">
      <section className="auth-card partner-register-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-mark">B</div>
          <span className="brand-name">BiteReel</span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <span className="partner-badge">
            Food Partner
          </span>

          <h1>Join BiteReel</h1>

          <p>
            Create your partner account and showcase your food.
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
            onClick={() => navigate('/user/register')}
          >
            Customer
          </button>

          <button
            type="button"
            className="switch-option active"
            onClick={() => navigate('/food-partner/register')}
          >
            Food Partner
          </button>
        </div>

        {/* Partner Registration Form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="auth-fields">

            {/* Business Name */}
            <div className="input-group">
              <label htmlFor="partner-business-name">
                Business Name
              </label>

              <input
                id="partner-business-name"
                name="businessName"
                type="text"
                placeholder="Enter your business name"
                autoComplete="organization"
              />
            </div>

            {/* Contact Name */}
            <div className="input-group">
              <label htmlFor="partner-contact-name">
                Contact Name
              </label>

              <input
                id="partner-contact-name"
                name="contactName"
                type="text"
                placeholder="Enter contact person's name"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label htmlFor="partner-register-email">
                Email
              </label>

              <input
                id="partner-register-email"
                name="email"
                type="email"
                placeholder="business@example.com"
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <div className="input-group">
              <label htmlFor="partner-phone">
                Phone
              </label>

              <input
                id="partner-phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                autoComplete="tel"
              />
            </div>

            {/* Address */}
            <div className="input-group">
              <label htmlFor="partner-address">
                Business Address
              </label>

              <textarea
                id="partner-address"
                name="address"
                placeholder="Enter your business address"
                rows="3"
                autoComplete="street-address"
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="partner-register-password">
                Password
              </label>

              <input
                id="partner-register-password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="primary-button"
          >
            Create partner account
          </button>

        </form>

        {/* Login Navigation */}
        <p className="auth-footer">
          Already a partner?{' '}
          <Link to="/food-partner/login">
            Sign in
          </Link>
        </p>

      </section>
    </main>
  )
}

export default PartnerRegister
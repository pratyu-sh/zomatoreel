import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../styles/Profile.css'

const Profile = () => {
  const { id } = useParams()
  const [profile,setProfile] = useState(null)
  const navigate = useNavigate()


  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


 useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      console.log("Profile ID:", id)

      const response = await axios.get(
        `http://localhost:3000/api/foodpartner/${id}`,
        {
          withCredentials: true
        }
      )

      console.log("API RESPONSE:", response.data)

      const partner = response.data.foodPartner

      setProfile(partner)
      setFoodItems(partner?.foodItems || [])

      console.log("FOOD ITEMS:", partner?.foodItems)

    } catch (error) {
      console.error("REQUEST FAILED:", error)

      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to load profile."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!id) {
    setError("Food partner ID is missing.")
    setLoading(false)
    return
  }

  fetchProfile()
}, [id])
  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>
          <p>Loading profile...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <button
            className="profile-back-button"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </main>
    )
  }

  /*
   * Fallback values are only for displaying the UI
   * when the backend has not populated partner details yet.
   */
  const businessName =
    profile?.name || 'Food Partner'

  const address =
    profile?.address || 'Address unavailable'

  const profileImage =
    profile?.profileImage ||
    profile?.image ||
    profile?.avatar ||
    null

  const totalMeals = foodItems.length

  /*
   * If your backend eventually provides totalServes,
   * replace this with:
   *
   * partner?.totalServes
   */
  const totalServes =
    profile?.totalServes ?? 0

  return (
    <main className="profile-page">

      <div className="profile-container">

        {/* =================================
            PROFILE HEADER
        ================================= */}

        <section className="profile-header">

          <div className="profile-image-wrapper">

          
              
              <img className="profile-image" src="https://images.pexels.com/photos/15393590/pexels-photo-15393590.jpeg"/>
            
            

          </div>

          <div className="profile-business-info">

            <h1>
              {businessName}
            </h1>

            <p>
              {address}
            </p>

          </div>

        </section>


        {/* =================================
            STATISTICS
        ================================= */}

        <section className="profile-stats">

          <div className="profile-stat-card">

            <span className="stat-label">
              Total Meals
            </span>

            <strong className="stat-value">
              {totalMeals}
            </strong>

          </div>


          <div className="profile-stat-card">

            <span className="stat-label">
              Total Serves
            </span>

            <strong className="stat-value">
              {totalServes}
            </strong>

          </div>

        </section>


        {/* =================================
            DIVIDER
        ================================= */}

        <div className="profile-divider"></div>


        {/* =================================
            FOOD REELS
        ================================= */}

        <section className="profile-reels">

          {foodItems.length === 0 ? (

            <div className="empty-reels">

              <div className="empty-reels-icon">
                +
              </div>

              <h2>
                No meals yet
              </h2>

              <p>
                This food partner hasn't uploaded
                any meals yet.
              </p>

            </div>

          ) : (

            <div className="profile-reel-grid">

              {foodItems.map((item) => (

                <button
                  key={item._id}
                  className="profile-reel"
                  onClick={() =>
                    navigate(`/reels?food=${item._id}`)
                  }
                >

                  <video
                    src={item.video}
                    muted
                    playsInline
                    preload="metadata"
                    className="profile-reel-video"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />

                  <div className="profile-reel-overlay">

                    <div className="profile-reel-play">
                      ▶
                    </div>

                    <span className="profile-reel-name">
                      {item.name}
                    </span>

                  </div>

                </button>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  )
}

export default Profile
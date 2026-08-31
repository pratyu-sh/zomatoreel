import React, { useEffect, useRef, useState } from 'react'
import '../../styles/CreateFoodItem.css'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
const CreateFoodItem = () => {
  const fileInputRef = useRef(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    if (!video) {
      setVideoPreview('')
      return
    }

    const url = URL.createObjectURL(video)
    setVideoPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [video])

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')
    setSuccess('')

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.')
      return
    }

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      setError('Video size must be less than 50MB.')
      return
    }

    setVideo(file)
  }

  const removeVideo = () => {
    setVideo(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Please enter the food name.')
      return
    }

    if (!description.trim()) {
      setError('Please enter a description.')
      return
    }

    if (!video) {
      setError('Please upload a food video.')
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()

      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('video', video)

      /*
       * Connect your backend here.
       *
       * Example:
       *
       * await axios.post(
       *   'http://localhost:3000/api/food',
       *   formData,
       *   {
       *     withCredentials: true,
       *     headers: {
       *       'Content-Type': 'multipart/form-data'
       *     }
       *   }
       * )
       */

      const respose = await axios.post(
        'http://localhost:3000/api/food',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      console.log(respose.data)
      navigate('/reels')

      console.log('Food item:', {
        name,
        description,
        video
      })

      setSuccess('Food item created successfully.')

      setName('')
      setDescription('')
      setVideo(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Unable to create food item.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="create-food-page">

      <div className="create-food-container">

        {/* Header */}

        <header className="create-food-header">
          <p className="create-food-eyebrow">
            Food Partner
          </p>

          <h1>
            Create a food item
          </h1>

          <p className="create-food-subtitle">
            Add a meal to your menu and showcase it
            with a short video.
          </p>
        </header>


        {/* Form */}

        <form
          className="create-food-form"
          onSubmit={handleSubmit}
        >

          {/* Video */}

          <section className="food-form-section">

            <div className="food-form-label-row">

              <label className="food-form-label">
                Food video
              </label>

              <span className="food-form-required">
                Required
              </span>

            </div>


            {videoPreview ? (

              <div className="video-preview-container">

                <video
                  src={videoPreview}
                  className="food-video-preview"
                  controls
                  playsInline
                />

                <button
                  type="button"
                  className="video-remove-button"
                  onClick={removeVideo}
                >
                  Remove video
                </button>

              </div>

            ) : (

              <button
                type="button"
                className="video-upload-box"
                onClick={() => fileInputRef.current?.click()}
              >

                <div className="video-upload-icon">
                  +
                </div>

                <strong>
                  Upload food video
                </strong>

                <span>
                  MP4, MOV or WebM · Max 50MB
                </span>

              </button>

            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden-file-input"
            />

          </section>


          {/* Food Name */}

          <section className="food-form-section">

            <label
              htmlFor="food-name"
              className="food-form-label"
            >
              Food name
            </label>

            <input
              id="food-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError('')
              }}
              placeholder="e.g. Classic Paneer Burger"
              className="food-input"
              maxLength={80}
            />

            <span className="food-input-hint">
              Give your meal a short, memorable name.
            </span>

          </section>


          {/* Description */}

          <section className="food-form-section">

            <div className="food-form-label-row">

              <label
                htmlFor="food-description"
                className="food-form-label"
              >
                Description
              </label>

              <span className="food-character-count">
                {description.length}/300
              </span>

            </div>

            <textarea
              id="food-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setError('')
              }}
              placeholder="Tell customers what makes this meal special..."
              className="food-textarea"
              maxLength={300}
              rows={5}
            />

          </section>


          {/* Feedback */}

          {error && (
            <div className="food-form-message food-form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="food-form-message food-form-success">
              {success}
            </div>
          )}


          {/* Submit */}

          <button
            type="submit"
            className="create-food-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-loader"></span>
                Creating...
              </>
            ) : (
              'Create food item'
            )}
          </button>

        </form>

      </div>

    </main>
  )
}

export default CreateFoodItem
import React, { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import '../../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()

  const heroRef = useRef(null)
  const headingRef = useRef(null)
  const eyebrowRef = useRef(null)
  const descriptionRef = useRef(null)
  const buttonRef = useRef(null)
  const visualRef = useRef(null)
  const featuresRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out'
        }
      })

      /*
       * Initial Hero Animation
       */

      timeline
        .fromTo(
          eyebrowRef.current,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7
          }
        )

        .fromTo(
          headingRef.current,
          {
            opacity: 0,
            y: 60
          },
          {
            opacity: 1,
            y: 0,
            duration: 1
          },
          '-=0.45'
        )

        .fromTo(
          descriptionRef.current,
          {
            opacity: 0,
            y: 25
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7
          },
          '-=0.5'
        )

        .fromTo(
          buttonRef.current,
          {
            opacity: 0,
            y: 20,
            scale: 0.96
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6
          },
          '-=0.35'
        )

      /*
       * Reel Cards
       */

      gsap.fromTo(
        visualRef.current.querySelectorAll('.hero-reel'),
        {
          opacity: 0,
          y: 100,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.35
        }
      )

      /*
       * Feature Animation
       */

      gsap.fromTo(
        featuresRef.current.querySelectorAll('.feature'),
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.8
        }
      )

      /*
       * Floating Reel Animation
       */

   

     

      

    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <main
      className="landing-page"
      ref={heroRef}
    >

      {/* Navigation */}
      <header className="landing-nav">

        <div className="landing-brand">

          <div className="brand-mark">
            B
          </div>

          <span>
            BiteReel
          </span>

        </div>

        <button
          className="nav-explore-button"
          onClick={() => navigate('/reels')}
        >
          Explore
        </button>

      </header>


      {/* Hero */}
      <section className="landing-hero">

        {/* Hero Content */}
        <div className="hero-content">

          <span
            className="hero-eyebrow"
            ref={eyebrowRef}
          >
            Discover food differently
          </span>


          <h1 ref={headingRef}>
            See it.
            <br />

            <span>
              Taste it.
            </span>

            <br />

            Find it.
          </h1>


          <p ref={descriptionRef}>
            Discover amazing food from local restaurants
            through short, immersive food reels.
          </p>


          <button
            ref={buttonRef}
            className="hero-button"
            onClick={() => navigate('/reels')}
          >
            Explore Food Reels

            <span>
              â†’
            </span>
          </button>

        </div>


        {/* Reel Preview */}
        <div
          className="hero-visual"
          ref={visualRef}
        >

          <div className="hero-reel hero-reel-back">
            <div className="hero-reel-overlay" />
          </div>


          <div className="hero-reel hero-reel-main">

            <div className="hero-reel-overlay" />

            <div className="hero-reel-content">

              <span className="preview-label">
                NOW DISCOVERING
              </span>

              <h3>
                The Urban Spoon
              </h3>

              <p>
                Creamy butter chicken made fresh today.
              </p>

            </div>

          </div>


          <div className="hero-reel hero-reel-front">
            <div className="hero-reel-overlay" />
          </div>

        </div>

      </section>


      {/* Features */}
      <section
        className="landing-features"
        ref={featuresRef}
      >

        <div className="feature">

          <span className="feature-number">
            01
          </span>

          <div>
            <h3>
              Watch
            </h3>

            <p>
              Discover delicious dishes through
              immersive short videos.
            </p>
          </div>

        </div>


        <div className="feature">

          <span className="feature-number">
            02
          </span>

          <div>
            <h3>
              Discover
            </h3>

            <p>
              Find restaurants and food you
              actually want to try.
            </p>
          </div>

        </div>


        <div className="feature">

          <span className="feature-number">
            03
          </span>

          <div>
            <h3>
              Experience
            </h3>

            <p>
              Turn scrolling into your next
              great food experience.
            </p>
          </div>

        </div>

      </section>

    </main>
  )
}

export default Home
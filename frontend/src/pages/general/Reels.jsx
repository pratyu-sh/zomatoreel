
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Home,
  MessageCircle,
  PlaySquare,
} from "lucide-react";

import "../../styles/Reels.css";

const Reels = () => {
  const navigate = useNavigate();

  // =========================================
  // STATE
  // =========================================

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Like / Save states
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [savedVideos, setSavedVideos] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});

  // Video refs
  const videoRefs = useRef(new Map());
  const containerRef = useRef(null);

  // =========================================
  // FETCH FOOD REELS
  // =========================================

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:3000/api/food",
          {
            withCredentials: true,
          }
        );

        console.log("Food API response:", response.data);

        const foodItems = response.data.fooditems || [];

        setVideos(foodItems);

        // Initialize like/save state
        const likes = {};
        const liked = new Set();
        const saved = new Set();

        foodItems.forEach((item) => {
          likes[item._id] = item.likeCount || item.LikeCount || 0;

          if (item.isLiked) {
            liked.add(item._id);
          }

          if (item.isSaved) {
            saved.add(item._id);
          }
        });

        setLikeCounts(likes);
        setLikedVideos(liked);
        setSavedVideos(saved);
      } catch (error) {
        console.error(
          "Failed to fetch food:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load food reels."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  // =========================================
  // LIKE / UNLIKE
  // =========================================

  const handleLike = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlyLiked = likedVideos.has(foodId);

    // Optimistic UI update
    setLikedVideos((previous) => {
      const updated = new Set(previous);

      if (currentlyLiked) {
        updated.delete(foodId);
      } else {
        updated.add(foodId);
      }

      return updated;
    });

    setLikeCounts((previous) => ({
      ...previous,
      [foodId]: Math.max(
        0,
        (previous[foodId] || 0) +
          (currentlyLiked ? -1 : 1)
      ),
    }));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodid: foodId },
        {
          withCredentials: true,
        }
      );

      console.log("Like response:", response.data);

      // Sync with backend response
      if (
        typeof response.data.likeCount === "number"
      ) {
        setLikeCounts((previous) => ({
          ...previous,
          [foodId]: response.data.likeCount,
        }));
      }

      if (
        typeof response.data.isLiked === "boolean"
      ) {
        setLikedVideos((previous) => {
          const updated = new Set(previous);

          if (response.data.isLiked) {
            updated.add(foodId);
          } else {
            updated.delete(foodId);
          }

          return updated;
        });
      }
    } catch (error) {
      console.error(
        "Failed to like food:",
        error.response?.data || error
      );

      // Rollback like state
      setLikedVideos((previous) => {
        const updated = new Set(previous);

        if (currentlyLiked) {
          updated.add(foodId);
        } else {
          updated.delete(foodId);
        }

        return updated;
      });

      // Rollback like count
      setLikeCounts((previous) => ({
        ...previous,
        [foodId]: Math.max(
          0,
          (previous[foodId] || 0) +
            (currentlyLiked ? 1 : -1)
        ),
      }));
    }
  };

  // =========================================
  // SAVE / UNSAVE
  // =========================================

  const handleSave = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlySaved = savedVideos.has(foodId);

    // Optimistic UI update
    setSavedVideos((previous) => {
      const updated = new Set(previous);

      if (currentlySaved) {
        updated.delete(foodId);
      } else {
        updated.add(foodId);
      }

      return updated;
    });

    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodid: foodId },
        {
          withCredentials: true,
        }
      );

      console.log("Save response:", response.data);

      // Sync with backend response
      if (
        typeof response.data.isSaved === "boolean"
      ) {
        setSavedVideos((previous) => {
          const updated = new Set(previous);

          if (response.data.isSaved) {
            updated.add(foodId);
          } else {
            updated.delete(foodId);
          }

          return updated;
        });
      }
    } catch (error) {
      console.error(
        "Failed to save food:",
        error.response?.data || error
      );

      // Rollback save state
      setSavedVideos((previous) => {
        const updated = new Set(previous);

        if (currentlySaved) {
          updated.add(foodId);
        } else {
          updated.delete(foodId);
        }

        return updated;
      });
    }
  };

  // =========================================
  // COMMENTS
  // =========================================

  const handleComments = (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    navigate(`/food/${foodId}/comments`);
  };

  // =========================================
  // VIDEO REF
  // =========================================

  const setVideoRef = (id) => (element) => {
    if (!element) {
      videoRefs.current.delete(id);
      return;
    }

    videoRefs.current.set(id, element);
  };

  // =========================================
  // INTERSECTION OBSERVER
  // =========================================

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.75
          ) {
            // Pause all other videos
            videoRefs.current.forEach(
              (otherVideo) => {
                if (otherVideo !== video) {
                  otherVideo.pause();
                }
              }
            );

            // Play current video
            if (video.paused) {
              const playPromise = video.play();

              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  if (error.name !== "AbortError") {
                    console.error(
                      "Video playback error:",
                      error
                    );
                  }
                });
              }
            }
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: [0.75],
      }
    );

    videoRefs.current.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  // =========================================
  // LOADING STATE
  // =========================================

  if (loading) {
    return (
      <main className="reels-page-state">
        <div className="reels-loader">
          <div className="loader-spinner" />

          <p>
            Finding something delicious...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // ERROR STATE
  // =========================================

  if (error) {
    return (
      <main className="reels-page-state">
        <div className="reels-state-content">
          <div className="state-icon">!</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            className="state-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // =========================================
  // EMPTY STATE
  // =========================================

  if (!videos.length) {
    return (
      <main className="reels-page-state">
        <div className="reels-state-content">
          <div className="state-icon">+</div>

          <h2>No food reels yet</h2>

          <p>
            Restaurants haven't added any food
            reels yet.
          </p>

          <button
            type="button"
            className="state-button"
            onClick={() => navigate("/")}
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  // =========================================
  // MAIN REELS UI
  // =========================================

  return (
    <main
      className="reels-page"
      ref={containerRef}
    >
      {/* =====================================
          TOP BAR
      ====================================== */}

      <div className="reels-top-bar">

        {/* Back */}
        <button
          type="button"
          className="reels-back-button"
          onClick={() => navigate("/")}
          aria-label="Go back"
        >
          <ArrowLeft
            size={24}
            strokeWidth={2}
          />
        </button>

        {/* Brand */}
        <div className="reels-brand">
          <span className="reels-brand-mark">
            B
          </span>

          <span>BiteReel</span>
        </div>

      </div>

      {/* =====================================
          REEL FEED
      ====================================== */}

      <div className="reels-feed">

        {videos.map((item) => {
          const isLiked = likedVideos.has(
            item._id
          );

          const isSaved = savedVideos.has(
            item._id
          );

          return (
            <article
              className="reel"
              key={item._id}
            >

              {/* =================================
                  VIDEO
              ================================== */}

              <video
                ref={setVideoRef(item._id)}
                className="reel-video"
                src={item.video}
                muted
                playsInline
                loop
                preload="metadata"
              />

              {/* =================================
                  OVERLAY
              ================================== */}

              <div
                className="reel-overlay"
                aria-hidden="true"
              />

              {/* =================================
                  INFORMATION
              ================================== */}

              <div className="reel-content">

                <h1 className="reel-food-name">
                  {item.name}
                </h1>

                {item.foodPartner && (
                  <Link
                    className="reel-store-link"
                    to={`/food-partner/profile/${item.foodPartner}`}
                  >
                    {item.foodPartner.name}

                    <span>→</span>
                  </Link>
                )}

                {item.description && (
                  <p
                    className="reel-description"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                )}

              </div>

              {/* =================================
                  RIGHT SIDE ACTIONS
              ================================== */}

              <div className="reel-actions">

                {/* LIKE */}
                <button
                  type="button"
                  className={`reel-action-button ${
                    isLiked ? "liked" : ""
                  }`}
                  onClick={(event) =>
                    handleLike(
                      event,
                      item._id
                    )
                  }
                  aria-label={
                    isLiked
                      ? "Unlike this food"
                      : "Like this food"
                  }
                >
                  <Heart
                    size={28}
                    strokeWidth={2}
                    fill={
                      isLiked
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <span className="reel-action-count">
                    {likeCounts[item._id] || 0}
                  </span>
                </button>


                {/* SAVE */}
                <button
                  type="button"
                  className={`reel-action-button ${
                    isSaved ? "saved" : ""
                  }`}
                  onClick={(event) =>
                    handleSave(
                      event,
                      item._id
                    )
                  }
                  aria-label={
                    isSaved
                      ? "Remove from saved"
                      : "Save this food"
                  }
                >
                  <Bookmark
                    size={28}
                    strokeWidth={2}
                    fill={
                      isSaved
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <span className="reel-action-label">
                    {isSaved
                      ? "Saved"
                      : "Save"}
                  </span>
                </button>


                {/* COMMENTS */}
                <button
                  type="button"
                  className="reel-action-button"
                  onClick={(event) =>
                    handleComments(
                      event,
                      item._id
                    )
                  }
                  aria-label="View comments"
                >
                  <MessageCircle
                    size={28}
                    strokeWidth={2}
                  />

                  <span className="reel-action-label">
                    Comments
                  </span>
                </button>

              </div>

            </article>
          );
        })}

      </div>

      {/* =====================================
          BOTTOM NAVIGATION
      ====================================== */}

      <nav
        className="reels-bottom-nav"
        aria-label="Main navigation"
      >

        {/* HOME */}
        <button
          type="button"
          className="reels-nav-item"
          onClick={() => navigate("/")}
          aria-label="Home"
        >
          <Home
            size={23}
            strokeWidth={2}
          />

          <span>Home</span>
        </button>


        {/* REELS */}
        <button
          type="button"
          className="reels-nav-item active"
          aria-label="Reels"
        >
          <PlaySquare
            size={23}
            strokeWidth={2}
          />

          <span>Reels</span>
        </button>


        {/* SAVED */}
        <button
          type="button"
          className="reels-nav-item"
          onClick={() =>
            navigate("/saved")
          }
          aria-label="Saved"
        >
          <Bookmark
            size={23}
            strokeWidth={2}
          />

          <span>Saved</span>
        </button>

      </nav>

    </main>
  );
};

export default Reels;

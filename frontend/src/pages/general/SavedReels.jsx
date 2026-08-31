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

const SavedReels = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const videoRefs = useRef(new Map());

  useEffect(() => {
    const fetchSavedFoodItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:3000/api/food/saved",
          {
            withCredentials: true,
          }
        );

        const foodItems = response.data.fooditems || [];
        const likes = {};
        const liked = new Set();

        foodItems.forEach((item) => {
          likes[item._id] = item.likeCount || item.LikeCount || 0;

          if (item.isLiked) {
            liked.add(item._id);
          }
        });

        setVideos(foodItems);
        setLikeCounts(likes);
        setLikedVideos(liked);
      } catch (error) {
        console.error(
          "Failed to fetch saved food:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load saved reels."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFoodItems();
  }, []);

  const handleLike = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlyLiked = likedVideos.has(foodId);

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
        (previous[foodId] || 0) + (currentlyLiked ? -1 : 1)
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

      if (typeof response.data.likeCount === "number") {
        setLikeCounts((previous) => ({
          ...previous,
          [foodId]: response.data.likeCount,
        }));
      }

      if (typeof response.data.isLiked === "boolean") {
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

      setLikedVideos((previous) => {
        const updated = new Set(previous);

        if (currentlyLiked) {
          updated.add(foodId);
        } else {
          updated.delete(foodId);
        }

        return updated;
      });

      setLikeCounts((previous) => ({
        ...previous,
        [foodId]: Math.max(
          0,
          (previous[foodId] || 0) + (currentlyLiked ? 1 : -1)
        ),
      }));
    }
  };

  const handleSave = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const previousVideos = videos;
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video._id !== foodId)
    );

    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodid: foodId },
        {
          withCredentials: true,
        }
      );

      if (response.data.isSaved) {
        setVideos(previousVideos);
      }
    } catch (error) {
      console.error(
        "Failed to save food:",
        error.response?.data || error
      );

      setVideos(previousVideos);
    }
  };

  const handleComments = (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    navigate(`/food/${foodId}/comments`);
  };

  const setVideoRef = (id) => (element) => {
    if (!element) {
      videoRefs.current.delete(id);
      return;
    }

    videoRefs.current.set(id, element);
  };

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
            videoRefs.current.forEach((otherVideo) => {
              if (otherVideo !== video) {
                otherVideo.pause();
              }
            });

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

  if (loading) {
    return (
      <main className="reels-page-state">
        <div className="reels-loader">
          <div className="loader-spinner" />

          <p>Loading saved reels...</p>
        </div>
      </main>
    );
  }

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
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!videos.length) {
    return (
      <main className="reels-page-state">
        <div className="reels-state-content">
          <div className="state-icon">+</div>

          <h2>No saved reels yet</h2>

          <p>Save food reels you want to come back to.</p>

          <button
            type="button"
            className="state-button"
            onClick={() => navigate("/reels")}
          >
            Explore reels
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="reels-page">
      <div className="reels-top-bar">
        <button
          type="button"
          className="reels-back-button"
          onClick={() => navigate("/reels")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>

        <div className="reels-brand">
          <span className="reels-brand-mark">B</span>

          <span>Saved</span>
        </div>
      </div>

      <div className="reels-feed">
        {videos.map((item) => {
          const isLiked = likedVideos.has(item._id);

          return (
            <article className="reel" key={item._id}>
              <video
                ref={setVideoRef(item._id)}
                className="reel-video"
                src={item.video}
                muted
                playsInline
                loop
                preload="metadata"
              />

              <div className="reel-overlay" aria-hidden="true" />

              <div className="reel-content">
                <h1 className="reel-food-name">{item.name}</h1>

                {item.foodPartner && (
                  <Link
                    className="reel-store-link"
                    to={`/food-partner/profile/${item.foodPartner}`}
                  >
                    {item.foodPartner.name || "View restaurant"}

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

              <div className="reel-actions">
                <button
                  type="button"
                  className={`reel-action-button ${
                    isLiked ? "liked" : ""
                  }`}
                  onClick={(event) => handleLike(event, item._id)}
                  aria-label={
                    isLiked
                      ? "Unlike this food"
                      : "Like this food"
                  }
                >
                  <Heart
                    size={28}
                    strokeWidth={2}
                    fill={isLiked ? "currentColor" : "none"}
                  />

                  <span className="reel-action-count">
                    {likeCounts[item._id] || 0}
                  </span>
                </button>

                <button
                  type="button"
                  className="reel-action-button saved"
                  onClick={(event) => handleSave(event, item._id)}
                  aria-label="Remove from saved"
                >
                  <Bookmark
                    size={28}
                    strokeWidth={2}
                    fill="currentColor"
                  />

                  <span className="reel-action-label">Saved</span>
                </button>

                <button
                  type="button"
                  className="reel-action-button"
                  onClick={(event) =>
                    handleComments(event, item._id)
                  }
                  aria-label="View comments"
                >
                  <MessageCircle size={28} strokeWidth={2} />

                  <span className="reel-action-label">
                    Comments
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <nav
        className="reels-bottom-nav"
        aria-label="Main navigation"
      >
        <button
          type="button"
          className="reels-nav-item"
          onClick={() => navigate("/")}
          aria-label="Home"
        >
          <Home size={23} strokeWidth={2} />

          <span>Home</span>
        </button>

        <button
          type="button"
          className="reels-nav-item"
          onClick={() => navigate("/reels")}
          aria-label="Reels"
        >
          <PlaySquare size={23} strokeWidth={2} />

          <span>Reels</span>
        </button>

        <button
          type="button"
          className="reels-nav-item active"
          aria-label="Saved"
        >
          <Bookmark size={23} strokeWidth={2} />

          <span>Saved</span>
        </button>
      </nav>
    </main>
  );
};

export default SavedReels;

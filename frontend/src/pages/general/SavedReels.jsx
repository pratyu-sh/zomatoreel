
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
  const [saveCounts, setSaveCounts] = useState({});

  const videoRefs = useRef(new Map());
  const feedRef = useRef(null);

  // =========================================
  // FETCH SAVED FOOD REELS
  // =========================================

  useEffect(() => {
    const fetchSavedFoodItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:3000/api/food/saved",
          { withCredentials: true }
        );

        // Backend returns { fooditems: [...] }
        const foodItems = response.data.fooditems || [];

        const likes = {};
        const saves = {};
        const liked = new Set();

        foodItems.forEach((item) => {
          likes[item._id] = item.likeCount || item.LikeCount || 0;
          saves[item._id] = item.saveCount || 0;
          if (item.isLiked) liked.add(item._id);
        });

        setVideos(foodItems);
        setLikeCounts(likes);
        setSaveCounts(saves);
        setLikedVideos(liked);
      } catch (error) {
        console.error("Failed to fetch saved food:", error.response?.data || error);

        if (error.response?.status === 401) {
          navigate("/user/login");
          return;
        }

        setError(error.response?.data?.message || "Unable to load saved reels.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFoodItems();
  }, []);

  // =========================================
  // LIKE / UNLIKE
  // =========================================

  const handleLike = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlyLiked = likedVideos.has(foodId);

    setLikedVideos((prev) => {
      const updated = new Set(prev);
      currentlyLiked ? updated.delete(foodId) : updated.add(foodId);
      return updated;
    });

    setLikeCounts((prev) => ({
      ...prev,
      [foodId]: Math.max(0, (prev[foodId] || 0) + (currentlyLiked ? -1 : 1)),
    }));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodid: foodId },
        { withCredentials: true }
      );

      if (typeof response.data.likeCount === "number") {
        setLikeCounts((prev) => ({ ...prev, [foodId]: response.data.likeCount }));
      }

      if (typeof response.data.isLiked === "boolean") {
        setLikedVideos((prev) => {
          const updated = new Set(prev);
          response.data.isLiked ? updated.add(foodId) : updated.delete(foodId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to like food:", error.response?.data || error);
      setLikedVideos((prev) => {
        const updated = new Set(prev);
        currentlyLiked ? updated.add(foodId) : updated.delete(foodId);
        return updated;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [foodId]: Math.max(0, (prev[foodId] || 0) + (currentlyLiked ? 1 : -1)),
      }));
    }
  };

  // =========================================
  // UNSAVE — removes the reel from this page
  // =========================================

  const handleSave = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const previousVideos = videos;
    const previousSaveCount = saveCounts[foodId] || 0;

    // Optimistically remove from list
    setVideos((current) => current.filter((v) => v._id !== foodId));
    setSaveCounts((prev) => ({
      ...prev,
      [foodId]: Math.max(0, (prev[foodId] || 0) - 1),
    }));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodid: foodId },
        { withCredentials: true }
      );

      if (typeof response.data.saveCount === "number") {
        setSaveCounts((prev) => ({ ...prev, [foodId]: response.data.saveCount }));
      }

      // If backend says it was re-saved (shouldn't happen here), restore
      if (response.data.isSaved) {
        setVideos(previousVideos);
      }
    } catch (error) {
      console.error("Failed to unsave food:", error.response?.data || error);
      // Rollback
      setVideos(previousVideos);
      setSaveCounts((prev) => ({ ...prev, [foodId]: previousSaveCount }));
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

  // =========================================
  // INTERSECTION OBSERVER — feedRef as root
  // =========================================

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            videoRefs.current.forEach((otherVideo) => {
              if (otherVideo !== video) otherVideo.pause();
            });
            if (video.paused) {
              video.play().catch((err) => {
                if (err.name !== "AbortError") {
                  console.error("Video playback error:", err);
                }
              });
            }
          } else {
            video.pause();
          }
        });
      },
      {
        root: null,
        threshold: [0.5],
      }
    );

    videoRefs.current.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [videos]);

  // =========================================
  // LOADING STATE
  // =========================================

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
          <button type="button" className="state-button" onClick={() => window.location.reload()}>
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
          <div className="state-icon">
            <Bookmark size={22} />
          </div>
          <h2>No saved reels yet</h2>
          <p>Save food reels you want to come back to.</p>
          <button type="button" className="state-button" onClick={() => navigate("/reels")}>
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

      <div className="reels-feed" ref={feedRef}>
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
                  <p className="reel-description" title={item.description}>
                    {item.description}
                  </p>
                )}
              </div>

              <div className="reel-actions">
                {/* LIKE */}
                <button
                  type="button"
                  className={`reel-action-button ${isLiked ? "liked" : ""}`}
                  onClick={(event) => handleLike(event, item._id)}
                  aria-label={isLiked ? "Unlike this food" : "Like this food"}
                >
                  <Heart size={28} strokeWidth={2} fill={isLiked ? "currentColor" : "none"} />
                  <span className="reel-action-count">{likeCounts[item._id] || 0}</span>
                </button>

                {/* UNSAVE */}
                <button
                  type="button"
                  className="reel-action-button saved"
                  onClick={(event) => handleSave(event, item._id)}
                  aria-label="Remove from saved"
                >
                  <Bookmark size={28} strokeWidth={2} fill="currentColor" />
                  <span className="reel-action-count">{saveCounts[item._id] || 0}</span>
                </button>

                {/* COMMENTS */}
                <button
                  type="button"
                  className="reel-action-button"
                  onClick={(event) => handleComments(event, item._id)}
                  aria-label="View comments"
                >
                  <MessageCircle size={28} strokeWidth={2} />
                  <span className="reel-action-label">Comments</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <nav className="reels-bottom-nav" aria-label="Main navigation">
        <button type="button" className="reels-nav-item" onClick={() => navigate("/")} aria-label="Home">
          <Home size={23} strokeWidth={2} />
          <span>Home</span>
        </button>

        <button type="button" className="reels-nav-item" onClick={() => navigate("/reels")} aria-label="Reels">
          <PlaySquare size={23} strokeWidth={2} />
          <span>Reels</span>
        </button>

        <button type="button" className="reels-nav-item active" aria-label="Saved">
          <Bookmark size={23} strokeWidth={2} />
          <span>Saved</span>
        </button>
      </nav>
    </main>
  );
};

export default SavedReels;

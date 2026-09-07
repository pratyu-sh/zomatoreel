
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

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [savedVideos, setSavedVideos] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [saveCounts, setSaveCounts] = useState({});

  const videoRefs = useRef(new Map());
  const feedRef = useRef(null);

  // =========================================
  // FETCH FOOD REELS
  // =========================================

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("http://localhost:3000/api/food", {
          withCredentials: true,
        });

        const foodItems = response.data.fooditems || [];
        setVideos(foodItems);

        const likes = {};
        const saves = {};
        const liked = new Set();
        const saved = new Set();

        foodItems.forEach((item) => {
          likes[item._id] = item.likeCount || item.LikeCount || 0;
          saves[item._id] = item.saveCount || 0;
          if (item.isLiked) liked.add(item._id);
          if (item.isSaved) saved.add(item._id);
        });

        setLikeCounts(likes);
        setSaveCounts(saves);
        setLikedVideos(liked);
        setSavedVideos(saved);
      } catch (error) {
        console.error("Failed to fetch food:", error.response?.data || error);

        if (error.response?.status === 401) {
          navigate("/user/login");
          return;
        }

        setError(error.response?.data?.message || "Unable to load food reels.");
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
  // SAVE / UNSAVE
  // =========================================

  const handleSave = async (event, foodId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlySaved = savedVideos.has(foodId);

    setSavedVideos((prev) => {
      const updated = new Set(prev);
      currentlySaved ? updated.delete(foodId) : updated.add(foodId);
      return updated;
    });

    setSaveCounts((prev) => ({
      ...prev,
      [foodId]: Math.max(0, (prev[foodId] || 0) + (currentlySaved ? -1 : 1)),
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

      if (typeof response.data.isSaved === "boolean") {
        setSavedVideos((prev) => {
          const updated = new Set(prev);
          response.data.isSaved ? updated.add(foodId) : updated.delete(foodId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to save food:", error.response?.data || error);
      setSavedVideos((prev) => {
        const updated = new Set(prev);
        currentlySaved ? updated.add(foodId) : updated.delete(foodId);
        return updated;
      });
      setSaveCounts((prev) => ({
        ...prev,
        [foodId]: Math.max(0, (prev[foodId] || 0) + (currentlySaved ? 1 : -1)),
      }));
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
  // INTERSECTION OBSERVER — uses feedRef as root
  // so it tracks visibility inside the scroll container
  // =========================================

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Pause all other videos
            videoRefs.current.forEach((otherVideo) => {
              if (otherVideo !== video) otherVideo.pause();
            });
            // Play this one
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
        root: null,        // use the viewport as root
        threshold: [0.5],  // fire when >50% visible
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
          <p>Finding something delicious...</p>
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
          <div className="state-icon">+</div>
          <h2>No food reels yet</h2>
          <p>Restaurants haven't added any food reels yet.</p>
          <button type="button" className="state-button" onClick={() => navigate("/")}>
            Go home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="reels-page">
      {/* Fixed top bar — outside feed so it doesn't scroll */}
      <div className="reels-top-bar">
        <button type="button" className="reels-back-button" onClick={() => navigate("/")} aria-label="Go back">
          <ArrowLeft size={24} strokeWidth={2} />
        </button>
        <div className="reels-brand">
          <span className="reels-brand-mark">B</span>
          <span>BiteReel</span>
        </div>
      </div>

      {/* Scrollable feed — ref attached for IntersectionObserver root */}
      <div className="reels-feed" ref={feedRef}>
        {videos.map((item) => {
          const isLiked = likedVideos.has(item._id);
          const isSaved = savedVideos.has(item._id);

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
                  <Link className="reel-store-link" to={`/food-partner/profile/${item.foodPartner}`}>
                    {item.foodPartner.name}
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
                <button
                  type="button"
                  className={`reel-action-button ${isLiked ? "liked" : ""}`}
                  onClick={(event) => handleLike(event, item._id)}
                  aria-label={isLiked ? "Unlike this food" : "Like this food"}
                >
                  <Heart size={28} strokeWidth={2} fill={isLiked ? "currentColor" : "none"} />
                  <span className="reel-action-count">{likeCounts[item._id] || 0}</span>
                </button>

                <button
                  type="button"
                  className={`reel-action-button ${isSaved ? "saved" : ""}`}
                  onClick={(event) => handleSave(event, item._id)}
                  aria-label={isSaved ? "Remove from saved" : "Save this food"}
                >
                  <Bookmark size={28} strokeWidth={2} fill={isSaved ? "currentColor" : "none"} />
                  <span className="reel-action-count">{saveCounts[item._id] || 0}</span>
                </button>

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

        <button type="button" className="reels-nav-item active" aria-label="Reels">
          <PlaySquare size={23} strokeWidth={2} />
          <span>Reels</span>
        </button>

        <button type="button" className="reels-nav-item" onClick={() => navigate("/saved")} aria-label="Saved">
          <Bookmark size={23} strokeWidth={2} />
          <span>Saved</span>
        </button>
      </nav>
    </main>
  );
};

export default Reels;

import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Background Video */}
      <video
        className="landing__video"
        autoPlay
        loop
        muted
        playsInline
      >
        {/* Option A: local file in /public/videos/plane.mp4 */}
        <source src="/videos/plane.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for readability */}
      <div className="landing__overlay" />

      {/* Content */}
      <div className="landing__content">
        <h1 className="landing__title">Your World</h1>
        <p className="landing__subtitle">
          Save trips, mark visited states, rate experiences, and build your personal map.
        </p>

        <div className="landing__actions">
          <button
            className="landing__btn landing__btn--primary"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>

          <button
            className="landing__btn landing__btn--ghost"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;

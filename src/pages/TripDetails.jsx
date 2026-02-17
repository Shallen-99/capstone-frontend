import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosconfig";
import USMap from "../components/map/USMap";
import "../styles/tripdetails.css";

function TripDetails() {
  const { tripId } = useParams(); // undefined means create mode
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Trip fields
  const [title, setTitle] = useState("");
  const [states, setStates] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photos, setPhotos] = useState([]);

  // Load trip if editing
  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/trips/${tripId}`);
        const t = res.data;

        setTitle(t.title || "");
        setStates(t.states || []);
        setComment(t.comment || "");
        setRating(t.rating || 0);
        setPhotos(t.photos || []);
      } catch (err) {
        console.error(err);
        setError("Could not load trip.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const toggleState = (stateId) => {
    setStates((prev) =>
      prev.includes(stateId)
        ? prev.filter((s) => s !== stateId)
        : [...prev, stateId]
    );
  };

  const addPhotoUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    setPhotos((prev) => [...prev, url]);
    setPhotoUrlInput("");
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    try {
      setError("");
      setLoading(true);

      const payload = {
        title,
        states,
        comment,
        rating,
        photos,
      };

      if (!title.trim()) {
        setError("Title is required.");
        setLoading(false);
        return;
      }

      if (tripId) {
        await api.put(`/trips/${tripId}`, payload);
      } else {
        await api.post("/trips", payload);
      }

      navigate("/"); // back to dashboard
    } catch (err) {
      console.error(err);
      setError("Failed to save trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tripd">
      <div className="tripd__container">
        {/* Header */}
        <header className="tripd__header">
          <div>
            <h1 className="tripd__title">{tripId ? "Edit Trip" : "Create New Trip"}</h1>
            <p className="tripd__subtitle">
              Build your route, add notes, rate the trip, and save photos.
            </p>
          </div>

          <div className="tripd__actions">
            <button
              className="tripd__btn tripd__btn--primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Trip"}
            </button>

            <button className="tripd__btn tripd__btn--ghost" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="tripd__error" role="alert" aria-live="polite">
            <span className="tripd__errorIcon" aria-hidden="true">
              ⚠
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Main layout */}
        <div className="tripd__grid">
          {/* Left: Map + selection */}
          <section className="tripd__panel">
            <div className="tripd__panelHeader">
              <div>
                <h2 className="tripd__panelTitle">Select States</h2>
                <p className="tripd__panelSub">Click a state to toggle it in your trip.</p>
              </div>
              <div className="tripd__pill">
                Selected: <strong>{states.length}</strong>
              </div>
            </div>

            <div className="tripd__mapWrap">
              {loading ? (
                <div className="tripd__mapSkeleton">
                  <div className="tripd__shimmer" />
                  <p>Loading...</p>
                </div>
              ) : (
                <USMap selectedStates={states} onToggleState={toggleState} />
              )}
            </div>

            <div className="tripd__legend">
              <LegendSwatch color="#22c55e" label="Selected" />
              <LegendSwatch color="#D6D6DA" label="Not selected" />
              <LegendSwatch color="#3498db" label="Hover" />
            </div>
          </section>

          {/* Right: Form */}
          <section className="tripd__panel">
            <div className="tripd__panelHeader tripd__panelHeader--tight">
              <div>
                <h2 className="tripd__panelTitle">Trip Details</h2>
                <p className="tripd__panelSub">Give it a title, notes, rating, and photos.</p>
              </div>
            </div>

            <div className="tripd__form">
              {/* Title */}
              <div className="tripd__field">
                <label className="tripd__label">Trip Title</label>
                <input
                  className="tripd__input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Colorado Weekend"
                  disabled={loading}
                />
              </div>

              {/* Notes */}
              <div className="tripd__field">
                <label className="tripd__label">Comment / Notes</label>
                <textarea
                  className="tripd__textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you do? What did you like?"
                  disabled={loading}
                />
              </div>

              {/* Rating */}
              <div className="tripd__field">
                <label className="tripd__label">Rating</label>
                <StarRating rating={rating} setRating={setRating} disabled={loading} />
              </div>

              {/* Photos */}
              <div className="tripd__field">
                <label className="tripd__label">Add Photo (URL for MVP)</label>

                <div className="tripd__row">
                  <input
                    className="tripd__input"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="https://..."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="tripd__btn tripd__btn--small"
                    onClick={addPhotoUrl}
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>

                {photos.length > 0 && (
                  <div className="tripd__photos">
                    <div className="tripd__photosHead">
                      <span className="tripd__muted">
                        Photos: <strong>{photos.length}</strong>
                      </span>
                    </div>

                    <div className="tripd__photoGrid">
                      {photos.map((url, idx) => (
                        <div key={idx} className="tripd__photoCard">
                          <div className="tripd__photoImgWrap">
                            <img
                              src={url}
                              alt="trip"
                              className="tripd__photoImg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            className="tripd__btn tripd__btn--danger"
                            onClick={() => removePhoto(idx)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom actions (mobile-friendly) */}
              <div className="tripd__footerActions">
                <button
                  className="tripd__btn tripd__btn--primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Trip"}
                </button>
                <button
                  className="tripd__btn tripd__btn--ghost"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;

/* ---------- Legend ---------- */
function LegendSwatch({ color, label }) {
  return (
    <div className="tripd__legendItem">
      <span className="tripd__swatch" style={{ backgroundColor: color }} />
      <span className="tripd__legendText">{label}</span>
    </div>
  );
}

/* ---------- Star Rating ---------- */
function StarRating({ rating, setRating, disabled }) {
  return (
    <div className={`tripd__stars ${disabled ? "tripd__stars--disabled" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`tripd__star ${n <= rating ? "tripd__star--on" : ""}`}
          onClick={() => setRating(n)}
          disabled={disabled}
          title={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      <span className="tripd__starText">{rating ? `${rating}/5` : "No rating"}</span>
    </div>
  );
}

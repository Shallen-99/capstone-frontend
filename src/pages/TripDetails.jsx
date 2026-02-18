import { useEffect, useMemo, useState } from "react";
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

  // Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Legacy MVP URL photos (keep if you want)
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photos, setPhotos] = useState([]);

  // Uploaded media saved on trip (edit mode)
  const [media, setMedia] = useState([]); // [{url,type,filename,...}]

  // Create mode: queue files until trip exists
  const [queuedFiles, setQueuedFiles] = useState([]); // File[]

  const queuedPreviews = useMemo(() => {
    return queuedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image"
    }));
  }, [queuedFiles]);

  // Cleanup previews
  useEffect(() => {
    return () => {
      queuedPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [queuedPreviews]);

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
        setMedia(t.media || []);

        setStartDate(t.startDate ? String(t.startDate).slice(0, 10) : "");
        setEndDate(t.endDate ? String(t.endDate).slice(0, 10) : "");
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
      prev.includes(stateId) ? prev.filter((s) => s !== stateId) : [...prev, stateId]
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

  // Upload a file to backend
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return res.data; // { url, filename, type }
  };

  // Handle picking a file
  const handlePickFile = async (file) => {
    if (!file) return;
    setError("");

    // Edit mode: upload immediately and attach to trip
    if (tripId) {
      try {
        setLoading(true);
        const uploaded = await uploadFile(file);
        const updated = await api.post(`/trips/${tripId}/media`, uploaded);
        setMedia(updated.data.media || []);
      } catch (err) {
        console.error(err);
        setError("Upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Create mode: queue it
    setQueuedFiles((prev) => [...prev, file]);
  };

  const removeQueued = (idx) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    try {
      setError("");
      setLoading(true);

      if (!title.trim()) {
        setError("Title is required.");
        setLoading(false);
        return;
      }

      const payload = {
        title,
        states,
        comment,
        rating,
        photos,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      if (tripId) {
        // Edit existing trip
        await api.put(`/trips/${tripId}`, payload);
        navigate("/dashboard");
        return;
      }

      // Create trip first
      const createdRes = await api.post("/trips", payload);
      const newTripId = createdRes.data._id;

      // Upload queued files and attach
      for (const file of queuedFiles) {
        const uploaded = await uploadFile(file);
        await api.post(`/trips/${newTripId}/media`, uploaded);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save trip.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tripId) return;

    const ok = window.confirm("Delete this trip? This cannot be undone.");
    if (!ok) return;

    try {
      setError("");
      setLoading(true);
      await api.delete(`/trips/${tripId}`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to delete trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tripd">
      <div className="tripd__container">
        <header className="tripd__header">
          <div>
            <h1 className="tripd__title">{tripId ? "Edit Trip" : "Create New Trip"}</h1>
            <p className="tripd__subtitle">
              Build your route, add notes, rate the trip, add dates, and upload photos/videos.
            </p>
          </div>

          <div className="tripd__actions">
            <button className="tripd__btn tripd__btn--primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Trip"}
            </button>

            <button className="tripd__btn tripd__btn--ghost" onClick={() => navigate("/dashboard")} disabled={loading}>
              Cancel
            </button>

            {tripId && (
              <button className="tripd__btn tripd__btn--danger" onClick={handleDelete} disabled={loading} type="button">
                Delete Trip
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="tripd__error" role="alert" aria-live="polite">
            <span className="tripd__errorIcon" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="tripd__grid">
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
          </section>

          <section className="tripd__panel">
            <div className="tripd__panelHeader tripd__panelHeader--tight">
              <div>
                <h2 className="tripd__panelTitle">Trip Details</h2>
                <p className="tripd__panelSub">Title, notes, rating, dates, and media.</p>
              </div>
            </div>

            <div className="tripd__form">
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

              <div className="tripd__field">
                <label className="tripd__label">Start Date</label>
                <input
                  type="date"
                  className="tripd__input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="tripd__field">
                <label className="tripd__label">End Date</label>
                <input
                  type="date"
                  className="tripd__input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>

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

              <div className="tripd__field">
                <label className="tripd__label">Rating</label>
                <StarRating rating={rating} setRating={setRating} disabled={loading} />
              </div>

              <div className="tripd__field">
                <label className="tripd__label">Upload Photo/Video</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  disabled={loading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePickFile(file);
                    e.target.value = "";
                  }}
                />

                {!tripId && queuedPreviews.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p>Queued (uploads after Save): {queuedPreviews.length}</p>
                    <div className="tripd__photoGrid">
                      {queuedPreviews.map((p, idx) => (
                        <div key={idx} className="tripd__photoCard">
                          <div className="tripd__photoImgWrap">
                            {p.type === "video" ? (
                              <video className="tripd__photoImg" src={p.previewUrl} controls />
                            ) : (
                              <img className="tripd__photoImg" src={p.previewUrl} alt="queued" />
                            )}
                          </div>
                          <button
                            type="button"
                            className="tripd__btn tripd__btn--danger"
                            onClick={() => removeQueued(idx)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tripId && media.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p>Saved media: {media.length}</p>
                    <div className="tripd__photoGrid">
                      {media.map((m, idx) => (
                        <div key={idx} className="tripd__photoCard">
                          <div className="tripd__photoImgWrap">
                            {m.type === "video" ? (
                              <video
                                className="tripd__photoImg"
                                src={`http://localhost:5000${m.url}`}
                                controls
                              />
                            ) : (
                              <img
                                className="tripd__photoImg"
                                src={`http://localhost:5000${m.url}`}
                                alt="uploaded"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="tripd__field">
                <label className="tripd__label">Add Photo (URL)</label>

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

              <div className="tripd__footerActions">
                <button className="tripd__btn tripd__btn--primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Trip"}
                </button>

                <button className="tripd__btn tripd__btn--ghost" onClick={() => navigate("/dashboard")} disabled={loading}>
                  Cancel
                </button>

                {tripId && (
                  <button className="tripd__btn tripd__btn--danger" onClick={handleDelete} disabled={loading} type="button">
                    Delete Trip
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;

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

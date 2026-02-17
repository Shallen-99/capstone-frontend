import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosconfig";
import USMap from "../components/map/USMap";

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
        photos
      };

      if (!title.trim()) {
        setError("Title is required.");
        setLoading(false);
        return;
      }

      if (tripId) {
        // edit
        await api.put(`/trips/${tripId}`, payload);
      } else {
        // create
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

  if (loading) return <p style={{ padding: "1rem" }}>Loading...</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <h2>{tripId ? "Edit Trip" : "Create New Trip"}</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label>Trip Title</label>
        <input
          style={{ width: "100%", padding: 8, marginTop: 6 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Colorado Weekend"
        />
      </div>

      <h3>Select States (click to toggle)</h3>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <USMap selectedStates={states} onToggleState={toggleState} />
      </div>

      <p><b>Selected:</b> {states.length} states</p>

      <div style={{ marginTop: "1rem" }}>
        <label>Comment / Notes</label>
        <textarea
          style={{ width: "100%", padding: 8, marginTop: 6, minHeight: 90 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you do? What did you like?"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Rating</label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Add Photo (URL for MVP)</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            style={{ flex: 1, padding: 8 }}
            value={photoUrlInput}
            onChange={(e) => setPhotoUrlInput(e.target.value)}
            placeholder="https://..."
          />
          <button type="button" onClick={addPhotoUrl}>
            Add
          </button>
        </div>

        {photos.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p><b>Photos:</b></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {photos.map((url, idx) => (
                <div key={idx} style={{ width: 150 }}>
                  <img
                    src={url}
                    alt="trip"
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    style={{ marginTop: 6, width: "100%" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
        <button onClick={handleSave} disabled={loading}>
          Save Trip
        </button>
        <button onClick={() => navigate("/")}>Cancel</button>
      </div>
    </div>
  );
}

export default TripDetails;

// -------------------------
// Star Rating Component
// -------------------------
function StarRating({ rating, setRating }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => setRating(n)}
          style={{
            fontSize: 28,
            cursor: "pointer",
            userSelect: "none",
            color: n <= rating ? "#f1c40f" : "#bdc3c7"
          }}
          title={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
      <span style={{ marginLeft: 10, alignSelf: "center" }}>
        {rating ? `${rating}/5` : "No rating"}
      </span>
    </div>
  );
}

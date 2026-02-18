import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosconfig";
import USMap from "../components/map/USMap";
import "../styles/dashboard.css";
import useTheme from "../hooks/useTheme";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { resolvedTheme, toggleTheme } = useTheme();

  const fetchTrips = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const visitedStates = useMemo(() => {
    const set = new Set();
    for (const trip of trips) {
      for (const s of trip.states || []) set.add(s);
    }
    return Array.from(set);
  }, [trips]);

  const totalStates = 50;
  const remaining = Math.max(totalStates - visitedStates.length, 0);

  const totalTrips = trips.length;
  const avgRating =
    trips.length === 0
      ? null
      : (() => {
          const ratings = trips
            .map((t) => (typeof t.rating === "number" ? t.rating : null))
            .filter((r) => r && r > 0);
          if (ratings.length === 0) return null;
          const sum = ratings.reduce((a, b) => a + b, 0);
          return (sum / ratings.length).toFixed(1);
        })();

  //DELETE trip handler
  const handleDeleteTrip = async (trip, e) => {
    // prevent the trip card click navigation
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm(`Delete trip "${trip.title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setError("");
      await api.delete(`/trips/${trip._id}`);
      // remove from UI
      setTrips((prev) => prev.filter((t) => t._id !== trip._id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete trip.");
    }
  };

  return (
    <div className="dash">
      <div className="dash__container">
        <header className="dash__header">
          <div>
            <h1 className="dash__title">My Travel Dashboard</h1>
            <p className="dash__subtitle">
              Visited <strong>{visitedStates.length}</strong> / {totalStates} states
              <span className="dash__sep">•</span>
              Remaining <strong>{remaining}</strong>
            </p>
          </div>

          <div className="dash__actions">
            {/* Theme toggle (switch) */}
            <button
              type="button"
              className="dash__themeToggle"
              role="switch"
              aria-checked={resolvedTheme === "light"}
              aria-label="Toggle theme"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <span className="dash__themeToggleTrack" aria-hidden="true">
                <span className="dash__themeToggleThumb" aria-hidden="true">
                  <span className="dash__themeToggleIcon" aria-hidden="true">
                    {resolvedTheme === "dark" ? (
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4 11a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1Zm16 0a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1ZM5.64 5.64a1 1 0 0 1 1.41 0l.7.7a1 1 0 0 1-1.41 1.41l-.7-.7a1 1 0 0 1 0-1.41Zm11.31 11.31a1 1 0 0 1 1.41 0l.7.7a1 1 0 1 1-1.41 1.41l-.7-.7a1 1 0 0 1 0-1.41ZM18.36 5.64a1 1 0 0 1 0 1.41l-.7.7a1 1 0 1 1-1.41-1.41l.7-.7a1 1 0 0 1 1.41 0ZM7.05 16.95a1 1 0 0 1 0 1.41l-.7.7a1 1 0 1 1-1.41-1.41l.7-.7a1 1 0 0 1 1.41 0Z"
                        />
                      </svg>
                    )}
                  </span>
                </span>
              </span>
              <span className="dash__themeToggleLabel">
                {resolvedTheme === "dark" ? "Dark" : "Light"}
              </span>
            </button>

            <button
              className="dash__btn dash__btn--primary"
              onClick={() => navigate("/trips/new")}
            >
              + New Trip
            </button>
            <button className="dash__btn dash__btn--ghost" onClick={fetchTrips}>
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="dash__error" role="alert" aria-live="polite">
            <span className="dash__errorIcon" aria-hidden="true"></span>
            <span>{error}</span>
          </div>
        )}

        <section className="dash__stats">
          <div className="dash__statCard">
            <div className="dash__statLabel">Visited States</div>
            <div className="dash__statValue">{visitedStates.length}</div>
            <div className="dash__statHint">Out of {totalStates} total</div>
          </div>

          <div className="dash__statCard">
            <div className="dash__statLabel">Trips Created</div>
            <div className="dash__statValue">{totalTrips}</div>
            <div className="dash__statHint">Click a trip to view details</div>
          </div>

          <div className="dash__statCard">
            <div className="dash__statLabel">Average Rating</div>
            <div className="dash__statValue">{avgRating ? avgRating : "—"}</div>
            <div className="dash__statHint">
              {avgRating ? "Based on rated trips" : "No ratings yet"}
            </div>
          </div>
        </section>

        <section className="dash__grid">
          <div className="dash__panel">
            <div className="dash__panelHeader">
              <div>
                <h2 className="dash__panelTitle">Visited Map</h2>
                <p className="dash__panelSub">Hover states on the map to explore.</p>
              </div>

              <div className="dash__legend" aria-label="Map legend">
                <LegendSwatch color="#2ecc71" label="Visited" />
                <LegendSwatch color="#D6D6DA" label="Not visited yet" />
                <LegendSwatch color="#3498db" label="Hover" />
              </div>
            </div>

            <div className="dash__mapWrap">
              {loading ? (
                <div className="dash__mapSkeleton">
                  <div className="dash__shimmer" />
                  <p>Loading your trips...</p>
                </div>
              ) : (
                <USMap visitedStates={visitedStates} />
              )}
            </div>
          </div>

          <div className="dash__panel">
            <div className="dash__panelHeader dash__panelHeader--tight">
              <div>
                <h2 className="dash__panelTitle">Your Trips</h2>
                <p className="dash__panelSub">
                  Your saved journeys and the states you picked.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="dash__tripSkeletonList">
                <TripSkeleton />
                <TripSkeleton />
                <TripSkeleton />
              </div>
            ) : trips.length === 0 ? (
              <div className="dash__empty">
                <div className="dash__emptyIcon" aria-hidden="true"></div>
                <p className="dash__emptyTitle">No trips yet</p>
                <p className="dash__emptySub">
                  Click <strong>New Trip</strong> to create your first route.
                </p>
                <button
                  className="dash__btn dash__btn--primary"
                  onClick={() => navigate("/trips/new")}
                >
                  + New Trip
                </button>
              </div>
            ) : (
              <div className="dash__tripList">
                {trips.map((trip) => (
                  <button
                    key={trip._id}
                    className="dash__tripCard"
                    onClick={() => navigate(`/trip/${trip._id}`)}
                    type="button"
                  >
                    <div className="dash__tripTop">
                      <div className="dash__tripTitle">{trip.title}</div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {typeof trip.rating === "number" && trip.rating > 0 ? (
                          <div className="dash__pill">{trip.rating}/5</div>
                        ) : (
                          <div className="dash__pill dash__pill--muted">Unrated</div>
                        )}

                        {/*Delete button inside the clickable card */}
                        <button
                          type="button"
                          className="dash__btn dash__btn--ghost"
                          onClick={(e) => handleDeleteTrip(trip, e)}
                          aria-label={`Delete ${trip.title}`}
                          title="Delete trip"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="dash__tripMeta">
                      <span>
                        <strong>{trip.states?.length || 0}</strong> states selected
                      </span>
                      <span className="dash__dot" aria-hidden="true">
                        •
                      </span>
                      <span className="dash__muted">Open details →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

function LegendSwatch({ color, label }) {
  return (
    <div className="dash__legendItem">
      <span className="dash__swatch" style={{ backgroundColor: color }} />
      <span className="dash__legendText">{label}</span>
    </div>
  );
}

function TripSkeleton() {
  return (
    <div className="dash__tripSkeleton">
      <div className="dash__tripSkeletonTop">
        <div className="dash__skel dash__skel--title" />
        <div className="dash__skel dash__skel--pill" />
      </div>
      <div className="dash__skel dash__skel--line" />
    </div>
  );
}

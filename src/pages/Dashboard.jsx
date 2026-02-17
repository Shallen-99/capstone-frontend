import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosconfig";
import USMap from "../components/map/USMap";
import "../styles/dashboard.css";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // union of all states across all trips
  const visitedStates = useMemo(() => {
    const set = new Set();
    for (const trip of trips) {
      for (const s of trip.states || []) set.add(s);
    }
    return Array.from(set);
  }, [trips]);

  const totalStates = 50;
  const remaining = Math.max(totalStates - visitedStates.length, 0);

  // quick stats
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

  return (
    <div className="dash">
      <div className="dash__container">
        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="dash__error" role="alert" aria-live="polite">
            <span className="dash__errorIcon" aria-hidden="true">
              
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Top Stats */}
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
            <div className="dash__statValue">
              {avgRating ? avgRating : "—"}
            </div>
            <div className="dash__statHint">
              {avgRating ? "Based on rated trips" : "No ratings yet"}
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <section className="dash__grid">
          {/* Map Panel */}
          <div className="dash__panel">
            <div className="dash__panelHeader">
              <div>
                <h2 className="dash__panelTitle">Visited Map</h2>
                <p className="dash__panelSub">
                  Hover states on the map to explore.
                </p>
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

          {/* Trips Panel */}
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
                <div className="dash__emptyIcon" aria-hidden="true">
                  
                </div>
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
                  >
                    <div className="dash__tripTop">
                      <div className="dash__tripTitle">{trip.title}</div>
                      {typeof trip.rating === "number" && trip.rating > 0 ? (
                        <div className="dash__pill">{trip.rating}/5</div>
                      ) : (
                        <div className="dash__pill dash__pill--muted">Unrated</div>
                      )}
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

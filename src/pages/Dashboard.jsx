import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosconfig";
import USMap from "../components/map/USMap";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get("/trips");
        setTrips(res.data);
      } catch (err) {
        console.error(err);
        setError("Could not load trips.");
      }
    };

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

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Travel Dashboard</h2>
        <button onClick={() => navigate("/trips/new")}>+ New Trip</button>
      </div>

      {error && <p>{error}</p>}

      <h3>Visited States (All Trips Combined): {visitedStates.length}</h3>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* read-only highlight map */}
        <USMap visitedStates={visitedStates} />
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <h3>Your Trips</h3>
      {trips.length === 0 ? (
        <p>No trips yet. Click “New Trip” to create one.</p>
      ) : (
        <ul>
          {trips.map((trip) => (
            <li
              key={trip._id}
              onClick={() => navigate(`/trip/${trip._id}`)}
              style={{ cursor: "pointer", padding: "6px 0" }}
            >
              <b>{trip.title}</b> — {trip.states?.length || 0} states selected
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;

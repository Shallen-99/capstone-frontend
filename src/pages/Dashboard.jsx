import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTrips = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/trips", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setTrips(data);

      } catch (error) {
        console.error("Error fetching trips:", error.message);
      }
    };

    fetchTrips();
  }, [token, navigate]);

  const handleCreateTrip = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });

      const newTrip = await res.json();

      if (!res.ok) {
        throw new Error(newTrip.message);
      }

      setTrips([...trips, newTrip]);
      setTitle("");

    } catch (error) {
      console.error("Error creating trip:", error.message);
    }
  };

  return (
    <div>
      <h2>Your Trips</h2>

      <input
        type="text"
        placeholder="Trip Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleCreateTrip}>
        Create Trip
      </button>

      <ul>
        {trips.map((trip) => (
          <li
            key={trip._id}
            onClick={() => navigate(`/trip/${trip._id}`)}
            style={{ cursor: "pointer" }}
          >
            {trip.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;

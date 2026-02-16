import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch("http://localhost:5000/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTrips(data);
    };

    fetchTrips();
  }, []);

  const handleCreatetrip = async () => {
    const res = await fetch("http://localhost:5000/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({title})
    });

    const newTrip = await res.json();

    setTrips([...trips, newTrip]);
    setTitle("");
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
      <button onClick={handleCreatetrip}>
        Create Trip
      </button>
      <ul>
        {trips.map((trip) => (
          <li key={trip._id}
            onClick={() => navigate(`/trip/${trip._id}`)}
            style={{cursor: "pointer"}}
          >
           {trip.title} 
          </li>
        ))}
      </ul>


      {/* List of trips will go here */}
    </div>
  );
}

export default Dashboard;
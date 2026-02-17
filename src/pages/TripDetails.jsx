import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import USMap from "../components/map/USMap";

function TripDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const res = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      setTrip(data);
    };

    fetchTrip();
  }, [id, token]);

  const updateStates = async (newStates) => {
    const res = await fetch(
      `http://localhost:5000/api/trips/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ states: newStates })
      }
    );

    const updated = await res.json();
    setTrip(updated);
  };

  if (!trip) return <p>Loading...</p>;

  return (
    <div>
      <h2>{trip.title}</h2>

      <USMap
        selectedStates={trip.states}
        onStateClick={updateStates}
      />
    </div>
  );
}

export default TripDetails;

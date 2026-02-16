import { useState } from "react";
import { useParams } from "react-router-dom";
import USMap from "../components/map/USMap.jsx"

function TripDetail() {
    const {tripId} = useParams();
    const [selectedStates, setSelectedStates] = useState([]);

    return (
        <div>
            <h2>Trip Details</h2>
            <USMap onSelectionChange={setSelectedStates}/>
            <h3>Selected States:</h3>
            <ul>
                {selectedStates.map((state) => (
                    <li key={state}>{state}</li>
                ))}
            </ul>
        </div>
    );
}

export default TripDetail;
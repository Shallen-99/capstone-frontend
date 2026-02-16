import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function USMap() {
  const [selectedStates, setSelectedStates] = useState([]);

  const handleStateClick = (geo) => {
    const stateId = geo.id;

    setSelectedStates((prev) =>
      prev.includes(stateId)
        ? prev.filter((id) => id !== stateId)
        : [...prev, stateId]
    );
  };

  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={800}
      height={500}
      style={{ width: "100%", height: "auto" }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const isSelected = selectedStates.includes(geo.id);

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleStateClick(geo)}
                style={{
                  default: {
                    fill: isSelected ? "#F53" : "#D6D6DA",
                    outline: "none"
                  },
                  hover: {
                    fill: "#FF8C69",
                    outline: "none"
                  },
                  pressed: {
                    fill: "#E42",
                    outline: "none"
                  }
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}


export default USMap;

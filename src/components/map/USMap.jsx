import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/**
 * Props:
 * - visitedStates: array of geo.id strings to highlight (dashboard)
 * - selectedStates: array of geo.id strings to highlight (trip edit)
 * - onToggleState: function(stateId) for trip edit mode (optional)
 */
function USMap({ visitedStates = [], selectedStates = [], onToggleState }) {
  // If selectedStates provided, use that; otherwise use visitedStates
  const highlight = selectedStates.length ? selectedStates : visitedStates;

  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={800}
      height={500}
      style={{ width: "100%", maxWidth: "900px", height: "auto" }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const stateId = geo.id;
            const isHighlighted = highlight.includes(stateId);

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => onToggleState?.(stateId)}
                style={{
                  default: {
                    fill: isHighlighted ? "#2ecc71" : "#D6D6DA",
                    outline: "none",
                  },
                  hover: {
                    fill: "#3498db",
                    outline: "none",
                    cursor: onToggleState ? "pointer" : "default",
                  },
                  pressed: {
                    fill: isHighlighted ? "#27ae60" : "#95a5a6",
                    outline: "none",
                  },
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

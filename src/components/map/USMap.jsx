import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function USMap({ selectedStates, onStateClick }) {

  const handleClick = (geo) => {
    const stateCode = geo.properties.postal;

    let updatedStates;

    if (selectedStates.includes(stateCode)) {
      // Remove state
      updatedStates = selectedStates.filter(
        (state) => state !== stateCode
      );
    } else {
      // Add state
      updatedStates = [...selectedStates, stateCode];
    }

    onStateClick(updatedStates);
  };

  return (
    <ComposableMap projection="geoAlbersUsa">
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const isSelected = selectedStates.includes(
              geo.properties.postal
            );

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleClick(geo)}
                style={{
                  default: {
                    fill: isSelected ? "#2ecc71" : "#DDD",
                    outline: "none"
                  },
                  hover: {
                    fill: "#3498db",
                    outline: "none"
                  },
                  pressed: {
                    fill: "#2ecc71",
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

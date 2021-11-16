import React, { useState } from "react";
import RoomIcon from "@mui/icons-material/Room";
// eslint-disable-next-line
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";

import usePlacesAutocomplete, { getGeocode, getLatLng , getDetails } from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import mapStyles from "./mapStyles";
import "./map.styles.scss";
import "@reach/combobox/styles.css";

// Display Map
const Map = (props) => {
  const libraries = ["places"];
  const mapContainerStyle = {
    height: "600px",
  };
  const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  };
  const center = {
    lat: -37.813629,
    lng: 144.963058,
  };
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    console.log('panning to:', lat, lng)
    mapRef.current.setZoom(16);
  }, []);

  if (loadError) return "Error loading Maps";
  if (!isLoaded) return "Loading Maps";

  return (
    <div className="map">
      <Search saveVenues={props.saveVenues} panTo={panTo}/>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
        onLoad={onMapLoad}
      ></GoogleMap>
    </div>
  );
};

// Search box component within map
function Search( {panTo, saveVenues} ) {

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    // eslint-disable-next-line
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => -37.813629, lng: () => 144.963058 },
      radius: 15000,
    },
  });

  // const handleSelect = ({ address }) => {
  //   setValue( address, false);
  //   clearSuggestions();
  //
  //   getGeocode({ address })
  //     .then((results) => getLatLng(results[0]))
  //     .then(({ lat, lng }) => panTo({lat, lng}))
  //     .catch((error) => {
  //       console.log('error', error)
  //     })
  // }

  return (
    <div className="search">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();

          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);

            console.log(results[0]);

            const places_parameters = {
              placeId: results[0].place_id,
              fields: ["name", "opening_hours", "price_level", "rating", "website", "photo"]
            };

            getDetails(places_parameters)
            .then((details) => {
              console.log("Details: ", details)
              saveVenues(details);
              panTo({ lat, lng });
            })
            .catch((error) => {
              console.log(error);
            })

          } catch (error) {
            console.log("error");
          }
        }}
      >
        <div className="search-form">
          <ComboboxInput
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            disabled={!ready}
            placeholder={"Where would you like to go?"}
          />
        </div>
        <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
        </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

export default Map;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "../styles/Price.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// 👉 Replace this with your real Gebeta API key
const GEBETA_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IlRlY2ggQ2l0eSBQLkwuQyAiLCJkZXNjcmlwdGlvbiI6ImJmODk0YzI2LTJiMDEtNDQxYS1hNGJiLTZhM2U4YjE1NTc3OCIsImlkIjoiOTcwMGQ4YjQtY2ZhNy00ODI2LTg5OGEtNmI4ZGE4MjE5YzExIiwiaXNzdWVkX2F0IjoxNzU4MTg2Njg2LCJpc3N1ZXIiOiJodHRwczovL21hcGFwaS5nZWJldGEuYXBwIiwiand0X2lkIjoiMCIsInNjb3BlcyI6WyJGRUFUVVJFX0FMTCJdLCJ1c2VybmFtZSI6IlRvbG8ifQ.XheJqj-Eg_1mZApoHfyTNMQ4Yg-ri65SRNhH0-aacn0";

export default function Price() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupCoord, setPickupCoord] = useState(null);
  const [dropCoord, setDropCoord] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  // 🔎 Autocomplete
  const fetchSuggestions = async (query, setter) => {
    if (!query || query.length < 2) return setter([]);
    try {
      const res = await fetch(
        `https://mapapi.gebeta.app/api/place/autocomplete/?text=${encodeURIComponent(
          query
        )}&limit=5&apiKey=${GEBETA_API_KEY}`
      );
      const data = await res.json();
      const mapped = data.predictions?.map((p) => ({
        place_id: p.place_id,
        description: p.description,
        lat: p.lat || p.latitude,
        lon: p.lon || p.longitude,
      }));
      setter(mapped || []);
    } catch (err) {
      console.error(err);
      setter([]);
    }
  };

  const handlePickupChange = (e) => {
    setPickup(e.target.value);
    fetchSuggestions(e.target.value, setPickupSuggestions);
  };

  const handleDropChange = (e) => {
    setDrop(e.target.value);
    fetchSuggestions(e.target.value, setDropSuggestions);
  };

  const selectPickup = (place) => {
    setPickup(place.description);
    setPickupCoord({ latitude: parseFloat(place.lat), longitude: parseFloat(place.lon) });
    setPickupSuggestions([]);
  };

  const selectDrop = (place) => {
    setDrop(place.description);
    setDropCoord({ latitude: parseFloat(place.lat), longitude: parseFloat(place.lon) });
    setDropSuggestions([]);
  };

  // 📏 Calculate price using Gebeta directions
  const calculatePrice = async () => {
    if (!pickupCoord || !dropCoord) {
      alert("Select pickup and drop from suggestions!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `https://mapapi.gebeta.app/api/route/direction/?origin=${pickupCoord.latitude},${pickupCoord.longitude}&destination=${dropCoord.latitude},${dropCoord.longitude}&apiKey=${GEBETA_API_KEY}`
      );
      const data = await res.json();

      const distance = data.distance || data.routes?.[0]?.distance;
      const geometry = data.routes?.[0]?.geometry;

      if (!distance) throw new Error("Failed to calculate distance");
      const km = distance / 1000;
      setDistanceKm(km.toFixed(1));

      // Decode route polyline
      if (geometry) {
        const decoded = polyline.decode(geometry);
        setRouteCoords(decoded.map(([lat, lng]) => [lat, lng]));
      }

      // 💰 Simple tiered pricing
      let calculatedPrice = 0;
      if (km <= 5.9) calculatedPrice = 100;
      else if (km <= 10.9) calculatedPrice = 200;
      else if (km <= 17) calculatedPrice = 300;
      else calculatedPrice = 500;

      setPrice(calculatedPrice);
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate distance!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    alert(`Price confirmed: ${price} Birr`);
    setShowPopup(false);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setDistanceKm(null);
    setPrice(null);
    setRouteCoords([]);
  };

  return (
    <div
      className="price-page"
      style={{
        width: "100vw",
        height: "100vh",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        color: "#f0f0f0",
        position: "relative",
      }}
    >
      {/* Back to Dashboard button */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "8px 12px",
          backgroundColor: "#1e3a8a",
          color: "#f0f0f0",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        ← Back to Dashboard
      </button>

      <h2 className="price-header" style={{ textAlign: "center", padding: "10px 0" }}>
        Delivery Price Calculator (Gebeta Maps – Addis Ababa)
      </h2>

      {/* Input + suggestions */}
      <div className="price-form" style={{ padding: "10px", textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", width: "45%", marginRight: "5px" }}>
          <input
            type="text"
            placeholder="Pickup Location"
            value={pickup}
            onChange={handlePickupChange}
            style={{ width: "100%", padding: "8px" }}
          />
          {pickupSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {pickupSuggestions.map((s) => (
                <li key={s.place_id} onClick={() => selectPickup(s)}>
                  {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ position: "relative", display: "inline-block", width: "45%", marginLeft: "5px" }}>
          <input
            type="text"
            placeholder="Drop Location"
            value={drop}
            onChange={handleDropChange}
            style={{ width: "100%", padding: "8px" }}
          />
          {dropSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {dropSuggestions.map((s) => (
                <li key={s.place_id} onClick={() => selectDrop(s)}>
                  {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={calculatePrice}
          disabled={loading}
          style={{ marginTop: "10px", padding: "8px 20px" }}
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {/* Confirmation Popup */}
      {showPopup && (
        <div
          className="price-popup"
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e3a8a",
            padding: "20px",
            borderRadius: "12px",
            zIndex: 1000,
            width: "300px",
            textAlign: "center",
          }}
        >
          <h3>Confirm Delivery</h3>
          <p>Pickup: {pickup}</p>
          <p>Drop: {drop}</p>
          <p>Distance: {distanceKm} km</p>
          <div>
            <label>Price (Birr): </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
            />
          </div>
          <div className="popup-buttons" style={{ marginTop: "10px" }}>
            <button onClick={handleConfirm} style={{ marginRight: "5px" }}>
              Confirm
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Gebeta Map */}
      <div className="price-map" style={{ flex: 1 }}>
        <MapContainer center={[9.03, 38.74]} zoom={13} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url={`https://mapapi.gebeta.app/api/tiles/{z}/{x}/{y}.png?apiKey=${GEBETA_API_KEY}`}
            attribution="&copy; Gebeta Maps"
          />
          {pickupCoord && (
            <Marker position={[pickupCoord.latitude, pickupCoord.longitude]}>
              <Popup>Pickup: {pickup}</Popup>
            </Marker>
          )}
          {dropCoord && (
            <Marker position={[dropCoord.latitude, dropCoord.longitude]}>
              <Popup>Drop: {drop}</Popup>
            </Marker>
          )}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

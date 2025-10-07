import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import "../styles/Price.css";

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6InRpbnNhZSIsImRlc2NyaXB0aW9uIjoiZDBlZjg5MzYtODkwNi00ZTBmLWI5MjgtZjZlYWE4NmNhYWIxIiwiaWQiOiJkOTk2ODZjYy1iNDcwLTQ4OTctOWVhOC0wNmExYzU4YjFkZGEiLCJpc3N1ZWRfYXQiOjE3NTkxMTc1OTQsImlzc3VlciI6Imh0dHBzOi8vbWFwYXBpLmdlYmV0YS5hcHAiLCJqd3RfaWQiOiIwIiwic2NvcGVzIjpbIkZFQVRVUkVfQUxMIl0sInVzZXJuYW1lIjoiU29sZW4ifQ.rAvceHp9j2buKO4xFPwjHqAdgJxF7ukJmPh9epJi2IQ";

export default function Price() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [results, setResults] = useState("");

  // Refs for detecting outside clicks
  const pickupRef = useRef(null);
  const destRef = useRef(null);

  // Detect clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickupRef.current &&
        !pickupRef.current.contains(event.target)
      ) {
        setPickupSuggestions([]);
      }
      if (
        destRef.current &&
        !destRef.current.contains(event.target)
      ) {
        setDestSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://mapapi.gebeta.app/api/v1/route/geocoding?name=${encodeURIComponent(
          query
        )}&apiKey=${API_KEY}`
      );
      const data = await res.json();
      const valid = Array.isArray(data.data)
        ? data.data.filter(
            (item) =>
              typeof item.latitude === "number" &&
              typeof item.longitude === "number"
          )
        : [];
      setSuggestions(valid);
    } catch {
      setSuggestions([]);
    }
  };

  const debouncedPickup = debounce(
    (q) => fetchSuggestions(q, setPickupSuggestions),
    300
  );
  const debouncedDest = debounce(
    (q) => fetchSuggestions(q, setDestSuggestions),
    300
  );

  const calculateRoute = async () => {
    if (!pickupCoords || !destCoords) {
      setResults("⚠️ Please select both pickup and destination.");
      return;
    }

    const origin = `${pickupCoords.lat},${pickupCoords.lon}`;
    const destination = `${destCoords.lat},${destCoords.lon}`;
    const url = `https://mapapi.gebeta.app/api/route/direction/?origin=${origin}&destination=${destination}&apiKey=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.totalDistance) {
        setResults("❌ No route found for the selected locations.");
        return;
      }

      const distanceKm = (data.totalDistance / 1000).toFixed(2);
      const durationMin = Math.ceil(data.timetaken / 60);

      let price = 0;
      if (distanceKm <= 5) price = 100;
      else if (distanceKm <= 10) price = 200;
      else if (distanceKm <= 17) price = 300;
      else price = 400;

      setResults(
        `📍 Distance: ${distanceKm} km\n⏱ Duration: ${durationMin} min\n💰 Estimated Price: ${price} birr`
      );
    } catch {
      setResults("❌ Error calculating route.");
    }
  };

  return (
    <div className="price-page">
      <div className="price-card">
        <h2 className="price-header">🚕 Tolo Delivery Price Estimator</h2>
        <p className="price-subtitle">
          Instantly calculate delivery distance & price
        </p>

        <div className="price-form">
          {/* Pickup Input */}
          <div className="form-group" ref={pickupRef}>
            <label>
              <MapPin className="icon" /> Pickup Location
            </label>
            <input
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                debouncedPickup(e.target.value);
              }}
              placeholder="Enter pickup location..."
            />
            {pickupSuggestions.length > 0 && (
              <div className="suggestions">
                {pickupSuggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setPickup(s.name);
                      setPickupCoords({ lat: s.latitude, lon: s.longitude });
                      setPickupSuggestions([]);
                    }}
                    className="suggestion-item"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="form-group" ref={destRef}>
            <label>
              <Navigation className="icon" /> Destination
            </label>
            <input
              value={dropoff}
              onChange={(e) => {
                setDropoff(e.target.value);
                debouncedDest(e.target.value);
              }}
              placeholder="Enter destination..."
            />
            {destSuggestions.length > 0 && (
              <div className="suggestions">
                {destSuggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setDropoff(s.name);
                      setDestCoords({ lat: s.latitude, lon: s.longitude });
                      setDestSuggestions([]);
                    }}
                    className="suggestion-item"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={calculateRoute} className="calculate-btn">
            <DollarSign className="icon" /> Calculate Price
          </button>

          {results && (
            <div className="result-box">
              <pre>{results}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

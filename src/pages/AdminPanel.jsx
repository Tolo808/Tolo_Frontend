import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPanel.css";

const BACKEND_URL = "web-production-c4710.up.railway.app";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDriver, setCurrentDriver] = useState({
    _id: "",
    name: "",
    phone: "",
    vehicle_plate: "",
  });

  // Fetch drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/drivers`);
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Save driver (Add or Edit)
  const handleSave = async () => {
    if (!currentDriver.name || !currentDriver.phone || !currentDriver.vehicle_plate) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (isEdit) {
        const res = await fetch(`${BACKEND_URL}/api/drivers/${currentDriver._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentDriver),
        });
        const updatedDriver = await res.json();
        setDrivers(drivers.map(d => (d._id === updatedDriver._id ? updatedDriver : d)));
      } else {
        const res = await fetch(`${BACKEND_URL}/api/drivers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentDriver),
        });
        const newDriver = await res.json();
        setDrivers([...drivers, newDriver]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save driver. Check console.");
    }
  };

  // Delete driver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/drivers/${id}`, { method: "DELETE" });
      setDrivers(drivers.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver. Check console.");
    }
  };

  // Open modals
  const openAddModal = () => {
    setIsEdit(false);
    setCurrentDriver({ _id: "", name: "", phone: "", vehicle_plate: "" });
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setIsEdit(true);
    setCurrentDriver(driver);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentDriver({ _id: "", name: "", phone: "", vehicle_plate: "" });
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => navigate("/select")}>← Back</button>
      <h1>🧑‍✈️ Drivers Admin Panel</h1>
      <button className="add-btn" onClick={openAddModal}>Add Driver</button>

      {loading ? (
        <p className="loading-text">Loading drivers...</p>
      ) : (
        <table className="driver-table full-width-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Plate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.vehicle_plate}</td>
                <td>
                  <button className="edit-btn" onClick={() => openEditModal(d)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{isEdit ? "Edit Driver" : "Add Driver"}</h2>
            {isEdit && <input placeholder="ID" value={currentDriver._id} disabled />}
            <input
              placeholder="Name"
              value={currentDriver.name}
              onChange={e => setCurrentDriver({ ...currentDriver, name: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={currentDriver.phone}
              onChange={e => setCurrentDriver({ ...currentDriver, phone: e.target.value })}
            />
            <input
              placeholder="Vehicle Plate"
              value={currentDriver.vehicle_plate}
              onChange={e => setCurrentDriver({ ...currentDriver, vehicle_plate: e.target.value })}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleSave}>{isEdit ? "Save" : "Add"}</button>
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

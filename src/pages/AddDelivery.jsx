import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const BACKEND_URL = "https://web-production-c4710.up.railway.app";

export default function AddDelivery() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: "web",
    user_name: "",
    pickup: "",
    dropoff: "",
    sender_phone: "",
    receiver_phone: "",
    full_address: "",
    quantity: "",
    item_description: "",
    price: "",
    delivery_type: "payable",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.pickup || !formData.dropoff || !formData.sender_phone || !formData.receiver_phone) {
      return alert("Please fill in all required fields.");
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/add_delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert("Delivery added successfully!");
        navigate("/dashboard"); // return to dashboard
      } else {
        alert("Failed to add delivery: " + (data.error || "Check console"));
      }
    } catch (err) {
      console.error(err);
      alert("Error adding delivery. Check console.");
    }
  };

  return (
    <div className="page">
      <h2>➕ Add Delivery</h2>
      <form className="add-delivery-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Source:</label>
          <select name="source" value={formData.source} onChange={handleChange}>
            <option value="web">Web</option>
            <option value="bot">Bot</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="form-row">
          <label>Username:</label>
          <input type="text" name="user_name" value={formData.user_name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Pickup Location:</label>
          <input type="text" name="pickup" value={formData.pickup} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Dropoff Location:</label>
          <input type="text" name="dropoff" value={formData.dropoff} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Sender Phone:</label>
          <input type="text" name="sender_phone" value={formData.sender_phone} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Receiver Phone:</label>
          <input type="text" name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Full Address:</label>
          <input type="text" name="full_address" value={formData.full_address} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Quantity:</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Item Description:</label>
          <input type="text" name="item_description" value={formData.item_description} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Price:</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Delivery Type:</label>
          <select name="delivery_type" value={formData.delivery_type} onChange={handleChange}>
            <option value="payable">Payable</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className="form-row">
          <button type="submit">Add Delivery</button>
          <button type="button" onClick={() => navigate("/dashboard")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

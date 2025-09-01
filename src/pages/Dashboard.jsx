import React, { useEffect, useState, useMemo } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://web-production-c4710.up.railway.app";

export default function Dashboard() {
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [deliveryCounts, setDeliveryCounts] = useState({
    pending: 0,
    successful: 0,
    unsuccessful: 0,
  });
  const [newDeliveryAlert, setNewDeliveryAlert] = useState(false);

  // Modal state for unsuccessful reason
  const [unsuccessfulModal, setUnsuccessfulModal] = useState({
    open: false,
    deliveryId: null,
    reason: "",
  });

  const perPage = 10;
  const navigate = useNavigate();

  // Map driver_id -> driver name
  const driverMap = useMemo(() => {
    const map = {};
    drivers.forEach((d) => {
      map[d._id] = d.name;
    });
    return map;
  }, [drivers]);

  // Fetch all deliveries
  const fetchAllDeliveries = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/deliveries`);
      const data = await res.json();

      setAllDeliveries((prev) => {
        if (prev.length && data.length > prev.length) {
          setNewDeliveryAlert(true);
          setTimeout(() => setNewDeliveryAlert(false), 5000);
        }
        return data;
      });
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    }
  };

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/drivers`);
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  };

  // Calculate delivery counts
  useEffect(() => {
    const counts = allDeliveries.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      { pending: 0, successful: 0, unsuccessful: 0 }
    );
    setDeliveryCounts(counts);
  }, [allDeliveries]);

  // Initial fetch + polling
  useEffect(() => {
    fetchDrivers();
    fetchAllDeliveries();
    const interval = setInterval(fetchAllDeliveries, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => setPage(1), [statusFilter]);

  // Filter deliveries for current tab
  const filteredDeliveries = useMemo(
    () => allDeliveries.filter((d) => d.status === statusFilter),
    [allDeliveries, statusFilter]
  );

  const totalPages = Math.ceil(filteredDeliveries.length / perPage);
  const currentDeliveries = filteredDeliveries.slice(
    (page - 1) * perPage,
    page * perPage
  );

  useEffect(() => {
    if ((page - 1) * perPage >= filteredDeliveries.length) setPage(1);
  }, [filteredDeliveries, page]);

  // Update delivery in state
  const updateDeliveryState = (id, newData) => {
    setAllDeliveries((prev) =>
      prev.map((d) => (d._id === id ? { ...d, ...newData } : d))
    );
  };

  // Update delivery status
  const updateStatus = async (id, newStatus) => {
    try {
      updateDeliveryState(id, { status: newStatus });

      const res = await fetch(
        `${BACKEND_URL}/api/update_delivery_status/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status in database");
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Refresh the page.");
    }
  };

  // Update delivery field (price or delivery_type)
  const updateDeliveryField = async (id, field, value) => {
    try {
      const body = { [field]: value };
      const res = await fetch(
        `${BACKEND_URL}/api/update_delivery_status/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Failed to update delivery");
      updateDeliveryState(id, { [field]: value });
    } catch (err) {
      console.error(err);
      alert("Failed to update delivery. Refresh the page.");
    }
  };

  // Assign driver
  const assignDriver = async (deliveryId, driverId) => {
    const delivery = allDeliveries.find((d) => d._id === deliveryId);
    const price = delivery.price;
    const deliveryType = delivery.delivery_type;

    if (!driverId) return alert("Please select a driver first.");
    if (!price || !deliveryType) return alert("Set price and delivery type first.");

    try {
      const res = await fetch(`${BACKEND_URL}/api/assign_driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_id: deliveryId, driver_id: driverId, price, delivery_type: deliveryType }),
      });

      const data = await res.json();

      if (!data.success) {
        return alert("Failed to assign driver: " + (data.error || "Check console"));
      }

      updateDeliveryState(deliveryId, { driver_id: driverId, price, delivery_type: deliveryType });

      alert(`Driver "${driverMap[driverId]}" assigned with ${deliveryType} delivery (Price: ${price})`);
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Error assigning driver. Check console for details.");
    }
  };

  // Notify driver
  const notifyDriver = async (deliveryId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notify_driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_id: deliveryId }),
    });
    const result = await response.json();

    if (result.success) {
      alert("Driver and customers notified successfully!");
      setAllDeliveries((prev) =>
        prev.map((d) =>
          d._id === deliveryId ? { ...d, notified: true } : d
        )
      );
    } else {
      alert("Failed to notify: " + result.error);
    }
  } catch (error) {
    console.error("Error notifying driver:", error);
    alert("An error occurred while notifying the driver.");
  }
};




  // Delete delivery
  const deleteDelivery = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/delete_delivery/${id}`, { method: "DELETE" });
      setAllDeliveries((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete delivery.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Open unsuccessful modal
  const handleMarkUnsuccessful = (deliveryId) => {
    setUnsuccessfulModal({ open: true, deliveryId, reason: "" });
  };

  const handleModalChange = (e) => {
    setUnsuccessfulModal((prev) => ({ ...prev, reason: e.target.value }));
  };

  const submitUnsuccessful = async () => {
    const { deliveryId, reason } = unsuccessfulModal;
    if (!reason) return alert("Please enter a reason");

    try {
      const res = await fetch(`${BACKEND_URL}/api/update_delivery_status/${deliveryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "unsuccessful", reason }),
      });

      if (!res.ok) throw new Error("Failed to update delivery");

      setAllDeliveries((prev) =>
        prev.map((d) =>
          d._id === deliveryId ? { ...d, status: "unsuccessful", reason } : d
        )
      );

      setUnsuccessfulModal({ open: false, deliveryId: null, reason: "" });
      alert("Delivery marked as unsuccessful with reason saved.");
    } catch (err) {
      console.error(err);
      alert("Error updating delivery.");
    }
  };

  const closeModal = () => {
    setUnsuccessfulModal({ open: false, deliveryId: null, reason: "" });
  };

  return (
    <div className="page">
      <h2>🚚 Tolo Delivery</h2>

      {newDeliveryAlert && <div className="new-delivery-banner">🚀 New delivery received!</div>}

      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => navigate("/add-delivery")}>Add Delivery</button>

        {["pending", "successful", "unsuccessful"].map((s) => (
          
          <button
            key={s}
            className={statusFilter === s ? "active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {s === "successful"
              ? `Successful (${deliveryCounts.successful || 0})`
              : s === "pending"
              ? `Pending (${deliveryCounts.pending || 0})`
              : `Unsuccessful (${deliveryCounts.unsuccessful || 0})`}
          </button>
        ))}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate("/price")}>Price Calculator</button>
      </div>

      {/* Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Username</th>
            <th>Pickup</th>
            <th>Dropoff</th>
            <th>Sender Phone</th>
            <th>Receiver Phone</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Item Description</th>
            <th>Status</th>
            <th>Delivery Type</th>
            <th>Assigned Driver</th>
            <th>Price</th>
            <th>Timestamp</th>
            <th>Assign Driver</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDeliveries.map((d) => (
            <tr key={d._id}>
              <td>{d.source || "unknown"}</td>
              <td>{d.user_name || "N/A"}</td>
              <td>{d.pickup}</td>
              <td>{d.dropoff}</td>
              <td>{d.sender_phone}</td>
              <td>{d.receiver_phone}</td>
              <td>{d.full_address || "-"}</td>
              <td>{d.Quantity || "-"}</td>
              <td>{d.item_description || "-"}</td>
              <td>{d.status}</td>
              <td>{d.delivery_type || "Not Set"}</td>
              <td>{d.driver_id ? driverMap[d.driver_id] : "Not Assigned"}</td>
              <td>{d.price || "-"}</td>
              <td>
                {d.timestamp
                  ? new Date(d.timestamp).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : "-"}
              </td>

              <td>
                <div className="assign-driver-cell">
                  <select
                    value={d.price || ""}
                    onChange={(e) =>
                      updateDeliveryField(d._id, "price", Number(e.target.value))
                    }
                  >
                    <option value="">Select Price</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={300}>300</option>
                  </select>

                  <select
                    value={d.delivery_type || "payable"}
                    onChange={(e) => updateDeliveryField(d._id, "delivery_type", e.target.value)}
                  >
                    <option value="payable">Payable</option>
                    <option value="free">Free</option>
                  </select>

                  <select
                    className="driver-select"
                    value={d.driver_id || ""}
                    onChange={(e) => assignDriver(d._id, e.target.value)}
                    disabled={!d.price || !d.delivery_type}
                  >
                    <option value="">Assign</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </td>

              <td>
                <button disabled={d.status === "successful"} onClick={() => updateStatus(d._id, "successful")}>✅</button>
                <button disabled={d.status === "unsuccessful"} onClick={() => handleMarkUnsuccessful(d._id)}>❌</button>
                <button
                  disabled={!d.driver_id || d.notified}
                  onClick={() => notifyDriver(d._id)}
                >
                  {d.notified ? "Notified ✅" : "Notify Driver"}
                </button>





                <button onClick={() => deleteDelivery(d._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>{page} / {totalPages || 1}</span>
        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {/* Modal for unsuccessful reason */}
      {unsuccessfulModal.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Mark Delivery Unsuccessful</h3>
            <textarea
              placeholder="Enter reason..."
              value={unsuccessfulModal.reason}
              onChange={handleModalChange}
            />
            <div className="modal-buttons">
              <button onClick={submitUnsuccessful}>Submit</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

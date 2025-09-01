const API_URL = "http://localhost:5000"; // replace with your Flask backend

export const fetchOrders = async () => {
  try {
    const res = await fetch(`${API_URL}/get_orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`${API_URL}/update_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

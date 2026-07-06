import { createContext, useContext, useState, useEffect } from "react";
import { seedOrders, ORDER_STATUS_FLOW } from "../data/dummyData";
import { readStorage, writeStorage, generateId } from "../utils/storage";

const OrderContext = createContext(null);

const ORDERS_KEY = "shopely_orders";

function loadOrders() {
  return readStorage(ORDERS_KEY, seedOrders);
}
function saveOrders(orders) {
  writeStorage(ORDERS_KEY, orders);
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(loadOrders());
    setLoading(false);
  }, []);

  function placeOrder({ userId, userName, items, address, paymentMethod }) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 89999)}`,
      userId,
      userName,
      items,
      total,
      status: "Placed",
      placedAt: new Date().toISOString(),
      address,
      paymentMethod,
    };
    const updated = [newOrder, ...loadOrders()];
    saveOrders(updated);
    setOrders(updated);
    return newOrder;
  }

  function getOrdersByUser(userId) {
    return loadOrders()
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }

  function getOrderById(orderId) {
    return loadOrders().find((o) => o.id.toLowerCase() === orderId.toLowerCase()) || null;
  }

  function updateOrderStatus(orderId, status) {
    const updated = loadOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
    saveOrders(updated);
    setOrders(updated);
  }

  function cancelOrder(orderId) {
    updateOrderStatus(orderId, "Cancelled");
  }

  const value = {
    orders,
    loading,
    statusFlow: ORDER_STATUS_FLOW,
    placeOrder,
    getOrdersByUser,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}

export default OrderContext;
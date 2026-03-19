import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const CART_KEY = "techbouquet_cart";
const GUEST_KEY = "techbouquet_cart_guest";
const USER_KEY_PREFIX = "techbouquet_cart_user_";

function getUserKey(email) {
  if (!email) return null;
  return `${USER_KEY_PREFIX}${email}`;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const key = user?.email ? getUserKey(user.email) : GUEST_KEY;
    const stored = localStorage.getItem(key);
    const nextItems = stored ? JSON.parse(stored) : [];
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
  }, [user]);

  useEffect(() => {
    const key = user?.email ? getUserKey(user.email) : GUEST_KEY;
    localStorage.setItem(key, JSON.stringify(items));
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, user]);

  const addItem = (product, addons = []) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && JSON.stringify(item.addons) === JSON.stringify(addons));
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, addons }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const logoutCart = () => {
    if (user?.email) {
      const key = getUserKey(user.email);
      localStorage.setItem(key, JSON.stringify(items));
    }
    localStorage.removeItem(CART_KEY);
    setItems([]);
  };

  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, logoutCart }), [items, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

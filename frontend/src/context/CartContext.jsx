import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const CART_KEY = "techbouquet_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

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

  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

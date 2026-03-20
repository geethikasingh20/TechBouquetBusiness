import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, clearCartApi, fetchCart, removeCartItem, updateCartItem } from "../data/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

function normalizeAddons(value) {
  return Array.isArray(value) ? value : [];
}

function sameAddons(a, b) {
  const left = normalizeAddons(a);
  const right = normalizeAddons(b);
  return JSON.stringify(left) === JSON.stringify(right);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (!user?.token) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchCart(user.token);
        setItems(data);
      } catch (error) {
        // Keep existing items to avoid UI flicker
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user]);

  const addItem = async (product, addons = []) => {
    if (!user?.token) {
      throw new Error("LOGIN_REQUIRED");
    }

    const safeAddons = normalizeAddons(addons);

    // Optimistic update
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && sameAddons(item.addons, safeAddons)
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          addons: safeAddons
        }
      ];
    });

    try {
      const data = await addCartItem(user.token, {
        productId: product.id,
        addonsJson: JSON.stringify(safeAddons)
      });
      setItems(data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      return;
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (!user?.token) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
    try {
      const data = await updateCartItem(user.token, id, quantity);
      setItems(data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
    }
  };

  const removeItem = async (id) => {
    if (!user?.token) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const data = await removeCartItem(user.token, id);
      setItems(data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
    }
  };

  const clearCart = async () => {
    if (!user?.token) return;
    setItems([]);
    try {
      const data = await clearCartApi(user.token);
      setItems(data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
    }
  };

  const value = useMemo(() => ({ items, loading, addItem, updateQuantity, removeItem, clearCart }), [items, loading, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, clearCartApi, fetchCart, removeCartItem, updateCartItem } from "../data/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const CART_CACHE_KEY = "techbouquet_cart_cache";

function normalizeAddons(value) {
  return Array.isArray(value) ? value : [];
}

function sameAddons(a, b) {
  const left = normalizeAddons(a);
  const right = normalizeAddons(b);
  return JSON.stringify(left) === JSON.stringify(right);
}

function readCache(email) {
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email === email && Array.isArray(parsed.items)) {
      return parsed.items;
    }
  } catch {
    return null;
  }
  return null;
}

function writeCache(email, items) {
  if (!email) return;
  localStorage.setItem(CART_CACHE_KEY, JSON.stringify({ email, items }));
}

function clearCache() {
  localStorage.removeItem(CART_CACHE_KEY);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (!user?.token) {
        setItems([]);
        clearCache();
        return;
      }

      const cached = readCache(user.email);
      if (cached) {
        setItems(cached);
      }

      setLoading(true);
      try {
        const data = await fetchCart(user.token);
        setItems(data);
        writeCache(user.email, data);
      } catch (error) {
        // Keep cached items to avoid UI flicker
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
        const updated = prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
        writeCache(user.email, updated);
        return updated;
      }
      const updated = [
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
      writeCache(user.email, updated);
      return updated;
    });

    try {
      const data = await addCartItem(user.token, {
        productId: product.id,
        addonsJson: JSON.stringify(safeAddons)
      });
      setItems(data);
      writeCache(user.email, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(user.email, data);
      return;
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (!user?.token) return;
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
      writeCache(user.email, updated);
      return updated;
    });
    try {
      const data = await updateCartItem(user.token, id, quantity);
      setItems(data);
      writeCache(user.email, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(user.email, data);
    }
  };

  const removeItem = async (id) => {
    if (!user?.token) return;
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      writeCache(user.email, updated);
      return updated;
    });
    try {
      const data = await removeCartItem(user.token, id);
      setItems(data);
      writeCache(user.email, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(user.email, data);
    }
  };

  const clearCart = async () => {
    if (!user?.token) return;
    setItems([]);
    writeCache(user.email, []);
    try {
      const data = await clearCartApi(user.token);
      setItems(data);
      writeCache(user.email, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(user.email, data);
    }
  };

  const value = useMemo(() => ({ items, loading, addItem, updateQuantity, removeItem, clearCart }), [items, loading, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, clearCartApi, fetchCart, removeCartItem, updateCartItem } from "../data/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const CART_CACHE_KEY = "techbouquet_cart_cache";
const GUEST_CART_OWNER = "guest";

function normalizeAddons(value) {
  if (!Array.isArray(value)) return [];
  const unique = new Map();
  for (const addon of value) {
    if (addon?.id == null) continue;
    unique.set(String(addon.id), addon);
  }
  return Array.from(unique.values());
}

function normalizePincode(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sameAddons(a, b) {
  const left = normalizeAddons(a).map((addon) => String(addon?.id ?? "")).filter(Boolean).sort();
  const right = normalizeAddons(b).map((addon) => String(addon?.id ?? "")).filter(Boolean).sort();
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeAddons(existing, incoming) {
  const merged = new Map();
  for (const addon of normalizeAddons(existing)) {
    if (addon?.id == null) continue;
    merged.set(String(addon.id), addon);
  }
  for (const addon of normalizeAddons(incoming)) {
    if (addon?.id == null) continue;
    if (!merged.has(String(addon.id))) {
      merged.set(String(addon.id), addon);
    }
  }
  return Array.from(merged.values());
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

function cartOwner(user) {
  return user?.email || GUEST_CART_OWNER;
}

function getProductImageUrl(product) {
  if (!product) return "";
  return product.imageUrl || product.images?.[0]?.url || product.images?.[0] || "";
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      const owner = cartOwner(user);
      const cached = readCache(owner);

      if (!user?.token) {
        setItems(cached || []);
        return;
      }

      if (cached) {
        setItems(cached);
      }

      setLoading(true);
      try {
        const data = await fetchCart(user.token);
        setItems(data);
        writeCache(owner, data);
      } catch (error) {
        // Keep cached items to avoid UI flicker
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user]);

  const addItem = async (product, addons = [], deliveryPincode = "") => {
    const safeAddons = normalizeAddons(addons);
    const safePincode = normalizePincode(deliveryPincode);
    const owner = cartOwner(user);

    // Optimistic update
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product.id &&
          normalizePincode(item.deliveryPincode) === safePincode
      );
      if (existing) {
        const mergedAddons = mergeAddons(existing.addons, safeAddons);
        const sameAddonSet = sameAddons(existing.addons, safeAddons);
        const updated = prev.map((item) =>
          item === existing
            ? sameAddonSet
              ? { ...item, quantity: item.quantity + 1 }
              : { ...item, addons: mergedAddons }
            : item
        );
        writeCache(owner, updated);
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
          addons: safeAddons,
          imageUrl: getProductImageUrl(product),
          deliveryPincode: safePincode
        }
      ];
      writeCache(owner, updated);
      return updated;
    });

    if (!user?.token) {
      return;
    }

    try {
      const data = await addCartItem(user.token, {
        productId: product.id,
        addonsJson: JSON.stringify(safeAddons),
        deliveryPincode: safePincode
      });
      setItems(data);
      writeCache(owner, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(owner, data);
      return;
    }
  };

  const updateQuantity = async (id, quantity) => {
    const owner = cartOwner(user);
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
      writeCache(owner, updated);
      return updated;
    });
    if (!user?.token) return;
    try {
      const data = await updateCartItem(user.token, id, quantity);
      setItems(data);
      writeCache(owner, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(owner, data);
    }
  };

  const removeItem = async (id) => {
    const owner = cartOwner(user);
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      writeCache(owner, updated);
      return updated;
    });
    if (!user?.token) return;
    try {
      const data = await removeCartItem(user.token, id);
      setItems(data);
      writeCache(owner, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(owner, data);
    }
  };

  const clearCart = async () => {
    const owner = cartOwner(user);
    setItems([]);
    if (owner === GUEST_CART_OWNER) {
      clearCache();
    } else {
      writeCache(owner, []);
    }
    if (!user?.token) return;
    try {
      const data = await clearCartApi(user.token);
      setItems(data);
      writeCache(owner, data);
    } catch (error) {
      const data = await fetchCart(user.token);
      setItems(data);
      writeCache(owner, data);
    }
  };

  const value = useMemo(() => ({ items, loading, addItem, updateQuantity, removeItem, clearCart }), [items, loading, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

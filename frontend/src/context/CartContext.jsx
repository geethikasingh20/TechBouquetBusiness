import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, clearCartApi, fetchCart, removeCartItem, updateCartItem } from "../data/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      if (!user?.token) {
        setItems([]);
        return;
      }
      try {
        const data = await fetchCart(user.token);
        setItems(data);
      } catch (error) {
        setItems([]);
      }
    };
    loadCart();
  }, [user]);

  const addItem = async (product, addons = []) => {
    if (!user?.token) {
      throw new Error("LOGIN_REQUIRED");
    }
    const data = await addCartItem(user.token, {
      productId: product.id,
      addonsJson: JSON.stringify(addons)
    });
    setItems(data);
  };

  const updateQuantity = async (id, quantity) => {
    if (!user?.token) return;
    const data = await updateCartItem(user.token, id, quantity);
    setItems(data);
  };

  const removeItem = async (id) => {
    if (!user?.token) return;
    const data = await removeCartItem(user.token, id);
    setItems(data);
  };

  const clearCart = async () => {
    if (!user?.token) return;
    const data = await clearCartApi(user.token);
    setItems(data);
  };

  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart }), [items, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

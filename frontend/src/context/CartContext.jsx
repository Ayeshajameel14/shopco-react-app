
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "shopco_cart";

function getSavedCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { token, isLoggedIn } = useAuth();

  const [cartItems, setCartItems] = useState(getSavedCart);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  // Load the logged-in user's cart from MongoDB
  useEffect(() => {
    if (!token) {
      setCartItems(getSavedCart());
      setCartError("");
      return;
    }

    const controller = new AbortController();

    async function loadCart() {
      setCartLoading(true);
      setCartError("");

      try {
        const response = await fetch(`${API_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load cart.");
        }

        const serverItems = (data.items || []).map((item) => ({
          id: item.productId,
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }));

        setCartItems(serverItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverItems));
      } catch (error) {
        if (error.name !== "AbortError") {
          setCartError(error.message || "Unable to load cart.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCartLoading(false);
        }
      }
    }

    loadCart();

    return () => controller.abort();
  }, [token]);

  // Save cart changes to MongoDB when logged in
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));

    if (!token) return;

    const controller = new AbortController();

    async function saveCart() {
      try {
        const items = cartItems.map((item) => ({
          productId: Number(item.productId ?? item.id),
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          size: item.size || "",
          color: item.color || "",
          quantity: Number(item.quantity),
        }));

        const response = await fetch(`${API_URL}/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to save cart.");
        }

        setCartError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setCartError(error.message || "Unable to save cart.");
        }
      }
    }

    // Wait until the initial cart has loaded before saving changes.
    if (!cartLoading) {
      saveCart();
    }

    return () => controller.abort();
  }, [cartItems, token, cartLoading]);

  function addToCart(product, size, color, quantity = 1) {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) =>
          Number(item.productId ?? item.id) === Number(product.id) &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...previousItems,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.images?.[0] || "",
          size,
          color,
          quantity,
        },
      ];
    });
  }

  function removeFromCart(id, size, color) {
    setCartItems((items) =>
      items.filter(
        (item) =>
          !(
            Number(item.productId ?? item.id) === Number(id) &&
            item.size === size &&
            item.color === color
          )
      )
    );
  }

  function updateQuantity(id, size, color, quantity) {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((items) =>
      items.map((item) =>
        Number(item.productId ?? item.id) === Number(id) &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}


import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const ProductsContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Products load nahi ho sake.");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}

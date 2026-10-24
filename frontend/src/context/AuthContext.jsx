import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "shopco_token";
const USER_KEY = "shopco_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  async function requestAuth(endpoint, formData) {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (!data.token) {
        throw new Error(
          "The server did not return a token. Check your auth controller."
        );
      }

      const loggedInUser = data.user || {
        name: formData.name || "",
        email: formData.email,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));

      setToken(data.token);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } finally {
      setLoading(false);
    }
  }

  async function signup(name, email, password) {
    return requestAuth("signup", { name, email, password });
  }

  async function login(email, password) {
    return requestAuth("login", { email, password });
  }

  // Update account email or password
  async function updateAccount({
    email,
    currentPassword,
    newPassword,
    confirmNewPassword,
  }) {
    const response = await fetch(`${API_URL}/auth/update-account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update account.");
    }

    const updatedUser = {
      ...user,
      ...data.user,
    };

    // Save the updated user details
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Log out if the password was changed
    if (newPassword) {
      logout();
    }

    return {
      success: true,
      message: data.message,
      user: updatedUser,
    };
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: Boolean(token),
        signup,
        login,
        logout,
        updateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

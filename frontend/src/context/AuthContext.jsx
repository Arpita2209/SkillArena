
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "skillarena_session";

function readSession() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const session = JSON.parse(saved);
    if (!session?.token || !session?.user) return null;

    return session;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  function saveSession(authResponse) {
    if (!authResponse?.token || !authResponse?.userId || !authResponse?.email) {
      throw new Error("The server returned an incomplete authentication response.");
    }

    const nextSession = {
      token: authResponse.token,
      user: {
        id: authResponse.userId,
        name: authResponse.name,
        email: authResponse.email,
      },
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  useEffect(() => {
    const handleUnauthorized = () => logout();

    window.addEventListener("skillarena:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("skillarena:unauthorized", handleUnauthorized);
    };
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token),
    saveSession,
    logout,
  }), [session]);

  return (
    <AuthContext.Provider value={value}>
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

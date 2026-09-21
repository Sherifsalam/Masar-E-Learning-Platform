import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on boot: the token lives in localStorage, the user
  // record is re-fetched so it is never stale.
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const adopt = useCallback((result) => {
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const loginStudent = useCallback(
    async (identifier, password) => adopt(await authApi.studentLogin(identifier, password)),
    [adopt]
  );

  const signupStudent = useCallback(
    async (payload) => adopt(await authApi.studentSignup(payload)),
    [adopt]
  );

  const loginTeacher = useCallback(
    async (email, password) => adopt(await authApi.teacherLogin(email, password)),
    [adopt]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    role: user ? user.role : null,
    isStudent: !!user && user.role === "student",
    isTeacher: !!user && user.role === "teacher",
    loginStudent,
    signupStudent,
    loginTeacher,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token =
      localStorage.getItem("token");

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (token && user) {
      return {
        token,
        user,
      };
    }

    return null;
  });

  const login = (token, user) => {
    localStorage.setItem("token", token);

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setAuth({
      token,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
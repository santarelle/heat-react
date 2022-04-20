import { createContext, ReactNode, useEffect, useState } from "react";
import { AuthResponse } from "../models/AuthResponse";
import { User } from "../models/User";
import { api } from "../services/api";

type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=65f33ecafed832aaf50f`;

  async function signIn(githubCode: string) {
    try {
      const response = await api.post<AuthResponse>("authenticate", {
        code: githubCode,
      });

      const { token, user } = response.data;
      localStorage.setItem("@heat-react:token", token);
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      setUser(user);
    } catch (error) {
      console.error("An error happened", error);
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@heat-react:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@heat-react:token");
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api
        .get<User>("users/profile")
        .then((response) => setUser(response.data))
        .catch((_) => signOut());
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}

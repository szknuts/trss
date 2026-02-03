"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserIdState] = useState<string | null>(null);

  // ★ 起動時に localStorage から復元
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserIdState(storedUserId);
    }
  }, []);

  // ★ setter をラップして localStorage も更新
  const setUserId = (id: string | null) => {
    if (id) {
      localStorage.setItem("userId", id);
    } else {
      localStorage.removeItem("userId");
    }
    setUserIdState(id);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

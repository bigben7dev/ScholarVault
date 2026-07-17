// src/context/DarkModeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // 1. localStorage preference
    const stored = localStorage.getItem("scholarvault-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // 2. System preference fallback
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply/remove .dark class on both <html> and <body>
    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    // Explicit background color to prevent flash of wrong theme
    body.style.backgroundColor = isDark ? "#020617" : "#ffffff";

    // Persist to localStorage
    localStorage.setItem("scholarvault-theme", isDark ? "dark" : "light");

    // Cleanup: no need to remove class on unmount, but we can reset style if needed
    return () => {
      // Optional: reset body background on unmount (rarely needed)
    };
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
}

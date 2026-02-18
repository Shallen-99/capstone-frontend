import { useEffect, useMemo, useState } from "react";

const THEME_KEY = "theme"; // "light" | "dark" | "system"

function getSystemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || "dark"; // default to your current look
  });

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  // Apply to <html data-theme="...">
  useEffect(() => {
    const root = document.documentElement;

    root.classList.add("theme-animate");
    root.setAttribute("data-theme", resolvedTheme);

    const t = window.setTimeout(() => root.classList.remove("theme-animate"), 250);
    return () => window.clearTimeout(t);
  }, [resolvedTheme]);

  // Persist
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // System changes (only if user chose system)
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", getSystemTheme());
    };

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return { theme, setTheme, resolvedTheme, toggleTheme };
}

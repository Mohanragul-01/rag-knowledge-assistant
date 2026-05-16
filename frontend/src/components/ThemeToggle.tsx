// File: src/components/ThemeToggle.tsx
// Purpose: Button that toggles dark/light mode by adding/removing 'dark' on <html>
// Step: Step-7 — React UI

import { useEffect, useState } from "react";


export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () =>
      // Respect OS preference on first load
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );


  useEffect(() => {
    // Tailwind's darkMode: 'class' reads this class on <html>
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);


  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      className="rounded-xl border border-cosmic-200 p-2 text-cosmic-600
                 transition-all hover:bg-cosmic-50 active:scale-95
                 dark:border-cosmic-700 dark:text-cosmic-300 dark:hover:bg-void-700"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}


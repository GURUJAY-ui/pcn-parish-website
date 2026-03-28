import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="theme-toggle group"
    >
      <span className="theme-toggle__halo" aria-hidden="true" />
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <Sun className="h-4 w-4" />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <Moon className="h-4 w-4" />
        </span>
        <span className="theme-toggle__thumb">
          <span className="theme-toggle__thumb-core">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </span>
        </span>
      </span>
      <span className="theme-toggle__label">
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}

export default ThemeToggle;

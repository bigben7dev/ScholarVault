// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.png";

export default function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300",
        "bg-white/70 border-slate-200/60",
        "dark:bg-slate-900/70 dark:border-slate-700/60",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand – always links to landing page */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ScholarVault" className="h-10 w-9" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ScholarVault
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-full transition-colors",
                "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
              )}
              aria-label="Toggle dark mode"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </motion.button>

            {/* Auth‑dependent buttons */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    "bg-indigo-600 text-white hover:bg-indigo-700",
                    "dark:bg-indigo-500 dark:hover:bg-indigo-600",
                    "shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50",
                  )}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    "bg-indigo-600 text-white hover:bg-indigo-700",
                    "dark:bg-indigo-500 dark:hover:bg-indigo-600",
                    "shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50",
                  )}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

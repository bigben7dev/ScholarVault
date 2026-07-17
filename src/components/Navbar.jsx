// src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.png";

export default function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ScholarVault" className="h-10 w-9" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ScholarVault
            </span>
          </Link>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />
            {user ? <AuthActions signOut={signOut} /> : <GuestActions />}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-center">
              <DarkModeToggle isDark={isDark} toggle={toggleDarkMode} />
            </div>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg bg-indigo-600 text-white text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="block w-full px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg bg-indigo-600 text-white text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Small helper components (avoids duplication)
function DarkModeToggle({ isDark, toggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
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
  );
}

function AuthActions({ signOut }) {
  return (
    <>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50"
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <button
        onClick={signOut}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </>
  );
}

function GuestActions() {
  return (
    <>
      <Link
        to="/auth"
        className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        Sign In
      </Link>
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50"
      >
        Get Started
      </Link>
    </>
  );
}

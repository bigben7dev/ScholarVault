import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { DarkModeProvider } from "./context/DarkModeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import UploadNote from "./components/UploadNote";
import SearchPage from "./components/SearchPage";
import AboutPage from "./components/AboutPage";
/**
 * Protected route wrapper – redirects to /auth if user is not logged in.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

/**
 * Animated route wrapper that applies consistent fade-in-up transitions.
 */
function AnimatedRoute({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <DarkModeProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <AnimatedRoute>
                  <LandingPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <AnimatedRoute>
                  <AboutPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <AnimatedRoute>
                  <AuthForm />
                </AnimatedRoute>
              }
            />

            {/* Protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <AnimatedRoute>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </AnimatedRoute>
              }
            />

            {/* Fallback (404) */}
            <Route
              path="*"
              element={
                <AnimatedRoute>
                  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <h1 className="text-2xl text-slate-500">Page not found</h1>
                  </div>
                </AnimatedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <AnimatedRoute>
                  <ProtectedRoute>
                    <UploadNote />
                  </ProtectedRoute>
                </AnimatedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <AnimatedRoute>
                  <SearchPage />
                </AnimatedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </DarkModeProvider>
  );
}

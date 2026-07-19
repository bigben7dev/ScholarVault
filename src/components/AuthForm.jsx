// src/components/AuthForm.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Hash,
  LogIn,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo2.png";

// Animation variants (unchanged)
const formContainer = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const extraFieldsVariant = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 16,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export default function AuthForm() {
  const { signIn, signUp, loading: authLoading } = useAuth();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Modes
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for recovery token in URL
  useEffect(() => {
    const hash = location.hash;
    if (hash.includes("type=recovery")) {
      setRecoveryMode(true);
      setForgotMode(false);
      setIsSignUp(false);
    }
  }, [location]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setDepartment("");
    setLevel("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setForgotMode(false);
    setRecoveryMode(false);
    resetForm();
  };

  const switchToForgotPassword = () => {
    setForgotMode(true);
    setIsSignUp(false);
    setRecoveryMode(false);
    resetForm();
  };

  const backToSignIn = () => {
    setForgotMode(false);
    setRecoveryMode(false);
    setIsSignUp(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // Recovery mode: update password
      if (recoveryMode) {
        if (!password || !confirmPassword) {
          setError("Both password fields are required.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
        setSuccessMessage(
          "Password updated successfully! Redirecting to sign in...",
        );
        setTimeout(() => {
          backToSignIn();
        }, 3000);
        return;
      }

      // Forgot password mode: send reset email
      if (forgotMode) {
        if (!email) {
          setError("Please enter your email address.");
          return;
        }
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth`,
          },
        );
        if (resetError) throw resetError;
        setSuccessMessage("Check your email for the password reset link.");
        return;
      }

      // Sign In / Sign Up
      if (isSignUp) {
        if (!fullName || !department || !level) {
          setError("All fields are required.");
          return;
        }
        const levelNum = parseInt(level, 10);
        if (isNaN(levelNum) || levelNum < 100) {
          setError("Please enter a valid level (e.g., 100, 200).");
          return;
        }
        await signUp(email, password, {
          full_name: fullName,
          department,
          level: levelNum,
        });
        navigate("/dashboard");
      } else {
        await signIn(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm";

  // Determine the form title
  const formTitle = recoveryMode
    ? "Create new password"
    : forgotMode
      ? "Reset your password"
      : isSignUp
        ? "Create your student account"
        : "Welcome back! Sign in to your vault";

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 ease-in-out flex flex-col md:flex-row">
      {/* Left Side: Form */}
      <div
        className={cn(
          "w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white dark:bg-slate-900",
        )}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formContainer}
          className="w-full max-w-md"
        >
          {/* Logo & branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <img src={logo} alt="ScholarVault" className="mx-auto h-10 w-9" />
            </motion.div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              ScholarVault
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {formTitle}
            </p>
          </div>

          {/* Toggle Tabs (hidden in forgot/recovery) */}
          {!recoveryMode && !forgotMode && (
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 relative">
              <motion.div
                layout
                className="absolute inset-0 w-1/2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm"
                animate={{ x: isSignUp ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setForgotMode(false);
                  setRecoveryMode(false);
                  resetForm();
                }}
                className={cn(
                  "relative flex-1 z-10 py-2.5 text-sm font-medium rounded-xl transition-colors",
                  !isSignUp
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </span>
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setForgotMode(false);
                  setRecoveryMode(false);
                  resetForm();
                }}
                className={cn(
                  "relative flex-1 z-10 py-2.5 text-sm font-medium rounded-xl transition-colors",
                  isSignUp
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus size={16} />
                  Sign Up
                </span>
              </button>
            </div>
          )}

          {/* Error / Success messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 flex items-start gap-3"
              >
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            key={
              isSignUp
                ? "signup"
                : recoveryMode
                  ? "recovery"
                  : forgotMode
                    ? "forgot"
                    : "signin"
            }
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {/* Email (except recovery) */}
            {(isSignUp || !recoveryMode) && !forgotMode && (
              <motion.div variants={childVariant}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    className={inputClass}
                  />
                </div>
              </motion.div>
            )}

            {/* Forgot mode: email only */}
            {forgotMode && (
              <motion.div variants={childVariant}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    className={inputClass}
                  />
                </div>
              </motion.div>
            )}

            {/* Password (sign-in / sign-up) */}
            {!recoveryMode && !forgotMode && (
              <motion.div variants={childVariant}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={cn(inputClass, "pr-12")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Recovery mode: new password + confirm */}
            {recoveryMode && (
              <>
                <motion.div variants={childVariant}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={cn(inputClass, "pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
                <motion.div variants={childVariant}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={cn(inputClass, "pr-12")}
                    />
                  </div>
                </motion.div>
              </>
            )}

            {/* Extra Sign Up fields */}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="extra-fields"
                  variants={extraFieldsVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="space-y-4">
                    <motion.div variants={childVariant}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Benedict Olasunkanmi"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                    <motion.div variants={childVariant}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Computer Science"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                    <motion.div variants={childVariant}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Level
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <input
                          type="number"
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          placeholder="200"
                          min="100"
                          step="100"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={authLoading}
              variants={childVariant}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all",
                authLoading && "animate-pulse",
              )}
            >
              {authLoading ? (
                "Processing..."
              ) : recoveryMode ? (
                <>
                  Update Password <ArrowRight size={18} />
                </>
              ) : forgotMode ? (
                <>
                  Send Reset Link <ArrowRight size={18} />
                </>
              ) : (
                <>
                  {isSignUp ? "Create account" : "Sign in"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer links */}
          {!recoveryMode && !forgotMode && (
            <>
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  {isSignUp ? "Sign in" : "Create one"}
                </button>
              </p>

              {/* Forgot password link (only on sign-in) */}
              {!isSignUp && (
                <p className="mt-2 text-center text-sm">
                  <button
                    onClick={switchToForgotPassword}
                    className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </p>
              )}
            </>
          )}

          {/* Back to sign in from forgot/recovery */}
          {(forgotMode || recoveryMode) && (
            <p className="mt-4 text-center text-sm">
              <button
                onClick={backToSignIn}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </motion.div>
      </div>

      {/* Right Side: Immersive Visual Hero (unchanged) */}
      <div
        className={cn(
          "hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12",
          "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950",
        )}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="relative z-10 text-center text-white max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
            <Sparkles size={14} />
            Your Academic Sanctuary
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
            Centralized.
            <br />
            Secure.
            <br />
            Yours forever.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Never hunt through WhatsApp groups again. ScholarVault stores every
            note, handout, and past question — filtered precisely to your
            department and level. Just log in and your academic world unfolds.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GraduationCap size={16} />
              <span>Department‑filtered content</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Zap size={16} />
              <span>Lightning‑fast search</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Lock size={16} />
              <span>End‑to‑end encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

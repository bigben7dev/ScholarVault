import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Camera, Loader2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";

// ==============================================================================

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8791A] dark:focus-visible:outline-[#E8C77A]";

const LEVELS = [100, 200, 300, 400, 500, 600];

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function getVaultId(userId) {
  if (!userId) return "········";
  return userId.slice(0, 8).toUpperCase();
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#E8E3D8] bg-white px-3 py-2 text-sm text-[#1C1D22] transition-colors focus:border-[#B8791A] focus:outline-none focus:ring-1 focus:ring-[#B8791A] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#E8C77A] dark:focus:ring-[#E8C77A]";

const labelClass =
  "block font-['IBM_Plex_Sans'] text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile(
    user?.id,
  );
  const shouldReduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    full_name: "",
    department: "",
    level: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Sync form fields whenever the underlying profile loads or changes,
  // without clobbering in-progress edits on every re-render.
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        department: profile.department ?? "",
        level: profile.level ?? "",
      });
    }
  }, [profile]);

  // Escape-to-close + focus the first field on open. This is a lightweight
  // a11y baseline (not a full focus trap) — good enough for a single-form
  // panel, but worth upgrading if this pattern spreads to more complex
  // dialogs later.
  useEffect(() => {
    if (!isOpen) return;
    firstFieldRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        full_name: form.full_name,
        department: form.department,
        level: form.level === "" ? null : Number(form.level),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message ?? "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err.message ?? "Couldn't upload that photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignOut = async () => {
    onClose();
    await supabase.auth.signOut();
  };

  const vaultId = getVaultId(user?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="vault-id-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#1C1D22]/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.aside
            key="vault-id-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your Vault ID"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 32 }
            }
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-r border-[#E8E3D8] bg-[#FAFAF9] dark:border-slate-700 dark:bg-slate-900 sm:max-w-[400px]"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-[#E8E3D8] px-6 py-5 dark:border-slate-800">
              <p className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.15em] text-[#B8791A] dark:text-[#E8C77A]">
                Vault ID · {vaultId}
              </p>
              <button
                onClick={onClose}
                aria-label="Close"
                className={`rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#F0EDE4] hover:text-[#1C1D22] dark:hover:bg-slate-800 dark:hover:text-white ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              {/* Photo — square ID-photo frame, matches the Dashboard card */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`group relative h-24 w-24 overflow-hidden rounded-xl bg-[#1B2A47] ring-1 ring-[#E8E3D8] transition-opacity dark:ring-slate-700 ${focusRing}`}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-['Source_Serif_4'] text-2xl font-semibold text-[#E8C77A]">
                        {getInitials(profile?.full_name)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  PNG, JPG, GIF, or WEBP · up to 2MB
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="mt-8 space-y-5">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input
                    ref={firstFieldRef}
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    className={inputClass}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    className={inputClass}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className={labelClass}>Level</label>
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, level: e.target.value }))
                    }
                    className={inputClass}
                    disabled={loading}
                  >
                    <option value="">Select level</option>
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} Level
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={saving || loading}
                  className={`w-full rounded-lg bg-[#B8791A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9C6415] disabled:opacity-60 dark:bg-[#E8C77A] dark:text-[#1C1D22] dark:hover:bg-[#DCB25E] ${focusRing}`}
                >
                  {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
                </button>
              </form>
            </div>

            <div className="border-t border-[#E8E3D8] px-6 py-4 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 ${focusRing}`}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

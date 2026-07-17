import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  GraduationCap,
  Search,
  FileText,
  ClipboardList,
  NotebookPen,
  ScrollText,
  Library,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  IdCard,
  Settings,
  Home,
  Trash2,
  Download,
} from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/userDashboardData";
import { supabase } from "../lib/supabase";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import logo from "../assets/logo2.png";
// ==================================================

const CATEGORY_CONFIG = {
  lecture_note: {
    label: "Lecture Note",
    icon: NotebookPen,
    accent: "bg-sky-500",
  },
  handout: { label: "Handout", icon: FileText, accent: "bg-emerald-500" },
  past_question: {
    label: "Past Question",
    icon: ScrollText,
    accent: "bg-rose-500",
  },
  study_guide: {
    label: "Study Guide",
    icon: BookOpen,
    accent: "bg-violet-500",
  },
  assignment: {
    label: "Assignment",
    icon: ClipboardList,
    accent: "bg-orange-500",
  },
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8791A] dark:focus-visible:outline-[#E8C77A]";

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function formatLevel(level) {
  if (level == null) return null;
  return `${level} Level`;
}

function formatMemberSince(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function getVaultId(userId) {
  if (!userId) return "········";
  return userId.slice(0, 8).toUpperCase();
}

function timeAgo(dateString) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Opens a note's file via a short-lived signed URL
async function openNoteFile(note, setOpeningId) {
  setOpeningId(note.id);
  try {
    const { data, error } = await supabase.storage
      .from("note-files")
      .createSignedUrl(note.file_url, 60);
    if (error) throw error;
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("Could not open file:", err.message);
  } finally {
    setOpeningId(null);
  }
}

//download function
async function downloadNoteFile(note, setDownloadingId) {
  setDownloadingId(note.id);
  try {
    const { data, error } = await supabase.storage
      .from("note-files")
      .createSignedUrl(note.file_url, 60, { download: true }); // Forces attachment

    if (error) throw error;

    // Trigger download by creating an invisible link
    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = note.title || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Download failed:", err.message);
  } finally {
    setDownloadingId(null);
  }
}

// ----------------------------------------------------------------------------
// Motion variants
// ----------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ----------------------------------------------------------------------------
// Small presentational pieces
// ----------------------------------------------------------------------------

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] ?? {
    label: category ?? "Other",
    accent: "bg-slate-400",
  };
  return (
    <span className="inline-flex items-center gap-1.5 font-['IBM_Plex_Sans'] text-xs font-medium text-slate-600 dark:text-slate-300">
      <span className={`h-1.5 w-1.5 rounded-full ${config.accent}`} />
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-xl border border-[#E8E3D8] bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="font-['IBM_Plex_Sans'] text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 font-['IBM_Plex_Mono'] text-3xl font-semibold tabular-nums text-[#1C1D22] dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div>
      <p className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.15em] text-[#B8791A] dark:text-[#E8C77A]">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-['Source_Serif_4'] text-lg font-semibold text-[#1C1D22] dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#DDD6C4] bg-[#FAFAF9] p-10 text-center dark:border-slate-600 dark:bg-slate-800/50">
      <Icon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
      <h3 className="mt-4 font-['IBM_Plex_Sans'] text-sm font-semibold text-[#1C1D22] dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#B8791A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9C6415] dark:bg-[#E8C77A] dark:text-[#1C1D22] dark:hover:bg-[#DCB25E] ${focusRing}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E8E3D8] bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:p-8">
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 shrink-0 rounded-xl bg-[#F0EDE4] dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-[#F0EDE4] dark:bg-slate-700" />
          <div className="h-7 w-44 rounded bg-[#F0EDE4] dark:bg-slate-700" />
          <div className="h-3 w-36 rounded bg-[#F0EDE4] dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Dashboard
// ----------------------------------------------------------------------------

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useCourses();
  const {
    profile,
    myNotes,
    totalVaultCount,
    loading: dashboardLoading,
    error: dashboardError,
    deleteNote,
  } = useDashboardData(user?.id);

  const [downloadingId, setDownloadingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const coursesCoveredCount = useMemo(
    () => new Set(myNotes.map((n) => n.course_code)).size,
    [myNotes],
  );

  const vaultId = getVaultId(user?.id);

  return (
    <div className="min-h-screen bg-[#FAFAF9] transition-colors duration-300 dark:bg-slate-900">
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-[#E8E3D8] bg-[#FAFAF9]/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ScholarVault" className="h-10 w-9" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ScholarVault
            </span>
          </div>

          <button
            onClick={() => setPanelOpen(true)}
            className={`flex items-center gap-2 rounded-full border border-[#E8E3D8] py-1 pl-1 pr-3 transition-colors hover:border-[#B8791A]/50 dark:border-slate-700 dark:hover:border-[#E8C77A]/50 ${focusRing}`}
          >
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-[#1B2A47] dark:bg-slate-700">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-['IBM_Plex_Mono'] text-[9px] font-semibold text-[#E8C77A]">
                  {getInitials(profile?.full_name)}
                </span>
              )}
            </div>
            <span className="font-['IBM_Plex_Mono'] text-xs text-slate-500 dark:text-slate-400">
              {vaultId}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Vault ID card — the signature identity element */}
        {dashboardLoading ? (
          <ProfileHeaderSkeleton />
        ) : dashboardError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            Couldn't load your record: {dashboardError}
          </div>
        ) : (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#B8791A] dark:bg-[#E8C77A]" />
            <div className="flex flex-col gap-6 p-6 pl-8 sm:flex-row sm:items-center sm:p-8 sm:pl-10">
              {/* ID-card photo frame — square, not circular; the "ID photo" is
                  the detail that sells the card metaphor. */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1B2A47] ring-1 ring-[#E8E3D8] dark:ring-slate-600 sm:h-24 sm:w-24">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name ?? "Profile photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-['Source_Serif_4'] text-2xl font-semibold text-[#E8C77A]">
                      {getInitials(profile?.full_name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-['IBM_Plex_Mono'] text-[11px] font-medium uppercase tracking-[0.15em] text-[#B8791A] dark:text-[#E8C77A]">
                  Vault ID · {vaultId}
                </p>
                <h1 className="mt-1 truncate font-['Source_Serif_4'] text-2xl font-semibold text-[#1C1D22] dark:text-white sm:text-3xl">
                  {profile?.full_name ??
                    user?.email?.split("@")[0] ??
                    "Student"}
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{profile?.department ?? "Department not set"}</span>
                  {profile?.level != null && (
                    <>
                      <span className="text-[#DDD6C4] dark:text-slate-600">
                        ·
                      </span>
                      <span className="font-['IBM_Plex_Mono']">
                        {formatLevel(profile.level)}
                      </span>
                    </>
                  )}
                  {profile?.created_at && (
                    <>
                      <span className="text-[#DDD6C4] dark:text-slate-600">
                        ·
                      </span>
                      <span>Since {formatMemberSince(profile.created_at)}</span>
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() => setPanelOpen(true)}
                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#E8E3D8] px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#B8791A]/50 hover:text-[#B8791A] dark:border-slate-600 dark:text-slate-300 dark:hover:text-[#E8C77A] ${focusRing}`}
              >
                <IdCard className="h-3.5 w-3.5" />
                Edit record
              </button>
            </div>
          </motion.section>
        )}

        {/* Stats strip */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <StatCard
            icon={Upload}
            label="Notes you've shared"
            value={myNotes.length}
          />
          <StatCard
            icon={GraduationCap}
            label="Courses you've covered"
            value={coursesCoveredCount}
          />
          <StatCard
            icon={Library}
            label="Resources in the vault"
            value={totalVaultCount}
          />
        </motion.section>

        {/* Quick actions — one primary action, the rest quiet */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <button
            onClick={() => navigate("/upload")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#B8791A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9C6415] dark:bg-[#E8C77A] dark:text-[#1C1D22] dark:hover:bg-[#DCB25E] ${focusRing}`}
          >
            <Upload className="h-4 w-4" />
            Upload a note
          </button>
          <button
            onClick={() => navigate("/search")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8E3D8] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#B8791A]/40 hover:text-[#B8791A] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-[#E8C77A] ${focusRing}`}
          >
            <Search className="h-4 w-4" />
            Search the vault
          </button>
          <button
            onClick={() => navigate("/")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 ${focusRing}`}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </motion.section>

        {/* Recent uploads */}
        <motion.section
          id="my-uploads"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10"
        >
          <SectionHeading eyebrow="Your Activity" title="Recent uploads" />

          {myNotes.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="You haven't shared anything yet"
              description="Upload your first lecture note, handout, or past question to start building the vault."
              actionLabel="Upload a note"
              onAction={() => navigate("/upload")}
            />
          ) : (
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mt-4 divide-y divide-[#E8E3D8] overflow-hidden rounded-xl border border-[#E8E3D8] bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800"
            >
              {myNotes.slice(0, 5).map((note) => {
                const config = CATEGORY_CONFIG[note.category] ?? {
                  accent: "bg-slate-400",
                };
                return (
                  <motion.li
                    key={note.id}
                    variants={staggerItem}
                    className="relative flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${config.accent}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 pl-2">
                      <CategoryBadge category={note.category} />
                      <p className="mt-1 truncate font-medium text-[#1C1D22] dark:text-white">
                        {note.title}
                      </p>
                      <p className="mt-0.5 font-['IBM_Plex_Mono'] text-xs text-slate-500 dark:text-slate-400">
                        {note.course_code} · {timeAgo(note.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openNoteFile(note, setOpeningId)}
                        disabled={openingId === note.id}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-400 ${focusRing}`}
                      >
                        {openingId === note.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                        View
                      </button>

                      {/* Download button */}
                      <button
                        onClick={() => downloadNoteFile(note, setDownloadingId)}
                        disabled={downloadingId === note.id}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-400 ${focusRing}`}
                      >
                        {downloadingId === note.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download
                      </button>

                      {/* Delete button (new) */}
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this note?",
                            )
                          ) {
                            try {
                              await deleteNote(note.id, note.file_url);
                            } catch (err) {
                              console.error("Delete failed:", err);
                            }
                          }
                        }}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.section>

        {/* Browse by course */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 pb-4"
        >
          <SectionHeading eyebrow="Explore" title="Browse by course" />

          {coursesLoading ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-[#F0EDE4] dark:bg-slate-800"
                />
              ))}
            </div>
          ) : coursesError ? (
            <p className="mt-4 text-sm text-red-500">{coursesError}</p>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Be the first to upload a note and start building the vault."
              actionLabel="Upload a note"
              onAction={() => navigate("/upload")}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {courses.map((course) => (
                <motion.button
                  key={course.course_code}
                  variants={staggerItem}
                  onClick={() =>
                    navigate(
                      `/search?course=${encodeURIComponent(course.course_code)}`,
                    )
                  }
                  whileHover={{ y: -2 }}
                  className={`group flex flex-col items-start rounded-xl border border-[#E8E3D8] bg-white p-5 text-left shadow-sm transition-colors hover:border-[#B8791A]/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-[#E8C77A]/50 ${focusRing}`}
                >
                  <div className="inline-flex rounded-lg bg-[#F5F2EA] p-2 dark:bg-slate-700">
                    <BookOpen className="h-5 w-5 text-[#1B2A47] dark:text-slate-300" />
                  </div>
                  <h3 className="mt-4 font-['IBM_Plex_Sans'] text-base font-semibold text-[#1C1D22] dark:text-white">
                    {course.course_title}
                  </h3>
                  <p className="mt-1 font-['IBM_Plex_Mono'] text-xs uppercase tracking-wide text-slate-400">
                    {course.course_code}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#B8791A] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#E8C77A]">
                    View notes <ChevronRight className="h-3 w-3" />
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.section>
      </main>

      <ProfileSettingsModal
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

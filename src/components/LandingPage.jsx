// src/components/LandingPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Search,
  Upload,
  FolderOpen,
  Star,
  Users,
  FileText,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  Lock,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import heroImage from "../assets/hero.jpg";
import lockImg from "../assets/lock.jpg";
import searchImg from "../assets/search1.jpeg";
import uploadImg from "../assets/uploadbtn.jpeg";

// ── Animation presets ────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const STAGGER_SLOW = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const SLIDE_RIGHT = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

const SLIDE_LEFT = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

// ── Static data (updated for open repository) ────────────────
const STATS = [
  { value: "12,000+", label: "Documents shared" },
  { value: "340+", label: "Courses indexed" },
  { value: "98%", label: "Positive feedback" },
  { value: "Free", label: "Forever for students" },
];

const CATEGORIES = [
  { label: "Lecture Notes", icon: BookOpen, color: "bg-blue-500" },
  { label: "Past Questions", icon: FileText, color: "bg-violet-500" },
  { label: "Handouts", icon: Layers, color: "bg-amber-500" },
  { label: "Study Guides", icon: Star, color: "bg-emerald-500" },
  { label: "Assignments", icon: FolderOpen, color: "bg-rose-500" },
];

const TESTIMONIALS = [
  {
    quote:
      "I found three years of CSC past questions in under two minutes. That has never happened before at this university.",
    name: "Amara O.",
    course: "Computer Science",
    initials: "AO",
    color: "bg-blue-600",
  },
  {
    quote:
      "The moment I uploaded my notes and saw coursemates downloading them instantly — this is what we needed.",
    name: "Tunde B.",
    course: "Electrical Engineering",
    initials: "TB",
    color: "bg-violet-600",
  },
  {
    quote:
      "Every note is categorized properly. No more 'does anyone have the handout from week 4?' in group chat.",
    name: "Ngozi A.",
    course: "Biochemistry",
    initials: "NA",
    color: "bg-emerald-600",
  },
];

const FEATURES = [
  {
    number: "01",
    icon: Search,
    image: searchImg,
    color: "text-blue-600",
    bg: "bg-blue-50",
    tag: "Discovery",
    heading: "Search across all universities instantly.",
    body: "No more institutional silos. Type any course code or keyword and get results from our shared global knowledge base — in milliseconds.",
    proof: [
      "Full‑text search on title & description",
      "Filter by category",
      "Anonymous browsing allowed",
    ],
  },
  {
    number: "02",
    icon: Upload,
    image: uploadImg,
    color: "text-violet-600",
    bg: "bg-violet-50",
    tag: "Contribution",
    heading: "Upload once. The world finds it.",
    body: "Share your lecture notes, past questions, and handouts with students everywhere. Your document becomes part of a permanent, searchable academic vault.",
    proof: [
      "Lecture notes",
      "Past questions",
      "Handouts",
      "Study guides",
      "Assignments",
    ],
  },
  {
    number: "03",
    icon: Lock,
    image: lockImg,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    tag: "Security",
    heading: "Secure access, self‑moderated.",
    body: "Download links are protected behind authentication. Community flagging keeps the repository clean. You own your uploads — update or delete anytime.",
    proof: [
      "Row Level Security",
      "File URL hidden from anonymous visitors",
      "Flagging & moderation",
    ],
  },
];

// ── Helper components ────────────────────────────────────────
function Tag({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "text-xs font-bold uppercase tracking-widest",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Hero Search Component ────────────────────────────────────
function HeroSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Unified search function – uses RPC with ILIKE fallback
  const performSearch = useCallback(async (searchQuery) => {
    setSearching(true);
    setSearchError(null);
    try {
      const { data, error } = await supabase.rpc("search_notes", {
        search_query: searchQuery,
        limit_count: 20,
      });
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      if (err.message.includes("Could not find the function")) {
        console.warn("search_notes RPC missing – using ILIKE fallback");
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("notes")
            .select("*")
            .or(
              `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%`,
            )
            .order("created_at", { ascending: false })
            .limit(20);
          if (fallbackError) throw fallbackError;
          setResults(fallbackData || []);
        } catch (fallbackErr) {
          setSearchError(fallbackErr.message || "Search failed");
          setResults([]);
        }
      } else {
        setSearchError(err.message || "Search failed");
        setResults([]);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchError(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 transition-all">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "CSC301 past questions" or "organic chemistry handout"'
            className="flex-1 pl-11 pr-4 py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm transition-colors"
          >
            Search Vault
          </button>
        </div>
      </form>

      {/* Loading indicator */}
      {searching && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Searching...
        </div>
      )}

      {/* Error message */}
      {searchError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          {searchError}
        </div>
      )}

      {/* Results grid */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid grid-cols-1 gap-3"
          >
            {results.map((note) => (
              <SearchResultCard
                key={note.id}
                note={note}
                isAuthenticated={!!user}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Search result card ───────────────────────────────────────
function SearchResultCard({ note, isAuthenticated }) {
  const navigate = useNavigate();
  const [loadingUrl, setLoadingUrl] = useState(false);

  const categoryColor =
    {
      lecture_note:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      handout:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
      past_question:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
      study_guide:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      assignment:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    }[note.category] || "bg-slate-100 text-slate-800";

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setLoadingUrl(true);
    try {
      const { data, error } = await supabase.storage
        .from("note-files")
        .createSignedUrl(note.file_url, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to generate download link:", err);
    } finally {
      setLoadingUrl(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border p-4",
        "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm",
        !isAuthenticated && "relative overflow-hidden",
      )}
    >
      {/* Blur overlay for anonymous users */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] bg-white/40 dark:bg-slate-800/40">
          <div className="text-center p-4">
            <Lock className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Sign up to access
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold rounded-lg"
            >
              Create Free Account
            </button>
          </div>
        </div>
      )}

      {/* Content (visible to all) */}
      <div className="relative z-20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                {note.course_code}
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-md",
                  categoryColor,
                )}
              >
                {note.category?.replace("_", " ")}
              </span>
              {!isAuthenticated && (
                <Lock size={12} className="text-slate-400 ml-auto" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {note.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {new Date(note.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Action button */}
          <div className="flex-shrink-0 self-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleDownload}
              disabled={loadingUrl}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all",
                isAuthenticated
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-indigo-200 dark:shadow-indigo-900"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900 hover:shadow-lg",
              )}
            >
              {loadingUrl ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isAuthenticated ? (
                <Download size={14} />
              ) : (
                <Lock size={14} />
              )}
              {loadingUrl
                ? "Loading..."
                : isAuthenticated
                  ? "View & Download"
                  : "Sign Up to Access"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Dashboard mockup (unchanged) ────────────────────────────
function HeroMockup() {
  const MOCK_COURSES = [
    {
      code: "CSC 301",
      title: "Data Structures",
      files: 14,
      color: "bg-blue-500",
    },
    {
      code: "MTH 201",
      title: "Calculus II",
      files: 28,
      color: "bg-violet-500",
    },
    { code: "PHY 101", title: "Mechanics", files: 9, color: "bg-amber-500" },
    {
      code: "CHM 201",
      title: "Organic Chemistry",
      files: 17,
      color: "bg-emerald-500",
    },
  ];

  return (
    <motion.div
      variants={SLIDE_LEFT}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl",
        "border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10",
        "dark:border-slate-700/80 dark:bg-slate-900",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600">
            <BookOpen size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Scholar
            <span className="text-blue-600 dark:text-blue-400">Vault</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
          <Search size={14} className="text-slate-400" strokeWidth={2} />
          <span className="text-sm text-slate-400">Search by course code…</span>
          <span className="ml-auto text-xs text-slate-300">⌘K</span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Recent documents
        </p>
        <div className="flex flex-col gap-2">
          {MOCK_COURSES.map((course, i) => (
            <motion.div
              key={course.code}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.4 + i * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 22,
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-slate-100",
                "bg-white px-4 py-3 shadow-sm",
                "cursor-default transition-all duration-200 hover:border-slate-200 hover:shadow-md",
                "dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600",
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  course.color,
                )}
              >
                <BookOpen size={14} className="text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate dark:text-white">
                  {course.code}
                </p>
                <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                  {course.title}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <FileText
                  size={12}
                  className="text-slate-300 dark:text-slate-500"
                />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-300">
                  {course.files}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 cursor-default"
        >
          <Upload size={14} className="text-white" strokeWidth={2} />
          <span className="text-sm font-semibold text-white">
            Upload a Note
          </span>
        </motion.div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/20"
      />
    </motion.div>
  );
}

// ── Feature row (unchanged) ──────────────────────────────────
function FeatureRow({ feature, index }) {
  const isEven = index % 2 === 0;
  const Icon = feature.icon;

  return (
    <motion.div
      id="features"
      variants={STAGGER}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "grid items-center gap-12 lg:grid-cols-2",
        !isEven && "lg:[&>*:first-child]:order-2",
      )}
    >
      {/* Text side (unchanged) */}
      <motion.div
        variants={isEven ? SLIDE_RIGHT : SLIDE_LEFT}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif text-5xl font-bold text-slate-100 select-none dark:text-slate-800">
            {feature.number}
          </span>
          <Tag className="border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Icon size={11} strokeWidth={2.25} className={feature.color} />
            {feature.tag}
          </Tag>
        </div>
        <h3 className="font-serif text-2xl font-bold leading-snug text-slate-900 dark:text-white sm:text-3xl">
          {feature.heading}
        </h3>
        <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
          {feature.body}
        </p>
        <ul className="flex flex-col gap-2">
          {feature.proof.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <CheckCircle2
                size={15}
                className="shrink-0 text-emerald-500"
                strokeWidth={2.25}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Visual side – now a floating image container */}
      <motion.div
        variants={isEven ? SLIDE_LEFT : SLIDE_RIGHT}
        className="flex items-center justify-center"
      >
        <motion.div
          // Floating animation: moves up and down infinitely
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden",
            "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]",
            "border border-slate-200 dark:border-slate-700",
          )}
        >
          <img
            src={feature.image}
            alt={feature.tag}
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay gradient to match the design */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
// ── Testimonial card (unchanged) ────────────────────────────
function TestimonialCard({ quote, name, course, initials, color }) {
  return (
    <motion.div
      variants={FADE_UP}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-slate-200",
        "bg-white p-6 shadow-sm",
        "cursor-default transition-shadow duration-200 hover:shadow-md",
        "dark:border-slate-700 dark:bg-slate-900",
      )}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className="fill-amber-400 text-amber-400"
            strokeWidth={0}
          />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "text-xs font-bold text-white",
            color,
          )}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {name}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{course}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Landing Page ────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Navbar />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* ══ HERO (with photo background) ════════════════════ */}
        <section
          ref={heroRef}
          id="home"
          className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/80" />

          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"
          >
            {/* Left column – search & text */}
            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-7"
            >
              <motion.div variants={FADE_UP}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                    "border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/30",
                    "text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300",
                  )}
                >
                  <GraduationCap size={12} strokeWidth={2.5} />
                  Open Academic Repository
                </span>
              </motion.div>

              <motion.h1
                variants={FADE_UP}
                className="font-serif text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-6xl"
              >
                All of students'
                <br />
                knowledge,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  in one vault.
                </span>
              </motion.h1>

              <motion.p
                variants={FADE_UP}
                className="max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg"
              >
                Search any course code, any keyword — lecture notes, past
                questions, handouts — shared by students across the world. Free,
                open, secure.
              </motion.p>

              {/* Search bar */}
              <motion.div variants={FADE_UP}>
                <HeroSearch />
              </motion.div>
            </motion.div>

            {/* Right column – mockup */}
            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="show"
              className="relative hidden lg:block"
              style={{ height: 460 }}
            >
              <HeroMockup />
            </motion.div>
          </motion.div>
        </section>

        {/* ══ STATS STRIP ═════════════════════════════════════ */}
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-100 px-6 md:grid-cols-4 md:divide-y-0 dark:divide-slate-800 lg:px-10"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={FADE_UP}
                className="flex flex-col items-center gap-1 py-10 px-6 text-center"
              >
                <span className="font-serif text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ══ CATEGORIES PILL STRIP ═══════════════════════════ */}
        <section className="overflow-hidden border-b border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex animate-[marquee_24s_linear_infinite] items-center gap-3 whitespace-nowrap">
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <span
                  key={i}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2",
                    "border border-slate-200 bg-white text-sm font-medium text-slate-600",
                    "shadow-sm",
                    "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full",
                      cat.color,
                    )}
                  >
                    <Icon size={11} className="text-white" strokeWidth={2.5} />
                  </span>
                  {cat.label}
                </span>
              );
            })}
          </div>
        </section>

        {/* ══ FEATURES ════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              variants={STAGGER}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-20 flex flex-col items-center text-center"
            >
              <motion.div variants={FADE_UP}>
                <Tag className="border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Layers
                    size={11}
                    strokeWidth={2.25}
                    className="text-slate-400"
                  />
                  How it works
                </Tag>
              </motion.div>
              <motion.h2
                variants={FADE_UP}
                className="mt-4 font-serif text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl"
              >
                Everything you need.
                <br />
                <span className="text-slate-400 dark:text-slate-500">
                  Nothing you don&apos;t.
                </span>
              </motion.h2>
            </motion.div>

            <div className="flex flex-col gap-24 lg:gap-32">
              {FEATURES.map((feature, i) => (
                <FeatureRow key={feature.number} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ════════════════════════════════════ */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              variants={STAGGER}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-14 flex flex-col items-center text-center"
            >
              <motion.div variants={FADE_UP}>
                <Tag className="border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Star size={11} strokeWidth={0} className="fill-amber-400" />
                  Student voices
                </Tag>
              </motion.div>
              <motion.h2
                variants={FADE_UP}
                className="mt-4 font-serif text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl"
              >
                Don&apos;t take our word for it.
              </motion.h2>
              <motion.p
                variants={FADE_UP}
                className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400"
              >
                Thousands of students across the globe are already using
                ScholarVault to find what they need, when they need it.
              </motion.p>
            </motion.div>

            <motion.div
              variants={STAGGER_SLOW}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ CTA SECTION ═════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white py-28 dark:bg-slate-950">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.06), transparent)",
            }}
          />

          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 px-6 text-center"
          >
            <motion.div variants={FADE_UP}>
              <Tag className="border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <GraduationCap
                  size={11}
                  strokeWidth={2.25}
                  className="text-slate-400"
                />
                Free for every student
              </Tag>
            </motion.div>

            <motion.h2
              variants={FADE_UP}
              className="font-serif text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl"
            >
              Join the global
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                academic vault.
              </span>
            </motion.h2>

            <motion.p
              variants={FADE_UP}
              className="max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400"
            >
              Sign up for free and unlock every document shared by students
              worldwide. Your account gives you unlimited access and the power
              to contribute.
            </motion.p>

            <motion.div
              variants={FADE_UP}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to="/auth"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-8 py-4",
                    "bg-indigo-600 text-white text-sm font-bold",
                    "shadow-xl shadow-indigo-200 dark:shadow-indigo-900",
                    "transition-colors duration-200 hover:bg-indigo-700 dark:hover:bg-indigo-500",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  )}
                >
                  Create Your Free Account
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.p
              variants={FADE_UP}
              className="text-xs text-slate-400 dark:text-slate-500"
            >
              No credit card · No setup · No cost
            </motion.p>
          </motion.div>
        </section>
      </main>

      <Footer />

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

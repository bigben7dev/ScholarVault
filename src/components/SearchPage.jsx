import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  ArrowLeft,
  FileText,
  BookOpen,
  Lock,
  GraduationCap,
  Download,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "lecture_note", label: "Lecture Notes" },
  { key: "handout", label: "Handouts" },
  { key: "past_question", label: "Past Questions" },
  { key: "study_guide", label: "Study Guides" },
  { key: "assignment", label: "Assignments" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialQuery = searchParams.get("q") || "";
  const initialCourse = searchParams.get("course") || "";

  const [query, setQuery] = useState(initialQuery);
  const [courseFilter, setCourseFilter] = useState(initialCourse);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Build search text: combine query and course filter
  const effectiveQuery = courseFilter
    ? `${courseFilter} ${query}`.trim()
    : query;

  const performSearch = useCallback(async () => {
    if (!effectiveQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      // Call the search_notes RPC
      const { data, error: rpcError } = await supabase.rpc("search_notes", {
        search_query: effectiveQuery,
        limit_count: 30,
      });
      if (rpcError) throw rpcError;

      // Filter by category client-side if a category is selected
      let filtered = data || [];
      if (categoryFilter) {
        filtered = filtered.filter((n) => n.category === categoryFilter);
      }
      setResults(filtered);
    } catch (err) {
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [effectiveQuery, categoryFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 350);
    return () => clearTimeout(timer);
  }, [performSearch]);

  // Handle Enter key
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setCourseFilter("");
    setResults([]);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Search the Vault
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Find lecture notes, past questions, handouts, and more.
          </p>
        </motion.div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "CSC 201 past questions"'
              className="w-full pl-11 pr-10 py-3.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className={`px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl shadow-sm transition-colors ${focusRing}`}
          >
            Search
          </button>
        </form>

        {/* Course filter (optional) */}
        <div className="mt-4">
          <input
            type="text"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            placeholder="Filter by course code (e.g. CSC201)"
            className="w-full sm:w-64 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Category filter chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                categoryFilter === cat.key
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                  : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-400",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-10">
          {searching && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {!searching &&
            results.length === 0 &&
            effectiveQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                  No results found
                </h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Try different keywords or browse by category.
                </p>
              </motion.div>
            )}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
      </div>
    </div>
  );
}

// Single result card with signed URL for authenticated users
function SearchResultCard({ note, isAuthenticated }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && note.file_url) {
      setLoadingUrl(true);
      supabase.storage
        .from("note-files")
        .createSignedUrl(note.file_url, 60)
        .then(({ data, error }) => {
          if (!error) setSignedUrl(data.signedUrl);
          setLoadingUrl(false);
        });
    }
  }, [isAuthenticated, note.file_url]);

  const categoryColor =
    {
      lecture_note:
        "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
      handout:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      past_question:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      study_guide:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      assignment:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    }[note.category] || "bg-slate-100 text-slate-800";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        "relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm",
        !isAuthenticated && "overflow-hidden",
      )}
    >
      {/* Blur for anonymous */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 dark:bg-slate-800/30 flex items-center justify-center">
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

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
              {note.course_code}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                categoryColor,
              )}
            >
              {note.category?.replace("_", " ")}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {note.title}
          </h3>
          {note.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {note.description}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {new Date(note.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {isAuthenticated && (
          <div className="shrink-0">
            {loadingUrl ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            ) : signedUrl ? (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-lg shadow-sm"
              >
                <Download size={14} />
                View
              </a>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

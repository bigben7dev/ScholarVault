// src/components/CourseDetails.jsx
import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  HelpCircle,
  Map,
  ClipboardCheck,
  BookOpen,
  Bookmark,
  UploadCloud,
  X,
  PlusCircle,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  File as FileIcon,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourseNotes } from "../hooks/useCourseNotes";
import { cn } from "../lib/utils";

// Allowed categories with icons and labels
const CATEGORIES = [
  { key: "lecture_note", icon: FileText, label: "Lecture Notes" },
  { key: "handout", icon: FileSpreadsheet, label: "Handouts" },
  { key: "past_question", icon: HelpCircle, label: "Past Questions" },
  { key: "course_outline", icon: Map, label: "Course Outlines" },
  { key: "assignment", icon: ClipboardCheck, label: "Assignments" },
  { key: "textbook", icon: BookOpen, label: "Textbooks" },
  { key: "study_guide", icon: Bookmark, label: "Study Guides" },
];

// Helper to determine file type icon
const getFileIcon = (url) => {
  if (!url) return FileText;
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return ImageIcon;
  if (ext === "pdf") return FileText;
  if (ext === "doc" || ext === "docx") return FileText;
  return FileIcon;
};

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const listItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function CourseDetails({ course }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { notes, loading, isUploading, uploadError, uploadNote, refresh } =
    useCourseNotes(course?.id, userId);

  const [activeCategory, setActiveCategory] = useState("lecture_note");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("lecture_note");
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef(null);

  const filteredNotes = useMemo(
    () => notes.filter((n) => n.category === activeCategory),
    [notes, activeCategory],
  );

  const handleBack = () => navigate("/dashboard");

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setSelectedCategory(activeCategory);
    setFormError("");
    setIsDragging(false);
  };

  const openUpload = (category) => {
    setSelectedCategory(category || activeCategory);
    setUploadOpen(true);
  };

  const closeUpload = () => {
    setUploadOpen(false);
    resetForm();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!file || !title || !selectedCategory) {
      setFormError("Title, category, and file are required.");
      return;
    }
    try {
      await uploadNote({
        file,
        title,
        description,
        category: selectedCategory,
      });
      closeUpload();
    } catch (err) {
      setFormError(err.message || "Upload failed.");
    }
  };

  // Full page loading / error
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">No course selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 ease-in-out">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openUpload(activeCategory)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <UploadCloud size={18} />
            Upload Note
          </motion.button>
        </div>

        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {course.course_title}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {course.course_code} &middot; {course.level} Level
          </p>
        </div>

        {/* Category Tabs with layoutId animation */}
        <div className="relative mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm overflow-x-auto">
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "relative z-10 flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                  )}
                >
                  <Icon size={16} />
                  {cat.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-lg"
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes List or Empty State */}
        <AnimatePresence mode="wait">
          {filteredNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <PlusCircle className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              </motion.div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                No {CATEGORIES.find((c) => c.key === activeCategory)?.label} yet
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                This category is empty. Upload your first file and start
                building your vault.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openUpload(activeCategory)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <UploadCloud size={16} />
                Upload Now
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="space-y-4"
            >
              {filteredNotes.map((note) => {
                const Icon = getFileIcon(note.file_url);
                return (
                  <motion.div
                    key={note.id}
                    variants={listItem}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex items-start gap-4"
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {note.title}
                      </h3>
                      {note.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {note.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {new Date(note.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                    >
                      <FileText size={14} /> View
                    </a>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Slide-over Panel */}
        <AnimatePresence>
          {uploadOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeUpload}
                className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
              />
              {/* Slide-over */}
              <motion.div
                key="panel"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Upload New Note
                  </h2>
                  <button
                    onClick={closeUpload}
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X
                      size={20}
                      className="text-slate-500 dark:text-slate-400"
                    />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 p-6 space-y-6 overflow-y-auto"
                >
                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-3 px-4 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Midterm Summary"
                      required
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Description (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description..."
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 py-3 px-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Drag-and-drop file upload zone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      File
                    </label>
                    <div
                      ref={dropRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                        isDragging
                          ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-300 dark:border-slate-600 hover:border-indigo-400",
                        file &&
                          "border-green-300 bg-green-50 dark:bg-green-900/20",
                      )}
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                    >
                      <input
                        id="fileInput"
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {file ? (
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          <FileText className="h-6 w-6 mx-auto mb-1 text-indigo-500" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </div>
                      ) : (
                        <div>
                          <UploadCloud className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Drag & drop your file here, or click to browse
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PDF, DOCX, images up to 15MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form error */}
                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle size={14} />
                      {formError}
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isUploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70",
                      isUploading && "animate-pulse",
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} /> Upload Note
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  ArrowLeft,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useNoteUpload } from "../hooks/useNoteUpload";

const CATEGORIES = [
  { key: "lecture_note", label: "Lecture Note" },
  { key: "handout", label: "Handout" },
  { key: "past_question", label: "Past Question" },
  { key: "study_guide", label: "Study Guide" },
  { key: "assignment", label: "Assignment" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

export default function UploadNote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadNote, uploading, error: uploadError } = useNoteUpload(user?.id);

  const [form, setForm] = useState({
    course_code: "",
    course_title: "",
    title: "",
    description: "",
    category: "lecture_note",
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      await uploadNote({
        file,
        ...form,
      });
      setSuccess(true);
      // Optionally reset form
      setForm({
        course_code: "",
        course_title: "",
        title: "",
        description: "",
        category: "lecture_note",
      });
      setFile(null);
      // Redirect after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      // Error handled by hook (displayed)
    }
  };

  const clearFile = () => setFile(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
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
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Upload a Note
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Share your knowledge with the global vault. All fields are required.
          </p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-8 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 text-xl font-semibold text-emerald-800 dark:text-emerald-200">
              Upload Successful!
            </h3>
            <p className="mt-2 text-emerald-600 dark:text-emerald-300">
              Your note is now available in the vault. Redirecting...
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            {/* Course code & title in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="course_code"
                  value={form.course_code}
                  onChange={handleChange}
                  placeholder="e.g. CSC201"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="course_title"
                  value={form.course_title}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Note title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Midterm Past Questions"
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full appearance-none border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
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

            {/* File dropzone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                File (PDF, DOCX, Image) *
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-300 dark:border-slate-600 hover:border-amber-400",
                  file &&
                    "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-amber-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Drag & drop your file here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Max 15 MB · PDF, DOCX, Images
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error display */}
            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                {uploadError}
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={uploading || !file}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed",
                focusRing,
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Publish to Vault
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

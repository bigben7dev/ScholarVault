// src/hooks/useCourseNotes.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Custom hook to manage notes for a specific course.
 *
 * @param {string} courseId - The UUID of the active course.
 * @param {string} userId - The authenticated user's UUID.
 * @returns {{
 *   notes: Array,
 *   loading: boolean,
 *   isUploading: boolean,
 *   uploadError: string|null,
 *   uploadNote: function,
 *   refresh: function
 * }}
 */
export function useCourseNotes(courseId, userId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  /**
   * Sanitize a filename: remove special characters, keep letters/numbers/_.-
   * Prepend a Unix timestamp to prevent overwrite collisions.
   */
  const sanitizeFileName = (name) => {
    const ext = name.substring(name.lastIndexOf("."));
    const base = name.substring(0, name.lastIndexOf("."));
    const clean = base
      .replace(/[^a-zA-Z0-9_.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_|_$/g, "");
    return `${Date.now()}_${clean}${ext}`;
  };

  /**
   * Fetch all notes for the current course, ordered by newest first.
   */
  const fetchNotes = useCallback(async () => {
    if (!courseId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      setNotes([]);
      console.error("Failed to fetch notes:", err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  /**
   * Upload a file and create its database record.
   * Rolls back storage upload if database insert fails.
   *
   * @param {Object} params
   * @param {File} params.file - The file to upload.
   * @param {string} params.title - Note title.
   * @param {string} params.description - Note description.
   * @param {string} params.category - One of the allowed note categories.
   */
  const uploadNote = async ({ file, title, description, category }) => {
    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("No course selected.");

    setIsUploading(true);
    setUploadError(null);

    let uploadedPath = null;

    try {
      // ----- Phase 1: Storage Upload (unchanged) -----
      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${userId}/${courseId}/${safeFileName}`;
      uploadedPath = filePath;

      const { error: uploadErr } = await supabase.storage
        .from("note-files")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw uploadErr;

      // ----- Phase 2: Database Record (ONLY CHANGE BELOW) -----
      // BEFORE: stored public URL
      // const { data: urlData } = supabase.storage.from("note-files").getPublicUrl(filePath);
      // const publicUrl = urlData?.publicUrl;
      // INSERT file_url = publicUrl;

      // AFTER: store the file path directly (no URL)
      const { error: insertErr } = await supabase.from("notes").insert({
        title,
        description: description || null,
        category,
        course_id: courseId,
        uploaded_by: userId,
        file_url: filePath, // ← now stores path, not URL
      });

      if (insertErr) {
        // Rollback: delete the stored file
        await supabase.storage.from("note-files").remove([filePath]);
        throw insertErr;
      }

      await fetchNotes();
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };
}

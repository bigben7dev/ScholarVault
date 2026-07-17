import { useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook for uploading a note to the global vault.
 * @param {string} userId - The authenticated user's ID.
 */
export function useNoteUpload(userId) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sanitise filename: remove special characters, prefix with timestamp.
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
   * Upload a file and create the database record.
   * @param {Object} params
   * @param {File} params.file - The file to upload.
   * @param {string} params.course_code - e.g. 'CSC201'
   * @param {string} params.course_title - e.g. 'Data Structures'
   * @param {string} params.title - Note title.
   * @param {string} params.description - Optional description.
   * @param {string} params.category - One of: lecture_note, handout, past_question, study_guide, assignment
   * @returns {Promise<Object>} The inserted note record.
   */
  const uploadNote = async ({
    file,
    course_code,
    course_title,
    title,
    description = "",
    category,
  }) => {
    if (!userId) throw new Error("You must be logged in to upload.");
    setUploading(true);
    setError(null);

    let uploadedPath = null;

    try {
      // Client-side file size check (15 MB)
      if (file.size > 30 * 1024 * 1024) {
        throw new Error("File size must be less than 30 MB.");
      }

      // Validate allowed MIME types
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Allowed: PDF, DOC, DOCX, images.");
      }

      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${userId}/${safeFileName}`;
      uploadedPath = filePath;

      // Upload to private bucket
      const { error: uploadError } = await supabase.storage
        .from("note-files")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Insert note record (file_url stores the path)
      const { data, error: insertError } = await supabase
        .from("notes")
        .insert({
          course_code,
          course_title,
          title,
          description,
          category,
          file_url: filePath, // not a public URL
          uploaded_by: userId,
        })
        .select("*")
        .single();

      if (insertError) {
        // Rollback: remove uploaded file
        await supabase.storage.from("note-files").remove([filePath]);
        throw insertError;
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadNote, uploading, error };
}

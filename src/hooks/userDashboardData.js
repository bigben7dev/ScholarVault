import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useDashboardData(userId) {
  const [profile, setProfile] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [totalVaultCount, setTotalVaultCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [profileRes, notesRes, countRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("notes")
          .select("*")
          .eq("uploaded_by", userId)
          .order("created_at", { ascending: false }),
        // head: true → Postgres returns only the count, no rows transferred.
        supabase.from("notes").select("*", { count: "exact", head: true }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (notesRes.error) throw notesRes.error;
      if (countRes.error) throw countRes.error;

      setProfile(profileRes.data);
      setMyNotes(notesRes.data ?? []);
      setTotalVaultCount(countRes.count ?? 0);
    } catch (err) {
      setError(err.message ?? "Something went wrong loading your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Delete a note and its file from storage
  const deleteNote = async (noteId, filePath) => {
    // 1. Delete the database row
    const { error: dbError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    if (dbError) throw dbError;

    // 2. Delete the file from storage (ignore errors if file doesn't exist)
    if (filePath) {
      await supabase.storage.from("note-files").remove([filePath]);
    }

    // 3. Refresh the notes list
    await fetchAll();
  };

  return {
    profile,
    myNotes,
    totalVaultCount,
    loading,
    error,
    deleteNote,
    refetch: fetchAll,
  };
}

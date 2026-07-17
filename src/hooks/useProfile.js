// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update text fields
  const updateProfile = async ({ full_name, department, level }) => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name, department, level })
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  // Upload avatar and set avatar_url
  const uploadAvatar = async (file) => {
    const filePath = `${userId}/avatar.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    // Get signed URL (private bucket)
    const { data: signedData, error: signedError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
    if (signedError) throw signedError;

    const avatar_url = signedData.signedUrl;
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw error;
    setProfile(data);
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}

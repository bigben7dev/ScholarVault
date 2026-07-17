import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

/**
 * Merge Tailwind classes and conditional class names without conflicts.
 * Uses clsx for conditional logic and tailwind-merge for precedence.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export async function getSignedUrl(filePath, expiresIn = 60) {
  const { data, error } = await supabase.storage
    .from("note-files")
    .createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches all distinct courses available in the global vault.
 * Returns a list of { course_code, course_title } objects.
 */
export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get distinct course_code and course_title combinations from notes
        const { data, error } = await supabase
          .from("notes")
          .select("course_code, course_title")
          .order("course_code");

        if (error) throw error;

        // Deduplicate the pairs (some rows may have same code but different titles,
        // but that shouldn't happen if course_code is consistent)
        const seen = new Set();
        const uniqueCourses = [];
        for (const row of data) {
          const key = `${row.course_code}::${row.course_title}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueCourses.push(row);
          }
        }
        setCourses(uniqueCourses);
      } catch (err) {
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return { courses, loading, error, retry: () => {} }; // retry optional
}

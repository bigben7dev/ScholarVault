
import { useEffect, useState } from "react";

const SCRIPT_ID = "recaptcha-script";
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export function useRecaptcha() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Avoid double loading
    if (document.getElementById(SCRIPT_ID)) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("reCAPTCHA failed to load");
      setScriptLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Remove only if component unmounts? Actually keep it for global use.
      // We'll not remove because it's shared.
    };
  }, []);

  /**
   * Returns a reCAPTCHA token for the given action.
   * Throws if script is not ready or token fails.
   */
  const getToken = async (action = "submit") => {
    if (!scriptLoaded) throw new Error("reCAPTCHA not yet loaded");
    if (!window.grecaptcha) throw new Error("grecaptcha not available");
    return window.grecaptcha.execute(SITE_KEY, { action });
  };

  return { getToken, scriptLoaded };
}
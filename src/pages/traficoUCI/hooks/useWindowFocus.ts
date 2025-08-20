// src/pages/traficoUCI/useWindowFocus.ts
import { useEffect, useState } from "react";

export function useWindowFocus() {
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return focused;
}

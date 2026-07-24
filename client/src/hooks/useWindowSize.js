import { useEffect, useState } from "react";

/**
 * Returns current window width, updating on resize.
 * Used to conditionally render chart props for mobile.
 */
export function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  return { width, isMobile: width < 640, isTablet: width < 1024 };
}

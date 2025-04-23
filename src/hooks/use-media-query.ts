
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Initialize as false for consistency between client and server
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // No window in server environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Create MediaQueryList object
    const mediaQuery = window.matchMedia(query);
    
    // Set initial state value
    setMatches(mediaQuery.matches);
    
    // Define callback for when media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup: remove event listener when component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]); // Only depends on the query
  
  return matches;
}


import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Stato inizializzato come null per evitare un rendering difforme tra server e client
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Crea un oggetto MediaQueryList
    const mediaQuery = window.matchMedia(query);
    
    // Imposta lo stato con il valore iniziale
    setMatches(mediaQuery.matches);
    
    // Definisci il callback per quando il media query cambia
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Aggiungi l'event listener
    mediaQuery.addEventListener('change', handler);
    
    // Pulizia: rimuovi l'event listener quando il componente viene smontato
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]); // Dipende solo dalla query
  
  return matches;
}

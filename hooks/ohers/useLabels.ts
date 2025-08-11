
import { useEffect, useState } from 'react';
import  { Labels } from '../../types/labelInterface'; 
import { useSession } from 'next-auth/react';

// Custom hook para cargar los labels
export const useLabels = () => {
  const [labels, setLabels]       = useState<Labels | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const { data: session, status } = useSession();
  let jsonFileName='labelsES.json';
  // if (session?.user.language === 'fr'){
  //   jsonFileName= 'labels.json';
  // } else  if (session?.user.language === 'en'){
  //   jsonFileName= 'labels.json';
  // }else {
  //   jsonFileName= 'labelsES.json';
  // }

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const loadedLabels = await import(`../../data/${jsonFileName}`);
        setLabels(loadedLabels); // Si el JSON tiene un export default
      } catch (err) {
        setError('Error al cargar los labels');
        console.error('Error al cargar el archivo:', err);
      }
    };

    if (jsonFileName) {
      loadLabels(); // Invoca la función cuando jsonFileName está disponible
    }
  }, [jsonFileName]);

  return { labels, error }; // Devuelve los labels y el error para usar en otros componentes
};

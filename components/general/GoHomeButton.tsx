"use client";

import { useState } from 'react';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { useSidebarToggle } from '../../context/SidebarToggleContext';
import { fetchMenuData } from '@/utils/fetchMenuData'; // Ajusta la ruta según tu estructura de carpetas
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLabels } from '@/hooks/ohers/useLabels';

interface GoHomeButtonProps {
  isFormModified: boolean;//si hubo cambios
  theme: string;
}

const GoHomeButton: React.FC<GoHomeButtonProps> = ({ isFormModified, theme }) => {
  
  const { dirty }                 = useFormikContext(); 
  const router                    = useRouter();
  const { enableToggleButton }    = useSidebarToggle();
  const [ loading, setLoading ]   = useState(false);
  const { data: session }         = useSession();
  const user                      = session?.user;
  const { labels, error }         = useLabels();
  //console.log('GoHomeButton');
  const handleGoHome = async () => {
    if (isFormModified) {
      //const confirmLeave = window.confirm('Advertencia: Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
      const message=labels?.general.tooltipBotonGotoMenu;
      const confirmLeave = window.confirm(message)
      if (!confirmLeave) {
        return;
      }
    }
    setLoading(true);
    if (user) {
      try {
        const menuData = await fetchMenuData(user.id);
        // Actualiza el estado global del menú si es necesario
      } catch (error) {
        console.error('Error loading menu:', error);
      }
    }
    setLoading(false);
    router.push('/');
    setTimeout(() => {
      enableToggleButton();
    }, 100);
  };
  return ( 
    <div>
       { labels ? (
        <button
          onClick={handleGoHome}
          disabled={loading}
          // className={`absolute top-2 right-2 bg-transparent text-gray-600 
          //           hover:text-gray-900`}
          className={`absolute top-2 right-2 bg-transparent ${
            theme === 'dark'
              ? 'text-white hover:text-gray-400'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={labels.general.botonGoToMenu}
        >
          <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          {loading ? `${labels.general.loading}` : ''}
        </button>
        ): (
          <div>Loading labels...</div>
        )}
    </div>    
  );
};

export default GoHomeButton;
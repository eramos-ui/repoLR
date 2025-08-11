import { useEffect, useRef  } from "react";

type AlertType = 'success' | 'error' | 'warning' | 'info';
interface CustomAlertProps {
  onClose?: () => void; // Función para cerrar el alert
  message: React.ReactNode; // Mensaje que se mostrará en el alert (puede contener HTML)
  type?: AlertType;
  duration?: number | null; // Tiempo en milisegundos antes de que la alerta se cierre automáticamente, null no se cierra
  theme?: 'light' | 'dark';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ type='info', onClose, message, duration , theme = 'light' }) => {
  
  const alertStyles = {
    light: {
      success: 'bg-green-100 text-green-700 border-green-400',
      error: 'bg-red-100 text-red-700 border-red-400',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-400',
      info: 'bg-blue-100 text-blue-700 border-blue-400',
    },
    dark: {
      success: 'bg-green-900 text-green-200 border-green-700',
      error: 'bg-red-900 text-red-200 border-red-700',
      warning: 'bg-yellow-900 text-yellow-200 border-yellow-700',
      info: 'bg-blue-900 text-blue-200 border-blue-700',
    },
  };
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Mantener referencia al temporizador

  useEffect(() => {
    if (duration && onClose) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);

      // Limpiar el temporizador al desmontar el componente
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [duration, onClose]);
   
  const handleClose = () => { // Función para manejar el clic en "X"
      if (timerRef.current) {
        clearTimeout(timerRef.current); // Cancelar el temporizador si aún está activo
      }
      onClose?.(); // Llamar a la función onClose
  };
  return (
    <div className={`border-l-4 p-4  rounded w-90 ${alertStyles[theme][type]}`} role="alert">
      <div className="flex justify-between items-center">
        <span className="text-sm">{message}</span>
        {onClose && (
          <button
            onClick={handleClose} // Cerrar alerta inmediatamente
            className="ml-2 text-2xl font-bold leading-none focus:outline-none"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};



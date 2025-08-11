import React, { useState } from 'react';

interface CustomTooltipProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  position?: 'top' | 'bottom' | 'left' | 'right'; // Nueva prop para la ubicación
  children: React.ReactNode;
}

export const FormCustomTooltip: React.FC<CustomTooltipProps> = ({
  text,
  color = 'white',
  backgroundColor = 'black',
  position = 'top', // Posición por defecto
  children
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Definimos estilos de posición en función de la prop 'position'
  const getTooltipPosition = () => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)' };
      default:
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            ...getTooltipPosition(), // Aplicamos la posición calculada
            backgroundColor: backgroundColor,
            color: color,
            padding: '5px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
import React, { useState, ReactNode } from 'react';

import "./CustomTooltip.css";
export interface CustomTooltipProps {
  children: ReactNode;
  color?: string;
  backgroundColor?: string;
  content: ReactNode; // Contenido del tooltip
  position?: "top" | "bottom" | "left" | "right"; // Posición del tooltip
  theme?: "light" | "dark"; // Tema
  trigger?: "hover" | "click" | "focus"; // Modo de activación
  offset?: number; // Margen del tooltip
} 

export const  CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  color = 'white',
  backgroundColor = 'black',
  content,
  position = "top",
  theme = "light",
  trigger = "hover",
  offset = 3,
}) => {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);

  const eventHandlers =
    trigger === "hover"
      ? { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }
      : trigger === "click"
      ? { onClick: () => setVisible(!visible) }
      : { onFocus: showTooltip, onBlur: hideTooltip };

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    ...(position === "top" && { bottom: `calc(100% + ${offset}px)` }),
    ...(position === "bottom" && { top: `calc(100% + ${offset}px)` }),
    ...(position === "left" && { right: `calc(100% + ${offset}px)` }),
    ...(position === "right" && { left: `calc(100% + ${offset}px)` }),
  };

  const wrapperStyle: React.CSSProperties = {
    position: "relative", // Necesario para posicionar el tooltip
    display: "inline-block",
  };
 //console.log('Tooltips-position',position,content);
  return (
    <div className="custom-tooltip-container" style={wrapperStyle} {...eventHandlers}>
      {children}
      {visible && (
        <div
          className={`custom-tooltip custom-tooltip--${position} custom-tooltip--${theme} color:${color}  backgroundColor: ${backgroundColor}`}
          style={tooltipStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// export default CustomTooltip;



// interface CustomTooltipProps {
//   text: string;
//   color?: string;
//   backgroundColor?: string;
//   position?: 'top' | 'bottom' | 'left' | 'right'; // Nueva prop para la ubicación
//   children: React.ReactNode;
// }

// export const CustomTooltip: React.FC<CustomTooltipProps> = ({
//   text,
//   color = 'white',
//   backgroundColor = 'black',
//   position = 'top', // Posición por defecto
//   children
// }) => {
//   const [showTooltip, setShowTooltip] = useState(false);

//   const handleMouseEnter = () => {
//     setShowTooltip(true);
//   };

//   const handleMouseLeave = () => {
//     setShowTooltip(false);
//   };

//   // Definimos estilos de posición en función de la prop 'position'
//   const getTooltipPosition = () => {
//     switch (position) {
//       case 'top':
//         return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
//       case 'bottom':
//         return { top: '100%', left: '50%', transform: 'translateX(-50%)' };
//       case 'left':
//         return { right: '100%', top: '50%', transform: 'translateY(-50%)' };
//       case 'right':
//         return { left: '100%', top: '50%', transform: 'translateY(-50%)' };
//       default:
//         return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
//     }
//   };

//   return (
//     <div
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//       style={{ position: 'relative', display: 'inline-block' }}
//     >
//       {children}
//       {showTooltip && (
//         <div
//           style={{
//             position: 'absolute',
//             ...getTooltipPosition(), // Aplicamos la posición calculada
//             backgroundColor: backgroundColor,
//             color: color,
//             padding: '5px',
//             borderRadius: '4px',
//             whiteSpace: 'nowrap',
//             zIndex: 100,
//           }}
//         >
//           {text}
//         </div>
//       )}
//     </div>
//   );
// };
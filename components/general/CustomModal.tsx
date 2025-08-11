import React from 'react';
import DOMPurify from 'dompurify';
import { CustomButton } from '../controls';

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?:string;
  height?: string;   
  position?:"center" | "top" | "bottom" | "left" |"right";
  htmlContent?: string; // 📌 Nueva prop para HTML
  backgroundColorForm?:string;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, width ='500px', height='1000px',  children, 
     title, onClose, position='center',htmlContent='', backgroundColorForm="#fff" }) => {
      // console.log('en CustomModal width,height',width,height);
  if (!isOpen) return null;
    // 📌 Posicionamiento flexible según la opción seleccionada
    const getPositionStyles = (): React.CSSProperties => {
      switch (position) {
        case "top":
          return { top: "10%", left: "50%", transform: "translate(-50%, 0)" };
        case "bottom":
          return { bottom: "10%", left: "50%", transform: "translate(-50%, 0)" };
        case "left":
          return { top: "50%", left: "10%", transform: "translate(0, -50%)" };
        case "right":
          return { top: "50%", right: "10%", transform: "translate(0, -50%)" };
        default: // "center"
          return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      }
    };
  
  return (
    <div
      style={{
        position: "fixed", // Asegura que el modal esté encima      
        top :0,
        left: 0,
        backgroundColor:'rgba(0, 0, 0, 0.5)', // Fondo semitransparente oscuro
        backdropFilter: "none",//sin transparencia
        zIndex: 1000, // Alta prioridad en el apilamiento
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "15px", // 📌 Espaciado superior
      }}
    >
      <div
      //rgba(87, 85, 85, 0.1)
        style={{
          position: "fixed",
          ...getPositionStyles(),
          //backgroundColor:backgroundColorForm, //"#fff", // Fondo blanco para el modal
          backgroundColor:backgroundColorForm,
          backdropFilter: "none",//sin transparencia
          borderRadius: "8px",
          width: width, // Ancho del modal
          maxWidth: "90%", // Ajuste para pantallas pequeñas
          padding: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra para realzar
          border: "2px solid #007BFF", // 🔹 Borde azul
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch", 
          height: height, // 📌 Altura ajustable
          maxHeight: "85vh", // 📌 Limita el alto máximo para evitar desbordamiento
          overflowY: "auto", // 📌 Agrega scroll si el contenido es demasiado grande
        }}
      >
        <div /* Header */
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
            width: "100%", 
          }}
        >
          {title && <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{title}</h2>}
          <CustomButton 
             label='✖' tooltipPosition='left' tooltipContent='Cerrar el formulario' onClick={onClose}
             style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#555",
            }}
          />
        </div>
        {/* 📌 Renderiza HTML si se proporciona */}
        {htmlContent && (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
        )}
        <div /* Content */
          style={{
              display: "flex",
              flexDirection: "column", // Asegura que las filas estén en columna
              gap: "5px", // Define el espacio entre filas                    
            }}
        >
            {children}
        </div>
      </div>
    </div>
  );
};
export default CustomModal;

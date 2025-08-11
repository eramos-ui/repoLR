

import { CustomTooltip } from '.';

import "./CustomButton.css";

export interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  theme?: "light" | "dark";
  buttonStyle?: "primary" | "secondary";
  size?: "large" | "small" | "medium";
  disabled?: boolean;
  htmlType?: "button" | "submit" | "reset";
  isSubmitting?: boolean; // Nueva propiedad para manejar el estado de envío
  icon?: React.ReactNode; // Ícono para el botón
  iconPosition?: "left" | "right"; // Posición del ícono
  style?: React.CSSProperties;  
  tooltipContent?: React.ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right"; 
  formRef?: React.RefObject<HTMLFormElement | null>;
};


export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  theme = "light",
  buttonStyle = "primary",
  size = "large",
  disabled = false,
  htmlType = "button",
  isSubmitting = false, // Valor predeterminado
  icon,
  iconPosition = "left",
  style,
  tooltipContent,
  tooltipPosition = "top",
  formRef,
}) => {

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // console.log("🧪 Botón clic detectado. Tipo:", htmlType);
  
    if (htmlType === "submit" && formRef?.current) {
      event.preventDefault(); // 🔹 evita el comportamiento predeterminado
      formRef.current.requestSubmit(); // 🔹 fuerza el submit del formulario
      return;
    }
  
    if (!isSubmitting && onClick) {
      event.preventDefault(); // prevenir en todos los casos para controlar manualmente
      onClick();
    }
  };
  const button = (
    <button
      className={`custom-button ${theme} ${buttonStyle} ${size} ${disabled || isSubmitting ? "disabled" : ""}`}
      type={htmlType}
      onClick={handleClick}
      disabled={disabled || isSubmitting}
      style={style}
      aria-busy={isSubmitting}
    >
      {icon && iconPosition === "left" && <span className="button-icon left">{icon}</span>}
      {isSubmitting ? "Enviando..." : label}
      {icon && iconPosition === "right" && <span className="button-icon right">{icon}</span>}
    </button>
  );

  return tooltipContent ? (
    <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={10}>
      {button}
    </CustomTooltip>
  ) : (
    button
  );
};
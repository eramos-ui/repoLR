import { useState } from "react";
import Image from 'next/image';
import { useFormikContext, FieldProps } from "formik";

export interface CustomSelectIconProps extends Partial<FieldProps> {
  label: string;
  name?: string;
  options: { value: string; label: string; image?: string | undefined; nroAguas?:number }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  width?: string;
  
}

export const CustomSelectIcon: React.FC<CustomSelectIconProps> = ({
  field,
  meta,
  label,
  name,
  options,
  value,
  onChange,
  placeholder = "Seleccione una opción",
  required = false,
  width = "100%",

}) => {
  //console.log('CustonSelectIcon',label, required);
    const { setFieldValue } = useFormikContext();
    const selectedValue = name ? field?.value : value;
    const [internalValue, setInternalValue] = useState(selectedValue || "");
    const handleChange = (newValue: string) => {
        if ( field ) {
          console.log(`📌 Actualizando Formik: ${field.name} = ${newValue}`);
          setFieldValue(field.name,newValue)
        } else {
          setInternalValue(newValue);
          if (onChange) {
            onChange(newValue);
          }
        }
      };
  return (
    <div className="custom-select-icon">
      <label className="select-label">{label} {required && '*'}</label>
      <div className="options-container">
        {options.map((option) => (
          <div
            key={option.value}
            className={`option ${value === option.value ? "selected" : ""}`}
            onClick={() => handleChange(option.value)}
          >
            <Image 
                src={option.image!!}
                alt={option.label}
                width={120} // 📌 Establece el tamaño de la imagen
                height={120}
                className="option-image"
            />
            <span className="option-label">{option.label}</span>
          </div>
        ))}
      </div>
      {meta?.touched && meta.error && <div className="error-message">{meta.error}</div>}
      <style jsx>{`
        .custom-select-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .select-label {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .options-container {
          display: flex;
          gap: 15px;          
          flex-wrap: wrap;
          justify-content: center;
        }
        .option {
          cursor: pointer;
          border: 2px solid transparent;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: border 0.2s ease-in-out;
        }
        .option :global(img) { 
            width: 40px;  /* 📌 Tamaño fijo para todas las imágenes */
            height: 40px; 
           
            
        }
        .option-label {
          margin-top: 5px;
          font-size: 14px;
          text-align: center;
        }
        .option.selected {
          border: 2px solid #0070f3;
          border-radius: 10px;
        }
      `}</style>
    </div>
      );
    };
    // <div className="custom-select-icon" style={{ position: "relative", width }}>
    //   <label className="select-label">{label} {required && '*'}</label>
    //   <button
    //     type="button"
    //     className="custom-select-button"
    //     onClick={() => setIsOpen(!isOpen)}
    //     style={{
    //       display: "flex",
    //       alignItems: "center",
    //       justifyContent: "space-between",
    //       width: "100%",
    //       padding: "10px",
    //       background: "#fff",
    //       border: "1px solid #ccc",
    //       borderRadius: "5px",
    //       cursor: "pointer"
    //     }}
    //   >
    //     <FontAwesomeIcon icon={selectedIcon} style={{ marginRight: "10px" }} />
    //     {selectedLabel}
    //     <FontAwesomeIcon icon={faCaretDown} />
    //   </button>

    //   {isOpen && (
    //     <div className="custom-select-dropdown" style={{
    //       position: "absolute",
    //       top: "100%",
    //       left: 0,
    //       width: "100%",
    //       background: "#fff",
    //       border: "1px solid #ccc",
    //       borderRadius: "5px",
    //       boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    //       zIndex: 100
    //     }}>
    //       {options.map((option) => (
    //         <div key={option.value}
    //           className={`option ${value === option.value ? "selected" : ""}`}
    //           onClick={() => { onChange?.(option.value); setIsOpen(false); }}
    //           style={{
    //             display: "flex",
    //             alignItems: "center",
    //             padding: "10px",
    //             cursor: "pointer",
    //             borderBottom: "1px solid #eee"
    //           }}
    //         >
    //            <FontAwesomeIcon icon={option.icon} style={{ marginRight: "10px" }} />
    //           {option.label} 
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>


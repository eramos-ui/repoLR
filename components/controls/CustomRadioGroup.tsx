import React, { useEffect, useState } from "react";
import { FieldProps } from "formik";

interface CustomRadioGroupProps extends Partial<FieldProps> {
  label: string;
  size?:'normal' | 'h1' | 'h2' | 'h3'  | 'normal+'; //definidas en el css
  options: { id: string | number; label: string }[];
  orientation?: "horizontal" | "vertical";
  color?: 'text-primary' | 'text-secondary' | 'text-tertiary' ;
  className?: string;
  width?: string;
  theme?: 'light' | 'dark';
  onChange?: (value: string | number) => void;
  defaultValue?: string | number; 
}

export const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  label,
  size ='normal',
  options,
  orientation = "vertical",
  color= 'text-primary',
  theme = 'light',
  width = "100%",
  field,
  form,
  onChange,
  defaultValue,
}) => {
  const isFormik = Boolean(field && form); // 📌 Detectamos si el componente está dentro de Formik
  const [ selectedValue, setSelectedValue ] = useState<string | number>(
    isFormik ? field?.value ?? defaultValue : defaultValue ?? ""
  );
  // 📌 Sincroniza defaultValue con Formik cuando está dentro
  useEffect(() => {
    if (isFormik && field?.value !== undefined) {
      setSelectedValue(field.value);
    }
  }, [field?.value, isFormik]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;

    if (isFormik && field) {
      form?.setFieldValue(field.name, newValue);
    } else {
      setSelectedValue(newValue);
    }

    if (onChange) onChange(newValue);
  };

  return (
    <div className={`radio-group-container ${ size } ${ color }  ${theme} ${orientation}`} style={{ width }}>
      <label> {label}: </label>
      {options.map((option) => (
        <label key={option.id} >
          <input
            type="radio"
            name={field?.name}
            value={option.id}
            checked={ isFormik ? field?.value === option.id : selectedValue === option.id}
            onChange={handleChange}
          />          
          <span style={{ marginLeft: "10px" }}>{option.label}</span> {/* 📌 Agrega espacio a la izquierda */}
        </label>
      ))}
    </div>
  );
};

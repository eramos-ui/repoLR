"use client";

import {useEffect, useState, useCallback} from "react";
import { FieldProps } from 'formik';
import './CustomInput.css';
import { CustomTooltip } from './CustomTooltip';
import React from 'react';
import { formatRut } from "@/utils/formatRut";
import { validateRut } from "@/utils/validateRut";

export interface InputProps  extends Partial<FieldProps> {
    /**
      * caption to display
    */
    label:string;
    /**
      * caption position
    */    
    captionPosition?: 'left' | 'top';
    /**
      * placeholder
    */   
    placeholder?: string;
    /**
      * type input
    */  
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'color' | 'file' | 'RUT';
    /**
      * value para storybook
    */      
    value?: string | number; // Para Storybook
    /**
      * error para storybook
    */     
    error?: string | any; // Para Storybook
    /**
      * text align
    */         
    textAlign?: 'left' | 'center' | 'right';
    /**
      * disabled
    */         
    disabled?: boolean;
    /**
      * required 
    */     
    required?: boolean;
    /**
      * maxlength
    */         
    maxLength?: number;
    /**
      * minLength
    */
    name?: string; // Nombre del campo en Formik         
    minLength?: number;
    pattern?: string;
    className?: string;
    //onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // Declarar onChange como opcional
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    autoFocus?: boolean;
    /**
      * ícono at left
    */         
    leftIcon?: React.ReactNode;
    /**
      * ícono at right
    */         
    rightIcon?: React.ReactNode;
    /**
      * width control in pixels
    */     
    style?: React.CSSProperties; // Define el estilo inline del componente no va si es parte de un FormRow en que respeta grid-template-columns
    width?: string ; 
    theme?: 'light' | 'dark'; 
    /**
     * Contenido del tooltip
     */ 
    tooltipContent?: React.ReactNode;
    /**
     * Posición del tooltip
     */ 
    tooltipPosition?: "top" | "bottom" | "left" | "right"; 
    id?: string;
    min?:number; //valor mínimo si es number
    multiline?: boolean; // 📌 Nueva propiedad para soportar múltiples líneas
    rows?: number; // 📌 Permite definir el número de filas en el `textarea`
    formatNumber?: boolean;
    useDecimals?:boolean;
    visible?:boolean;
    autocomplete?:string;
  }

export const CustomInput = ({
    field,
    form,   
    label, captionPosition ='top',
    placeholder,
    type = 'text',    
    value,
    textAlign='left',
    disabled = false,
    required = false,
    error,
    maxLength,
    minLength,
    style,
    width,
    pattern,
    onChange,
    autoFocus = false,
    leftIcon,
    rightIcon,
    theme='light',
    tooltipContent,
    tooltipPosition = "top",
    id,
    min=0,
    multiline = false, // 📌 Se añade soporte para multilínea
    rows = 3, // 📌 Se establece un valor predeterminado de filas
    formatNumber= false,
    useDecimals= false,
    visible=true,
    autocomplete ="off",
    ...props
   }: InputProps ) =>{
    const [ charCount, setCharCount ]           = useState((field?.value ?? value ?? "").toString().length);
    const [ formattedValue, setFormattedValue ] = useState<string>(value ? value.toString() : "");
    const [ valueInside, setValueInside ]       = useState<any>( value ? value.toString() : "");
    const [ rutError, setRutError ]             = useState<string | null>(null);
    // console.log('CustomInput ',label,type,formatNumber,value);
    const inputClassNames = ` 
    custom-input-field ${theme}
    ${leftIcon ? 'has-left-icon' : ''} 
    ${rightIcon ? 'has-right-icon' : ''}
  `.trim();
      // 📌 Formatea el número con separadores de miles y opcionalmente decimales
      const formatNumberValue = useCallback((num: string): string => {
          if (!num) return "";
          //const numericValue = num.replace(/[^0-9,]/g, "").replace(",", ".");
          const numericValue = num.replace(/[^0-9,]/g, "");
          let [integerPart, decimalPart] = numericValue.split(".");
          
          if (formatNumber) {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          }
          // console.log('formatNumberValue',num,integerPart,decimalPart);
          const formattedDecimal = decimalPart ? decimalPart.slice(0, 2) : ""; // 🔹 Limita a 2 decimales
          //console.log('formattedDecimal',formattedDecimal,decimalPart);
    
          return useDecimals && formattedDecimal !== "" ? `${integerPart},${formattedDecimal}` : integerPart;
    },[formatNumber,useDecimals]);
    useEffect(()=>{//🔹 Si se usa formatNumber, se formatea el valor inicial
      if (formatNumber) {
        const formatted = formatNumberValue(valueInside);
        setFormattedValue(formatted);
      }
    }, [valueInside, formatNumber, formatNumberValue]);
    useEffect(() => {
      if (type === 'RUT' && valueInside) {
        // console.log('CustomInput useEffect type',type,valueInside);
        const isValid= validateRut(valueInside);
        setRutError(isValid ? null : 'RUT no válido');
      } else {
        setRutError(null);
      }
    }, [valueInside, type]);

    // if (type ==='RUT') console.log('**CustomInput field', value, error,form?.touched,form?.errors);
    const inputValue = (field?.value ?? value)? field?.value ?? value:'';
    const name = field?.name || ''; // Usa un valor predeterminado si field es undefined
    const errorMessage =
     (form?.touched?.[name] && form?.errors?.[name] && typeof form?.errors?.[name] === 'string') || error; // Prioriza Formik si existe
    if (!visible) return <></>;

    // 📌 Convierte el valor formateado en un número real sin separadores
    const parseNumber = (formatted: string): string => {
      // Elimina los puntos de miles
      let raw = formatted.replace(/\./g, "");    
      // Si se usa decimales, reemplaza coma por punto
      if (useDecimals) {
        raw = raw.replace(/,/g, ".");
      }    
      return raw;
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawInput = event.target.value;
      setValueInside(rawInput);
      setCharCount(rawInput.length);
    
      // Caso: tipo número con formato de miles (y opcional decimales)
      if (type === "number" && formatNumber) {
        const formatted = formatNumberValue(rawInput); // visual
        const parsed = parseNumber(rawInput); // para Formik
    
        setFormattedValue(formatted);
    
        if (field?.onChange) {
          field.onChange({
            ...event,
            target: {
              ...event.target,
              value: parsed,
            },
          });
        }
    
        if (onChange) {
          onChange({
            ...event,
            target: {
              ...event.target,
              value: parsed,
            },
          });
        }
    
        return;
      }
    
      // Caso: RUT
      if (type === "RUT") {
        const formatted = formatRut(rawInput);
        setFormattedValue(formatted);
    
        if (field?.onChange) {
          field.onChange({
            ...event,
            target: {
              ...event.target,
              value: formatted,
            },
          });
        }
    
        if (onChange) {
          onChange({
            ...event,
            target: {
              ...event.target,
              value: formatted,
            },
          });
        }
    
        return;
      }
    
      // Caso general (texto, email, etc.)
      setFormattedValue(rawInput);
    
      if (field?.onChange) {
        field.onChange(event);
      }
    
      if (onChange) {
        onChange(event);
      }
    };
    
    const labelAdd  = ( maxLength && multiline)? `(${charCount}/${maxLength} caracteres máx.)`: '' ; //`+ required && '*' 
    const labelFull = label+' '+labelAdd;
    const inputElement = (
      <div  className="input-wrapper"   >
        {leftIcon && <span className="icon left-icon">{leftIcon}</span>}
        {multiline ? (
        // 📌 Si multiline está activado, usamos `textarea` en lugar de `input`
        <textarea
          id={id}
          {...field}
          {...props}
          className={`${inputClassNames} custom-textarea`}
          style={{
            textAlign,
            ...style,
            width: width || "auto",
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          value={inputValue}
          onChange={handleChange}
          autoFocus={autoFocus}
          autoComplete={autocomplete}
          rows={rows} // 📌 Número de líneas visibles
        />
      ) : (
        <input
          id={id}
          {...field} // Solo contiene value, onChange, onBlur, y name
          {...props}
          type={formatNumber ? "text" : type} // 📌 Cambia a `text` si se usa formateo de miles
          className={inputClassNames}
          style={{ textAlign,
            ...style, // Combina estilos externos
            width: width || "auto", // Usa un ancho personalizado o predeterminado
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          value={type === "number" && formatNumber ? formattedValue :(type ==='RUT')? formattedValue :  valueInside}
          onChange={handleChange} // Usa handleChange que prioriza field.onChange
          autoFocus={autoFocus}
          autoComplete={autocomplete}
        />
      )}
        {rightIcon && <span className="icon right-icon">{rightIcon}</span>}
      </div>
    ); 
    // console.log('CustomInput rutError',rutError,valueInside);
    return (
      <div 
        className={`custom-input-container ${theme} ${captionPosition}`}
      >
        <label className={`custom-input-label ${captionPosition} `}
          style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0"}}
        >    
          {labelFull} {required && '*'}
        </label>
        {tooltipContent ? (
          <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={1}>
            {inputElement}
          </CustomTooltip>
        ) : (
          inputElement
        )}
           {/* {errorMessage && <div className="error-message">{errorMessage}</div>}
           {rutError && <div className="error-message">{rutError}</div>} */}
             {/* Ahora lo maneja las props del FieldWrapper en FormikError */}
        </div>
      );
}

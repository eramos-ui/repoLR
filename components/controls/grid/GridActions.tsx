"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomButton } from "../CustomButton";
import { faEdit,  faTrash, faMagnifyingGlassChart, faHome, faFilePdf, faFileCircleExclamation } from "@fortawesome/free-solid-svg-icons";
// import { FaEdit, FaTrashAlt, FaRegFilePdf , FaXRay } from 'react-icons/fa';
type GridActionsProps<T> = {
    row: T;
    actions: ("edit" | "delete" | "add" | "zoom" | "zoom-file")[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onZoom?: (row: T) => void;
    tooltips?: string[];
    positions?: ("left" | "right" | "top" | "bottom")[]; 
    labelButtomActions?: string[];
  };
  /*
  Este componente es similar FormGridActions pero NO se usa con Form dinámico
  */
  export const GridActions = <T,>({ row, actions, onEdit, onDelete, onZoom,
     tooltips = [], positions = [], labelButtomActions=[] }: GridActionsProps<T>) => {
      // console.log('en GridActions',row);
      return(
        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
          {actions.includes("edit") && (
            <CustomButton
              label={ labelButtomActions[1] }
              onClick={() => onEdit?.(row)}
              buttonStyle="secondary"
              size="small"
              theme="light"
              icon={<FontAwesomeIcon icon={faEdit} />}
              iconPosition= {"left" }    
              style={{ color: "green", backgroundColor:"white"  }} 
              tooltipContent={tooltips[1] || "Modificar"}
              tooltipPosition={positions[1] || "top"} // Verificación de fallback
            />
          )}
          {actions.includes("delete") && (
            <CustomButton
              label={ labelButtomActions[2] }
              onClick={() => onDelete?.(row)}
              buttonStyle="secondary"
              size="small"
              theme="light"
              icon={<FontAwesomeIcon icon={faTrash} />}
              iconPosition= {"left" }  
              style={{ color: "red", backgroundColor:"white" }}  
              tooltipContent={tooltips[2] || "Eliminar"}
              tooltipPosition={positions[2] || "top"} // Verificación de fallback
            />
          )}
            {actions.includes("zoom-file") && (              
            <CustomButton
              label={ labelButtomActions[3] }
              onClick={() => onZoom?.(row)}
              buttonStyle="secondary"
              size="small"
              theme="light"
              icon={<FontAwesomeIcon icon={faFileCircleExclamation} />}
              iconPosition= {"left" }  
              style={{ color: "grey", backgroundColor:"white" }}  
              tooltipContent={tooltips[3] || "Detalle"}
              tooltipPosition={positions[3] || "top"} // Verificación de fallback
            />
          )}
          {actions.includes("zoom") && (
              
            <CustomButton
              label={ labelButtomActions[3] }
              onClick={() => onZoom?.(row)}
              buttonStyle="secondary"
              size="small"
              theme="light"
              icon={<FontAwesomeIcon icon={faMagnifyingGlassChart} />}
              iconPosition= {"left" }  
              style={{ color: "green", backgroundColor:"white" }}  
              tooltipContent={tooltips[3] || "Detalle"}
              tooltipPosition={positions[3] || "top"} // Verificación de fallback
            />
          )}
        </div>
  )
};
  
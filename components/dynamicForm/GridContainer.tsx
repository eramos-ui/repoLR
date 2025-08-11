import React, { useEffect, useMemo, useState } from 'react';
import FormGridHeader from './FormGridHeader';

import GridRowComponent from './GridRowComponent';
import { FormConfigDFType, FormFieldDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';
import { TitleOverGridAndAddButton } from './TitleOverGridAndAddButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomButton } from "../controls/CustomButton";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface GridContainerProps {
  columns: GridColumnDFType[];
  // rows: GridRowDFType[];
  rows: GridRowDFType[] | { items: GridRowDFType[] } | undefined | null; // ⭐ aceptar ambas formas
  rowToShow?: number;
  actions: ('add' | 'edit' | 'delete' | 'zoom')[];
  actionsTooltips?:{action:string,tooltips:string}[];
  onEdit: (index: number, editFormConfig?: FormConfigDFType) => void; // Pasamos el editFormConfig aquí
  onDelete: (index: number) => void;
  onZoom: (row:any) => void;
  columnWidths?: string[];
  editFormConfig?: FormConfigDFType; // Agregar editFormConfig como prop
  label: string; //para los tooltips
  objectGrid?:string;//para el tooltips de los botones de actions
  handleAdd:() => void;//botón de agregar
  table:FormFieldDFType;
  // currentPage?: number;
}

const GridContainer: React.FC<GridContainerProps> = ({ columns, rows, rowToShow=5, actions, actionsTooltips,onEdit, 
    onDelete, onZoom, columnWidths, editFormConfig, label, objectGrid, handleAdd, table }) => {
    const [ page, setPage ]     = useState(0);
    // console.log('en GridContainer actions', actions)
    // ⭐ Normalizar rows -> siempre un array
    const rowsArray: GridRowDFType[] = useMemo(() => {
      if (Array.isArray(rows)) return rows;
      if (rows && Array.isArray((rows as any).items)) return (rows as any).items;
      return [];
    }, [rows]);

    // ⭐ Evitar división por 0 / valores negativos
    const pageSize = Math.max(1, Number(rowToShow) || 1);

    const totalPages = Math.ceil(rowsArray.length / rowToShow);
    const start = page * rowToShow;
    const end = start + rowToShow;

    // ⭐ Derivar visibleRows siempre como slice de un array
    const visibleRows = rowsArray.slice(start, end);

    // ⭐ Clamp de página cuando cambian los datos (sin setState en render)
    useEffect(() => {
      setPage((prev) => {
        const maxPage = Math.max(0, totalPages - 1);
        return Math.min(prev, maxPage);
      });
    }, [totalPages]);
    
    const handlePrev = () => {
      if (page > 0) setPage((prev) => prev - 1);
    };
  
    const handleNext = () => {
      if (page < totalPages - 1) setPage((prev) => prev + 1);
    };
    return (
     <>
      <TitleOverGridAndAddButton table={table} actions={actions} handleAdd={handleAdd} />
      <table className="min-w-full border-collapse">
        <FormGridHeader 
        columns={columns} columnWidths={columnWidths} actions={actions} label={label} 
        />
        <tbody>
        {visibleRows.map((row: GridRowDFType, rowIndex: number) => {
          return (
            <GridRowComponent
              key={start + rowIndex}
              row={row}
              columns={columns}
              columnWidths={columnWidths}
              actions={actions}
              actionsTooltips ={actionsTooltips}
              onEdit={() => onEdit(start + rowIndex, editFormConfig)}
              onDelete={() => onDelete(start + rowIndex)}
              onZoom={() => onZoom(row)}
              label={label}
              objectGrid={objectGrid}
            />
          )
        })}
        </tbody>
      </table> 
      <div className="flex justify-between items-center mt-2 px-4 text-sm text-gray-600">
        <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Anterior"
                  onClick={handlePrev}
                  disabled={page === 0}
                  icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />} iconPosition='left'
        />
        <span>
          Página {page + 1} de {totalPages}
        </span>
        <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Siguiente"
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />} iconPosition='right'
              />
      </div>
     </> 
  );
};

export default GridContainer;

import React from 'react';
import { GridColumnType, GridRowType, FormConfigType } from '@/types/interfaces';
import GridRowComponent from '@/components/dynamicForm/GridRowComponent';
//import { GridHeader } from './GridHeader';
//import FormGridHeader from '@/components/formComponents/FormGridHeader';
// import GridRowComponent from '@/components/formComponents/GridRowComponent';
import FormGridHeader from '@/components/dynamicForm/FormGridHeader';
import { GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';

interface GridContainerProps {
  columns: GridColumnDFType[];
  rows: GridRowDFType[];
  actions: ('add' | 'edit' | 'delete')[];
  onEdit: (index: number, editFormConfig?: FormConfigType) => void; // Pasamos el editFormConfig aquí
  onDelete: (index: number) => void;
  onZoom: (index: number) => void;
  columnWidths?: string[];
  editFormConfig?: FormConfigType; // Agregar editFormConfig como prop
  label: string; //para los tooltips
  objectGrid?:string;//para el tooltips de los botones de actions
}

const GridContainer: React.FC<GridContainerProps> = ({ columns, rows, actions, onEdit,onZoom, 
    onDelete, columnWidths, editFormConfig, label, objectGrid }) => {
    //console.log('en GridContainer rows ***************',rows)
    return (
    <table className="min-w-full border-collapse">
      <FormGridHeader
      columns={columns} columnWidths={columnWidths} actions={actions} label={label} 
      />
      <tbody>
        {rows.map((row: GridRowDFType, rowIndex: number) => (// string | number | boolean | Date | null | File | undefined
          <GridRowComponent
            key={rowIndex}
            row={row}
            columns={columns}
            columnWidths={columnWidths}
            actions={actions}
            onEdit={() => onEdit(rowIndex, editFormConfig)} // Pasamos el editFormConfig en el evento de edición
            onDelete={() => onDelete(rowIndex)}
            onZoom={() => onZoom(rowIndex)}
            label={label}
            objectGrid={objectGrid}//para el tooltips de los botones de actions
          />
        ))}
      </tbody>
    </table>
  );
};

export default GridContainer;

//import { GridColumnType, GridRowType } from '@/types/interfaces';
import { formatRut } from '@/utils/formatRut';
import { formatMoney } from '@/utils/formatMoney';
import {formatSIN}  from '@/utils/formatSIN';
import FormGridActions from './FormGridActions';
import { GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';


interface GridRowProps {
  row: GridRowDFType;
  columns: GridColumnDFType[];
  columnWidths?: string[];
  onEdit: () => void;
  onDelete: () => void;
  onZoom: () => void;
  label:string;
  objectGrid?:string;//para el tooltips de los botones de actions
  actions: ('add' | 'edit' | 'delete' | 'zoom')[];
  actionsTooltips?:{action:string,tooltips:string}[];
}

const GridRowComponent: React.FC<GridRowProps> = ({ row, columns , actions, actionsTooltips, objectGrid, columnWidths = [], onEdit, onDelete, onZoom, label }) => {
   //console.log('en GridRowComponent actionsTooltips', actionsTooltips )
  // if (row.nroGasto === '602') console.log('en GridRowComponent row', row )
  const renderCellValue = (column: GridColumnDFType, value: any) => {
    //if (row.nroGasto === '602') console.log('en GridRowComponent column', column,value )
    switch (column.typeColumn?.toLowerCase()) {
      case 'rut':
        return formatRut(value as string); // Formatea el RUT
      case 'sin': 
        return formatSIN(value as string); // Formatea el SIN
      case 'money':
        return formatMoney(value as number); // Formatea valores monetarios
      case 'number':
        //if (row.name === 'nrodocumento')console.log('en GridRowComponent number value', value)
        return value?.toString(); // Convierte un número a string si es necesario
      case 'boolean':
        return value ? 'Sí' : 'No'; // Manejo de valores booleanos
      case 'date':
        //console.log('en GridRowComponent date value', value)
        return new Date(value as string).toLocaleDateString(); // Manejo de fechas
       case 'string':
        //if (row.name === 'fecDocumento') console.log('en GridRowComponent string value****', value)
        return value;
      default:
        return value; // Valor por defecto si no hay coincidencia con los tipos
    }
  };
  return (
    <tr className="border-t" style={{ height: '40px' }}>
      {columns?.map((column: GridColumnDFType, colIndex: number) => 
        column.visible ? (
          <td
            key={colIndex}
            className="px-4 py-2 whitespace-nowrap"
            style={{ width: columnWidths ? columnWidths[colIndex] : 'auto', textAlign: column.textAlign }}
          >
          {/* {  console.log('en GridRowComponent column.name', column.name,column.typeColumn,row[column.name])} */}
          {renderCellValue(column, row[column.name])
          }
          </td>
        ) : null
      )}
      <td>
         <FormGridActions onEdit={onEdit} onDelete={onDelete} onZoom={onZoom} label={label} objectGrid={objectGrid} actions={actions} actionsTooltips={actionsTooltips}/>
      </td>
    </tr>
  );
};

export default GridRowComponent;

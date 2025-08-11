"use client";
import { useState, useRef, useEffect } from 'react';
import { FormikHelpers, useFormikContext } from 'formik';
import { useSession } from 'next-auth/react';
//import { FormConfigType, FormValues, FormFieldType, GridColumnType ,GridRowType } from '@/types/interfaces';

// import { EditForm } from './EditForm';

import { useLabels } from '@/hooks/ohers/useLabels';

// import {  FaPlus } from 'react-icons/fa';
// import GridContainer from './GridContainer';
import { CustomAlert } from '@/components/controls';
import { FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';



interface Props {
  field: FormFieldDFType;  // Usamos FormField en lugar de definir cada propiedad por separado
}
interface Props {
  titleGrid: string;
  labelGridAdd:string;
  label: string;  name: string;  
  columns: GridColumnDFType[];  
  rows: GridRowDFType[];  actions: ('add' | 'edit' | 'delete')[];
  columnWidths?: string[];  rowHeight?: string; // Altura de las filas
  gridWidth?: string;  className?: string;  borderColor?: string;  borderWidth?: string;  padding?: string;
  marginBottom?: string;  
  editFormConfig?: FormConfigDFType;  
  fields: FormFieldDFType[];
  theme?: 'light' | 'dark';  
  objectGrid?:string;//para el tooltips de los botones de actions
  spFetchRows?:string;
  spFetchSaveGrid?:string;
  allValues: any;//datos de todos los campos por si lo requiere un fetch como param
  globalStyles?: {
    light?: React.CSSProperties;
    dark?: React.CSSProperties;
  };
  width:string; 
 
  setRows: (rows:FormValuesDFType[]) => void;
}
//******NO SE USA*****
export const FormGrid: React.FC<Props> = ({  label, titleGrid, labelGridAdd, objectGrid,
  spFetchRows, spFetchSaveGrid, allValues, name,  columns,  rows,setRows, actions,  columnWidths = [], //Aseguramos que siempre sea un array
  editFormConfig,  fields,rowHeight = '40px',  gridWidth = '100%',  borderColor = 'border-gray-300', // Clase predeterminada de Tailwind para el color del borde
  borderWidth = 'border', // Clase predeterminada de Tailwind para el ancho del borde
  padding = 'p-4', // Clase predeterminada de Tailwind para el padding
  marginBottom = 'mb-4', // Clase predeterminada de Tailwind para el margen inferior
  ...props
}) => { 
    //const editFormConfig=props.editFormConfig;//si es grid editFormConfig está bajo fields de la grilla en formData
  const { data: session, status }               = useSession();//aquí están los datos del user si lo requiere el fetch
  const { setFieldValue }                       = useFormikContext<{ [key: string]: GridRowDFType[] }>();
  const [ gridRows, setGridRows ]               = useState<GridRowDFType[]>(rows || []);
  const [ isModalOpen, setIsModalOpen ]         = useState(false);
  const [ editingRowIndex, setEditingRowIndex ] = useState<number | null>(null);
  const [ isAdding, setIsAdding]                = useState(false);
  const { labels, error }                       = useLabels();
  const [ isAlertOpen, setIsAlertOpen ]         = useState(false);
  const [ nameAlert, setNameAlert ]             = useState('');
  const [ loading, setLoading ]                 = useState((spFetchRows)?true:false);

  const themeStyles = session?.theme === 'dark' 
     ? props.globalStyles?.dark 
     : props.globalStyles?.light;    
  const reLoad=() =>{//al cerrar el modal carga la pagina de nuevo
         window.location.reload();
  }
  useEffect(() => {
    const fetchRows = async (spFetch:string) => {//función que trae los datos
      setLoading(true);
      try {        
        const [spName, params] = spFetch.split('(');// Extraemos el nombre del SP y los parámetros de la cadena spFetchOptions
        //console.log('spName, params',spName, params);
        if (!params || params.trim() === ')') { // Si no hay parámetros, simplemente ejecutamos el SP
          const response = await fetch('/api/execSP', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storedProcedure: spName,
              parameters: {},
            }),
          });
          if (response.ok) {
            const data = await response.json();
            // console.log('en Mygrid data', data);
            setGridRows(data)
          } else {
            console.error('Error al obtener las opciones');
          }
          setLoading(false);
          return;
        }       
        const parameterNames = params.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));  // Manejar el caso donde hay parámetros
        const combinedValues = { // Combinar valores de allValues y sesión
          ...allValues, // Valores provenientes de los campos del formulario
          userId: session?.user?.id, // Incluyendo el id del usuario desde la sesión
          email: session?.user?.email, // Puedes incluir otros campos de la sesión si lo necesitas
        };        
        //const missingParams = parameterNames.filter((paramName) => !combinedValues[paramName]); // Verificar si todos los parámetros necesarios tienen valor
        // Si hay parámetros que no tienen valor, no ejecutar el fetch (esto mejor desecharlo xq tb se debe actualizar si no hay  nada en el select padre)
        // if (missingParams.length > 0) {
        //   console.log(`Faltan parámetros para ejecutar el SP: ${missingParams.join(', ')}`);
        //   setLoading(false);
        //   return;
        // }
        const parameters = parameterNames.reduce((acc, paramName) => { // Crear un objeto con los valores de los parámetros usando sus nombres reales
          acc[`@${paramName}`] = combinedValues[paramName];
          return acc;
        }, {} as Record<string, any>);
        // Realizar la solicitud a la API
        const response = await fetch('/api/execSP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storedProcedure: spName,
            parameters,
          }),
        });       
        if (response.ok) {
          const data = await response.json();
          setGridRows(data)
        } else {
          console.error('Error al obtener las opciones');
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoading(false);
      }
     };
    if (!spFetchRows) return;
     fetchRows(spFetchRows);
  }, [spFetchRows, allValues, session]);
  const handleAdd = () => {
    setEditingRowIndex(null);
    setIsModalOpen(true);
    setIsAdding(true);
  };
  const handleEdit = (index: number) => {
    setEditingRowIndex(index);
    setIsModalOpen(true);
    setIsAdding(false);
  };
  const handleDelete = (index: number) => {
     const updateData = async () => {
       try {
        const response = await fetch('/api/fetchSave', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storedProcedure: spFetchSaveGrid, // Nombre del stored procedure
            parameters: {action:'delete',userModification:session?.user.id,...gridRows[index]}, // Datos del row a eliminar + action='delete' y el userId
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Data deleted successfully:', result);
        } else {
          console.error('Error deleted data:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleted data:', error);
      }
    };
    updateData();
    window.location.reload();//recarga la página
    // newRows.splice(index, 1);
    // setGridRows(newRows);
    // setFieldValue(name, newRows);
  };
  const isUniqueValue = (newRow: GridRowDFType, key: string): boolean => {//gridRows son las filas que hay en la grilla y newRow es la que se agrega
       return !gridRows.some((row, idx) => idx !== editingRowIndex && row[key] === newRow[key]);
     };
     /* sacado al hacer el build
  const handleFormSubmit = (values: FormValuesDFType, { setSubmitting }: FormikHelpers<FormValuesDFType>) => {//values son los de la fila que se edita o agrega
    const newRow: GridRowDFType = {}; //para mapear los valores del formulario a una fila
    const typeValues= ['number','string','rut','sin','money'];
    //const typeValues=['string','number'];
    console.log('en FormGrid handleFormSubmit isAdding',isAdding);
    if (isAdding) {   
      for (const column of columns) {//convierte los datos del formulario values en newRow (de la grilla) 
        const value = values[column.name.toLowerCase()];
        const includedSome = typeValues.some(valor => column.typeColumn?.includes(valor));
        const columnName=column.name.toLowerCase();
        if (value !== undefined && includedSome   ) {
          if (!(value instanceof File)){
            newRow[columnName] =value;        
          }else if (value instanceof File) {// Si el valor es un archivo (File), manejamos el archivo aquí (por ejemplo, subiéndolo o ignorándolo)
            newRow[columnName] = value.name;           // Podrías optar por almacenar solo el nombre del archivo en `newRow`, por ejemplo:
          } else {
            newRow[columnName] ='';//si el caso de agregar row idRow es undefined
          }
        }
      }
      for (const column of columns) {//const includedSome = typeValues.some(valor => column.typeColumn?.includes(valor));
        //const columnName=column.name.toLowerCase();   
        if (column.unique && !isUniqueValue(newRow, column.name.toLowerCase())) {//en el atributo unique indica si debe ser único
             setNameAlert(column.name);//columna con repetido    
             setIsAlertOpen(true);//que desplieque el CustomAlert
             return; // No continuar si se encuentra un valor duplicado
           }
      }
      const newRows = [...gridRows, values as GridRowDFType];
      setGridRows(newRows);
      console.log('en FormGrid handleFormSubmit newRows',newRows);
      setFieldValue(name, newRows);
    } else if (editingRowIndex !== null) {
      const newRows = [...gridRows];
      newRows[editingRowIndex] = values as GridRowDFType;
      setGridRows(newRows);
      setFieldValue(name, newRows);
      setEditingRowIndex(null);
    }
    setIsModalOpen(false);
    setSubmitting(false);
  }; 
  */
  if (isAlertOpen){
    const messageAlert=`${labels?.grid.errorMsgDuplicate}`
     return (
     <CustomAlert  onClose={() => {setIsAlertOpen(false);setNameAlert(''); } }
        message={<span> <strong>{nameAlert}</strong>{messageAlert}</span>}
      />
    )}
    if (loading) {
     return <div> Cargando...</div>
    }
  return (
    <>
      {/* <div className={`rounded-lg ${padding} ${marginBottom} ${borderColor} ${borderWidth}`} 
               style={{ 
                width: gridWidth,
                backgroundColor: themeStyles?.backgroundColor,
                color: themeStyles?.color
              }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">
            { titleGrid }
          </span>
          {actions?.includes('add') && (
            <button type="button"  onClick={handleAdd}
              className="flex items-center px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 ml-5"
            >
              <FaPlus className="mr-2" /> 
             {labelGridAdd}
            </button>
          )}
        </div>
        <GridContainer  columns={columns} rows={gridRows} actions={actions} columnWidths={columnWidths} onEdit={handleEdit}  
          onDelete={handleDelete}  editFormConfig={editFormConfig} // Pasamos el editFormConfig a GridContainer
          label={label} //requerido para los tooltips de la Actions
          objectGrid={objectGrid}//para el tooltips de los botones de actions
        />
        {isModalOpen && editFormConfig && (
        <EditForm isOpen={isModalOpen} onClose={() => reLoad()  } theme={props.theme} onSubmit={handleFormSubmit} 
          row={editingRowIndex !== null ? gridRows[editingRowIndex] : {}} 
          requirePassword={props.field.requirePassword} formConfig={editFormConfig} // Pasa el editFormConfig al componente de edición
          spFetchSaveGrid={spFetchSaveGrid} isAdding={isAdding} fields={fields} rows={rows} setRows={setRows} columns={columns}
        />
      )} 
      </div> */}
    </>
  );  
}  
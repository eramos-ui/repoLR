
// "use client";
// import { useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { FormikHelpers, useFormikContext} from 'formik';
// import { FaPlus } from 'react-icons/fa';
// import {  FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';
// import GridContainer from './GridContainer';
// import { EditForm } from './EditForm'; 



// interface FormRowProps {
//   fields: FormFieldDFType[];
//   rows:GridRowDFType[];
//   table:FormFieldDFType;
//   setFieldValue: (field: string, value: any) => void;  
//   theme:string;
//   allValues?:any;
//   maxWidth?:string;
//   width?:string;
// }
// //renderiza la grilla de la tabla que administra el Dynamic Form y habilita el modal de edición
// export const FormTableGrid: React.FC<FormRowProps> = 
//   ({ table, fields, rows, width, theme}) => {  
//   const { data: session, status }               = useSession();//aquí están los datos del user si lo requiere el fetch
//   const [ allValues, setAllValues ]             = useState<any>(rows);
//   const [ isModalOpen, setIsModalOpen ]         = useState(false);
//   const [ editingRowIndex, setEditingRowIndex ] = useState<number | null>(null);
//   const [ isAdding, setIsAdding]                = useState(false);
//   const [ isAlertOpen, setIsAlertOpen ]         = useState(false);
//   const [ nameAlert, setNameAlert ]             = useState('');
//   const [ gridRows, setGridRows ]               = useState<GridRowDFType[]>(rows || []);
//   const { values, setFieldValue }               = useFormikContext<{ [key: string]: GridRowDFType[] }>();
//   // console.log('en FormRow values',values);
//   // console.log('en FormTableGrid fields',fields);
//   // console.log('en FormTableGrid table',table);
//   const columns:GridColumnDFType[]=table.columns || [];
//   const actions: ('add' | 'edit' | 'delete')[]=table.actions || [];
//   const columnWidths: string[]=table.columnWidths || [];
  
//   const label: string=table.label || '';
//   const objectGrid: string=table.objectGrid || '';
//   const editFormConfig: FormConfigDFType=table.editFormConfig as FormConfigDFType;
//   const apiSaveForm: string=table.apiSaveForm || '';

//   // console.log('en FormTableGrid columnsWithKey',columns);//soporta sólo el alemento tyep==='grid
//   let newFields=fields.map( field =>{ //revisa si hay select con nested values, x ahora sólo acepta 1
//     if (field.spFetchOptions?.includes('@')) {
//         const fieldNested=field.spFetchOptions.split ('@')[1].split(')')[0];//soporta sólo 1 parámetro
//         const fieldNestedValue=allValues[fieldNested];
//         //console.log('en FormRow fieldNestedValue',fieldNestedValue);
//         return {...field, dependentValue:fieldNestedValue, name:field.label} 
//       }
//       return field;           
//   });
//   if(fields && fields.length >1 ){//cuando es grilla viene un sólo fields y no requiere agregar el values
//     newFields=newFields.map((ff:any)=>{
//       if (ff.type=== 'grid') return;
//         //console.log('det',ff,allValues[ff.name]);
//         return {...ff, value:allValues[ff.name]};  
//     })
//   }
//   //  console.log('FormRow newFields',newFields);
//   // const [ dependentValues, setDependentValues ] =useState<any>(2);
//   // const groupedFields = newFields.reduce((acc, field, width) => {
//   //   if (!acc[field.row]) {
//   //     acc[field.row] = [];
//   //   }
//   //   acc[field.row].push(field);
//   //   return acc;
//   // }, {} as { [key: number]: FormFieldDFType[] });
//   const reLoad=() =>{//al cerrar el modal carga la pagina de nuevo
//     window.location.reload();
//   }
//   // const handleDelete=()=>{
//   //   console.log('handleDelete');
//   // }
//   // const handleEdit=()=>{
//   //   console.log('handleEdit');
//   // }
//   // const handleAdd=()=>{
//   //   console.log('handleAdd');
//   // }
//   const isUniqueValue = (newRow: GridRowDFType, key: string): boolean => {//gridRows son las filas que hay en la grilla y newRow es la que se agrega
//     return !rows.some((row, idx) => idx !== editingRowIndex && row[key] === newRow[key]);
//   };
//   const handleAdd = () => {
//     setEditingRowIndex(null);
//     setIsModalOpen(true);
//     setIsAdding(true);
//   };
//   /* sacado al hacer el build
//   const handleFormAdd = (values: FormValuesDFType, { setSubmitting }: FormikHelpers<FormValuesDFType>) => {//values son los de la fila que se edita o agrega
//     const newRow: GridRowDFType = {}; //para mapear los valores del formulario a una fila
//     const typeValues= ['number','string','rut','sin','boolean','money'];
//     if (isAdding) {   
//       console.log('en FormTableGrid handleFormAdd isAdding',isAdding);
//       for (const column of columns) {//convierte los datos del formulario values en newRow (de la grilla) 
//         const value = values[column.name.toLowerCase()];
//         const includedSome = typeValues.some(valor => column.typeColumn?.includes(valor));
//         const columnName=column.name.toLowerCase();
//         if (value !== undefined && includedSome   ) {
//           if (!(value instanceof File)){
//             newRow[columnName] =value;        
//           }else if (value instanceof File) {// Si el valor es un archivo (File), manejamos el archivo aquí (por ejemplo, subiéndolo o ignorándolo)
//             newRow[columnName] = value.name;  // Podrías optar por almacenar solo el nombre del archivo en `newRow`, por ejemplo:
//           } else {
//             newRow[columnName] ='';//si el caso de agregar row row es undefined
//           }
//         }
//       }
//       for (const column of columns) {//const includedSome = typeValues.some(valor => column.typeColumn?.includes(valor));
//         //const columnName=column.name.toLowerCase();   
//         if (column.unique && !isUniqueValue(newRow, column.name.toLowerCase())) {//en el atributo unique indica si debe ser único
//              setNameAlert(column.name);//columna con repetido    
//              setIsAlertOpen(true);//que desplieque el CustomAlert
//              return; // No continuar si se encuentra un valor duplicado
//            }
//       }
//       const newRows = [...rows, values as GridRowDFType];
//       setGridRows(newRows);
//       //setFieldValue(name, newRows);
//     } else if (editingRowIndex !== null) {
//       console.log('en FormTableGrid editingRowIndex',editingRowIndex,rows);
//       const newRows = [...rows];
//       newRows[editingRowIndex] = values as GridRowDFType;
//       setGridRows(newRows);
//       //setFieldValue(name, newRows);
//       setEditingRowIndex(null);
//     }
//     setIsModalOpen(false);
//     setSubmitting(false);
//   };
//   */ 
//   const handleEdit = (index: number) => {
//     setEditingRowIndex(index);
//     setIsModalOpen(true);
//     setIsAdding(false);
//   };
//   console.log('en FormTableGrid FALTA EL DELETE');
//   const handleDelete = (index: number) => {
//      const updateData = async () => {
//        try {
//         const response = await fetch('/api/fetchSave', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             storedProcedure: spFetchSaveGrid, // Nombre del stored procedure
//             parameters: {action:'delete',userModification:session?.user.id,...rows[index]}, // Datos del row a eliminar + action='delete' y el userId
//           }),
//         });

//         if (response.ok) {
//           const result = await response.json();
//           console.log('Data deleted successfully:', result);
//         } else {
//           console.error('Error deleted data:', response.statusText);
//         }
//       } catch (error) {
//         console.error('Error deleted data:', error);
//       }
//     };
//     updateData();
//     window.location.reload();//recarga la página
//     // newRows.splice(index, 1);
//     // setGridRows(newRows);
//     // setFieldValue(name, newRows);
//   };
//   //if (editingRowIndex) console.log('en FormTableGrid rows',rows,editingRowIndex);
//   return (
//       <div 
//           className={`rounded-lg ${table.padding} ${table.marginBottom} ${table.borderColor} ${table.borderWidth}`} 
//               style={{ 
//               width: table.gridWidth,      //backgroundColor: themeStyles?.backgroundColor,  // color: themeStyles?.color
//           }}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-lg font-bold">
//             { table.titleGrid }         
//           </span>
//           {actions?.includes('add') && (
//             <button type="button"  onClick={handleAdd}
//               className="flex items-center px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 ml-5"
//             >
//               <FaPlus className="mr-2" /> 
//              {table.labelGridAdd}
//             </button>
//           )}
//         </div>
//         <GridContainer  columns={columns} rows={values.items} actions={actions} columnWidths={columnWidths} onEdit={handleEdit}  
//           table={table} handleAdd={handleAdd} onDelete={handleDelete}  editFormConfig={table.editFormConfig} // Pasamos el editFormConfig a GridContainer
//           label={label} //requerido para los tooltips de la Actions
//           objectGrid={objectGrid}//para el tooltips de los botones de actions
//         />
//         {isModalOpen && editFormConfig && table.columns && (
//         <EditForm isOpen={isModalOpen} onClose={() => reLoad()  } theme={editFormConfig.theme} // onSubmit={handleFormAdd} 
//           row={editingRowIndex !== null ? values.items[editingRowIndex] : {}} columns={table.columns}
//           // requirePassword={editField.requirePassword} 
//           formConfig={editFormConfig} // Pasa el editFormConfig al componente de edición
//           apiSaveForm={apiSaveForm} isAdding={isAdding} fields={fields} //rows={rows} //setRows={setAllValues }
//         />
//         )} 
//       </div>
//   );
// }

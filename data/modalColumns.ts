//objetos ocupados por DynamicForm
/* dependsOn?: { field: string; value: string | number | boolean };  es para definir si el campo es enabled ó disabled (DynamicForm). Por ejemplo:
              const isDisabled = col.dependsOn
                  ? values[col.dependsOn.field] == null || values[col.dependsOn.field] !== col.dependsOn.value
                  : false;
  En el caso de la descripciónn de la forma de techo o el nro de aagus sólo se habilita si el usuario selecciona "otro"
    dependsOn: { field: "formaTecho", value: "otro" }    
  Debr ir en el objeto columna y el                 
*/
/*
 dependencies?:{ field: string; valueMap: Record<string, any> }[];  es para asignar un valor a un campo dependiendo del valor de otro
 En el ejemoplo que sigue: el campo "nroAguas" se obtiene del array techoOptions.nroAguas y "descripcionFormaTecho" de techoOptions.label
 dependencies: [{ field: "nroAguas",valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.nroAguas])),},
        { field: "descripcionFormaTecho", valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.label])), }],}, 

*/
import { ColumnConfigType, GridRowType } from "@/types/interfaces";
import { optionsCeilingElementType, optionsFormularioType, optionsMaterialCielingType, optionsOrientationType, techoOptions } from "./selectType";
import {ColumnDynamicForm} from "@/components/general/DynamicForm";


  export const empalmeColumns: ColumnConfigType<GridRowType>[] = [
    { key: "nroEmpalme", label: "Empalme", captionPosition: "top", editable: false, type: "string", options: undefined, width: '70px', widthFormEdit:'120px',textAlign:"right", },
    { key: "proveedor", label: "Cliente", captionPosition: "top", editable: true, type: "string" , width: '80px', widthFormEdit:'200px',rowFormEdit:1,
      required:true, labelFormEdit:"Nombre cliente" 
    },
    { key: "capacidad", label: "KWH transf.", captionPosition: "top", editable: true, type: "number", width: '80px', widthFormEdit:'150px',rowFormEdit:1,
      required:true, labelFormEdit:"KWH transformador"
     },
    { key: "distancia", label: "Dist. en mtrs", captionPosition: "top", editable: true, type: "number", options: undefined, width: '80px',rowFormEdit:1, 
      widthFormEdit:'150px',labelFormEdit:"Distancia en mtrs",}, 
    { key: "distribuidora", label: "Distribuidora", captionPosition: "top", editable: true, type: "string", options: undefined, width: '90px',rowFormEdit:2, 
       widthFormEdit:'150px',labelFormEdit:"Distribuidora",},
    { key: "nroCliente", label: "Nr. cliente", captionPosition: "top", editable: true, type: "string", options: undefined, width: '70px',rowFormEdit:2, 
      required:true, widthFormEdit:'150px',labelFormEdit:"Nro de cliente",    },
    { key: "capacidadInyeccion", label: "MT inyecc.", captionPosition: "top", editable: true, type: "number", width: '80px',rowFormEdit:2,
      widthFormEdit:'170px',labelFormEdit:"Capacidad de inyección en KWH",   },
    { key: "rutCliente", label: "Copia RUT (pdf/jpg)", captionPosition: "top", editable: true, type:"string", inputType: "file", width: '130px',rowFormEdit:3,  
      widthFormEdit:'170px',labelFormEdit:"Rut cliente (pdf/jpg)",  
      renderCell: (row) => row.rutCliente instanceof File ? row.rutCliente.name : typeof row.rutCliente === 'string' ? row.rutCliente : 'No subido', },
    { key: "boleta", label: "Boleta (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:3,
      widthFormEdit:'170px',labelFormEdit:"Copia de Boleta (pdf/jpg)", 
      renderCell: (row) => row.boleta instanceof File ? row.boleta.name : typeof row.boleta === 'string' ? row.boleta : 'No subido', },
    { key: "poder", label: "Poder (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:3, widthFormEdit:'170px'
      ,labelFormEdit:"Poder dado por el cliente (pdf/jpg)",
      renderCell: (row) => row.poder instanceof File ? row.poder.name : typeof row.poder === 'string' ? row.poder : 'No subido', },
    { key: "diagrama", label: "Diagrama (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:4, 
         widthFormEdit:'170px',labelFormEdit:"Diagrama unilienal (pdf/jpg)",
        renderCell: (row) => row.diagrama instanceof File ? row.diagrama.name : typeof row.diagrama === 'string' ? row.diagrama : 'No subido', },
    { key: "otrasImagenes", label: "Otras img. (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '140px',rowFormEdit:4,
           widthFormEdit:'170px',labelFormEdit:"Agregar otra imagen (pdf/jpg)",
          renderCell: (row) => row.otrasImagenes instanceof File ? row.otrasImagenes.name : typeof row.otrasImagenes === 'string' ? row.otrasImagenes : 'No subido', },
    { key: "foto", label: "Foto (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '140px',rowFormEdit:4,
            widthFormEdit:'170px',labelFormEdit:"Foto del lugar (pdf/jpg)",
          renderCell: (row) => row.foto instanceof File ? row.foto.name : typeof row.foto === 'string' ? row.foto : 'No subido', },
    { key: "f2oF4", label: "Fx sube", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsFormularioType, 
      required:true, width: '70px',rowFormEdit:5, widthFormEdit:'190px',labelFormEdit:"Formulario a subir (F3/F4)",   },
    { key: "f2", label: "F2 ó F4 (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:5,
        widthFormEdit:'220px',labelFormEdit:"Formulario F2 ó F4 (pdf/jpg)",
      renderCell: (row) => row.f2 instanceof File ? row.f2.name : typeof row.f2 === 'string' ? row.f2 : 'No subido', },
    { key: "fechaF3", label: "Fecha F3", captionPosition: "top", editable: true, type: "string", inputType:"date", options: undefined, width: '80px',rowFormEdit:5, 
      dependsOn: { field: "f2oF4", value: "F2" }, labelFormEdit:"Fecha para solicitar F3", }, 
    ];

  export const empalmeColumnsDynamic: ColumnDynamicForm[] = empalmeColumns.map(col => ({
    field: String(col.key), // `key` se convierte en `field`
    headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
    editable: col.editable,
    inputType: col.inputType === "file" ? "file" : col.inputType || col.type, // Asegurar que `inputType` tenga un valor
    options: col.options || undefined, // Mantener `options`
    width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
    row: (col.rowFormEdit)?col.rowFormEdit:1,// Definir la fila a la que pertenece (puede ajustarse según necesidades)
    dependsOn:col.dependsOn,
    dependencies:col.dependencies,
    required: (col.required)?col.required:false,
  }));
  export const techoColumns: ColumnConfigType<GridRowType>[] = [
    { key: "nroInstalacion", label: "Nro Instalación", captionPosition: "top", editable: false, type: "string", options: undefined },
    { key: "nroAgua", label: "Nro Agua", captionPosition: "top", editable: false, type: "string", options: undefined },
    { key: "orientacion", label: "Orientación", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsOrientationType,
      required:true, widthFormEdit:'180px',rowFormEdit:1, },
    { key: "material", label: "Material del Techo", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsMaterialCielingType, 
      required:true, widthFormEdit:'180px',rowFormEdit:1, },
    { key: "area", label: "Área (m²)", captionPosition: "top", editable: true, type: "number", options: undefined , widthFormEdit:'120px',rowFormEdit:1,}, 
    { key: "pendiente", label: "Pendiente (grados)", captionPosition: "top", editable: true, type: "number", options: undefined, widthFormEdit:'120px',rowFormEdit:1, },
    { key: "otrosElementos", label: "Elementos en techo", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsCeilingElementType,
        widthFormEdit:'200px',rowFormEdit:2,},
    { key: "imagenTecho", label: "Imagen agua (pdf/jpg)", captionPosition: "top", editable: true, type:"string", inputType: "file", width: '250px',rowFormEdit:2,  },
  ];

  export const techoColumnsDynamic: ColumnDynamicForm[] = techoColumns.map(col => ({
    field: String(col.key), // `key` se convierte en `field`
    headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
    editable: col.editable,
    inputType: col.inputType || col.type, // Asegurar que `inputType` tenga un valor
    options: col.options || undefined, // Mantener `options`
    multiple:(col.key ==='otrosElementos')? true : false,
    width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
    row: (col.rowFormEdit)?col.rowFormEdit:1, // Definir la fila a la que pertenece (puede ajustarse según necesidades)  
    required: (col.required)?col.required:false, 
  }));  
export const instalacionesColumns: ColumnConfigType<GridRowType>[] = [
  { key: "nroInstalacion", label: "Nro. instalación", captionPosition: "top", editable: false, type: "string", options: undefined, textAlign:"right", },
  { key: "descripcionInstalacion", label: "Descripción edificio", captionPosition: "top", editable: true, type: "string",inputType:"string",required:true,
    labelFormEdit:"Descripción instalación/edificio", widthFormEdit:'300px',rowFormEdit:1, },
  { key: "formaTecho", label: "Forma del techo", captionPosition: "top", editable: true, type: "string",inputType:"selectIcon", visible:false,
    required:true, options: techoOptions , widthFormEdit:'120px',rowFormEdit:2,  
      dependencies: [{ field: "nroAguas",valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.nroAguas])),},
                     { field: "descripcionFormaTecho", valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.label])), }],}, 
  { key: "nroAguas", label: "Nro. de aguas", captionPosition: "top", editable: true, type: "number", required:true,  textAlign:"right",
      widthFormEdit:'100px',rowFormEdit:3,  dependsOn: { field: "formaTecho", value: "otro" }, },
  { key: "descripcionFormaTecho", label: "Descripción Forma techo", captionPosition: "top",width:'200px', editable: true, type: "string", options: undefined,
    required:true, widthFormEdit:'300px',rowFormEdit:3,  dependsOn: { field: "formaTecho", value: "otro" }, },
  { key: "memoriaCalculo", label: "Memoria cálculo (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '180px',rowFormEdit:3,
    labelFormEdit:"Agregar pdf/jpg memoria de cálculo",},
  { key: "alturaTecho", label: "Altura techo (mtrs)", captionPosition: "top", editable: true, type: "number", required:true,
      widthFormEdit:'100px',rowFormEdit:4,  },
];
export const instalacionesColumnsDynamic: ColumnDynamicForm[] = instalacionesColumns.map(col => ({
  field: String(col.key), // `key` se convierte en `field`
  headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
  editable: col.editable,
  inputType: col.inputType === "file" ? "file" : col.inputType || col.type, // Asegurar que `inputType` tenga un valor
  options: col.options || undefined, // Mantener `options`
  width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
  row: (col.rowFormEdit)?col.rowFormEdit:2,// Definir la fila a la que pertenece (puede ajustarse según necesidades)
  dependsOn:col.dependsOn,
  dependencies:col.dependencies,
  required: (col.required)?col.required:false,
}));

export const toDoColumns: ColumnConfigType<GridRowType>[] = [
  { key: "infoToDo", label: "Descripción de la tarea", captionPosition: "top", editable: false,width:'900px', type: "string", options: undefined },
  { key: "idTask", label: "idTask", captionPosition: "top", editable: false, visible: false,  type: "number", width:'75px', options: undefined },
  { key: "ubicacionPanel", label: "Ubicacion panel", captionPosition: "top", editable: false, visible: false,  type: "string", width:'70px', options: undefined },
  { key: "usuarioCreador", label: "Usuario creador", captionPosition: "top", editable: false, visible: false,  type: "string", width:'70px', options: undefined },
  { key: "processName", label: "Proceso", captionPosition: "top", editable: false, type: "string", visible: false, options: undefined },
  { key: "nameActivity", label: "Actividad", captionPosition: "top", editable: false, type: "string" , visible: false, options: undefined },
  // { key: "idProcess", label: "Nro Proceso", captionPosition: "top", editable: false, type: "number", options: undefined },
  // { key: "idActivity", label: "Nro Actividad", captionPosition: "top", editable: false, type: "number", options: undefined },
  // { key: "taskAvailableDate", label: "Fecha disponilbe", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "idUserCreate", label: "Usuario creador", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "taskStatus", label: "Status", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "nameRol", label: "Rol", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "activityNumber", label: "Nro. actividad", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "tipoDocumento", label: "Tipo documento", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "nroDocumento", label: "Nro. documento", captionPosition: "top", editable: false, type: "number", options: undefined },
  
];

export const activityColumns: ColumnConfigType<GridRowType>[] = [
  { key: "numActividad", label: "Num.Actividad", captionPosition: "top", editable: false,width:'100px', type: "string",textAlign:'left', options: undefined },
  { key: "actividad", label: "Actividad", captionPosition: "top", editable: true, visible: true,  type: "string",textAlign:'left', width:'200px', options: undefined,
    widthFormEdit: '300px',rowFormEdit:1,labelFormEdit:'Descripción de la actividad',required: true,
   },
  { key: "fechaInicio", label: "Fecha inicio", captionPosition: "top", editable: true, visible: true,  type: "string",textAlign:'left', inputType: "date", width:'100px', options: undefined,
    widthFormEdit: '190px',rowFormEdit:2, labelFormEdit:'Fecha de inicio de la actividad',required: true,
   },
  { key: "fechaTermino", label: "Fecha término", captionPosition: "top", editable: true, visible: true,  type: "string", inputType: "date", width:'100px', options: undefined,
    widthFormEdit: '190px',rowFormEdit:2, labelFormEdit:'Fecha de término de la actividad',required: true, 
   },
  { key: "duracion", label: "Duración (días)", captionPosition: "top", editable: false, visible: true,  type: "number", width:'100px', options: undefined },
  { key: "presupuesto", label: "Presupuesto", captionPosition: "top", editable: true, visible: true,  type: "number", width:'100px', options: undefined ,
    widthFormEdit: '190px',rowFormEdit:3, labelFormEdit:'Presupuesto',required: true,
  },

];
export const activitiesColumnsDynamic:ColumnDynamicForm[] = activityColumns.map(col => ({
  field: String(col.key),
  editable: (col.key !== 'numActividad' && col.key !== 'duracion') ,
  width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
  headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label,
  inputType: col.inputType,
  captionPosition: col.captionPosition || "top",
  validationSchema: col.validationSchema || undefined,
  // row: (col.key === 'Actividad')? 1:(col.key !== 'Presupuesto')? 2:3 
  row: (col.rowFormEdit)?col.rowFormEdit:2,
  required: (col.required)?col.required:false,
}));




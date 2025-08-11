export interface UserData {
  _id: string;
  name: string;
  userModification: string;
  email: string;
  avatar?: string | null;
  theme?: 'light' | 'dark';
  password?: string;    
  aditionaldata?: [{contacto:string, email:string}]
  phone?:string;
  rut?:string;
  isValidate?:boolean;
  valid?:string;
  system?:string;
  roleswkf?:string[];
  createAt?:string;
  updateAt?:string;  
  state?:string;
  role?:string;
  roleperfil?:string;
  
}
// export interface UserData {
//     id: number;
//     name: string;
//     email: string;
//     avatar: string | null;
//     theme: 'light' | 'dark';  
//   }
export interface SubMenuItem {
  id: number;
  menuId: number;
  name: string;
  title: string;
  path?: string;
  formId?: number;
  icon: string;
  isValid: boolean;
  orden: number;
  perfiles: string[];
  system: string;
  idProcess: number;
  idActivity: number;
  processType: String;  //['from toDo' ,'init activity' ,'end activity','app','app-3','query' ]
  isAutomatic: boolean;
  nameActivity: string;
  isUserSpecific: boolean;
  origen?: 'task' | 'perfil'; 
  count?: number; 
}
  // export type SubMenuItem = {
  //   id: number;
  //   title: string;
  //   path: string;
  //   icon: string;
  //   form: string | null;
  //   processType: number | null;//1 si es wkf, 0 no
  //   idActivity:number | null; //idProcess*100+idActivity
  // };
  export interface MenuItem {
    id: number;
    system: string;
    name: string;
    title: string;
    path?: string;
    icon: string;
    menutype: string;
    isValid: boolean;
    orden: number;
    submenus: SubMenuItem[];
    processType: number;
  }
  // export type MenuItem = {
  //   id: number;
  //   title: string;
  //   path: string;
  //   icon: string;
  //   form: string | null;
  //   processType: number | null;
  //   subMenu?: SubMenuItem[];
  // };
  export type MenuConfig = {
    //position: 'left' | 'right';
    menuItems: MenuItem[];
  };  
  //configuración de los formularios
  import { FormikHelpers } from "formik";
  export type ValidationType = 'required' | 'maxLength' | 'minLength' | 'email' | 'minDate' | 'maxDate'
| 'min' |'max' |'url';
  export interface ValidationRule {
    type: ValidationType;
    value?: number ;
    message?:string;
  }  
  export type InputType = 'text' |'input' | 'email' | 'select' | 'password' | 'date' | 'checkbox' |'textarea' | 'readonly'
        | 'number' | 'file' | 'radio' | 'slider' | 'range' |'toggle' | 'grid' | 'multiselect'| 'autocomplete' | 'RUT' |'sin' | 'date';
  export interface FormFieldType { //los campos del formulario Dynamic
    type: InputType;
    name: string;
    label: string;
    autoComplete?:'on' |'off';
    placeholder?: string;
    visible?: boolean;
    value: string | number | boolean | undefined;
    row: number;
    width: string; 
    registroInicialSelect:string;//el registro que aparece en 1er lugar
    options?: { value: string | number; label: string }[];
    validations?: ValidationRule[];
    dependsOn?: string; // Nueva propiedad
    dependentOptions?: { [key: string]: { id: string | number; label: string }[] };
    format?: string;
    orientation?: 'horizontal' | 'vertical'; 
    min?: number; // Para el slider
    max?: number; // Para el slider
    step?: number; // Para el slider
    titleGrid?:string,
    labelGridAdd?: string;    
    spFetchRows?:string; //field con el sp que carga la tabla
    objectGrid?:string;//para el tooltips de agregar y eliminar
    columns?: GridColumnType[];// Para el grid
    rows?: GridRowType[]; // Para el grid
    actions?: ('add' | 'edit' | 'delete')[]; // Para el grid
    rowHeight?: string; // Altura de las filas
    columnWidths?: string[]; // Anchos de las columnas para el grid
    gridWidth?:string;//ancho total grilla 
    editFormConfig?: FormConfigType; // Para el formulario de edición
    className?: string;  // Para clases CSS personalizadas
    style?: React.CSSProperties;  // Para estilos en línea
    inputProps?: { [key: string]: any }; // Atributos HTML adicionales
    formatOptions?: { [key: string]: any }; // Opciones de formato adicionales
    conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
    dependentValue?:any;
    spFetchOptions?: string;
    spFetchSaveGrid?:string;
    requirePassword?:boolean; 
  }
  export interface FrameConfig {
    id: string;
    frameTitle: string;
    frameStyle: React.CSSProperties;
    fields: FormFieldType[];
  }
  export interface ButtonConfig {
    id: string;
    text: string;
    action: string;
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
    marginRight?: string;
  }
  export interface ModalStyles {
    overlay?: React.CSSProperties;
    content?: React.CSSProperties;
    header?: React.CSSProperties;
    modalTitleStyle?: React.CSSProperties; 
  } 
  export interface FormValues {
    [key: string]: string | number | boolean | File | undefined | null;
  }
  export interface FormConfigType { //del formulario dynamic
    formTitle: string;
    theme?: string;
    globalStyles?: {
      light?: React.CSSProperties;
      dark?: React.CSSProperties;
    };
    preferredTheme?:string;
    formSize?: {
      width?: string;
      maxWidth?: string;
    };
    buttons: ButtonConfig[];
    frames?: FrameConfig[];
    fields?: FormFieldType[];
    rows?:GridRowType[];
    modalStyles?: ModalStyles;
    editFormConfig?: {
      formTitle: string;
      requirePassword:boolean;
      modalStyles?: ModalStyles;
      fields: FormFieldType[];
    }; // Incluimos editFormConfig como opcional
  }
  export interface EditFormProps { // formulario dynamic
    formConfig: FormConfigType;
    isOpen: boolean;
    onClose: () => void;
    initialValues: FormValues;
    onSubmit: (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => void;
    isAdding?:boolean;
    spFetchSaveGrid?:string;
    theme?:string;
    requirePassword?:boolean;
    globalStyles?: {
      light?: React.CSSProperties;
      dark?: React.CSSProperties;
    };
    // style?: React.CSSProperties; // Para estilos en línea
    // inputProps?: { [key: string]: any }; // Atributos HTML adicionales
    // conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
  } 
  export type ColumnConfigType<T>= {// Tipo para configuración de las columnas de la grilla <T> es por genérico
    label: string; // Título de la columna
    key: keyof T; // Clave del dato en cada fila (debe existir en T)
    visible?: boolean; // Si la columna es visible
    type?: "string" | "number" | "Date"; // Tipo de dato de la columna
    textAlign?: "left" | "center" | "right"; // Alineación del texto
    width?: string; // Ancho de la columna (por ejemplo, "150px")
    widthFormEdit?:string;//el ancho en el modal
    rowFormEdit?:number;//la fila del modal
    labelFormEdit?:string; //label en el modal
    styles?: React.CSSProperties; // Estilos adicionales para la columna
    captionPosition: "left" | "top", 
    inputType?: string,
    options?: { value: string; label: string }[];// Opciones para selects
    validationSchema?: any;
    editable?:boolean,
    row?:number;
    dependsOn?: { field: string, value: string },
    dependencies?:{ field: string; valueMap: Record<string, any> }[];
    required?:boolean;      
    renderCell?: (row: T) => React.ReactNode;// ✅ Nueva propiedad para renderizado personalizado (como mostrar el nombre del archivo) cuando es file
    sortable?: boolean;
    hideOnSort?: boolean; /** Si es true, se oculta esta columna cuando hay un ordenamiento activo */
  };
  export interface OptionsSelect {
    value: string | number ;
    label: string ;
  } 
  export interface OptionSelectIcon{
     value: string; label: string; image: string , nroAguas?:number,
  }
  export interface Comunas {
    idComuna: number;
    idRegion: number;
    label:string;
    longitud?:string;
    latitud?:string;
  }
  export type ExcelColumn = {
    name: string;
    inputType: string;
    type: string;
  };
  export type ToDoList ={
    idProcess:number;
    idProcessInstance: number;
    idActivity: number;
    idTask: number;
    processName:string;
    nameActivity: string;
    TaskAvailableDate: Date;
    idUserCreate: string;
    taskStatus: string;
    specificUser: string;
    nameRol: string;
    activityNumber: string;
    tipoDocumento: string;
    nroDocumento:number;
    url: string;
    infoToDo: string;
    ubicacionPanel?:string;
    usuarioCreador?:string;
  }
  export interface GridRowType {//las filas del Dynamic form-grilla
    [key: string]: string | number | boolean | Date | null | File | undefined; // Ajusta los tipos según tus necesidades
  }   
  export interface GridColumnType { //del dynamic form
    name: string;
    visible: boolean;
    textAlign?: 'left' | 'center' | 'right';
    typeColumn?:'number'|'string'|'rut'|'money'|'sin'|'boolean';
    label?:string;
    unique?: boolean;
    captionPosition:'top' | 'left';
  }     
  export interface ActivitiesType {
    "numActividad":string,actividad:string | null, fechaInicio?: string | null,"fechaTermino"?:string | null, "duracion"?: number | string ,presupuesto?:number | string | null
   }
  export type empalmesGridType = {//este type debe estar en apiHelpers
    nroEmpalme: number; proveedor: string; capacidad: number; distancia: number; nroCliente: string; distribuidora:string;
    capacidadInyeccion: number; rutCliente: File | null; boleta:File |null; poder: File | null; foto: File | null; f2oF4:string;
    f2: File | null; diagrama: File | null; otrasImagenes: File | null; fechaF3: Date | null 
    }
  export type instalacionesGridType = {//este type debe estar en apiHelpers
    nroInstalacion: number; descripcionInstalacion: string | null; nroAguas: number; formaTecho: string;
    descripcionFormaTecho: string | null; memoriaCalculo: File | null
  }
  export type techoGridType = {//este type debe estar en apiHelpers
    nroInstalacion: number; nroAgua: number; orientacion: string | null; material: string | null;
    otrosElementos: string; area: number; pendiente: number; imagenTecho: File | null
  }
  export type ProjectType ={
     idProject: number;
     projectName: string;
     ubicacionPanel:string;
     idRegion:number | null;
     idComuna:number | null;
     direccion: string | null;
     nroEmpalmes:number | null;
     //  empalmesGrid:{ nroEmpalme: number; proveedor: string; capacidad: number; distancia: number; nroCliente: string; distribuidora:string;
     //           capacidadInyeccion: number; rutCliente: File | null; boleta:File |null; poder: File | null;fotos: File | null; f2oF4:string;
     //           f2: File | null; diagrama: File | null; otrasImagenes: File | null; fechaF3: Date | null }[];
     empalmesGrid:empalmesGridType[];
     //  instalacionesGrid?:{ nroInstalacion: number; descripcionInstalacion: string | null; nroAguas: number; formaTecho: string;
     //           descripcionFormaTecho: string | null; memoriaCalculo: File | null}[];	
     instalacionesGrid:instalacionesGridType[];
     //  techoGrid?: { nroInstalacion: number; nroAgua: number; orientacion: string | null; material: string | null;
     //        otrosElementos: string, area: number; pendiente: number; imagenTecho: File | null }[];	
     techoGrid?:techoGridType[];
     kmlFileName: string | null;
     kmlFileContent: string | null;	
     excelFileId: string | null;	
     //activities:{ "NumActividad": string;Actividad: string;FechaInicio: string;FechaTermino: string;Presupuesto: number;Duracion: number;  }[]	;
     activities:ActivitiesType[],  
     userModification:  string ;		
     dateModification: "" | null;	
     state:string;
     tipoTerreno: string | null;
     nivelPiedras:string | null;
     nivelFreatico:number | null;
     nroInstalaciones:number | null;
  }
  export interface ProjectFormValuesType {
    projectName: string;
    region:number;
    comuna:number;
    direccion: string;
    ubicacionPanel: string;
    tipoTerreno: string;
    nivelPiedras: string;
    nivelFreatico: number;
    certificadoAcceso:string;
    nroAguas:number;
    nroInstalaciones:number;
    kmlFile:string; 
    // techoGrid: { nroInstalacion: number;nroAgua: number; orientacion: string; material: string; area: number; pendiente: number, otrosElementos:string[], imagenTecho: File | null,  }[];
    techoGrid:techoGridType[];
    nroEmpalmes: number;
    instalacionesGrid:instalacionesGridType[];
    // empalmesGrid: { nroEmpalme: number; proveedor: string; capacidad: number; distancia: number; nroCliente: string, 
    //   capacidadInyeccion: number, rutCliente: File, boleta: File | null, poder: File | null, diagrama: File | null, otrasImagenes:File | null
    //   , f2:File | null ,fechaF3: string , }[], 
    empalmesGrid:empalmesGridType[],
    activities:ActivitiesType[],  
  }
  export interface ActivityType //extends ProjectType
  { 
      idProjectActivity:number; idProject:number, numActividad:string; actividad:string; fechaInicio: string; fechaTermino:string; duracion: number; 
      presupuesto:number ,userResponsable:string; formaEjecucion: string; periodoControl: string; userEjecutor:string; 
      idTask:number; idTransaction:number; projectName: string; ubicacionPanel: string;tipoTerreno: string; nivelPiedras: string;  
      nivelFreatico: number; nroInstalaciones:number;idProcessInstance:number;idActivity:number;
  }
  export interface ActivityEmailFilesType extends ActivityType {
      jsFiles:FilesType[]; emailTemplate:EmailTemplateType[];selectedTemplate:EmailTemplateType | null;selectedTemplateId:number;
      proveedores:ProveedorType[] | null; anexosSelected:number[]; proveedoresSelected: string[];
      FechaEntregaTrabajo:string; PlazoRespuestaCotizacion:string;tipoDocumento:string; attributes:any[];proveedorEditing?:string;
      // placeholder?:Record<string, string>; asuntoPlaceholder?:Record<string, string>; 
      editableBody?:string; editableAsunto?:string;
  }
  export interface EmailTemplateType {
    idEmailTemplate: string;
    templateName: string;
    subjectTemplate: string;
    bodyTemplate: string;
    metadataJSON?: {}; 
  }
  export interface FilesType {//asociada a projectFiles
    _id?: string;
    descripcion: string;
    fileClass: string;
    filePath: string;
    fileType:string;
    filename:string;
    nroAgua?:number;
    nroInstalacion?:number;
    email:string;
    fileSize?:number;

  }
  export interface ProveedorType {
    _id: string;
    label:string;
    contacto: string; 
    email:string;
    placeholders:{};
    name?:string;
    nombreProveedor?:string;
    asuntoPlaceholders:{};
    // asunto:string;
    // cuerpoEmail?:string;
    // aditionalData:{contacto:string, email:string};
    // url?:string;
    // token?:string;
  }
  export interface ProjectActivityType {
    idProject: number;
    idProjectActivity:number;
    idProveedor:number;
    nombreProveedor: string;
    contacto:string;
    idActivity: number;
    actividad:string;
    mensaje: { email: string; asunto: string; cuerpo: string };
    token: string;
    fechaEnvio: string;
    anexos:[];
  } 
  
export interface IEmpalme {
    _id: string;
    nroEmpalme?: number;
    proveedor?: string;
    capacidad?: number;
    distancia?: number;
    nroCliente?: string;
    capacidadInyeccion?: number;
    rutCliente?: string;
    boleta?: string;
    poder?: string;
    f2?: string;
    diagrama?: string;
    otrasImagenes?: string;
    fechaF3?: string;
  }
  
  export interface IInstalacion {
    _id: string;
    descripcionInstalacion?: string;
    nroInstalacion?: number;
    nroAguas?: number;
    formaTecho?: string;
    descripcionFormaTecho?: string;
    memoriaCalculo?: string;
  }
  
  export interface ITecho {
    _id: string;
    nroInstalacion?: number;
    nroAgua?: number;
    orientacion?: string;
    material?: string;
    area?: number;
    pendiente?: number;
    otrosElementos?: string[];
    imagen?: string;
  }
  
  export interface IActividad {
    numActividad?: string;
    actividad?: string;
    presupuesto?: number;
    fechaInicio?: string;
    fechaTermino?: string;
    duracion?: number;
  }
  
  export interface IProject {
    _id: string;
    idProject: number;
    projectName: string;
    ubicacionPanel: string;
    idRegion?: number;
    idComuna?: number;
    nroEmpalmes: number;
    empalmesGrid?: IEmpalme[];
    nroInstalaciones?: number;
    instalacionesGrid?: IInstalacion[];
    techoGrid?: ITecho[];
    activities?: IActividad[];
    state?: string;
    tipoTerreno?: string;
    nivelPiedras?: string;
    nivelFreatico?: number;
    kmlFileName?: string;
    kmlFileContent?: string;
    excelFileId?: string;
    userModification?: string;
  }

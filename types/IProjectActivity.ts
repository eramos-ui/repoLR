export interface IProjectActivity {
    idProjectActivity: number;
    idActivity: number;
    numActividad: string;
    actividad: string;
    fechaInicio: string;
    fechaTermino: string;
    duracion?: number;
    presupuesto: number;
    usuarioModificacion: string;
    idProject: number;
    idProcessInstance: number;
    userResponsable: string;
    formaEjecucion: string;
    userEjecutor: string;
    createdAt?: string;
    updatedAt?: string;
  }
   
export interface NextActivity {
    key: string;
    conditionText?: string;
    idActivity: number;
    isAutomatic?: boolean;
    isJoin?: boolean;
    tipoJoin?: string;
    decisionValue?: string;
    type?: string;
    nameActivity?: string;
    url?: string;
    userSpecific?: string;
    onExitActions?: Record<string, string>;
    tipoDocumento?: string;
    nroDocumento?: number;  
    idProcess?: number;
  }

  export interface TaskDocument {
    idTask: number;
    taskStatus?: string;
    taskLockDate?: Date;
    userlock?: string;
    taskFinishDate?: Date;
    userFinish?: string;
    idProcessInstance: number;
    idActivity: number;
    specificUser?: string;
    idUserCreate?: string;
    fecha?: Date;
    idProcess?: number;
    processName?: string;

    nameActivity?: string;
    isAutomatic?: string;
    url?: string;
  }
  export interface DiagramDocument {
    idProcess: number;
    processName: string;
    diagram: {
      connectors: any[];
      shapes: any[];
      page?: {
        width?: number;
        height?: number;
        pageColor?: number;
        pageWidth?: number;
        pageHeight?: number;
        pageLandscape?: boolean;
      };
    };
    context?: any[];
    roles?: any[];
    activityProperties: NextActivity[]; // <-- Aquí usamos directamente el tipo NextActivity
    subProcess?: any[];
    isSubprocess?: boolean;
    isValid?: boolean;
  }
  export interface TaskDocument {
    idTask: number;
    idProcessInstance: number;
    idActivity: number;
    taskStatus?: string;
    // otros campos si quieres, como userFinish, etc.
  }
  export interface ProcessDocument {
    idProcess: number;
    // idProcessInstance: number;
    processName: string;
    attributes: { idAttribute: string; value: string }[];
    // puedes agregar otros campos si los necesitas
  }
  export interface ProjectDocument {
    idProject: number;    
    projectName: string;  
    ubicacionPanel: string;
    activities: any[]
  }

  export type ActionFn = (context: Record<string, string>, idProcessInstance: number) => Promise<void>;
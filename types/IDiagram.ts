export interface IContext {
    idContext: number;
    name: string;
    type: string;
    description?: string;
  }
  
  export interface IRole {
    idRol: number;
    Nombre: string;
    description?: string;
  }
  
  export interface IActivityProperty {
    idActivity: number;
    key: string;
    nameActivity?: string;
    description?: string;
    url?: string;
    rolOption?: string;
    rol?: string;
    userSpecific?: string;
    isAutomatic?: boolean;
    isJoin?: boolean;
    tipoJoin?: string;
    isSubProcess?: boolean;
    triggerSubprocess?: string;
    decisionValue?: string;
    type?: string;
    onExitActions?: Record<string, string>;
  }
  
  export interface ISubProcess {
    idProcess: number;
    processName: string;
  }
  export interface IConnector {
    key: string;
    beginItemKey: string;
    endItemKey: string;
    points: any[];
    texts: Record<string, string>;
  }
  export interface IDiagram {
    idProcess: number;
    processName: string;
    diagram: {
      connectors: IConnector[];
      shapes: any[];
      page?: any;
    };
    context?: IContext[];
    roles?: IRole[];
    activityProperties?: IActivityProperty[];
    subProcess?: ISubProcess[];
    isSubprocess?: boolean;
    isValid?: boolean;
  }
  
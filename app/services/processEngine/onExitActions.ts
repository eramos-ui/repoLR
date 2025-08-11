// /app/services/processEngine/actions/onExitActions.ts

import { crearSubProcesoGantt } from "@/helpers/actions/crearSubProcesoGantt";
import { ActionFn } from "./types";
    

export const onExitActions = {
    crearSubProcesoGantt: async (context: Record<string, ActionFn>, idProcessInstance: number, tipoDocumento:string, nroDocumento:number) => {
      console.log('🛠 Ejecutando acción: crearSubProcesoGantt',idProcessInstance,tipoDocumento,nroDocumento);
      await crearSubProcesoGantt( idProcessInstance,tipoDocumento,nroDocumento);
  
      console.log('✅ Subprocesos Gantt creados');
    },
    // Puedes agregar más acciones aquí
  };
  
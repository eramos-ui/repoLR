import { findNextActivities } from './findNextActivities'; // Asumo que la tienes aparte
import { resolveCuestion } from './resolveCuestion';
import { canCreateJoinTask } from './canCreateJoinTask';

interface NextActivity {
  key: string;
  conditionText?: string;
  idActivity: number;
  isAutomatic?: boolean;
  isJoin?: boolean;
  tipoJoin?: string;
  decisionValue?: string;
  type?: string;
}

/**
 * Procesa las actividades siguientes de manera recursiva
 * @param diagram El objeto diagram.diagram
 * @param activityProperties El array activityProperties
 * @param context Contexto actual del proceso (para futuras decisiones)
 * @param currentKey Key de la actividad actual que acaba de terminar
 */
export const processNextActivities = async (
  diagram: any,
  activityProperties: any[],
  context: Record<string, any>,
  currentKey: string
): Promise<void> => {
  // Inicializamos la cola con las siguientes actividades
  let activitiesToProcess: NextActivity[] = findNextActivities(
    { connectors: diagram.connectors },
    activityProperties,
    currentKey
  );

  while (activitiesToProcess.length > 0) {
    // Sacamos la primera actividad a procesar
    const nextActivity = activitiesToProcess.shift();
    if (!nextActivity) break; // Seguridad

    console.log(`Procesando actividad key=${nextActivity.key}, idActivity=${nextActivity.idActivity}`);

    // Buscamos el shape asociado (por key)
    const destinationShape = diagram.shapes.find((shape: any) => shape.key === nextActivity.key);

    if (!destinationShape) {
      console.warn(`No se encontró shape para key=${nextActivity.key}`);
      continue;
    }

    // === Analizar según tipo de shape ===
    switch (destinationShape.type) {
      case 'fin':
        console.log('Proceso finalizado.');
        // Aquí podrías marcar el proceso como terminado
        break;

      case 'actividad':
        if (nextActivity.isJoin) {
          console.log('Actividad es un JOIN, falta lógica de join (fase 3).');
          // Aquí después implementaremos lógica join inclusivo/exclusivo
        } else {
          console.log('Creando nueva Task manual.');
          await createTaskForUser(nextActivity);
        }
        break;

      case 'cuestion':
        console.log('Actividad es una CUESTION automática, falta lógica de decisión (fase 2).');
        if (nextActivity.isAutomatic) {
            const resolvedActivity = resolveCuestion(diagram, activityProperties, context, nextActivity);
        
            if (resolvedActivity) {
              console.log(`Decisión tomada: ir a key=${resolvedActivity.key}`);
              activitiesToProcess.push(resolvedActivity);
            } else {
              console.warn(`No se pudo resolver la cuestion desde key=${nextActivity.key}`);
            }
          }
        break;

      case 'inicio':
        console.log('Inicio detectado (se ignora en este flujo).');
        break;

      default:
        console.warn(`Tipo de shape desconocido: ${destinationShape.type}`);
        break;
    }

    // === Si isAutomatic, seguir recursivamente ===
    if (nextActivity.isAutomatic && destinationShape.type !== 'cuestion') {
    //   const newActivities = findNextActivities({ connectors: diagram.connectors, activityProperties }, nextActivity.key);
      let newActivities: NextActivity[] = findNextActivities(
        { connectors: diagram.connectors },
        activityProperties,
        nextActivity.key
      );
      activitiesToProcess.push(...newActivities);
    }
  }
};

/**
 * Crea una nueva Task para usuario manual
 * (Simulado aquí, luego lo conectarás a tu base de datos)
 */
const createTaskForUser = async (activity: NextActivity) => {
  console.log(`Se debería crear una nueva Task para idActivity=${activity.idActivity}`);
  // Aquí iría la creación en DB de tu entidad Task
};


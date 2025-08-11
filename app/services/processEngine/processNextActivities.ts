
import { findNextActivities } from './findNextActivities';
import { resolveCuestion } from './resolveCuestion';
import { canCreateJoinTask } from './canCreateJoinTask';
import { NextActivity } from './types';
import { createTaskForUser } from './createTaskForUser';
import { onExitActions } from './onExitActions';

/**
 * Procesa las actividades siguientes de manera recursiva
 */
export const processNextActivities = async (
  diagram: any,
  activityProperties: any[],
  idProcessInstance: number,
  context: Record<string, any>,
  completedKeys: string[],
  currentKey: string,
  userFinish: string,
  idActivity: number,
  tipoDocumento: string,
  nroDocumento: number,
  nameActivity: string
): Promise<void> => {
  let activitiesToProcess: NextActivity[] = findNextActivities(
    { connectors: diagram.connectors },
    activityProperties,
    currentKey,
  );
  // console.log('en processNextActivities activitiesToProcess',activitiesToProcess);
  // console.log('en processNextActivities activityProperties',activityProperties);
  // console.log('en processNextActivities activitiesToProcess',activitiesToProcess);


  while (activitiesToProcess.length > 0) {
    const nextActivity = activitiesToProcess.shift() as NextActivity;
    const activityProp=activityProperties.find(act => act.idActivity === nextActivity.idActivity)
    // console.log('en processNextActivities activityProp',activityProp);
    if (!nextActivity) break;

    const destinationShape = diagram.shapes.find((shape: any) => shape.key === nextActivity.key);
    if (!destinationShape) continue;

    // Crear Task para actividades automáticas (cuestion incluida)
    if (nextActivity.isAutomatic) {
      // console.log(`Ejecutando automáticamente actividad automática idActivity=${nextActivity.idActivity}`);
      await createTaskForUser(nextActivity, idProcessInstance, context, 'system',tipoDocumento,nroDocumento, activityProp.userSpecific);
    }
    //console.log('en processNextActivities nameActivity,destinationShape.type',nameActivity,destinationShape.type);
    switch (destinationShape.type) {
      case 'fin':
        console.log('Proceso finalizado.');
        break;

      case 'actividad':
        if (nextActivity.isJoin) {
          const canCreate = canCreateJoinTask(diagram, nextActivity, completedKeys);
          if (canCreate) {
            console.log('Creando nueva Task de JOIN.');

            await createTaskForUser(nextActivity, idProcessInstance, context, userFinish, tipoDocumento, nroDocumento, activityProp.userSpecific);
          } else {
            console.log('Esperando más actividades previas para JOIN.');
          }
        } else {
          // console.log('Creando nueva Task manual para nextActivity*', nextActivity);
          console.log('Creando nueva Task manual para specificUser*', activityProp.specificUser);
          await createTaskForUser(nextActivity, idProcessInstance, context, userFinish, tipoDocumento, nroDocumento, activityProp.userSpecific);
        }
        break;

      case 'cuestion':
        if ('onExitActions' in nextActivity) {
          console.log('✅ onExitActions existe:', nextActivity.onExitActions);
        }
        if (nextActivity.isAutomatic) {
          // console.log('📦 onExitActions disponibles:', Object.keys(onExitActions));
          // console.log('en processNextActivities nextActivity',nextActivity);
          const resolvedActivity = resolveCuestion(diagram, activityProperties, context, nextActivity,tipoDocumento,nroDocumento,nameActivity);
          // console.log('en processNextActivities resolvedActivity',resolvedActivity);
          if (resolvedActivity) {
            // Ejecutar acción personalizada si existe
            const decisionValue = nextActivity.decisionValue;
            const contextValue = decisionValue ? context[decisionValue] : undefined;
            const actionName = contextValue && nextActivity.onExitActions?.[contextValue];
              // console.log('🧠 decisionValue:', decisionValue);
              // console.log('📥 context[decisionValue]:', contextValue);
              // console.log('🧾 nextActivity.onExitActions:', nextActivity.onExitActions);
              // console.log('🧨 actionName:', actionName);
            // console.log('🧨 action:', Object.prototype.hasOwnProperty.call(onExitActions, actionName));
            if (actionName && Object.prototype.hasOwnProperty.call(onExitActions, actionName)) {
              const action = onExitActions[actionName as keyof typeof onExitActions];
              // console.log(`⚙️ Ejecutando acción onExit: ${actionName}`);
              await action(context, idProcessInstance,tipoDocumento,nroDocumento);
            }

            activitiesToProcess.push(resolvedActivity);//Aquí se agrega la actividad a la lista de actividades a procesar
          }
        }
        break;

      case 'inicio':
        console.log('Inicio detectado. Resuelto en createInitialWorkflowData');
        // const newActivities = findNextActivities(
        //   { connectors: diagram.connectors },
        //   activityProperties,
        //   nextActivity.key
        // );
        // console.log('en processNextActivities newActivities',newActivities);
        break;
    }

    // Si es automática (y no cuestion), seguir el flujo
    if (nextActivity.isAutomatic && destinationShape.type !== 'cuestion') {
      const newActivities = findNextActivities(
        { connectors: diagram.connectors },
        activityProperties,
        nextActivity.key,
        
      );
      activitiesToProcess.push(...newActivities);
    }
  }
};

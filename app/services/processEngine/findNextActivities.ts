import { NextActivity } from './types';

export const findNextActivities = (
  diagram: { connectors: any[] },
  activityPropsArray: any[],
  currentKey: string,


): NextActivity[] => {
  if (!Array.isArray(diagram?.connectors) || !Array.isArray(activityPropsArray)) {
    console.warn('El diagrama no tiene conectores o activityProperties válidos.');
    return [];
  }

  return diagram.connectors
    .filter(connector => Number(connector.beginItemKey) === Number(currentKey))
    .map(connector => {
      const nextKey = connector.endItemKey;
      const nextActivity = activityPropsArray.find((act: any) => act.key === nextKey);
      //  console.log('en findNextActivities connector-nextActivity',connector,nextActivity);

      if (!nextActivity) {
        console.warn(`No se encontró activityProperty con key = ${nextKey}`);
      }
      return {
        key: nextKey,
        conditionText: connector.texts ? String(Object.values(connector.texts)[0]) : undefined,
        idActivity: nextActivity?.idActivity ?? 0,
        isAutomatic: nextActivity?.isAutomatic,
        isJoin: nextActivity?.isJoin,
        tipoJoin: nextActivity?.tipoJoin,
        decisionValue: nextActivity?.decisionValue,
        type: nextActivity?.type,
        onExitActions: nextActivity?.onExitActions,
        tipoDocumento: nextActivity?.tipoDocumento,
        nroDocumento: nextActivity?.nroDocumento,
        nameActivity: nextActivity?.nameActivity,
        specificUser: nextActivity?.specificUser
      };
    });
};

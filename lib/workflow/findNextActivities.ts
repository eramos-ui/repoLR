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
   * Encuentra las actividades siguientes desde una actividad actual
   * @param diagram El objeto diagram completo (diagram.diagram)
   * @param currentKey La key de la actividad actual
   * @returns Array de claves de actividades siguientes y condición asociada si existe
   */
  export const findNextActivities = (
    diagram: { connectors: any[]; },
    activityPropsArray: any[],
    currentKey: string
  ): NextActivity[] => {
    // console.log('en findNextActivities currentKey',currentKey);
    console.log('en findNextActivities diagram.connectors',diagram.connectors);
    console.log('en findNextActivities connectors asociados a currentKey',currentKey,diagram.connectors.filter(connector => Number(connector.beginItemKey) === Number(currentKey)));
    // console.log('en findNextActivities diagram.activityProperties',activityPropsArray);
    if (!Array.isArray(diagram?.connectors) || !Array.isArray(activityPropsArray)) {
      console.warn('El diagrama no tiene conectores o activityProperties válidos.');
      return [];
    }
  
    return diagram.connectors
      .filter(connector => Number(connector.beginItemKey) === Number(currentKey))
      .map(connector => {
        const nextKey = connector.endItemKey;
  
        const nextActivity = activityPropsArray.find((act: any) => act.key === nextKey);
  
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
        };
      });
  };
  
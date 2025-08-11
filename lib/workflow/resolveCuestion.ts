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
 * Resuelve una actividad de tipo 'cuestion'
 * @param diagram El diagrama completo
 * @param activityProperties El array de activityProperties
 * @param context El contexto del proceso actual
 * @param currentActivity La actividad de tipo 'cuestion' a resolver
 * @returns El NextActivity que corresponde seguir, o undefined si no se puede resolver
 */
export const resolveCuestion = (
    diagram: any,
    activityProperties: any[],
    context: Record<string, any>,
    currentActivity: NextActivity
  ): NextActivity | undefined => {
    console.log(`Resolviendo cuestion para key=${currentActivity.key} usando decisionValue=${currentActivity.decisionValue}`);
  
    if (!currentActivity.decisionValue) {
      console.warn(`La actividad de tipo 'cuestion' no tiene definido decisionValue`);
      return undefined;
    }
  
    const contextValue = context[currentActivity.decisionValue];
  
    if (contextValue === undefined) {
      console.warn(`No se encontró el atributo '${currentActivity.decisionValue}' en el context del proceso`);
      return undefined;
    }
  
    console.log(`Valor obtenido del contexto: ${contextValue}`);
  
    // Encontramos los conectores que salen de esta actividad
    const connectorsFromCurrent = diagram.connectors.filter(
      (connector: any) => Number(connector.beginItemKey) === Number(currentActivity.key)
    );
  
    // Buscamos el conector que tenga un text igual al valor de contexto
    const matchingConnector = connectorsFromCurrent.find((connector: any) => {
      const connectorText = connector.texts ? String(Object.values(connector.texts)[0]) : undefined;
      return connectorText === String(contextValue);
    });
  
    if (!matchingConnector) {
      console.warn(`No se encontró un conector que coincida con el valor '${contextValue}' en la cuestion.`);
      return undefined;
    }
  
    const nextKey = matchingConnector.endItemKey;
  
    // Encontramos la actividad destino
    const nextActivity = activityProperties.find((act: any) => act.key === nextKey);
  
    if (!nextActivity) {
      console.warn(`No se encontró activityProperty para key=${nextKey}`);
      return undefined;
    }
  
    return {
      key: nextKey,
      conditionText: matchingConnector.texts ? String(Object.values(matchingConnector.texts)[0]) : undefined,
      idActivity: nextActivity.idActivity,
      isAutomatic: nextActivity.isAutomatic,
      isJoin: nextActivity.isJoin,
      tipoJoin: nextActivity.tipoJoin,
      decisionValue: nextActivity.decisionValue,
      type: nextActivity.type,
    };
  };
  

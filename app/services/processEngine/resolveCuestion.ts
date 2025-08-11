import { NextActivity } from './types';

export const resolveCuestion = (
  diagram: any,
  activityProperties: any[],
  context: Record<string, any>,
  currentActivity: NextActivity,
  tipoDocumento: string,
  nroDocumento: number,
  nameActivity: string
): NextActivity | undefined => {
  //  console.log('en resolveCuestion currentActivity',currentActivity,nameActivity);
  if (!currentActivity.decisionValue) return undefined;
  //  console.log(`Resolviendo cuestion idActivity=${currentActivity.idActivity}`);
  //  console.log(`en resolveCuestion DecisionValue: ${currentActivity.decisionValue}`);
  //  console.log(`en resolveCuestion context`, context);
  //  console.log(`en resolveCuestion Valor en context:`, context[currentActivity.decisionValue]);

  const contextValue = context[currentActivity.decisionValue];
  // console.log(`en resolveCuestion contextValue`, contextValue);
  if (contextValue === undefined) return undefined;

  const connectorsFromCurrent = diagram.connectors.filter(
    (connector: any) => Number(connector.beginItemKey) === Number(currentActivity.key)
  );
  //  console.log(`en resolveCuestion Connectores salientes:`, connectorsFromCurrent.map((c: any) => ({
  //   key: c.key,
  //   to: c.endItemKey,
  //   text: c.texts ? Object.values(c.texts)[0] : 'sin texto'
  // })));

  const matchingConnector = connectorsFromCurrent.find((connector: any) => {
    const connectorText = connector.texts ? String(Object.values(connector.texts)[0]) : undefined;
    return connectorText === String(contextValue);
  });

  if (!matchingConnector) return undefined;
  // console.log('en resolveCuestion matchingConnector',matchingConnector);
  const nextKey = matchingConnector.endItemKey;
  const nextActivity = activityProperties.find((act: any) => act.key === nextKey);
  // console.log('en resolveCuestion matchingConnector.texts',matchingConnector.texts);
  // console.log('en resolveCuestion Object.values(matchingConnector.texts)[0]',Object.values(matchingConnector.texts)[0]);
  
  if (!nextActivity) return undefined;

  return {
    key: nextKey,
    conditionText: matchingConnector.texts ? String(Object.values(matchingConnector.texts)[0]) : undefined,
    idActivity: nextActivity.idActivity,
    isAutomatic: nextActivity.isAutomatic,
    isJoin: nextActivity.isJoin,
    tipoJoin: nextActivity.tipoJoin,
    decisionValue: nextActivity.decisionValue,
    type: nextActivity.type,
    onExitActions: nextActivity?.onExitActions,
    tipoDocumento,
    nroDocumento,
  };
};

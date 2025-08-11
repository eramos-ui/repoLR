import { NextActivity } from './types';

export const canCreateJoinTask = (
  diagram: any,
  currentJoin: NextActivity,
  completedKeys: string[]
): boolean => {
  const connectorsToJoin = diagram.connectors.filter(
    (connector: any) => Number(connector.endItemKey) === Number(currentJoin.key)
  );

  const previousKeys = connectorsToJoin.map((connector: any) => connector.beginItemKey);

  if (currentJoin.tipoJoin === 'exclusivo') {
    return previousKeys.some((prevKey:any) => completedKeys.includes(prevKey));
  } else if (currentJoin.tipoJoin === 'inclusivo') {
    return previousKeys.every((prevKey:any) => completedKeys.includes(prevKey));
  }

  return false;
};

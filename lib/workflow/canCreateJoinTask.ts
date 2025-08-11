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
 * Determina si se puede crear una task para una actividad JOIN
 * @param diagram El diagrama completo
 * @param currentJoin La actividad JOIN a analizar
 * @param completedKeys Lista de keys de actividades ya completadas
 * @returns true si se puede crear la task, false si no
 */
export const canCreateJoinTask = (
    diagram: any,
    currentJoin: NextActivity,
    completedKeys: string[]
  ): boolean => {
    console.log(`Evaluando creación de JOIN key=${currentJoin.key}, tipoJoin=${currentJoin.tipoJoin}`);
  
    // Buscamos las actividades previas que apuntan a este JOIN
    const connectorsToJoin = diagram.connectors.filter(
      (connector: any) => Number(connector.endItemKey) === Number(currentJoin.key)
    );
  
    if (connectorsToJoin.length === 0) {
      console.warn(`No hay actividades previas apuntando al JOIN key=${currentJoin.key}`);
      return false;
    }
  
    const previousKeys = connectorsToJoin.map((connector: any) => connector.beginItemKey);
  
    if (currentJoin.tipoJoin === 'exclusivo') {
      // Basta con que UNA actividad previa esté completada
      return previousKeys.some((prevKey:any) => completedKeys.includes(prevKey));
    } else if (currentJoin.tipoJoin === 'inclusivo') {
      // Deben estar TODAS las actividades previas completadas
      return previousKeys.every((prevKey:any) => completedKeys.includes(prevKey));
    } else {
      console.warn(`tipoJoin desconocido para key=${currentJoin.key}`);
      return false;
    }
  };
  
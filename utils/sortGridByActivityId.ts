export const sortGridByActivityId = (data: any[]) => {
    return [...data].sort((a, b) => {
      const parseActivityId = (id: string) =>
        id.split(".").map((num) => parseInt(num, 10));
  
      const idA = parseActivityId(String(a["numActividad"]));
      const idB = parseActivityId(String(b["numActividad"]));
  
      for (let i = 0; i < Math.max(idA.length, idB.length); i++) {
        const numA = idA[i] || 0;
        const numB = idB[i] || 0;
        if (numA !== numB) return numA - numB;
      }
      return 0;
    });
  };
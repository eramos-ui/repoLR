import { GridColumnType } from '@/types/interfaces';

export const extractColumnsFromJSON = (data: any[]): string[] => {
    const columnSet = new Set<string>();
  
    data.forEach(row => {
      Object.keys(row).forEach(key => columnSet.add(key.trim()));
    });
  
    return Array.from(columnSet); // Convertimos el Set en un array
  };

  const inferColumnType = (columnName: string, data: any[]): "string" | "number" => {
    for (const row of data) {
      const value = row[columnName];
      //console.log('columnName,value',row,columnName,value); 
      if (columnName.includes('NumActividad')) return 'string'
      if (value !== undefined && value !== null) {
        if (typeof value === "number") return "number";
        if (typeof value === "string" && !isNaN(Number(value.trim()))) return "number";
      }
    }
    return "string";
  };
/*
  export const extractColumnsWithConfig = (data: any[]): GridColumnType[] => {
    const columnSet = new Set<string>();
  
    data.forEach(row => {
      Object.keys(row).forEach(key => columnSet.add(key.trim()));
    });
  
    return Array.from(columnSet).map(column => {
      const typeColumn = inferColumnType(column, data);
      
      return {
        name: column,
        key: column,
        visible: true,
        textAlign: typeColumn === "number" ? "right" : "left",
        captionPosition:typeColumn === "number" ? "right" : "left",
        editable: true,
        type: typeColumn,
        typeColumn,
        row:1,
        label: column.charAt(0).toUpperCase() + column.slice(1),
        unique: false
      };
    });
  };*/
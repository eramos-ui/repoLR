// export interface CarteraGrilla {
//     idCasa: number;
//     codigoCasa: string;
//     familia: string;
//     [mes: string]: string | number; // permite 'ene', 'feb', ... y 'totalAnual'
//   }
//   export interface CarteraAggregated {
//     idCasa: number;
//     codigoCasa: string;
//     familia: string;
//     mes: number;
//     totalMonto: number;
//   }

  export interface CarteraAggregated {
    idCasa: number;
    codigoCasa: string;
    familia: string;
    mes: number;
    totalMonto: number;
    }
    
    export interface CarteraGrilla {
    idCasa: number;
    codigoCasa: string;
    familia: string;
    [mes: string]: string | number;
    }

    export interface GrillaMovimientosAggregated {
        idCasa: number;
        fechaDocumento: string;
        comentario: string;
        ingreso: number;
        salida: number;
        saldo: number;
    }
    export interface GrillaMovimientos {
        //id: string;
        idCasa: number;
        fechaDocumento: string;
        comentario: string;
        ingreso: number;
        salida: number;
        saldo: number;
    }
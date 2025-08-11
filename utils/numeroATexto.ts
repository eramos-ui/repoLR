export const numeroATexto = (numero: number | string): string => {
    const unidades: string[] = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales: string[] = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const decenas: string[] = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const centenas: string[] = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    const convertirEntero = (n: number): string => {
        if (n === 0) return "cero";
        if (n < 10) return unidades[n];
        if (n < 20) return especiales[n - 10];
        if (n < 100) return decenas[Math.floor(n / 10)] + (n % 10 !== 0 ? " y " + unidades[n % 10] : "");
        if (n < 1000) return centenas[Math.floor(n / 100)] + (n % 100 !== 0 ? " " + convertirEntero(n % 100) : "");
        if (n < 1000000) {
            const miles = Math.floor(n / 1000);
            const resto = n % 1000;
            return (miles === 1 ? "mil" : convertirEntero(miles) + " mil") + (resto !== 0 ? " " + convertirEntero(resto) : "");
        }
        if (n < 1000000000) {
            const millones = Math.floor(n / 1000000);
            const resto = n % 1000000;
            return (millones === 1 ? "un millón" : convertirEntero(millones) + " millones") + (resto !== 0 ? " " + convertirEntero(resto) : "");
        }
        return "Número demasiado grande";
    };

    const convertirDecimales = (numStr: string): string => {
        const partes = numStr.split(",");
        return partes.length === 2
            ? `${convertirEntero(parseInt(partes[0]))} con ${partes[1].substring(0, 2)}/100`
            : convertirEntero(parseInt(numStr));
    };

    return convertirDecimales(numero.toString());
};

// ✅ Ejemplos de uso
// console.log(numeroATexto(123));         // "ciento veintitrés"
// console.log(numeroATexto(9876));        // "nueve mil ochocientos setenta y seis"
// console.log(numeroATexto(1000000));     // "un millón"
// console.log(numeroATexto(1234567));     // "un millón doscientos treinta y cuatro mil quinientos sesenta y siete"
// console.log(numeroATexto(45.78));       // "cuarenta y cinco con 78/100"
// console.log(numeroATexto("2456,99"));   // "dos mil cuatrocientos cincuenta y seis con 99/100"
// console.log(numeroATexto(2000000000));  // "Número demasiado grande"

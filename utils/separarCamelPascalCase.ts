
export const separarCamelPascalCase = (texto:string) => {
    let resultado = texto.replace(/([a-z])([A-Z])/g, "$1 $2"); // Primera letra en mayúscula
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);// Agrega un espacio antes de la mayúscula
};
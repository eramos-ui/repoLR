export const validaModalInstalacion =( updatedInstalacion: any): boolean =>{
    if (!updatedInstalacion.descripcionInstalacion || updatedInstalacion.descripcionInstalacion.trim().length===0 ) {
        alert("Se requiere cómo mínimo que ingrese una descripción para identificar la instalación/edificio");
        return false;
      }
      if (!updatedInstalacion.formaTecho || updatedInstalacion.formaTecho.trim().length===0 ) {
        alert("Se requiere que defina la forma del techo");
        return false;
      }
      if (!updatedInstalacion.formaTecho || updatedInstalacion.formaTecho.trim()=== 'otro' && updatedInstalacion.descripcionFormaTecho.trim() === 'Otro') {
        alert(`Se requiere que ingrese la Descripción de la forma del techo "${updatedInstalacion.formaTecho}"`);
        return false;
      }
      if (!updatedInstalacion.formaTecho || updatedInstalacion.formaTecho.trim()=== 'otro' && updatedInstalacion.nroAguas === 0) {
        alert(`Se requiere que ingrese número de aguas de la forma de techo: "${updatedInstalacion.formaTecho}"`);
        return false;
      }
      return true;
}
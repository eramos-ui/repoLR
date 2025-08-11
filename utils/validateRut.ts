export const validateRut= (value: string):boolean => {
    const rut = value.replace(/\./g, '').replace('-', '').toUpperCase();
    const body = rut.slice(0, -1);//sin DV
    // console.log('validateRut body',body,rut );
    if (body.length <7 ){
      // return 'RUT inválido. Debe tener mínimo 7 dígitos.';
      return false;
    }
    const dv = rut.slice(-1);
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const mod = 11 - (sum % 11);
    let expectedDv;
    if (mod === 11) {
      expectedDv = '0';
    } else if (mod === 10) {
      expectedDv = 'K';
    } else {
      expectedDv = mod.toString();
    }
    // console.log('validateRut expectedDv',expectedDv,dv);
    if (expectedDv === dv) {
      return true;
    }
    return false;
  };
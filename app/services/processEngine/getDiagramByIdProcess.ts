export const getDiagramByIdProcess = async (idProcess: number) => {
    const url=`${process.env.NEXT_PUBLIC_DOMAIN}/api/diagram/getByIdProcess?idProcess=${idProcess}`
    // const url=`/api/diagram/getByIdProcess?idProcess=${idProcess}`
    // console.log('en fetchDiagramByIdProcess url',url);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('No se pudo obtener el diagrama para el idProcess');
    }
  
    return await res.json();
  };
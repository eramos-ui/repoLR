

export const getUserLocation = async(): Promise<[ number,number ]> =>{

    return new  Promise( (resolve, reject) =>{
        navigator.geolocation.getCurrentPosition( // si se va moviendo watchPosition
            ({ coords}) =>{
                //console.log('userLocation de navigator.geolocation.getCurrentPosition',coords.longitude,coords.latitude);
                resolve([ coords.longitude,coords.latitude])                
            },
            ( err ) =>{
                alert('No se pudo obtener la geolocalización');
                console.log( err );
                reject();
            } 
        ) 
    })
}
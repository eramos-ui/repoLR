
export const fromDateUTCtoLocalDate=(
         date: Date | string | number,
         withTime: boolean = false
      ): string =>{
        if (!date) return "";
      
        const opciones: Intl.DateTimeFormatOptions = {
          timeZone: "America/Santiago",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          ...(withTime && {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })
        };
        let formatedDate=new Intl.DateTimeFormat("es-CL", opciones).format(new Date(date));
        const addhrs=(withTime) ?' hrs.' :'';
        formatedDate=formatedDate + addhrs;
        return formatedDate ;
      }
      
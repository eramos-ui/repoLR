import { format } from 'date-fns';


export const currentDate = ( dateFormat: string = 'yyyy-MM-dd HH:mm:ss' ) => format( new Date(), dateFormat );
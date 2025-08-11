
  
"use client";

import { MapView } from '@/components/maps/MapView';
// import { MapView } from '@/app/components/maps/MapView';
import { useRouter } from 'next/navigation';
MapView
//import Map from 'react-map-gl/dist/esm/components/map';

const NewKMLPage = () => {
  const router = useRouter();
  return (
    <div className="flex">
       <div 
       className='w-1/2 pb-4' 
       >
        HouseList
       </div>   
       <div 
       className='w-1/2 pb-4' 
       >
        <MapView />
       </div>



      <button
      onClick={() =>  router.push('/') }
      > Volver a página pricipal</button>
    </div>
  );
};
export default NewKMLPage;
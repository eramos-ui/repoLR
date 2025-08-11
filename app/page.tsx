//Página de inicio de la aplicación
"use client";  

import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';   
import { useEffect } from 'react';
import { useState } from 'react';
import * as Fa from 'react-icons/fa';
interface Card {
  _id: string;
  title: string;
  description: string;
  icon: string;
  orden?:number;
  path?:string;
};

export default function HomePage() { 
  const { data: session, status }                   = useSession();
  const [ cards, setCards ]                         = useState<Card[]>([]);
  const router                                      = useRouter();
  useEffect(() => {
    const fetchCards = async () => {
      const email=session?.user.email;
      if (email){
        const res = await fetch(`/api/catalogs/cards?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        const sortedCards =data.sort((a:Card, b:Card) => (a.orden ?? 0) - (b.orden ?? 0));
        setCards(sortedCards );      
      }
      // console.log('HomePage cards',cards);
    };
    fetchCards();
  }, []);
  const handleClick = (path?: string) => {
    if (path) {
      router.push(path);
    }
  };
  // const userName=session?.user.name;
  // return (
  //   <div className={`p-6 dark`}>
  //   <h1 className="text-4xl font-bold mb-4">Bienvenido a la Plataforma</h1>
  //   <p className="text-lg mb-6">
  //     Hola <strong>{session?.user.name}</strong>.     
  //   </p>
  //  <p className="text-lm mt-1 mb-3">Estas son las herramientas para que puedas gestionar este repositorio: </p>
  //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
  //     {cards.map((option, orden) => {
  //       const Icon = Fa[option.icon as keyof typeof Fa];
  //        console.log('HomePage option',option,orden);
  //        return (
  //         <div key={orden} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
  //            <div className="text-3xl text-blue-600"> {Icon && <Icon /> }</div>
  //            <div className="text-2xl text-blue-600">  {option.title}</div>
  //           <p className="text-gray-700">{option.description}</p>
  //         </div>
  //        )
  //     })}
  //   </div>
  // </div>
  // );
  return (
    <div className="p-6 dark">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a la Plataforma</h1>
      <p className="text-lg mb-6">
        Hola <strong>{session?.user.name}</strong>.
      </p>
      <p className="text-lm mt-1 mb-3">Estas son las herramientas para que puedas gestionar este repositorio:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((option, orden) => {
          const Icon = Fa[option.icon as keyof typeof Fa];
          return (
            <div
              key={orden}
              // onClick={() => handleClick(option.path)}
              onClick={() => handleClick(option.path)}
              // className={`p-4 border rounded-lg shadow-md hover:shadow-lg transition cursor-pointer`}
              className={`p-4 border rounded-lg shadow-md transition
                ${option.path 
                  ? 'cursor-pointer hover:shadow-lg' 
                  : 'cursor-default'
                }`}
            >
              <div className="text-3xl text-blue-600">{Icon && <Icon />}</div>
              <div className="text-2xl text-blue-600">{option.title}</div>
              <p className="text-gray-700">{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
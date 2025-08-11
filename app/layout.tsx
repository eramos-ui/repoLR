//la app se inicia aquí y utiliza AppContent (en components/general/AppContent.tsx) para renderizar el contenido de la página

"use client";  

// Importar polyfills para evitar errores con módulos de Node.js
import '../lib/polyfills';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Modal from 'react-modal';

import { ThemeProvider } from '../context/ThemeContext';
import { SidebarToggleProvider } from '../context/SidebarToggleContext';

import '../styles/globals.css';
import AppContent from '../components/general/AppContent';
import { MapProvider,  PlacesProvider } from '@/app/context'; //context de map mapboxgl debe ir dentro de app

import { usePathname } from 'next/navigation';
import { MenuProvider } from '@/context/MenuContext';
//import CotizarLayout from "./cotizar/layout";  

import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken= process.env.NEXT_PUBLIC_ACCESS_token;//ojo que usar cliente para renderizar, Sólo funciona en el cliente

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname                                    = usePathname();
  const isCotizarPage =pathname?.startsWith("/cotizar");
  useEffect(() => {//Este código configura el elemento raíz del modal para evitar problemas de accesibilidad y compatibilidad con react-modal
    // El modal.setAppElement('body') Establece body como el elemento raíz para los modales.
    //Evita problemas de accesibilidad (aria-hidden) en otros elementos de la página.
    //Corrige problemas con el manejo de focus cuando se abre el modal.
    //Asegura que el modal sea accesible para lectores de pantalla.
    Modal.setAppElement('body');//evita problemas con el document en SSR (Server-Side Rendering)
  }, []);
  return (
    <html lang="en">
       <body>
        <ThemeProvider>
          { isCotizarPage ? children : (// si es cotizar, no se renderiza el layout
            <PlacesProvider>
              <MapProvider>
                <SidebarToggleProvider>
                  <SessionProvider>
                    <MenuProvider> 
                      <AppContent>{children}</AppContent>
                    </MenuProvider>
                  </SessionProvider>
                </SidebarToggleProvider>
              </MapProvider>
            </PlacesProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}

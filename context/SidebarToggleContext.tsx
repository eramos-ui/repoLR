// app/components/SidebarToggleContext.tsx
"use client";

import { createContext, useContext, useState } from 'react';

const SidebarToggleContext = createContext<any>(null);

export const SidebarToggleProvider = ({ children }: { children: React.ReactNode }) => {
  const [isToggleButtonDisabled, setIsToggleButtonDisabled] = useState(false);

  const enableToggleButton = () => setIsToggleButtonDisabled(false);
  const disableToggleButton = () => setIsToggleButtonDisabled(true);
  // console.log('SidebarToggleProvider');
  return (
    <SidebarToggleContext.Provider value={{ isToggleButtonDisabled, enableToggleButton, disableToggleButton }}>
      {children}
    </SidebarToggleContext.Provider>
  );
};

export const useSidebarToggle = () => useContext(SidebarToggleContext);

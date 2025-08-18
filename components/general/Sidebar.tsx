"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconMap } from '../../app/iconMap';
import { UserData } from '@/types/interfaces';
import { SubMenuItem, MenuItem } from '../../types/interfaces';


type SidebarProps = {
  isVisible: boolean;
  closeSidebar: () => void;
  user: UserData;
  // menuData: MenuConfig | null;
  menuData: MenuItem[] | null;
};
const systemName=process.env.NEXT_PUBLIC_SYSTEM_NAME?.toLocaleLowerCase() || 'repositorio';

const Sidebar: React.FC<SidebarProps> = ({ isVisible, closeSidebar, user, menuData }) => {
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sidebarRef                    = useRef<HTMLDivElement>(null);
  const router                        = useRouter();
  const toggleSubMenu                 = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  //  console.log('Siderbar menuData',menuData );
  // const navigateTo = useCallback( ( url: string ) => {
  //   //toggleSubMenu();//esto ocultará el menú al tocar el mismo menú
  //   //console.log('navigateTo en menu', url)
  //   router.push( url );
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      closeSidebar();
    }
  }, [closeSidebar]);
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);
  const handleNavigation = (subitem:SubMenuItem ) => {
    closeSidebar();
    const path=subitem.path;
    // const subMenuId=subitem.formId;
    const formId=subitem.formId;
    // const menuId=subitem.menuId;
    const processType:String=subitem.processType;
    const processActivity=String(subitem.idActivity); //para las 'from toDo
    const urlProcess=`/toDoList/${processActivity}`;//para las 'from toDo
    // console.log('handleNavigation subitem mongo',subitem);return;
    // console.log('handleNavigation subitem',subitem); 
  // || processType ==='init activity'  && (!processActivity || processActivity.length<=0 )
    if (processType && processType!=='from toDo' && processType !=='init activity' && processType !=='app'  ){
      alert(`Menú mal configurado para ${processType}` ) 
      return; 
    }
    if( processType === 'from toDo' ) {//workflow   || processType ==='init activity'
      // console.log('subitem,path,processType,processActivity',subitem);
      const queryParams = new URLSearchParams({
        idProcess: String(subitem.idProcess),
        idActivity: String(subitem.idActivity),
        email: user.email,
        perfil: user.role || '',
        roles: JSON.stringify(user.roleswkf),
        path: String(subitem.path),//requerido para redirigir a la tarea desde el toDoList        
        });
      // router.push(urlProcess,);
      router.push(`${urlProcess}?${queryParams.toString()}`);
 
    } else if( processType === 'app' ) {
      //  console.log('subitem,path,processType,processActivity',subitem,path,processType,urlProcess);
      if (formId) {// Si el campo "form" no es null, redirige el formulario construido desde JSON
        // console.log('subMenuId',subMenuId);
        router.push(`/forms/${formId}`);
        // router.push(`/forms/1016`);
       }else{ //si no tienen formId, redirige a la ruta del subitem (caso consulta)
        router.push(`${path}`);
       }
    } else if( processType === 'init activity' ) {
      router.push(path || '/');//menuId es 4 o 5  para techo o piso
    }
  };
  // console.log('JSX SideBar-isVisible', !isVisible );
  if (!isVisible || !menuData ) return null;
  // console.log('JSX SideBar-menuData',menuData );
  //const { menuItems } = menuData;
  const  menuItems  = menuData.filter(item => item.isValid).filter(item => item.system === systemName);//ojo con systemName en el .env
  // console.log('JSX SideBar-user',user );
  const sidebarClass = 'order-last';
  return (
    <>
    {/* {console.log('JSX SideBar-menuItems',menuItems, isVisible )} */}
      <div ref={sidebarRef} className={`w-96 h-full bg-gray-800 text-white rounded-lg shadow-lg p-2 ${sidebarClass}`}>
        <ul>
          {menuItems.map((item, index) => {
            // console.log('en JSX ext',item,index);
          return (
            <li key={item.id} className="border-b border-gray-700">
              <div
                className="flex justify-between items-center p-4 hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleSubMenu(item.id)}
              >
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={iconMap[item.icon]} />
                  <span>{item.title}</span>
                </div>
                {item.submenus && item.submenus.length > 0 && (
                  <span>{activeIndex === index ? '-' : '+'}</span>
                )}
              </div>
              { (item.submenus && item.submenus.length > 0 && activeIndex === item.id) && (
                <ul className="pl-8" >
                  {item.submenus.map((subItem, subIndex) => {  // console.log('en JSX',subItem,subIndex);
                    return (
                    <li key={subItem.menuId+'-'+subItem.id} className="p-2 hover:bg-gray-700">
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation(subItem)}>
                        <FontAwesomeIcon icon={iconMap[subItem.icon]} />
                        <span>
                          {subItem.title}
                        </span>
                      </div>
                    </li>
                    )
                  })}
                </ul>
              )}
            </li>
            )
          })}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
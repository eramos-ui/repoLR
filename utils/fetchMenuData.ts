import { MenuConfig } from "@/types/interfaces";


export const fetchMenuData = async (userId: string): Promise<MenuConfig> => {
  
    //  console.log('En fetchMenuData');
    try {
      const response = await fetch(`/api/getMenuData?userId=${userId}`); 
      if (!response.ok) { 
        throw new Error('Failed to fetch menu data');
      }
      const data = await response.json();
      if (!Array.isArray(data.menus)) {
        throw new Error('Unexpected data format');
      }
      
      const menuConfig: MenuConfig = {
        menuItems: data.menus.map((item: any) => ({
          id: item.id,
          title: item.title,
          path: item.path,
          icon: item.icon,
          form: item.form,
          processType:item.processType, //no está en uso
          subMenu: item.subMenu ? item.subMenu.map((subItem: any) => ({
            id:subItem.id,
            title: subItem.title,
            path: subItem.path,
            icon: subItem.icon,
            form: subItem.form,//nro del form
            idActivity:subItem.idActivity,//incluye idProcess*100+idActivity
            processType:subItem.processType,//1 es activity del workflow 
          })) : [],
        })),
      };
      //console.log('en fetchMenuData',data, menuConfig)
      return menuConfig;
    } catch (error) {
      console.error('Error fetching menu data:', error);
      throw error; // Lanza el error para manejarlo en el componente que llama a esta función
    }
  }; 
import { useState, useRef, useEffect, useCallback } from 'react';
import { UserData } from '@/types/interfaces';

type UserDropdownProps = {
  user: UserData;
  newName: string;
  setNewName: (name: string) => void;
  newEmail: string;
  setNewEmail: (email: string) => void;
  newTheme: 'light' | 'dark';
  setNewTheme: (theme: 'light' | 'dark') => void;
  handleSave: () => void;
  handleDropdownToggle: () => void;
  isDropdownOpen: boolean;
  //newAvatar:File | null;
  setNewAvatar: (file: File | undefined) => void;
  // newLanguage: string;  
  // setNewLanguage: (lang: string) => void;  
  disabled:boolean;
};

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newTheme,
  setNewTheme,
  handleSave,
  handleDropdownToggle,
  isDropdownOpen,
  setNewAvatar,
  // newLanguage, 
  // setNewLanguage,  
  disabled,
}) => {
  const [ isEditingName, setIsEditingName ]         = useState(false);
  const [ isEditingEmail, setIsEditingEmail ]       = useState(false);
  const [ isEditingAvatar, setIsEditingAvatar ]     = useState(false);    
 //const [ isEditingLanguage, setIsEditingLanguage ] = useState(false);
  const [ showSaveButton, setShowSaveButton ]       = useState(false);
  const [ userIni, setUserIni ]                     = useState(user);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // useEffect(()=> {
  //   console.log('isEditingAvatar',isEditingAvatar);
  // },[isEditingAvatar]);
  
  // useEffect(()=> {
  //     setUserIni(user);       
  //     console.log('useEffect ini', userIni);
  // },[])
  // useEffect(() => {
  //   if (
  //     newName !== user.name ||
  //     newEmail !== user.email ||
  //     newLanguage !== user.language ||
  //     newTheme !== user.theme ||
  //     isEditingAvatar
  //   ) {
  //     //setShowSaveButton(true);
  //   } else {
  //     //setShowSaveButton(false);
  //   }
  // }, [newName, newEmail, newTheme, isEditingAvatar, user, newLanguage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
          // Validar el tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert("Sólo se permiten imágenes JPG, PNG o GIF.");
        return;
      }
        // Validar que el tamaño del archivo no exceda 5 MB
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        alert("La imagen es demasiado grande. El tamaño máximo permitido es de 5 MB.");
        return;
      }
      setNewAvatar(file); 
      setIsEditingAvatar(true);
      //console.log("Avatar file selected:", file);
    }
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      handleDropdownToggle();
      setIsEditingName(false);
      setIsEditingEmail(false);
      setIsEditingAvatar(false);
      //setIsEditingLanguage( false)
    } 
  }, [handleDropdownToggle]);
  useEffect(() => {
    if (!disabled) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside, disabled]);
  return (
    <>
    {/* {console.log('user en render',user)} */}
      <span
        onClick={!disabled ? handleDropdownToggle : undefined} 
        className={`bg-gray-600 text-white px-2 py-1 rounded text-sm 
          ${!disabled ? 'hover:bg-gray-700':''} 
          ${disabled ? 'bg-gray-400':''} 
          ${disabled ? 'cursor-not-allowed' :''}
          ${!disabled ? 'cursor-pointer text-gray-400' : ''}
          `}
      >
        {user.name}
      </span>
      {isDropdownOpen && !disabled && (
        <div 
          ref={dropdownRef} 
          className="absolute right-0 mt-2 bg-white rounded-md shadow-lg py-2 dark:bg-gray-700"
          style={{ top: '100%',  width: '33vw' }}
        >
          <div className="px-4 py-2">
            {isEditingName ? (/* Opciones para modificar nombre */
              <div>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) =>{ setNewName(e.target.value);setShowSaveButton(true);}} 
                  className="px-2 py-1 w-full rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                  disabled={disabled}
                />
              </div>
            ) : (
              <button 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left dark:text-white dark:hover:bg-gray-600"
                onClick={() => setIsEditingName(true)}
                disabled={disabled}
              >
                Modificar Nombre
              </button>
            )}
            {isEditingEmail ? (/* Opciones para modificar email */
              <div>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => { setNewEmail(e.target.value) ;setShowSaveButton(true); }} 
                  className="px-2 py-1 w-full rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                  disabled={disabled}
               />
              </div>
            ) : (
              <button 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left dark:text-white dark:hover:bg-gray-600"
                onClick={() => setIsEditingEmail(true)}
                disabled={disabled}
              >
                Modificar Email
              </button>
            )}

            {isEditingAvatar ? ( /* Opciones para modificar avatar */
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFileChange(e); 
                    setShowSaveButton(true);
                  }}
                  className="px-2 py-1 w-full rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                  disabled={disabled}
                />
              </div>
            ) : (
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left dark:text-white dark:hover:bg-gray-600"
                onClick={() => setIsEditingAvatar(true)}
                disabled={disabled}
              >
                Modificar Avatar
              </button>
            )}     
            {/* //Selección de idioma 
            <div className="px-4 py-1">
              <label className="block text-sm text-gray-700 dark:text-white">
                Modificar Idioma:
              </label>
              <select 
                value={newLanguage} 
                onChange={(e) => { setNewLanguage(e.target.value);setShowSaveButton(true);}} 
                className="mt-1 block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={disabled}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div> */}
            
            <div className="px-4 py-1">{/* Opciones para cambiar el tema */}
              <label className="block text-sm text-gray-700 dark:text-white">
                Fondo de pantalla:
              </label>
              <select 
                value={newTheme} 
                onChange={(e) => {setShowSaveButton(true);setNewTheme(e.target.value as 'light' | 'dark')}} 
                className="mt-1 block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={disabled}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            { showSaveButton  && !disabled && (
              <button 
                className="block px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400 w-full text-left border 
                      border-blue-600 dark:border-blue-300 rounded-md bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 transition-colors"
                onClick={handleSave}
                disabled={disabled}
              >
                Guardar cambios
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserDropdown;
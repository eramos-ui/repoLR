// api/users/[userId]/files
/*
Lee los documentos que ha subido un usuario al repositorio para la grilla
que muestra el editar un documento en registrar un documento. Lo utiliza el form dinámico
*/

import React from 'react';
import { FaEdit, FaTrashAlt, FaRegFilePdf , FaXRay } from 'react-icons/fa';

import { FormCustomTooltip } from './FormCustomToolTip';
import { useLabels } from '@/hooks/ohers/useLabels';


interface GridActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onZoom: () => void;
  label: string; //el de la grilla que se usa en los tooltips de las Action
  objectGrid?:string;//tiene el nombre de la grilla por ejempo 'documento'
  actions: ('add' | 'edit' | 'delete' | 'zoom' | "zoom-file")[];
  actionsTooltips?:{action:string,tooltips:string}[];
}

const FormGridActions: React.FC<GridActionsProps> = ({ onEdit, onDelete, onZoom, actions, actionsTooltips,
   label,objectGrid }) => {
  const { labels, error }         = useLabels();
  //  console.log('actionsTooltips en GridActions',actionsTooltips)
  if (error) {
    return <div>{error}</div>;
  }
  let tooltipsForEdit=`${labels?.grid.tooltipsEdit} ${objectGrid}`;
  let tooltipsForDelete=`${labels?.grid.tooltipsDelete} ${objectGrid}`;
  let tooltipsForZoom=(labels?.grid.tooltipsZoom)?labels?.grid.tooltipsZoom:'ver archivo';
  if (actionsTooltips){
    const tipsEdit=actionsTooltips?.find(item => item.action.toLowerCase() === 'edit')?.tooltips;
    if (tipsEdit) tooltipsForEdit=tipsEdit;
    const tipsDelete=actionsTooltips?.find(item => item.action.toLowerCase() === 'delete')?.tooltips;
    if (tipsDelete) tooltipsForDelete=tipsDelete;
    const tipsZoom=actionsTooltips?.find(item => item.action.toLowerCase() === 'zoom')?.tooltips;
    if (tipsZoom) tooltipsForZoom=tipsZoom;
  }

  return (
    <div className="flex space-x-2">
      { (actions?.includes('edit')) &&
      <FormCustomTooltip text={`${tooltipsForEdit}` }  color="black" backgroundColor="lightblue" position="top">
        <button type="button" onClick={onEdit} className="text-blue-500 hover:text-blue-700">
          <FaEdit />
        </button>
      </FormCustomTooltip>

      }
      { (actions?.includes('zoom') ) &&
      <FormCustomTooltip text={`${tooltipsForZoom}` } color="white" backgroundColor="blue" position="top">
        <button type="button" onClick={onZoom} className="text-blue-500 hover:text-blue-700">
        <FaXRay />
        </button>
      </FormCustomTooltip>
      }
      { (actions?.includes('zoom-file') ) &&
      <FormCustomTooltip text={`${tooltipsForZoom}` } color="white" backgroundColor="blue" position="top">
        <button type="button" onClick={onZoom} className="text-blue-500 hover:text-blue-700">
        <FaRegFilePdf />
        </button>
      </FormCustomTooltip>
      }
      {
      (actions?.includes('delete')) &&
      <FormCustomTooltip text={`${tooltipsForDelete}` }  color="white" backgroundColor="red" position="top">
        <button type="button" onClick={onDelete} className="text-red-500 hover:text-red-700">
          <FaTrashAlt />
        </button>
      </FormCustomTooltip>
      }
    </div>
  );
};

export default FormGridActions;

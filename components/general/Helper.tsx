import { CustomLabel } from "../controls";
import CustomModal from "./CustomModal";
import {helpData } from "../../data/helpData";
//Esta página despliega el contenido de el botón ?
type HelperProps = {
    openHelp:boolean;
    pageId?: string;//nombre de la página ruta
    handleCloseModal:() => void;
    nroHelpers?:number;//id del array helpData
  };


export const HelperPage: React.FC<HelperProps>  =  ({openHelp, handleCloseModal, pageId, nroHelpers }   )=> {
if (!openHelp) return;

const help=helpData.find((h:any)=> h.id === nroHelpers  || h.pageId === pageId );
if (!help) { console.log('ayuda no definida',nroHelpers,nroHelpers);return;}
// console.log('helpData',nroHelpers,helpData,help);

return (
  <CustomModal isOpen={openHelp} onClose={handleCloseModal} height='95vh'  title={help.title} width="55%"
    htmlContent={help?.htmlContent} position='right'
  >
    <CustomLabel label='' />
  </CustomModal>
  )
}
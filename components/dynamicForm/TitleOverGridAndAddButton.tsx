import { FormFieldDFType } from "@/types/interfaceDF";
import { FaPlus } from "react-icons/fa";


interface TitleOverGridAndAddButtonProps {
  table: FormFieldDFType;
  actions: any;
  handleAdd: () => void;
}   

export const TitleOverGridAndAddButton: React.FC<TitleOverGridAndAddButtonProps> = ({ table, actions, handleAdd }) => {
    //console.log('en TitleOverGridAndAddButton', table, actions, handleAdd);
    return (
        // <div 
        // className={`rounded-lg ${table.padding} ${table.marginBottom} ${table.borderColor} ${table.borderWidth}`} 
        //     style={{ 
        //     width: table.gridWidth,      //backgroundColor: themeStyles?.backgroundColor,  // color: themeStyles?.color
        // }}
        // >
            <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">
                { table.titleGrid }         
                </span>
                {actions?.includes('add') && (
                <button type="button"  onClick={handleAdd}
                    className="flex items-center px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 ml-5"
                >
                    <FaPlus className="mr-2" /> 
                    {table.labelGridAdd}
                </button>
                )}
            </div>
        
        // </div>

    )
}
//import axios from 'axios';
const simulateFetchOptions = (): Promise<{ id: string | number; label: string }[]> => {
    return new Promise((resolve) => { 
      setTimeout(() => {
        resolve([
          { id: '1', label: 'Option 1' },
          { id: '2', label: 'Option 2' },
          { id: '3', label: 'Option 3' },
        ]);
      }, 1000); // Simula un retraso de 1 segundo
    });
  };
export const fetchOptionsFromDatabase = async () => {
 const data = await simulateFetchOptions();
 return data.map((option) => ({
    value: option.id,
    label: option.label,
  }));
  //const response = await axios.get('/api/options');
//   return response.data.map((option: { id: string | number; label: string }) => ({
//     value: option.id,
//     label: option.label,
//   }));

};
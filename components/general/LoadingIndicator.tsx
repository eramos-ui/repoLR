type LoadingProps = {
  message?: string;
};
export const LoadingIndicator: React.FC <LoadingProps> =  ({ message='cargando' } )=> {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative h-24 w-24 flex items-center justify-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-full w-full border-t-8 border-b-8 border-blue-500"></div>
        {/* Texto en el centro */}
        <span className="absolute text-sm  text-center text-blue-500 font-bold">
          {message}...
        </span>
      </div>
    </div>
  );
};




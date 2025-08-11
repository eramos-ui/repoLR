import Image from 'next/image';

const logoUrl='/LogoEvo.png';
const LogoCompany: React.FC = () => (
  <div className="relative w-12 h-12 flex items-center justify-center bg-gray-200 ">
      <Image 
        src={logoUrl} 
        alt="Logo de la empresa" 
        fill 
        sizes="150px"    
      />
  </div>
);
export default LogoCompany;
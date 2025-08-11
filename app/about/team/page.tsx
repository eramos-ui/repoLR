
"use client";

import { useRouter } from 'next/navigation';
import { CustomButton } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
const TeamPage = () => {
  const router = useRouter();

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Team</h1>
      <CustomButton
          buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
          icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
      > 
     </CustomButton>
     </div>
  );
};

export default TeamPage;
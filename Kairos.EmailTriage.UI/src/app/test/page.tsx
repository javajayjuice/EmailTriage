'use client';
import UnknownPageErrorProps from '@/components/error/UnknownError';


// Main Dashboard Component
const Dashboard = () => {
    const handleLoginWithGoogle = () => {
        window.location.href = 'https://localhost:44311/api/account/login/google?returnUrl=http://localhost:3000';
    }
    const handleLoginWithGoogle2 = () => {
        window.location.href = 'https://localhost:7141/api/account/login/google?returnUrl=http://localhost:3000';
    }

  return (
    <>
      <UnknownPageErrorProps />
    </>
  )
};

export default Dashboard;
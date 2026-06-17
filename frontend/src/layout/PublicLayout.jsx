import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark">
      <Navbar onLogin={() => navigate('/login')} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // If user is already logged in, redirect them to their respective dashboard
  if (token) {
    if (user.role === 'intern') {
      return <Navigate to="/intern-leaderboard" replace />;
    } else {
      return <Navigate to="/leaderboard" replace />;
    }
  }

  // Otherwise, render the public child routes
  return <Outlet />;
};

export default PublicRoute;

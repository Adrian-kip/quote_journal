import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a loading message while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // If finished loading and there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is logged in, render the component
  return children;
};

export default ProtectedRoute;
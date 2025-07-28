import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component for role-based access control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Object} props.user - Current user object
 * @param {boolean} props.adminExists - Whether an admin user exists in the system
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectPath - Path to redirect to if unauthorized
 * @returns {React.ReactNode} - The protected component or redirect
 */
const ProtectedRoute = ({ 
  children, 
  user, 
  adminExists, 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  // Special case: if no admin exists, redirect to admin registration
  if (adminExists === false) {
    return <Navigate to="/admin-registration" replace />;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    const rolePath = user.role === 'admin' ? '/user-management' : '/create-prescription';
    return <Navigate to={rolePath} replace />;
  }
  
  // User is authorized, render the protected component
  return children;
};

export default ProtectedRoute;
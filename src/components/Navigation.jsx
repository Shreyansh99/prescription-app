import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

/**
 * Navigation component for the application
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.setUser - Function to update user state
 * @returns {React.ReactNode} - The navigation component
 */
const Navigation = ({ user, setUser }) => {
  const location = useLocation();
  
  // Don't show navigation on login or admin registration pages
  if (
    !user || 
    location.pathname === '/login' || 
    location.pathname === '/admin-registration'
  ) {
    return null;
  }
  
  const handleLogout = () => {
    setUser(null);
  };
  
  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <h1 className="text-xl font-bold">Prescription App</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Show different navigation options based on user role */}
          {user.role === 'admin' && (
            <>
              <Link 
                to="/user-management"
                className={`px-3 py-2 rounded-md ${location.pathname === '/user-management' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
              >
                User Management
              </Link>
              <Link 
                to="/backup"
                className={`px-3 py-2 rounded-md ${location.pathname === '/backup' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
              >
                Backup & Restore
              </Link>
            </>
          )}
          
          {user.role === 'moderator' && (
            <>
              <Link 
                to="/create-prescription"
                className={`px-3 py-2 rounded-md ${location.pathname === '/create-prescription' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
              >
                Create Prescription
              </Link>
              <Link 
                to="/view-prescriptions"
                className={`px-3 py-2 rounded-md ${location.pathname === '/view-prescriptions' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
              >
                View Prescriptions
              </Link>
              <Link 
                to="/backup"
                className={`px-3 py-2 rounded-md ${location.pathname === '/backup' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
              >
                Backup & Restore
              </Link>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">{user.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
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
    <nav
      className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-4">
            <div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Hospital Prescription System</h1>
              <p className="text-xs text-gray-500 leading-tight">Digital prescription management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2" role="menubar">
            {/* Show different navigation options based on user role */}
            {user.role === 'admin' && (
              <>
                <Link
                  to="/user-management"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/user-management'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/user-management' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="whitespace-nowrap">User Management</span>
                </Link>
                <Link
                  to="/view-prescriptions"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/view-prescriptions'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/view-prescriptions' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">View Prescriptions</span>
                </Link>
                <Link
                  to="/backup"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/backup'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/backup' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  <span className="whitespace-nowrap">Backup & Restore</span>
                </Link>
              </>
            )}
          
            {user.role === 'moderator' && (
              <>
                <Link
                  to="/create-prescription"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/create-prescription'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/create-prescription' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">Create Prescription</span>
                </Link>
                <Link
                  to="/view-prescriptions"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/view-prescriptions'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/view-prescriptions' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">View Prescriptions</span>
                </Link>
                <Link
                  to="/backup"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-9 ${
                    location.pathname === '/backup'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/backup' ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  <span className="whitespace-nowrap">Backup & Restore</span>
                </Link>
              </>
            )}
          
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-3" role="group" aria-label="User information">
                <div
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <span className="text-sm font-medium text-gray-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm min-w-0">
                  <p className="font-medium text-gray-900 truncate">Welcome, {user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 h-9 flex-shrink-0"
                aria-label="Sign out of your account"
              >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
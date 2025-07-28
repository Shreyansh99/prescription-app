import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreatePrescriptionPage from './pages/CreatePrescriptionPage';
import ViewPrescriptionsPage from './pages/ViewPrescriptionsPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import BackupPage from './pages/BackupPage';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Create a toast function that can be used globally
const ToastProvider = ({ children }) => {
  const { toast } = useToast();
  
  // Expose toast function to window for global access
  React.useEffect(() => {
    window.toast = toast;
    return () => {
      window.toast = undefined;
    };
  }, [toast]);
  
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [adminExists, setAdminExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const result = await window.api.checkAdminExists();
        setAdminExists(result.adminExists);
      } catch (error) {
        console.error('Error checking admin existence:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <MemoryRouter>
          {loading ? (
            <div className="flex items-center justify-center h-screen">
              <p>Loading application...</p>
            </div>
          ) : (
            <AppContent 
              user={user} 
              setUser={setUser} 
              adminExists={adminExists} 
              setAdminExists={setAdminExists} 
            />
          )}
        </MemoryRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
};

const AppContent = ({ user, setUser, adminExists, setAdminExists }) => {
  const navigate = useNavigate();
  
  // Handle initial routing based on authentication state
  useEffect(() => {
    if (!adminExists) {
      navigate('/admin-registration');
    } else if (!user) {
      navigate('/login');
    } else if (user.role === 'admin' && window.location.pathname === '/login') {
      navigate('/user-management');
    } else if (user.role === 'moderator' && window.location.pathname === '/login') {
      navigate('/create-prescription');
    }
  }, [user, adminExists, navigate]);
  
  const handleAdminRegistrationComplete = () => {
    setAdminExists(true);
    navigate('/login');
  };

  return (
    <>
      <Navigation user={user} setUser={setUser} />
      <div className="min-h-screen pt-16">
        <Routes>
          {/* Public routes */}
          <Route path="/admin-registration" element={
            adminExists ? (
              <Navigate to="/login" replace />
            ) : (
              <ErrorBoundary>
                <AdminRegistrationPage onRegistrationComplete={handleAdminRegistrationComplete} />
              </ErrorBoundary>
            )
          } />
          
          <Route path="/login" element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/user-management' : '/create-prescription'} replace />
            ) : (
              <ErrorBoundary>
                <LoginPage setUser={setUser} />
              </ErrorBoundary>
            )
          } />
          
          {/* Protected routes for moderators */}
          <Route path="/create-prescription" element={
            <ErrorBoundary>
              <ProtectedRoute user={user} adminExists={adminExists} allowedRoles={['moderator']}>
                <CreatePrescriptionPage />
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          
          <Route path="/view-prescriptions" element={
            <ErrorBoundary>
              <ProtectedRoute user={user} adminExists={adminExists} allowedRoles={['moderator']}>
                <ViewPrescriptionsPage />
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          
          {/* Protected routes for admins */}
          <Route path="/user-management" element={
            <ErrorBoundary>
              <ProtectedRoute user={user} adminExists={adminExists} allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          
          {/* Backup route - accessible by both admin and moderator */}
          <Route path="/backup" element={
            <ErrorBoundary>
              <ProtectedRoute user={user} adminExists={adminExists} allowedRoles={['admin', 'moderator']}>
                <BackupPage />
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={
            <Navigate to={!adminExists ? '/admin-registration' : !user ? '/login' : 
              user.role === 'admin' ? '/user-management' : '/create-prescription'} replace />
          } />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;

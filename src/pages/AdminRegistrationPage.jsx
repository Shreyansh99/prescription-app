import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { FormField } from '../components/ui/form-field';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { validatePassword, validateUsername } from '../utils/validation';

const AdminRegistrationPage = ({ onRegistrationComplete }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.message;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const result = await window.api.registerAdmin({
        username,
        password
      });
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Success",
          description: "Admin account created successfully. You can now log in.",
        });
        
        // Notify parent component that registration is complete
        setTimeout(() => {
          if (onRegistrationComplete) onRegistrationComplete();
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to create admin account",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Registration Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-green-600 mb-4">
              Admin account created successfully!
            </p>
            <p className="text-center">
              You will be redirected to the login page shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Prescription System</h1>
          <p className="text-gray-600">First-time setup - Create admin account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Admin Registration</CardTitle>
            <p className="text-center text-gray-600">
              Welcome to the first-time setup. Please create an admin account to continue.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleRegisterAdmin} className="space-y-6">
              <FormField
                label="Username"
                required
                error={errors.username}
                helpText="Choose a unique username for admin access"
              >
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isLoading}
                />
              </FormField>

              <FormField
                label="Password"
                required
                error={errors.password}
                helpText="Password must be at least 8 characters with uppercase, lowercase, and numbers"
              >
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isLoading}
                />
              </FormField>

              <FormField
                label="Confirm Password"
                required
                error={errors.confirmPassword}
                helpText="Re-enter your password to confirm"
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isLoading}
                />
              </FormField>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-medium mt-6"
                type="submit"
                disabled={isLoading || !username || !password || !confirmPassword}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>Creating Admin Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>👑</span>
                    <span>Create Admin Account</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            This will be your primary admin account for system management
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
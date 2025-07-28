import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { FormField } from '../components/ui/form-field';
import { Spinner } from '../components/ui/spinner';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { validatePassword, validateUsername } from '../utils/validation';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await window.api.getUsers();
      // Filter out admin users for display
      setUsers(usersList.filter(user => user.role === 'moderator'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    }
  };

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

  const handleCreateModerator = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await window.api.createModerator({
        username,
        password,
        createdBy: 'admin' // Assuming the current user is admin
      });
      
      toast({
        title: "Success",
        description: `Moderator ${username} created successfully`,
      });
      
      // Reset form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      
      // Reload users list
      loadUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create moderator",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModerator = async (username) => {
    if (window.confirm(`Are you sure you want to delete moderator ${username}?`)) {
      try {
        const result = await window.api.deleteModerator(username);
        if (result.success) {
          toast({
            title: "Success",
            description: result.message || "Moderator deleted successfully",
          });
          // Reload the users list
          loadUsers();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to delete moderator",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while deleting the moderator",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Manage moderator accounts and permissions</p>
            </div>
          </div>
          <Badge variant="info" className="px-3 py-1">
            Admin Panel
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Moderator Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm">➕</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create New Moderator</h2>
                  <p className="text-sm text-gray-600">Add a new moderator to the system</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateModerator} className="space-y-6">
                <FormField
                  label="Username"
                  required
                  error={errors.username}
                  helpText="Choose a unique username for the moderator"
                >
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter moderator username"
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
                  helpText="Re-enter the password to confirm"
                >
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </FormField>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-medium"
                  type="submit"
                  disabled={isLoading || !username || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Creating Moderator...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>Create Moderator</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        
          {/* Moderators List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Active Moderators</h2>
                    <p className="text-sm text-gray-600">Manage existing moderator accounts</p>
                  </div>
                </div>
                <Badge variant="success" className="px-3 py-1">
                  {users.length} moderators
                </Badge>
              </div>
            </div>

            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No moderators found</h3>
                  <p className="text-gray-500 mb-4">Create your first moderator account to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.username} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Created: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="hover:bg-red-600"
                          >
                            <span className="mr-2">🗑️</span>
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Moderator</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the moderator "{user.username}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteModerator(user.username)}
                            >
                              Delete Moderator
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;

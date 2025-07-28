import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Moderator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Moderator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateModerator}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <Button className="mt-4 w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Moderator'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Moderators List */}
        <Card>
          <CardHeader>
            <CardTitle>Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground">No moderators found</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.username} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteModerator(user.username)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;

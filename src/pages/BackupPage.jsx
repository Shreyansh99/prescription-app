import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { Badge } from '../components/ui/badge';
import { FormField } from '../components/ui/form-field';

const BackupPage = () => {
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const handleExportData = async () => {
    try {
      setExportLoading(true);

      // Get all data from the application
      const prescriptions = await window.api.getPrescriptions();
      const users = await window.api.getUsers();

      // Check for API errors
      if (prescriptions && prescriptions.error) {
        throw new Error(prescriptions.error);
      }
      if (users && users.error) {
        throw new Error(users.error);
      }

      // Create a backup object with all data
      const backupData = {
        prescriptions: prescriptions || [],
        users: (users || []).map(user => {
          // Remove sensitive data like passwords
          const { password, ...safeUserData } = user;
          return safeUserData;
        }),
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          description: 'Prescription App Backup'
        }
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Backup Exported',
        description: 'Your data has been successfully exported.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export backup data. Please try again.',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a backup file to import.',
      });
      return;
    }

    try {
      setImportLoading(true);
      
      // Read the file
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          // Validate the backup file structure
          if (!jsonData.metadata || !jsonData.prescriptions) {
            throw new Error('Invalid backup file format');
          }
          
          // Send the data to the main process for import
          const result = await window.api.importBackup(jsonData);

          if (result && result.success) {
            toast({
              title: 'Import Successful',
              description: result.message || 'Your data has been successfully imported.',
            });

            // Reset the file input
            setImportFile(null);
            const fileInput = document.getElementById('import-file');
            if (fileInput) fileInput.value = '';
          } else {
            throw new Error(result?.message || 'Import failed');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'The selected file is not a valid backup file.',
          });
        } finally {
          setImportLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setImportLoading(false);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'Failed to read the backup file.',
        });
      };
      
      fileReader.readAsText(importFile);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportLoading(false);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Failed to import backup data. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Backup & Restore</h1>
              <p className="text-sm text-gray-500">Manage data backup and restoration</p>
            </div>
          </div>
          <Badge variant="info" className="px-3 py-1">
            Admin & Moderator
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
                  <p className="text-sm text-gray-600">Create a backup of all prescription data</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <Alert variant="info">
                  <AlertDescription>
                    This will create a backup file containing all prescriptions and user information (excluding passwords).
                    You can use this file to restore your data later or transfer it to another installation.
                  </AlertDescription>
                </Alert>
              </div>

              <Button
                onClick={handleExportData}
                disabled={exportLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-medium"
              >
                {exportLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>Creating Backup...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Export Backup</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        
          {/* Import Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
                  <p className="text-sm text-gray-600">Restore data from a backup file</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <Alert variant="warning">
                  <AlertDescription>
                    <strong>Warning:</strong> Importing data will merge the backup data with your existing data.
                    This operation cannot be undone. Make sure to export your current data first if needed.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-6">
                <FormField
                  label="Select Backup File"
                  required
                  helpText="Choose a JSON backup file to restore"
                >
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={importLoading}
                  />
                </FormField>

                <Button
                  onClick={handleImportData}
                  disabled={importLoading || !importFile}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-medium"
                >
                  {importLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Importing Data...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Import Backup</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
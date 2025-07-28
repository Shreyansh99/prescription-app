import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';

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
      
      // Create a backup object with all data
      const backupData = {
        prescriptions,
        users: users.map(user => {
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
          
          if (result.success) {
            toast({
              title: 'Import Successful',
              description: 'Your data has been successfully imported.',
            });
            
            // Reset the file input
            setImportFile(null);
            const fileInput = document.getElementById('import-file');
            if (fileInput) fileInput.value = '';
          } else {
            throw new Error(result.message || 'Import failed');
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Backup & Restore</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Export all prescription and user data to a backup file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This will create a backup file containing all prescriptions and user information (excluding passwords).
              You can use this file to restore your data later or transfer it to another installation.
            </p>
            <Button 
              onClick={handleExportData} 
              disabled={exportLoading}
              className="w-full"
            >
              {exportLoading ? 'Exporting...' : 'Export Backup'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Restore data from a previously exported backup file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a backup file to restore your data. This will merge the backup data with your existing data.
                <strong className="block mt-1 text-destructive">Note: This operation cannot be undone.</strong>
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="import-file">Select Backup File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  disabled={importLoading}
                />
              </div>
              
              <Button 
                onClick={handleImportData} 
                disabled={importLoading || !importFile}
                className="w-full"
                variant="outline"
              >
                {importLoading ? 'Importing...' : 'Import Backup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupPage;
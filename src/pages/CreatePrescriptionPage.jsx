import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { FormField } from '../components/ui/form-field';
import { Spinner } from '../components/ui/spinner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { validateAadhar, validateMobile } from '../utils/validation';

const CreatePrescriptionPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    department: '',
    type: '',
    roomNumber: '',
    address: '',
    aadharNumber: '',
    mobileNumber: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Age must be a positive number';
    }
    
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.type) newErrors.type = 'Type is required';
    
    // Optional fields with validation
    if (formData.roomNumber && (isNaN(formData.roomNumber) || parseInt(formData.roomNumber) <= 0)) {
      newErrors.roomNumber = 'Room number must be a positive number';
    }
    
    // Validate Aadhar number using utility function
    const aadharValidation = validateAadhar(formData.aadharNumber);
    if (!aadharValidation.isValid) {
      newErrors.aadharNumber = aadharValidation.message;
    }
    
    // Validate mobile number using utility function
    const mobileValidation = validateMobile(formData.mobileNumber);
    if (!mobileValidation.isValid) {
      newErrors.mobileNumber = mobileValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Add date/time
      const prescriptionData = {
        ...formData,
        dateTime: new Date().toISOString(),
      };
      
      // Note: The main process will sanitize the data before saving
      const result = await window.api.savePrescription(prescriptionData);
      
      // Show success message
      toast({
        title: "Success",
        description: "Prescription saved successfully",
      });
      
      // Show the summary
      setSavedPrescription(result);
      setShowSummary(true);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save prescription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNew = () => {
    // Reset form
    setFormData({
      patientName: '',
      age: '',
      gender: '',
      department: '',
      type: '',
      roomNumber: '',
      address: '',
      aadharNumber: '',
      mobileNumber: '',
    });
    setErrors({});
    setShowSummary(false);
    setSavedPrescription(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
      
      {showSummary ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Prescription Summary */}
          <Card className="prescription-summary">
            <CardHeader>
              <CardTitle>Prescription Summary</CardTitle>
              <CardDescription>
                Registration Number: {savedPrescription.registrationNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Patient Information</h3>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="font-medium">Name:</span> {savedPrescription.patientName}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {savedPrescription.age}
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {savedPrescription.gender}
                    </div>
                    <div>
                      <span className="font-medium">Date/Time:</span> {formatDate(savedPrescription.dateTime)}
                    </div>
                    {savedPrescription.address && (
                      <div>
                        <span className="font-medium">Address:</span> {savedPrescription.address}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold">Hospital Information</h3>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="font-medium">Department:</span> {savedPrescription.department}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {savedPrescription.type}
                    </div>
                    {savedPrescription.roomNumber && (
                      <div>
                        <span className="font-medium">Room Number:</span> {savedPrescription.roomNumber}
                      </div>
                    )}
                    {savedPrescription.aadharNumber && (
                      <div>
                        <span className="font-medium">Aadhar Number:</span> {savedPrescription.aadharNumber}
                      </div>
                    )}
                    {savedPrescription.mobileNumber && (
                      <div>
                        <span className="font-medium">Mobile Number:</span> {savedPrescription.mobileNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCreateNew}>
                Create New Prescription
              </Button>
              <Button onClick={handlePrint}>
                Print Prescription
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Form Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hospital Prescription Form</h2>
                <p className="text-sm text-gray-600">Fill in the patient information to generate a prescription</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Registration Number and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  Registration Number
                </label>
                <div className="text-2xl font-bold text-blue-900">000025</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Date & Time
                </label>
                <div className="text-lg font-semibold text-green-900">{new Date().toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <FormField
                    label="Patient Name"
                    required
                    error={errors.patientName}
                    helpText="Enter the full name of the patient"
                  >
                    <Input
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="Enter patient full name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormField>
                  
                  <FormField
                    label="Age"
                    required
                    error={errors.age}
                    helpText="Patient's age in years"
                  >
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age in years"
                      min="0"
                      max="150"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormField>
                  
                  <FormField
                    label="Gender"
                    required
                    error={errors.gender}
                    helpText="Select patient's gender"
                  >
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  
                  <FormField
                    label="Department"
                    required
                    error={errors.department}
                    helpText="Select the hospital department"
                  >
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleSelectChange('department', value)}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPD">OPD (Outpatient Department)</SelectItem>
                        <SelectItem value="IPD">IPD (Inpatient Department)</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANC">ANC</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="JSSK">JSSK</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-500">{errors.type}</p>
                    )}
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number (Optional)</Label>
                    <Input
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      placeholder="Enter room number"
                    />
                    {errors.roomNumber && (
                      <p className="text-sm text-red-500">{errors.roomNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number (Optional)</Label>
                    <Input
                      id="aadharNumber"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength={12}
                    />
                    {errors.aadharNumber && (
                      <p className="text-sm text-red-500">{errors.aadharNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-red-500">{errors.mobileNumber}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Creating Prescription...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Create Prescription</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .prescription-summary,
          .prescription-summary * {
            visibility: visible;
          }
          .prescription-summary {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .prescription-summary button {
            display: none;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;

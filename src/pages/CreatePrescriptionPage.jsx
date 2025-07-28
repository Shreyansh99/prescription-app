import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">🏥</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Hospital Prescription System</h1>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
              + New Prescription
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              📋 View Prescriptions
            </button>
          </div>
        </div>
      </div>

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
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">📋</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Hospital Prescription Form</h2>
            </div>
            <p className="text-sm text-gray-600">Fill in the patient information to generate a prescription</p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Registration Number and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">📋 Registration Number</label>
                <div className="text-lg font-semibold text-gray-900">000025</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">📅 Date & Time</label>
                <div className="text-lg font-semibold text-gray-900">{new Date().toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">Patient Name *</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="Enter patient name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.patientName && (
                      <p className="text-sm text-red-500">{errors.patientName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500">{errors.age}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => handleSelectChange('department', value)}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPD">OPD</SelectItem>
                        <SelectItem value="IPD">IPD</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-red-500">{errors.department}</p>
                    )}
                  </div>
                  
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
              
              <div className="mt-6">
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Create Prescription'}
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

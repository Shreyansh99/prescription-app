import React, { useState, useEffect } from 'react';
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
  const [nextRegNumber, setNextRegNumber] = useState(30); // Starting with 30 as shown in the image
  
  // Fetch the next registration number when component mounts
  useEffect(() => {
    const fetchNextRegNumber = async () => {
      try {
        const prescriptions = await window.api.getPrescriptions();
        if (prescriptions && prescriptions.length > 0) {
          // Find the maximum registration number and add 1
          const maxRegNumber = Math.max(...prescriptions.map(p => p.registrationNumber || 0));
          setNextRegNumber(maxRegNumber + 1);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };
    
    fetchNextRegNumber();
  }, []);

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
          {/* Navigation Buttons */}
          <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={handleCreateNew} className="px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Form
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Prescription
            </Button>
          </div>
          
          {/* Prescription Summary */}
          <Card className="prescription-summary bg-white shadow-md border border-gray-200">
            <div className="flex justify-between items-center p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V18C19 18.55 18.55 19 18 19Z" fill="currentColor"/>
                    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">City General Hospital</h2>
                  <p className="text-sm text-gray-600">Healthcare Excellence Since 1985</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">NO. {String(savedPrescription.registrationNumber).padStart(6, '0')}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 uppercase">PRESCRIPTION</h1>
                <p className="text-sm text-gray-600 mt-1">Date: {formatDate(savedPrescription.dateTime)}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border-b pb-4 md:border-b-0 md:border-r md:pr-6">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Patient Information</h3>
                  <div className="grid grid-cols-[120px_1fr] gap-y-2">
                    <div className="text-gray-600">Name:</div>
                    <div className="font-medium">{savedPrescription.patientName}</div>
                    
                    <div className="text-gray-600">Age:</div>
                    <div className="font-medium">{savedPrescription.age} years</div>
                    
                    <div className="text-gray-600">Gender:</div>
                    <div className="font-medium">{savedPrescription.gender}</div>
                    
                    <div className="text-gray-600">Mobile:</div>
                    <div className="font-medium">{savedPrescription.mobileNumber}</div>
                    
                    <div className="text-gray-600">Room No:</div>
                    <div className="font-medium">{savedPrescription.roomNumber || 'd'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Medical Information</h3>
                  <div className="grid grid-cols-[120px_1fr] gap-y-2">
                    <div className="text-gray-600">Department:</div>
                    <div className="font-medium">{savedPrescription.department}</div>
                    
                    <div className="text-gray-600">Type:</div>
                    <div className="font-medium">
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm">
                        {savedPrescription.type}
                      </span>
                    </div>
                    
                    <div className="text-gray-600">Address:</div>
                    <div className="font-medium">{savedPrescription.address || 'Near grace arjun homes.salbari Salbari.siliguri'}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Prescription Details</h3>
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500 italic">
                  Prescription details and medications will be filled by the doctor.
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-end">
                <div className="text-sm text-gray-500">
                  <p>Generated on {new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}</p>
                  <p>This is a computer-generated prescription.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Doctor's Signature</p>
                  <div className="w-32 border-b border-gray-400"></div>
                  <p className="text-sm text-gray-600 mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
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
                <div className="text-2xl font-bold text-blue-900">NO. {String(nextRegNumber).padStart(6, '0')}</div>
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

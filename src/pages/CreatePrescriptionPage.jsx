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
    paymentMethod: '',
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
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    
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
      // Add date/time and registration number
      const prescriptionData = {
        ...formData,
        dateTime: new Date().toISOString(),
        registrationNumber: nextRegNumber,
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
      
      // Increment the registration number for next prescription
      setNextRegNumber(nextRegNumber + 1);
      
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
      paymentMethod: '',
    });
    setErrors({});
    setShowSummary(false);
    setSavedPrescription(null);
  };
  
  const handleNavigateToCreate = () => {
    // Just reset the form to navigate to create prescription
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
            <Button variant="outline" onClick={handleNavigateToCreate} className="px-4 flex items-center gap-2 border-gray-300 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Form
            </Button>
            <Button variant="outline" onClick={handlePrint} className="px-4 flex items-center gap-2 border-gray-300 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Prescription
            </Button>
          </div>
          
          {/* Prescription Summary */}
          <Card className="prescription-summary bg-white shadow-md border border-gray-200">
            <div className="flex justify-between items-center p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex-1 text-center">
                <p className="text-red-600 font-bold">गर्भ में लड़का-लड़की का पता करना गैर कानूनी है।</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-600 border-b border-gray-200">
              <div className="flex-1 text-center">
                <p className="text-white font-bold">उप जिला चिकित्सालय प्रेमनगर, देहरादून</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="border border-gray-300 inline-block p-2">
                    <h2 className="text-lg font-bold">H</h2>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-xl font-bold text-gray-900">बाह्य रोगी कार्ड</h1>
                  <p className="text-sm text-gray-600 mt-1">(यह पर्ची केवल 15 दिन के लिए वैध है)</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-gray-600">पंजीकरण शुल्क</p>
                  <p className="text-lg font-bold">{String(savedPrescription.registrationNumber).padStart(5, '0')}</p>
                  <div className="mt-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seal_of_Uttarakhand.svg/100px-Seal_of_Uttarakhand.svg.png" 
                         alt="Uttarakhand Logo" 
                         className="h-12 ml-auto" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="border-b pb-4">
                  <div className="grid grid-cols-[120px_1fr] gap-y-2">
                    <div className="text-gray-600">रजि. नं.:</div>
                    <div className="font-medium border-b border-gray-300"></div>
                    
                    <div className="text-gray-600">दिनांक:</div>
                    <div className="font-medium border-b border-gray-300"></div>
                    
                    <div className="text-gray-600">समय:</div>
                    <div className="font-medium border-b border-gray-300"></div>
                    
                    <div className="text-gray-600">रोगी का नाम:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.patientName}</div>
                    
                    <div className="text-gray-600">रोगी का पता:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.address || 'N/A'}</div>
                    
                    <div className="text-gray-600">फोन नं0:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.mobileNumber}</div>
                    
                    <div className="text-gray-600">आयु:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.age}</div>
                    
                    <div className="text-gray-600">लिंग:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.gender}</div>
                    
                    <div className="text-gray-600">आधार नं0:</div>
                    <div className="font-medium border-b border-gray-300">{savedPrescription.aadharNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-2 text-left">वजन / कद</th>
                      <th className="border border-gray-400 p-2 text-left">Presenting Complaints/शिकायत</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 p-2 h-10"></td>
                      <td className="border border-gray-400 p-2 h-10"></td>
                    </tr>
                  </tbody>
                </table>
                
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-2 text-left">रक्त चाप</th>
                      <td className="border border-gray-400 p-2 h-10"></td>
                    </tr>
                  </thead>
                </table>
                
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-2 text-left">शर्करा</th>
                      <td className="border border-gray-400 p-2 h-10"></td>
                    </tr>
                  </thead>
                </table>
                
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-2 text-left">अन्य (परमर्शदाता)</th>
                      <td className="border border-gray-400 p-2 h-10"></td>
                    </tr>
                  </thead>
                </table>
                
                <div className="mt-4">
                  <p className="font-bold">Provisional / Final Diagnosis :</p>
                  <div className="border-b border-gray-400 h-8 mt-2"></div>
                </div>
                
                <div className="mt-4">
                  <div className="flex">
                    <div className="w-1/3 border-r border-gray-400">
                      <p className="font-bold">परीक्षण / जाँच</p>
                    </div>
                    <div className="w-2/3">
                      <p className="font-bold">दवा का नाम (जहां तक संभव हो सामान्य रसायनिक नाम बड़े अक्षरों में ) अवधि एवं खुराक</p>
                    </div>
                  </div>
                  <div className="flex h-64">
                    <div className="w-1/3 border-r border-t border-gray-400"></div>
                    <div className="w-2/3 border-t border-gray-400"></div>
                  </div>
                </div>
                
                <div className="mt-8 text-right">
                  <p className="text-sm text-gray-600 mb-1">चिकित्सक के हस्ताक्षर एवं तिथि</p>
                  <p className="text-sm text-gray-600 mb-1">(नाम एवं पदनाम की मुहर)</p>
                  <div className="w-32 border-b border-gray-400 ml-auto"></div>
                </div>
                
                <div className="mt-8 text-center text-xs border-t border-gray-300 pt-2">
                  <p>चिकित्सालय परिसर में धूम्रपान व मद्यपान वर्जित क्षेत्र है कृपया इसे साफ रखने में सहयोग करें</p>
                  <p className="mt-1">नोट: जन्म, मृत्यु रजिस्ट्रेशन घटना के 21 दिन के अन्तर्गत निःशुल्क है। रजिस्ट्रेशन समय सीमा के अन्तर्गत निःशुल्क कराये।</p>
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
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[150px] border-blue-300">
                        <SelectItem value="Male" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Male</SelectItem>
                        <SelectItem value="Female" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Female</SelectItem>
                        <SelectItem value="Others" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Others</SelectItem>
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
                      <SelectContent className="min-w-[250px] border-blue-300">
                        <SelectItem value="Cardiology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Cardiology</SelectItem>
                        <SelectItem value="Cardiologist" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Cardiologist</SelectItem>
                        <SelectItem value="Dental" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Dental</SelectItem>
                        <SelectItem value="Dermatology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Dermatology</SelectItem>
                        <SelectItem value="ENT" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">ENT</SelectItem>
                        <SelectItem value="General Physician" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">General Physician</SelectItem>
                        <SelectItem value="Gynecology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Gynecology</SelectItem>
                        <SelectItem value="Lab" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Lab</SelectItem>
                        <SelectItem value="Neurology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Neurology</SelectItem>
                        <SelectItem value="OPD" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">OPD (Outpatient Department)</SelectItem>
                        <SelectItem value="Oncology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Oncology</SelectItem>
                        <SelectItem value="OT Major" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">OT Major</SelectItem>
                        <SelectItem value="OT Minor" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">OT Minor</SelectItem>
                        <SelectItem value="Pediatrics" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Pediatrics</SelectItem>
                        <SelectItem value="Psychiatry" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Psychiatry</SelectItem>
                        <SelectItem value="Radiology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Radiology</SelectItem>
                        <SelectItem value="Surgeon" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Surgeon</SelectItem>
                        <SelectItem value="Urology" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Urology</SelectItem>
                        <SelectItem value="X-Ray" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">X-Ray</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger id="type" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[150px] border-blue-300">
                        <SelectItem value="ANC" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">ANC</SelectItem>
                        <SelectItem value="FREEDOM FIGHTER" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">FREEDOM FIGHTER</SelectItem>
                        <SelectItem value="General" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">General</SelectItem>
                        <SelectItem value="JSSK" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">JSSK</SelectItem>
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
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      placeholder="Enter room number"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                    {errors.roomNumber && (
                      <p className="text-sm text-red-500">{errors.roomNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength={12}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                    {errors.aadharNumber && (
                      <p className="text-sm text-red-500">{errors.aadharNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-red-500">{errors.mobileNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                    >
                      <SelectTrigger id="paymentMethod" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[180px] border-blue-300">
                        <SelectItem value="Cash" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Cash</SelectItem>
                        <SelectItem value="Online" className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-sm text-red-500">{errors.paymentMethod}</p>
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

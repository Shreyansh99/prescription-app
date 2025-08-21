import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FormField } from '../components/ui/form-field';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewPrescriptionsPage = () => {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: 'all',
    department: 'all',
    type: 'all',
    ageGroup: 'all'
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, prescriptions]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await window.api.getPrescriptions();
      setPrescriptions(data);
      setFilteredPrescriptions(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load prescriptions",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...prescriptions];

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(p => p.department === filters.department);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(p => p.type === filters.type);
    }
    
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      switch(filters.ageGroup) {
        case 'child':
          filtered = filtered.filter(p => parseInt(p.age) < 13);
          break;
        case 'teen':
          filtered = filtered.filter(p => parseInt(p.age) >= 13 && parseInt(p.age) < 20);
          break;
        case 'adult':
          filtered = filtered.filter(p => parseInt(p.age) >= 20 && parseInt(p.age) < 40);
          break;
        case 'middle':
          filtered = filtered.filter(p => parseInt(p.age) >= 40 && parseInt(p.age) < 60);
          break;
        case 'senior':
          filtered = filtered.filter(p => parseInt(p.age) >= 60);
          break;
        default:
          break;
      }
    }

    setFilteredPrescriptions(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      gender: 'all',
      department: 'all',
      type: 'all',
      ageGroup: 'all'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const exportToExcel = () => {
    try {
      // Prepare data with proper formatting
      const excelData = filteredPrescriptions.map(prescription => ({
        'Registration No.': prescription.registrationNumber,
        'Date & Time': formatDate(prescription.dateTime),
        'Patient Name': prescription.patientName,
        'Age': prescription.age,
        'Gender': prescription.gender,
        'Department': prescription.department,
        'Type': prescription.type,
        'Room No.': prescription.roomNumber || 'N/A',
        'Address': prescription.address || 'N/A',
        'Aadhar Number': prescription.aadharNumber || 'N/A',
        'Mobile Number': prescription.mobileNumber || 'N/A',
        'Doctor Notes': prescription.doctorNotes || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();

      // Set column widths for better readability
      const columnWidths = [
        { wch: 12 }, // Registration No.
        { wch: 18 }, // Date & Time
        { wch: 20 }, // Patient Name
        { wch: 8 },  // Age
        { wch: 10 }, // Gender
        { wch: 15 }, // Department
        { wch: 12 }, // Type
        { wch: 10 }, // Room No.
        { wch: 25 }, // Address
        { wch: 15 }, // Aadhar Number
        { wch: 15 }, // Mobile Number
        { wch: 25 }  // Doctor Notes
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Prescriptions");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `prescriptions_${currentDate}.xlsx`;

      XLSX.writeFile(workbook, filename);

      toast({
        title: "Success",
        description: `Prescriptions exported to ${filename}`,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export prescriptions to Excel",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({orientation: 'landscape', unit: 'mm', format: 'a4'});
      
      // Set document properties for better PDF metadata
      doc.setProperties({
        title: 'Hospital Prescriptions Report',
        subject: 'Patient Prescriptions',
        author: 'Hospital Prescription System',
        keywords: 'prescriptions, medical, report',
        creator: 'Hospital Prescription System'
      });
      
      // Define reusable function for headers and footers
      const addHeaderAndFooter = () => {
        // Modern Header with blue background
        doc.setFillColor(41, 98, 255); // Blue background
        doc.rect(0, 0, 297, 15, 'F'); // Full width header bar
        
        // Title in white text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Hospital Prescriptions Report", 10, 10);
        
        // Reset text color for rest of the document
        doc.setTextColor(0, 0, 0);
        
        // Add generation info
         doc.setFontSize(9);
         doc.setFont('helvetica', 'normal');
         doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 10);
        
        // Footer with page numbers only
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        // Page numbers at bottom right
        doc.setFontSize(8);
        doc.text(`Page ${currentPage} of ${pageCount}`, 250, 200);
      };
      
      // Set callback for page drawing to ensure headers/footers on all pages
      doc.setPage(1);
      // Apply autoTable to the document
      autoTable(doc, {
        didDrawPage: addHeaderAndFooter,
        margin: { top: 20 },
        headStyles: { 
          fillColor: [41, 98, 255],
          textColor: [255, 255, 255],
          halign: 'center',
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 247, 255] // Light blue for alternate rows
        },
        // Column styles with width and alignment
         columnStyles: {
           0: { halign: 'center', cellWidth: 20 },  // Reg No
           1: { cellWidth: 30 },                    // Date
           2: { cellWidth: 40 },                    // Name
           3: { halign: 'center', cellWidth: 10 },  // Age
           4: { halign: 'center', cellWidth: 15 },  // Gender
           5: { cellWidth: 30 },                    // Department
           6: { halign: 'center', cellWidth: 20 },  // Type
           7: { cellWidth: 15 },                    // Room
           8: { cellWidth: 25 }                     // Mobile
         },
        head: [[
          'Reg. No.',
          'Date & Time',
          'Patient Name',
          'Age',
          'Gender',
          'Department',
          'Type',
          'Room No.',
          'Mobile'
        ]],
        body: filteredPrescriptions.map(prescription => {
          // Format registration number with leading zeros if needed
          const regNumber = String(prescription.registrationNumber).padStart(6, '0');
          
          // Format date properly
          const formattedDate = formatDate(prescription.dateTime);
          
          return [
            regNumber,
            formattedDate,
            prescription.patientName,
            prescription.age,
            prescription.gender,
            prescription.department,
            prescription.type,
            prescription.roomNumber || 'N/A',
            prescription.mobileNumber || 'N/A'
          ];
        }),
        styles: { overflow: 'linebreak', cellWidth: 'auto' }
      });
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `prescriptions_report_${currentDate}.pdf`;
      
      doc.save(filename);
      
      toast({
        title: "Success",
        description: `PDF report saved as ${filename}`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export prescriptions to PDF. Please try again.",
      });
    }
  };

  const printPrescriptions = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');

      // Generate HTML content for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescriptions Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .info {
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #3b82f6;
              color: white;
              font-weight: bold;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #e2e8f0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hospital Prescription System</h1>
            <p>Patient Prescriptions Report</p>
          </div>

          <div class="info">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Records:</strong> ${filteredPrescriptions.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Reg#</th>
                <th>Date & Time</th>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Department</th>
                <th>Type</th>
                <th>Room</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPrescriptions.map(prescription => {

                return `
                  <tr>
                    <td style="text-align: center;">${prescription.registrationNumber}</td>
                    <td>${formatDate(prescription.dateTime)}</td>
                    <td><strong>${prescription.patientName}</strong></td>
                    <td style="text-align: center;">${prescription.age}</td>
                    <td style="text-align: center;">${prescription.gender}</td>
                    <td>${prescription.department}</td>
                    <td style="text-align: center;">${prescription.type}</td>
                    <td style="text-align: center;">${prescription.roomNumber || 'N/A'}</td>
                    <td>${prescription.mobileNumber || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Hospital Prescription System</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast({
        title: "Success",
        description: "Print dialog opened",
      });
    } catch (error) {
      console.error('Print error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open print dialog",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescriptions</h2>
          <p className="text-gray-600">View and Export all patient prescriptions</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                <p className="text-sm text-gray-600">Find and filter prescriptions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <FormField label="Search Prescriptions" helpText="Search by patient name, registration number, or other details">
                <Input
                  type="text"
                  placeholder="Search by name, registration number, or details..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormField label="From Date" helpText="Select start date for filtering">
                <Input
                  type="date"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
              <FormField label="To Date" helpText="Select end date for filtering">
                <Input
                  type="date"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <FormField label="Gender" helpText="Filter by patient gender">
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange('gender', value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Department" helpText="Filter by hospital department">
                <Select
                  value={filters.department}
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Type" helpText="Filter by prescription type">
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ANC">ANC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="JSSK">JSSK</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Age Group" helpText="Filter by patient age range">
                <Select
                  value={filters.ageGroup}
                  onValueChange={(value) => handleFilterChange('ageGroup', value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Age Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Age Groups</SelectItem>
                    <SelectItem value="child">Children (0-12)</SelectItem>
                    <SelectItem value="teen">Teenagers (13-19)</SelectItem>
                    <SelectItem value="adult">Adults (20-39)</SelectItem>
                    <SelectItem value="middle">Middle-aged (40-59)</SelectItem>
                    <SelectItem value="senior">Seniors (60+)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Clear All Filters
              </Button>
              <div className="flex items-center gap-4">
                <Badge variant="info" className="px-3 py-1">
                  {filteredPrescriptions.length} prescriptions found
                </Badge>
                <div className="text-sm text-gray-600">
                  Total: {filteredPrescriptions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      
        {/* Prescriptions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Prescriptions</h3>
                  <p className="text-sm text-gray-600">View and export all patient prescriptions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="success" className="px-3 py-1 text-sm">
                  {filteredPrescriptions.length} records
                </Badge>
                <Button
                  variant="outline"
                  onClick={printPrescriptions}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  disabled={filteredPrescriptions.length === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0v2h6v-2H6zm9 0v-2h1v2h-1z" clipRule="evenodd" />
                  </svg>
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToPDF}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  disabled={filteredPrescriptions.length === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={filteredPrescriptions.length === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Export Excel
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading prescriptions...</p>
                    <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                  </div>
                </div>
                {/* Skeleton loader */}
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <Button variant="outline" onClick={resetFilters}>
                  <span className="mr-2">🔄</span>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Registration No.</TableHead>
                    <TableHead className="font-semibold text-gray-700">Patient Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Age</TableHead>
                    <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                    <TableHead className="font-semibold text-gray-700">Room No.</TableHead>
                    <TableHead className="font-semibold text-gray-700">Department</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription, index) => (
                    <TableRow key={prescription.registrationNumber} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <TableCell className="font-medium text-blue-600">{prescription.registrationNumber}</TableCell>
                      <TableCell className="font-medium">{prescription.patientName}</TableCell>
                      <TableCell>{prescription.age}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {prescription.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>{prescription.roomNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {prescription.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="text-xs">
                          {prescription.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(prescription.dateTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescriptionsPage;

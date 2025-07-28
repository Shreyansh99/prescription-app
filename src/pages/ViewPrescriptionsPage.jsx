import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ViewPrescriptionsPage = () => {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: 'all',
    department: 'all',
    type: 'all'
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
      type: 'all'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredPrescriptions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Prescriptions");
      
      // Format column headers
      const headerStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
      
      // Apply styles to header row
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) continue;
        worksheet[cellRef].s = headerStyle;
      }
      
      XLSX.writeFile(workbook, "prescriptions.xlsx");
      
      toast({
        title: "Success",
        description: "Prescriptions exported to Excel",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export prescriptions",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Prescriptions", 14, 22);
      doc.setFontSize(10);
      
      // Prepare table data
      const tableColumn = [
        "Reg. No.", "Date/Time", "Patient Name", "Age", "Gender", 
        "Department", "Type", "Room No.", "Address", "Aadhar", "Mobile"
      ];
      
      const tableRows = [];
      
      filteredPrescriptions.forEach(prescription => {
        const prescriptionData = [
          prescription.registrationNumber,
          formatDate(prescription.dateTime),
          prescription.patientName,
          prescription.age,
          prescription.gender,
          prescription.department,
          prescription.type,
          prescription.roomNumber || "-",
          prescription.address || "-",
          prescription.aadharNumber || "-",
          prescription.mobileNumber || "-"
        ];
        tableRows.push(prescriptionData);
      });
      
      // Auto-adjust font size to fit all columns on a single page
      const totalPrescriptions = filteredPrescriptions.length;
      let fontSize = 8; // Default font size
      
      if (totalPrescriptions > 20) {
        fontSize = 6;
      } else if (totalPrescriptions > 10) {
        fontSize = 7;
      }
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: fontSize },
        columnStyles: {
          0: { cellWidth: 15 }, // Reg No
          1: { cellWidth: 25 }, // Date/Time
          2: { cellWidth: 25 }, // Patient Name
          3: { cellWidth: 10 }, // Age
          4: { cellWidth: 15 }, // Gender
          5: { cellWidth: 20 }, // Department
          6: { cellWidth: 15 }, // Type
          7: { cellWidth: 15 }, // Room No
          8: { cellWidth: 25 }, // Address
          9: { cellWidth: 20 }, // Aadhar
          10: { cellWidth: 20 } // Mobile
        },
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(`Generated on ${new Date().toLocaleString()}`, 10, pageHeight - 10);
        }
      });
      
      doc.save("prescriptions.pdf");
      
      toast({
        title: "Success",
        description: "Prescriptions exported to PDF",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export prescriptions",
      });
    }
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescriptions</h2>
          <p className="text-gray-600">View and Export all patient prescriptions</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or registration..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange('gender', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Select
                  value={filters.department}
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ANC">ANC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="JSSK">JSSK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ❌ Clear All Filters
              </button>
              <div className="text-sm text-gray-600">
                Showing {filteredPrescriptions.length} prescriptions
              </div>
            </div>
          </div>
        </div>
      
        {/* Prescriptions Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Prescriptions ({filteredPrescriptions.length})</h3>
              <p className="text-sm text-gray-600">Showing {filteredPrescriptions.length} prescriptions</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                📄 Export PDF (24)
              </button>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                📊 Export Excel (24)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <p>Loading prescriptions...</p>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No prescriptions found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription, index) => (
                    <tr key={prescription.registrationNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{prescription.registrationNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.roomNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {prescription.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(prescription.dateTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescriptionsPage;

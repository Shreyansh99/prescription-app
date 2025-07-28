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
    gender: '',
    department: '',
    type: ''
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

    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    if (filters.department) {
      filtered = filtered.filter(p => p.department === filters.department);
    }

    if (filters.type) {
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
      gender: '',
      department: '',
      type: ''
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">View Prescriptions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select 
                value={filters.gender} 
                onValueChange={(value) => handleFilterChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filters.department} 
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="OPD">OPD</SelectItem>
                  <SelectItem value="IPD">IPD</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="ANC">ANC</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="JSSK">JSSK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Button variant="outline" onClick={resetFilters} className="mr-2">
                Reset Filters
              </Button>
              <div className="flex-1"></div>
              <Button variant="outline" onClick={exportToExcel} className="mr-2">
                Export Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading prescriptions...</div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-4">No prescriptions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Reg. No.</th>
                    <th className="border p-2 text-left">Date/Time</th>
                    <th className="border p-2 text-left">Patient Name</th>
                    <th className="border p-2 text-left">Age</th>
                    <th className="border p-2 text-left">Gender</th>
                    <th className="border p-2 text-left">Department</th>
                    <th className="border p-2 text-left">Type</th>
                    <th className="border p-2 text-left">Room No.</th>
                    <th className="border p-2 text-left">Address</th>
                    <th className="border p-2 text-left">Aadhar</th>
                    <th className="border p-2 text-left">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.registrationNumber} className="hover:bg-gray-50">
                      <td className="border p-2">{prescription.registrationNumber}</td>
                      <td className="border p-2">{formatDate(prescription.dateTime)}</td>
                      <td className="border p-2">{prescription.patientName}</td>
                      <td className="border p-2">{prescription.age}</td>
                      <td className="border p-2">{prescription.gender}</td>
                      <td className="border p-2">{prescription.department}</td>
                      <td className="border p-2">{prescription.type}</td>
                      <td className="border p-2">{prescription.roomNumber || '-'}</td>
                      <td className="border p-2">{prescription.address || '-'}</td>
                      <td className="border p-2">{prescription.aadharNumber || '-'}</td>
                      <td className="border p-2">{prescription.mobileNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewPrescriptionsPage;

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import PrescriptionHTMLTemplate from './PrescriptionHTMLTemplate';

const PrescriptionDetailDialog = ({ prescription, isOpen, onClose }) => {
  if (!prescription) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const prescriptionHTML = PrescriptionHTMLTemplate({ prescription, isPreview: false });
    
    printWindow.document.write(prescriptionHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="no-print border-b pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span>
            Prescription Preview - {prescription.patientName}
          </DialogTitle>
        </DialogHeader>

        <PrescriptionHTMLTemplate prescription={prescription} isPreview={true} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t no-print">
          <Button variant="outline" onClick={onClose} className="px-6">
            Close
          </Button>
          <Button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            🖨️ Print Prescription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDetailDialog;

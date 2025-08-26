import React from 'react';
import logoImage from '../assets/Uttarakhand-Rajya-Color(1).png';

const PrescriptionHTMLTemplate = ({ prescription, isPreview = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN');
  };

  const generateHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Prescription - ${prescription.patientName}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            color: #333;
        }
        
        .prescription-container {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: white !important;
            padding: 15px;
            position: relative;
            margin-bottom: 10px;
            margin-top: 20px;
        }
        
        .logo {
            position: absolute;
            top: 15px;
            right: 20px;
            width: 90px;
            height: 90px;
            background: white !important;
            padding: 5px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            z-index: 10;
        }
        
        .h-logo {
            position: absolute;
            top: 15px;
            left: 20px;
            width: 90px;
            height: 90px;
            background: maroon;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 54px;
            font-weight: bold;
            border: 2px solid maroon;
        }
        
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .warning-message {
            text-align: center;
            padding: 8px;
            background: white;
            color: #8B0000;
            font-weight: 500;
            font-size: 12px;
            border-bottom: 1px solid #ddd;
        }
        
        .hospital-header {
            text-align: center;
            padding: 8px 16px;
            background: #800020;
            color: white;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            margin: 0 auto;
            border-radius: 4px;
        }
        
        .opd-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: white;
            border-bottom: 1px solid #ddd;
        }
        
        .opd-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        
        .opd-validity {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }
        
        .registration-fee {
            text-align: center;
            font-size: 12px;
            color: #333;
        }
        
        .fee-circle {
            border: 2px solid #8B0000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 4px auto 0;
            font-weight: bold;
            font-size: 14px;
            color: #8B0000;
        }
        
        .content {
            padding: 30px;
        }
        
        .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .prescription-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .prescription-validity {
            background: #e3f2fd;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
        }
        
        .patient-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
        }
        
        .detail-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 100px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-value {
            font-weight: 500;
            color: #212529;
            padding: 6px 12px;
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            min-width: 150px;
        }
        
        .section {
            margin-bottom: 15px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .diagnosis-box {
            min-height: 40px;
            background: white;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
        }
        
        .investigations-box, .medicines-box {
            min-height: 150px;
            background: white;
        }
        
        .content-grid {
            margin-bottom: 80px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            border-top: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
        }
        
        .signature-section {
            text-align: right;
        }
        
        .signature-title {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 40px;
        }
        
        .signature-line {
            width: 200px;
            border-bottom: 1px solid #6c757d;
            margin-left: auto;
        }
        
        .footer-notes {
            max-width: 60%;
            font-size: 10px;
            color: #6c757d;
            line-height: 1.4;
        }
        
        .fee-text {
            display: none;
        }
        
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white;
                padding: 0;
            }
            
            .prescription-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .warning-message {
                background: white !important;
                color: #8B0000 !important;
            }
            
            .footer {
                background: #f8f9fa !important;
                border-top: 1px solid #e9ecef !important;
            }
        }
    </style>
</head>
<body>
    <div class="prescription-container">
        <div class="header">
            <div class="h-logo">
                H
            </div>
            
            <div style="text-align: center; margin-top: 10px;">
                <div style="color: maroon; font-weight: bold; font-size: 14px; margin-bottom: 10px;">
                    गर्भ में लड़का-लड़की का पता करना गैर कानूनी है।
                </div>
                
                <div style="display: inline-block; padding: 8px 20px; background: maroon; color: white; font-weight: bold; font-size: 16px; margin-bottom: 10px;">
                    उप जिला चिकित्सालय प्रेमनगर, देहरादून
                </div>
                
                <div style="text-align: center; margin-top: 15px;">
                    <div style="font-size: 18px; font-weight: bold;">बाह्य रोगी कार्ड</div>
                    <div style="font-size: 12px;">(यह पर्ची केवल 15 दिन के लिए वैध है)</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div style="font-size: 12px;">
                        Registration Fee: ₹20
                    </div>
                    <div style="font-size: 20px; font-weight: bold; margin-left: 10px;">
                        ${prescription.registrationNumber}
                    </div>
                </div>
            </div>
            
            <div class="logo">
                <img src="${logoImage}" alt="Uttarakhand State Logo" />
            </div>
        </div>
        
        <div style="border-bottom: 1px solid black; margin: 2px 0;"></div>
        
        <div class="content">
            
            <div style="margin: 2px 0;">
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px; display: flex;">
                    <span style="font-weight: bold; width: 50%;">Reg No: ${prescription.registrationNumber || ''}</span>
                    <span style="font-weight: bold; width: 50%;">Patient Name: ${prescription.patientName || ''}</span>
                </div>
                
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px; display: flex;">
                    <span style="font-weight: bold; width: 50%;">Phone: ${prescription.mobileNumber || ''}</span>
                    <span style="font-weight: bold; width: 50%;">Aadhar No: ${prescription.aadharNumber || ''}</span>
                </div>
                
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px; display: flex;">
                    <span style="font-weight: bold; width: 50%;">Date: ${prescription.dateTime ? new Date(prescription.dateTime).toLocaleDateString() : ''}</span>
                    <span style="font-weight: bold; width: 50%;">Age: ${prescription.age || ''}</span>
                </div>
                
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px; display: flex;">
                    <span style="font-weight: bold; width: 50%;">Gender: ${prescription.gender || ''}</span>
                    <span style="font-weight: bold; width: 50%;">Type: ${prescription.type || ''}</span>
                </div>
                
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px;">
                    <span style="font-weight: bold;">Address: ${prescription.address || ''}</span>
                </div>
                
                <div style="margin-bottom: 15px; border-bottom: 1px dotted black; padding-bottom: 5px; display: flex;">
                    <span style="font-weight: bold; width: 50%;">Payment: ${prescription.paymentMethod || ''}</span>
                    <span style="font-weight: bold; width: 50%;"></span>
                </div>
            </div>
            
            <div style="margin: 10px 0;">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; background: #f0f0f0; padding: 5px;">
                    Provisional / Final Diagnosis :
                </div>
                <div style="min-height: 40px; padding: 5px;">
                    <!-- Diagnosis content will be written here -->
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin: 10px 0;">
                <div>
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
                        Investigation / Tests
                    </div>
                    <div style="min-height: 150px; padding: 5px;">
                        <!-- Investigation content will be written here -->
                    </div>
                </div>
                
                <div>
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
                        Medicine Name (Generic Name in Capital Letters)
                    </div>
                    <div style="min-height: 150px; padding: 5px;">
                        <!-- Medicines will be written here -->
                    </div>
                </div>
            </div>
        </div>
        
        
        <!-- Add bottom margin to prevent content overlap -->
        <div style="margin-bottom: 120px;"></div>
        
        <div style="position: absolute; bottom: 20px; left: 0; right: 0; padding: 15px; border-top: 1px solid black; background: white; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="max-width: 60%;">
                    <div style="font-weight: bold; margin-bottom: 10px;">चिकित्सक के हस्ताक्षर एवं तिथि</div>
                    <div style="font-size: 10px; margin-bottom: 10px;">(नाम एवं पदनाम की मुहर)</div>
                    <div style="border-bottom: 1px solid black; width: 200px; margin-top: 30px;"></div>
                </div>
                
                <div style="text-align: right; font-size: 10px;">
                    <div>(चिकित्सालय रजिस्टर में सुरक्षा न व चिकित्सा पाठशाला रखकर करनी करना है)</div>
                    <div style="margin-top: 10px;">नोट, जन्म, मृत्यु पंजीकरण व 21 दिन के अंतर्गत निशुल्क है। रजिस्ट्रेशन सीमा के अंतर्गत किया जाएगा।</div>
                </div>
            </div>
        </div>
        
    </div>
</body>
</html>
    `;
  };

  if (isPreview) {
    // Return JSX for preview
    return (
      <div className="prescription-container bg-white shadow-md border border-gray-200" style={{ width: '210mm', height: '297mm', margin: '20px', padding: '15px', fontSize: '10px', fontFamily: 'Arial, sans-serif', overflow: 'visible', position: 'relative' }}>
        {/* Header Section */}
        <div className="header-section border border-black mb-2">
          {/* Warning Message */}
          <div className="text-center py-2 bg-white border-b border-black">
            <p className="font-bold text-xs" style={{ color: '#800020' }}>गर्भ में लड़का-लड़की का पता करना गैर कानूनी है।</p>
          </div>
          
          {/* Hospital Header */}
          <div className="text-center py-2 px-4 border-b border-black" style={{ backgroundColor: '#800020' }}>
            <p className="font-bold text-lg text-white">उप जिला चिकित्सालय प्रेमनगर, देहरादून</p>
          </div>
          
          {/* Main Header */}
          <div className="flex justify-between items-center p-2 bg-white">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-black">बाह्य रोगी कार्ड</h1>
              <p className="text-sm text-gray-700 mt-1">(यह पर्ची केवल 15 दिन के लिए वैध है)</p>
            </div>
            
            <div className="flex-1 flex justify-end text-xs">
              <div className="text-center">
                <p>Registration Fee</p>
                <div className="border rounded-full w-12 h-12 flex items-center justify-center mt-1" style={{ borderColor: '#800020' }}>
                  <span className="text-xs font-bold">₹20</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo */}
          <div className="absolute top-4 right-5 w-20 h-20 bg-white p-1 rounded shadow-sm z-10">
            <img src={logoImage} alt="Uttarakhand State Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      
        {/* Patient Information Section */}
        <div className="p-2 patient-info text-sm">
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Reg. No.:</span>
            <span className="field-value min-w-[100px] inline-block text-sm">{prescription.registrationNumber}</span>
            <span className="field-label ml-8 min-w-[80px] text-sm font-medium">Date:</span>
            <span className="field-value min-w-[100px] inline-block text-sm">{formatDate(prescription.dateTime)}</span>
            <span className="field-label ml-8 min-w-[80px] text-sm font-medium">Time:</span>
            <span className="field-value min-w-[100px] inline-block text-sm">{formatTime(prescription.dateTime)}</span>
          </div>
          
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Patient Name:</span>
            <span className="field-value min-w-[200px] inline-block text-sm">{prescription.patientName}</span>
          </div>
          
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Patient Address:</span>
            <span className="field-value min-w-[300px] inline-block text-sm">{prescription.address || ''}</span>
          </div>
          
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Phone No.:</span>
            <span className="field-value min-w-[150px] inline-block text-sm">{prescription.mobileNumber || ''}</span>
            <span className="field-label ml-8 min-w-[80px] text-sm font-medium">Age:</span>
            <span className="field-value min-w-[80px] inline-block text-sm">{prescription.age}</span>
            <span className="field-label ml-8 min-w-[80px] text-sm font-medium">Gender:</span>
            <span className="field-value min-w-[80px] inline-block text-sm">{prescription.gender}</span>
          </div>
          
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Aadhar No.:</span>
            <span className="field-value min-w-[200px] inline-block text-sm">{prescription.aadharNumber || ''}</span>
          </div>
          
          <div className="field-row flex mb-3 items-center">
            <span className="field-label min-w-[120px] text-sm font-medium">Payment Mode:</span>
            <span className="field-value min-w-[150px] inline-block text-sm">{prescription.paymentMethod || ''}</span>
          </div>
        </div>
        
        {/* Diagnosis Section */}
        <div className="mt-4">
          <p className="font-bold mb-2 text-sm">Provisional / Final Diagnosis:</p>
          <div className="border-b border-black h-6 mb-4"></div>
        </div>
        
        {/* Medicine Section */}
        <div className="medicine-section mt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="font-bold text-sm mb-2 p-2">Investigation / Tests</div>
              <div className="min-h-[80px] p-2"></div>
            </div>
            <div className="flex-[2]">
              <div className="font-bold text-sm mb-2 p-2">Medicine Name (Generic name in capital letters where possible) Duration & Dosage</div>
              <div className="min-h-[80px] p-2"></div>
            </div>
          </div>
        </div>
        
        {/* Signature Section */}
        <div className="signature-section" style={{ position: 'absolute', bottom: '80px', right: '15px' }}>
          <div className="text-right">
            <p className="text-sm mb-1">Doctor's Signature & Date</p>
            <p className="text-sm mb-3">(Name & Designation Stamp)</p>
            <div className="w-40 border-b border-black ml-auto"></div>
          </div>
        </div>
        
        {/* Footer Notes */}
        <div className="footer-notes mt-auto pt-8 text-center" style={{ position: 'absolute', bottom: '20px', left: '15px', right: '15px' }}>
          <p className="text-xs">Hospital premises is a no-smoking and no-alcohol zone. Please cooperate in keeping it clean.</p>
          <p className="text-xs mt-1">Note: Birth and death registration is free within 21 days of the event. Please register within the time limit for free registration.</p>
        </div>
      </div>
    );
  }

  // Return HTML string for printing
  return generateHTML();
};

export default PrescriptionHTMLTemplate;

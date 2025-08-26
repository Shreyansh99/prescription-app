import React from 'react';

const PrescriptionTemplate = ({ prescription, showPrintStyles = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-IN');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatRegistrationNumber = (regNum) => {
    if (!regNum) return '000001';
    return String(regNum).padStart(6, '0');
  };

  return (
    <>
      {showPrintStyles && (
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .prescription-template,
            .prescription-template * {
              visibility: visible;
            }
            .prescription-template {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      )}
      
      <div className="prescription-template" style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '12px',
        lineHeight: '1.5',
        margin: '0',
        padding: '20px',
        background: '#f8f9fa',
        color: '#333'
      }}>
        <div style={{
          background: 'white',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
            padding: '20px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '35px',
              left: '20px',
              background: 'white',
              color: '#333',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              zIndex: '10'
            }}>
              ₹20
            </div>
            
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              width: '60px',
              height: '60px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <img 
                src="/Seal_of_Uttarakhand.svg" 
                alt="Uttarakhand Logo" 
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{
                display: 'none',
                fontWeight: 'bold',
                color: '#2c3e50',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                LOGO
              </div>
            </div>
            
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '8px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              उप जिला चिकित्सालय प्रेमनगर
            </div>
            
            <div style={{
              fontSize: '14px',
              opacity: '0.9',
              marginBottom: '5px'
            }}>
              Sub District Hospital Premnagar, Dehradun
            </div>
            
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '8px 12px',
              fontSize: '11px',
              textAlign: 'center',
              borderLeft: '4px solid #ffc107',
              marginTop: '10px'
            }}>
              गर्भ में लड़का-लड़की का पता करना गैर कानूनी है। | Gender determination is illegal.
            </div>
          </div>
          
          {/* Content */}
          <div style={{ padding: '30px' }}>
            {/* Prescription Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '2px solid #e9ecef'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                बाह्य रोगी कार्ड / OPD Card
              </div>
              
              <div style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                Valid for 15 days
              </div>
            </div>
            
            {/* Patient Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px',
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Reg. No.
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {formatRegistrationNumber(prescription?.registrationNumber)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Patient Name
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {prescription?.patientName || 'Not provided'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Phone
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {prescription?.mobileNumber || 'Not provided'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Aadhar No.
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {prescription?.aadharNumber || 'Not provided'}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Date
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {formatDate(prescription?.dateTime)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Age
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {prescription?.age || 'Not provided'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Gender
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    {prescription?.gender || 'Not provided'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    minWidth: '100px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Payment
                  </span>
                  <span style={{
                    fontWeight: '500',
                    color: '#212529',
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}>
                    Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis Section */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
                padding: '8px 0',
                borderBottom: '1px solid #dee2e6'
              }}>
                Provisional / Final Diagnosis
              </div>
              <div style={{
                minHeight: '40px',
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                padding: '10px'
              }}>
                {/* Diagnosis content will be written here */}
              </div>
            </div>

            {/* Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '10px',
                  padding: '8px 0',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  Investigation / Tests
                </div>
                <div style={{
                  minHeight: '150px',
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '10px'
                }}>
                  {/* Investigation content will be written here */}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '10px',
                  padding: '8px 0',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  Medicine Name (Generic name in capital letters where possible) Duration & Dosage
                </div>
                <div style={{
                  minHeight: '150px',
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '10px'
                }}>
                  {/* Medicines will be written here */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div style={{
              maxWidth: '60%',
              fontSize: '10px',
              color: '#6c757d',
              lineHeight: '1.4'
            }}>
              <strong>Important Notes:</strong><br />
              • Hospital premises is a no-smoking and no-alcohol zone<br />
              • Birth and death registration is free within 21 days<br />
              • Please keep this prescription for future reference
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '40px'
              }}>
                Doctor's Signature & Date<br />
                <small>(Name & Designation Stamp)</small>
              </div>
              <div style={{
                width: '200px',
                borderBottom: '1px solid #6c757d',
                marginLeft: 'auto'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionTemplate;

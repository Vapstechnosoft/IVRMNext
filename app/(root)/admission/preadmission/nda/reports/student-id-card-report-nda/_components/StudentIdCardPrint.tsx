'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface StudentIdCardPrintProps {
  cardData: any[];
  houseColor: string;
}

export const StudentIdCardPrint = forwardRef<HTMLDivElement, StudentIdCardPrintProps>(
  ({ cardData, houseColor }, ref) => {
    const getHouseStyles = () => {
      switch (houseColor) {
        case 'GREEN':
          return {
            color: 'green',
            headerImg: 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/c3ffeb85-f057-455f-9c24-aa05cb565da0.jpg',
            shadow: 'green',
          };
        case 'YELLOW':
          return {
            color: 'yellow',
            headerImg: 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/31ee0625-7593-4707-9d76-56675f90ce1b.jpg',
            shadow: 'yellow',
          };
        case 'BLUE':
          return {
            color: 'blue',
            headerImg: 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/86e88fe6-9619-4d93-bc4d-a295582aaee6.jpg',
            shadow: 'blue',
          };
        case 'RED':
          return {
            color: 'red',
            headerImg: 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/328609db-a041-478f-ad80-781af74eeeb5.jpg',
            shadow: 'red',
          };
        case 'WHITE':
        default:
          return {
            color: 'white',
            headerImg: 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/388ac9cf-7638-4e13-a123-2d70093017f2.jpg',
            shadow: 'white',
          };
      }
    };

    const styles = getHouseStyles();

    return (
      <div ref={ref} className="id-card-print-container">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: 85.5mm 53.6mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          .nd-card-wrapper {
            width: 85.5mm;
            height: auto;
            margin: 0 auto;
            font-family: 'Calibri', 'Poppins', sans-serif;
          }

          .nd-id-card {
            width: 85.5mm;
            height: 53.6mm;
            background: white;
            position: relative;
            overflow: hidden;
            page-break-after: always;
            box-sizing: border-box;
            border: 0.1px solid #eee;
          }

          .curved-triangle-top {
            width: 100px;
            height: 100px;
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 5;
          }

          .curved-triangle-top:before {
            content: "";
            width: 239%;
            height: 157%;
            position: absolute;
            border-radius: 39%;
            box-shadow: -104px -15px 0 0 ${styles.shadow === 'white' ? '#ddd' : styles.shadow};
            top: 0;
            left: 0;
          }

          .curved-triangle-bottom {
            width: 94px;
            height: 77px;
            overflow: hidden;
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 5;
          }

          .curved-triangle-bottom:before {
            content: "";
            width: 248%;
            height: 220%;
            position: absolute;
            border-radius: 39%;
            box-shadow: 103px 19px 0 0 ${styles.shadow === 'white' ? '#ddd' : styles.shadow};
            bottom: 0;
            right: 0;
          }

          .nd-header {
            position: absolute;
            top: 10px;
            left: 20px;
            right: 15px;
            z-index: 10;
          }

          .nd-header-img {
            width: 100%;
            height: 18mm;
            object-fit: contain;
          }

          .nd-content {
            position: relative;
            z-index: 10;
            margin-top: 22mm;
            padding: 0 10px;
            display: flex;
            gap: 10px;
          }

          .nd-photo-frame {
            width: 19mm;
            height: 23mm;
            border: 0.3px solid #000;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .nd-photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .nd-details {
            flex-grow: 1;
            font-size: 8.5pt;
            line-height: 1.4;
            color: #333;
          }

          .nd-details b {
            font-size: 9pt;
            font-weight: 900;
          }

          .nd-blood-group-wrap {
            position: absolute;
            bottom: 12mm;
            right: 10mm;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .nd-blood-drop {
            width: 5mm;
            height: 7mm;
            fill: #ff4444;
          }

          .nd-blood-text {
            font-size: 8pt;
            font-weight: 900;
            color: #333;
          }

          .nd-principal-wrap {
            position: absolute;
            bottom: 3.5mm;
            left: 58mm;
            text-align: center;
            z-index: 15;
          }

          .nd-sig-img {
            height: 10mm;
            width: auto;
            margin-bottom: 0;
          }

          .nd-principal-title {
            font-size: 7.5pt;
            font-weight: 900;
          }

          /* Back Side Specifics */
          .nd-back-rotated {
            transform: rotate(180deg);
          }

          .nd-back-content {
            padding: 10mm 5mm 5mm 5mm;
            position: relative;
            z-index: 10;
          }

          .nd-guardian-grid {
             display: flex;
             justify-content: space-around;
             gap: 2mm;
             margin-bottom: 2mm;
          }

          .nd-guardian-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 22mm;
          }

          .nd-guardian-label {
             font-size: 5.5pt;
             font-weight: 900;
             text-transform: uppercase;
             margin-bottom: 1mm;
          }

          .nd-guardian-photo {
            width: 20mm;
            height: 20mm;
            border: 0.3px solid #000;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1mm;
          }

          .nd-guardian-photo img {
             width: 100%;
             height: 100%;
             object-fit: cover;
          }

          .nd-guardian-info {
             font-size: 5pt;
             font-weight: 900;
             text-align: center;
             line-height: 1.1;
          }

          .nd-divider {
             height: 1.5pt;
             width: 90%;
             margin: 1.5mm auto;
             background-color: ${styles.shadow === 'white' ? '#000' : styles.shadow};
          }

          .nd-address-text {
             font-size: 6.5pt;
             font-weight: 900;
             text-align: center;
             padding: 0 4mm;
             line-height: 1.2;
             text-transform: uppercase;
          }

          .nd-back-triangle-bottom {
            width: 100%;
            height: 35%;
            overflow: hidden;
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 5;
          }

          .nd-back-triangle-bottom::after {
            content: "";
            width: 250%;
            height: 220%;
            position: absolute;
            border-radius: 39%;
            box-shadow: 103px 19px 0 0 ${styles.shadow === 'white' ? '#ddd' : styles.shadow};
            bottom: 0;
            right: 0;
          }
        `}} />

        <div className="nd-card-wrapper">
          {cardData.map((dd, index) => (
            <div key={index}>
              {/* Front Side */}
              <div className="nd-id-card">
                <div className="curved-triangle-top" />
                
                <div className="nd-header">
                  <img src={styles.headerImg} alt="NDA Header" className="nd-header-img" />
                </div>

                <div className="nd-content">
                  <div className="nd-photo-frame">
                    {dd.AMST_Photoname ? (
                      <img src={dd.AMST_Photoname} alt={dd.studentname} />
                    ) : (
                      <div className="w-full h-full bg-slate-100" />
                    )}
                  </div>

                  <div className="nd-details">
                    <p className="mb-2"><b>Name:</b> {dd.studentname}</p>
                    <p className="mb-2"><b>DOB:</b> {dd.AMST_DOB ? format(new Date(dd.AMST_DOB), 'dd/MM/yyyy') : ''}</p>
                    <p><b>Phone:</b> {dd.studentmobile}</p>
                  </div>
                </div>

                <div className="nd-blood-group-wrap">
                  <svg viewBox="0 0 64 64" className="nd-blood-drop">
                    <path d="M32 2C32 2 10 26 10 40C10 52.15 20.85 62 33 62C45.15 62 56 52.15 56 40C56 26 32 2 32 2Z" fill="white" stroke="#ff4444" strokeWidth="2" />
                  </svg>
                  <span className="nd-blood-text">{dd.AMST_BloodGroup}</span>
                </div>

                <div className="nd-principal-wrap">
                   <img src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/7a923e6a-8d84-43b2-a70b-692550db3992.png" alt="Sig" className="nd-sig-img" />
                   <p className="nd-principal-title">Principal</p>
                </div>

                <div className="curved-triangle-bottom" />
              </div>

              {/* Back Side (Rotated) */}
              <div className="nd-id-card nd-back-rotated">
                 <div className="curved-triangle-top" />

                 <div className="nd-back-content">
                    <div className="nd-guardian-grid">
                       <div className="nd-guardian-col">
                          <span className="nd-guardian-label">Mother</span>
                          <div className="nd-guardian-photo">
                             <img src={dd.ANST_MotherPhoto || '/placeholder.png'} alt="M" />
                          </div>
                          <div className="nd-guardian-info">
                             {dd.mothername}<br/>{dd.AMST_MotherMobileNo}
                          </div>
                       </div>
                       <div className="nd-guardian-col">
                          <span className="nd-guardian-label">Father</span>
                          <div className="nd-guardian-photo">
                             <img src={dd.ANST_FatherPhoto || '/placeholder.png'} alt="F" />
                          </div>
                          <div className="nd-guardian-info">
                             {dd.fatherName}<br/>{dd.AMST_FatherMobleNo}
                          </div>
                       </div>
                       <div className="nd-guardian-col">
                          <span className="nd-guardian-label">Guardian</span>
                          <div className="nd-guardian-photo">
                             <img src={dd.AMSTG_GuardianPhoto || '/placeholder.png'} alt="G" />
                          </div>
                          <div className="nd-guardian-info">
                             {dd.gaurdianname}<br/>{dd.AMSTG_GuardianPhoneNo}
                          </div>
                       </div>
                    </div>

                    <div className="nd-divider" />

                    <div className="nd-address-text">
                       {dd.AMST_PerStreet}, {dd.AMST_PerArea}, BANGALORE, {dd.AMST_PerState} - {dd.AMST_PerPincode}
                    </div>
                 </div>

                 <div className="nd-back-triangle-bottom" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

StudentIdCardPrint.displayName = 'StudentIdCardPrint';

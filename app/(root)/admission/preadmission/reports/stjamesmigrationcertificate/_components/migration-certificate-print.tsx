'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface MigrationCertificatePrintProps {
    data: any;
}

export const MigrationCertificatePrint = forwardRef<HTMLDivElement, MigrationCertificatePrintProps>(
    function MigrationCertificatePrint({ data }, ref) {
        const printDate = data.ASA_FromDate ? new Date(data.ASA_FromDate) : new Date();

        return (
            <div ref={ref} className="w-[210mm] min-h-[297mm] p-[20mm] bg-[#fffacd] text-black font-sans relative">
                <style type="text/css" media="print">
                    {`
                        @page { size: auto; margin: 0; }
                        @media print {
                            body {
                                background-color: #fffacd !important;
                                -webkit-print-color-adjust: exact;
                            }
                        }
                    `}
                </style>
                <div style={{ marginTop: '135px' }}>
                    <h5 style={{ marginLeft: '170px', marginTop: '135px', fontFamily: 'Calibri', fontSize: '13px', textTransform: 'uppercase' }}>
                        {data.studentname || ''}
                    </h5>
                    <h5 style={{ marginLeft: '130px', marginTop: '-10px', fontFamily: 'Calibri', fontSize: '13px' }}>
                        ST. JAMES SCHOOL
                    </h5>
                    <h5 style={{ marginLeft: '235px', marginTop: '-6px', fontFamily: 'Calibri', fontSize: '13px', textTransform: 'uppercase' }}>
                        {data.registernumber || ''}
                    </h5>
                    <h5 style={{ marginLeft: '150px', marginTop: '-14px', fontFamily: 'Calibri', fontSize: '13px', textTransform: 'uppercase' }}>
                        {data.certificatename || ''}
                    </h5>

                    <h5 style={{ marginLeft: '255px', marginTop: '210px', fontFamily: 'Calibri', fontSize: '13px', textTransform: 'uppercase' }}>
                        {data.fathername || ''}
                    </h5>
                    <h5 style={{ marginLeft: '255px', marginTop: '-10px', fontFamily: 'Calibri', fontSize: '13px', textTransform: 'uppercase' }}>
                        {data.mothername || ''}
                    </h5>
                    <h5 style={{ marginLeft: '120px', marginTop: '-45px', fontFamily: 'Calibri', fontSize: '13px' }}>
                        {format(printDate, 'dd-MM-yyyy')}
                    </h5>
                </div>
            </div>
        );
    }
);

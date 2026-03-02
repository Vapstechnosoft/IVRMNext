'use client';

import React from 'react';
import { format } from 'date-fns';

interface StudentData {
    amsT_RegistrationNo: string;
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_Date: string;
    amsT_DOB: string;
    amsT_Sex: string;
    amsT_MotherName: string;
    amsT_FatherName: string;
    amsT_emailId: string;
    amsT_MobileNo: number | string;
    amsT_StuBankAccNo: string | null;
    amsT_AadharNo: string | null;
    amsT_AdmNo: string;
    amsT_BirthCertNO: string | null;
    amsT_BloodGroup: string | null;
    amsT_FatherAadharNo: string | null;
    amsT_FatherBankAccNo: string | null;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Photoname: string;
    addressd1: string;
}

interface StudentSearchPrintProps {
    data: StudentData[];
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
}

export const StudentSearchPrint = React.forwardRef<HTMLDivElement, StudentSearchPrintProps>(
    ({ data, schoolName, schoolAddress, schoolPhone, logoUrl }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy hh:mm a');

        if (!data || data.length === 0) {
            return (
                <div ref={ref} className='p-5 text-center bg-white text-black'>
                    No data selected for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container p-5 bg-white text-black min-h-full w-full'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 0;
                                size: A4 landscape;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                                padding: 15mm;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            th, td {
                                border: 1px solid #000;
                                padding: 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left {
                                text-align: left !important;
                            }
                            .header-section {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    `}
                </style>

                {/* Header */}
                <div className="header-section mb-6 border-b border-black pb-4">
                    <div className="flex items-center justify-center gap-4">
                        {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                        <div className="text-center">
                            <h1 className="text-xl font-bold uppercase">{schoolName || 'Institution Name'}</h1>
                            <p className="text-xs">{schoolAddress || 'Institution Address'}</p>
                            <p className="text-xs">Ph: {schoolPhone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-md font-bold border-y border-black inline-block px-4 py-1 uppercase">
                            Student Search Report
                        </h2>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-10">SL. NO</th>
                            <th className="text-left w-24">REG. NO</th>
                            <th className="text-left">STUDENT NAME</th>
                            <th className="text-left w-24">CLASS</th>
                            <th className="text-left w-24">SECTION</th>
                            <th className="w-20">GENDER</th>
                            <th className="w-20">DOB</th>
                            <th className="text-left">FATHER NAME</th>
                            <th className="text-left w-24">MOBILE</th>
                            <th className="text-left w-24">ADM NO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="text-left">{row.amsT_RegistrationNo}</td>
                                <td className="text-left font-bold uppercase">{row.amsT_FirstName}</td>
                                <td className="text-left">{row.asmcL_ClassName}</td>
                                <td className="text-left">{row.asmC_SectionName}</td>
                                <td>{row.amsT_Sex}</td>
                                <td>{row.amsT_DOB}</td>
                                <td className="text-left">{row.amsT_FatherName}</td>
                                <td className="text-left">{row.amsT_MobileNo}</td>
                                <td className="text-left">{row.amsT_AdmNo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="mt-8 flex justify-between items-end text-[10px] opacity-60 italic">
                    <div>Date: {currentDate}</div>
                    <div>Generated by Vaps Technosoft Pvt. Ltd.</div>
                </div>
            </div>
        );
    }
);

StudentSearchPrint.displayName = 'StudentSearchPrint';

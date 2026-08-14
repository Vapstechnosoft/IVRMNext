'use client';

import { format } from 'date-fns';
import React from 'react';

interface BirthCertificatePrintProps {
    students: any[];
    purpose?: string;
    masterCompany?: any[];
    principalSign?: any[];
}

export const BirthCertificatePrint = React.forwardRef<HTMLDivElement, BirthCertificatePrintProps>(
    ({ students, purpose, masterCompany, principalSign }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!students || students.length === 0) {
            return (
                <div ref={ref} className='p-10 text-center bg-white text-black font-sans'>
                    <p className='text-lg font-bold'>No data available for printing.</p>
                    <p className='text-sm text-gray-500'>Please generate the report first.</p>
                </div>
            );
        }

        // Fallbacks
        const firstStudent = students?.[0];
        const mI_Logo = masterCompany?.[0]?.mI_Logo || firstStudent?.MI_Logo || '';
        const schoolName = masterCompany?.[0]?.mI_Name || firstStudent?.schoolName || '';
        const schoolAddress = `${masterCompany?.[0]?.mI_Address1 || ''} ${masterCompany?.[0]?.mI_Address2 || ''} ${masterCompany?.[0]?.mI_Address3 || ''}`.trim();
        const pincode = masterCompany?.[0]?.mI_Pincode || '';

        const ivrmmctName = firstStudent?.IVRMMCT_Name || 'BANGALORE';

        const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return dateString;
                return format(date, 'dd/MM/yyyy');
            } catch {
                return dateString;
            }
        };

        return (
            <div ref={ref} className='bg-white'>
                <style>
                    {`
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        @media print {
                            body {
                                visibility: hidden !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            .dob-print-container {
                                visibility: visible !important;
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                            }
                            .dob-print-container * {
                                visibility: visible !important;
                            }
                            .dob-a4-page {
                                page-break-after: always !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                border: none !important;
                            }
                        }
                        .dob-a4-container {
                            display: flex !important;
                            flex-direction: column !important;
                            width: 190mm !important;
                            padding: 10mm !important;
                            margin: 0 auto !important;
                            border: 1px solid black !important;
                            position: relative !important;
                            background: white !important;
                            font-family: 'Times New Roman', Times, serif !important;
                        }
                        .dob-bg-watermark::before {
                            content: "";
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: url('https://vapsclg.blob.core.windows.net/files/57/COE_Images_Videos/f3a56e64-883f-4c81-9e9e-41c34eeb0b21.png') no-repeat center center;
                            background-size: 600px;
                            opacity: 0.08;
                            z-index: 0;
                            pointer-events: none;
                            display: block !important;
                        }
                        .dob-content-wrapper {
                            position: relative;
                            z-index: 1;
                        }
                        .text-justify {
                            text-align: justify;
                            text-justify: inter-word;
                        }
                    `}
                </style>
                <div className='dob-print-container'>
                    {students.map((student, index) => (
                        <div key={index} className='dob-a4-page mb-8 print:mb-0 flex justify-center bg-white'>
                            <div className='dob-a4-container dob-bg-watermark'>
                                <div className='dob-content-wrapper flex flex-col h-full'>
                                    {/* Header */}
                                    {/* <div className='flex items-center justify-between mb-8 border-b-2 border-black pb-4'>
                                    {mI_Logo && (
                                        <div className='w-[100px] h-[100px] flex-shrink-0'>
                                            <img src={mI_Logo} alt='Logo' className='w-full h-full object-contain' />
                                        </div>
                                    )}
                                    <div className='flex-1 text-center px-4'>
                                        <h1 className='text-2xl font-bold uppercase text-[#1a237e]'>{schoolName}</h1>
                                        <p className='text-sm mt-1'>{schoolAddress} - {pincode}</p>
                                    </div>
                                    <div className='w-[100px]'>
                                    </div>
                                </div> */}

                                    <div className='text-center mb-8'>
                                        <h2 className='text-2xl font-bold underline decoration-1 uppercase'>BIRTH CERTIFICATE</h2>
                                        <p className='text-xl font-bold uppercase mt-4'>TO WHOMSOEVER IT MAY CONCERN</p>
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 px-12'>
                                        <div className='flex flex-col items-end mb-8'>
                                            <div className='text-lg font-bold mb-4'>
                                                <span className='border-b border-black pb-0.5'>Date: {currentDate}</span>
                                            </div>
                                            <div className='w-28 h-32 border border-gray-400 flex items-center justify-center bg-white shadow-sm'>
                                                {(student.stuPhoto || student.stuphoto) ? (
                                                    <img
                                                        src={student.stuPhoto || student.stuphoto}
                                                        alt='Student'
                                                        className='w-full h-full object-cover'
                                                    />
                                                ) : (
                                                    <span className='text-[10px] text-gray-400 text-center p-2'>Student Photo</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className='space-y-10 text-[18.5px] leading-[2.2] text-black'>
                                            <p className='text-justify'>
                                                This is to Certify that Kumar/Kumari
                                                <span className='font-bold uppercase mx-1'>
                                                    {student.stuFN || student.stufn || ''} {student.stuMN || student.stumn || ''} {student.stuLN || student.stuln || ''}
                                                </span>
                                                Child of Sri.
                                                <span className='font-bold uppercase mx-1'>
                                                    {student.fatherName || student.fathername || 'N/A'}
                                                </span>
                                                is/was a Student of the Institution Studying in
                                                <span className='font-bold uppercase mx-1'>
                                                    {student.class || student.className || 'N/A'}
                                                </span>,
                                                <span className='font-bold mx-1'>
                                                    {student.acadamicyear || 'N/A'}
                                                </span>.
                                            </p>

                                            <p className='text-justify'>
                                                His/Her Date of Birth According to Our School Admission Record is
                                                <span className='font-bold mx-1'>
                                                    {formatDate(student.dob)}
                                                </span>
                                                during the Academic Year
                                                <span className='font-bold mx-1'>
                                                    {student.acadamicyear || 'N/A'}
                                                </span>
                                                and Date of Birth in Words is
                                                <span className='font-bold uppercase mx-1'>
                                                    {student.dobWord || student.dobword || 'Not Available'}
                                                </span>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className='mt-8 mb-4 px-12 flex justify-end'>
                                        <div className='text-right'>
                                            <p className='font-bold text-lg'>Principal's Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

BirthCertificatePrint.displayName = 'BirthCertificatePrint';

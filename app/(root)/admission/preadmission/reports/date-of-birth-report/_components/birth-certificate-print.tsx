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

        // Fallbacks
        const firstStudent = students?.[0];
        const mI_Logo = masterCompany?.[0]?.mI_Logo || firstStudent?.MI_Logo || '';
        const schoolName = masterCompany?.[0]?.mI_Name || firstStudent?.schoolName || '';
        const schoolAddress = `${masterCompany?.[0]?.mI_Address1 || ''} ${masterCompany?.[0]?.mI_Address2 || ''} ${masterCompany?.[0]?.mI_Address3 || ''}`.trim();
        const pincode = masterCompany?.[0]?.mI_Pincode || '';

        const signImg = principalSign?.[0]?.ivrmgC_PrincipalSign || principalSign?.[0]?.IVRMSIG_Signature || '';
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
                            margin: 0;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white !important;
                        }
                        .dob-a4-page {
                            page-break-after: always;
                        }
                        .dob-a4-page:last-child {
                            page-break-after: auto;
                        }
                        .dob-a4-container {
                            display: flex !important;
                            flex-direction: column !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            padding: 15mm !important;
                            margin: 0 !important;
                            border: 2px solid black !important;
                            box-shadow: none !important;
                            position: relative !important;
                            overflow: hidden !important;
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
                            visibility: visible !important;
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
                {students.map((student, index) => (
                    <div key={index} className='dob-a4-page mb-8 print:mb-0 bg-gray-50 print:bg-white flex justify-center'>
                        <div className='dob-a4-container dob-bg-watermark bg-white'>
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

                                <div className='text-center mb-12' >
                                    <h2 className='text-3xl font-bold underline decoration-2 uppercase'>BIRTH CERTIFICATE</h2>
                                </div>
                                <div className='text-center mb-12' style={{ marginTop: '-40px' }}>
                                    <p className='text-3xl  uppercase'>TO WHOMSOEVER IT MAY CONCERN</p>
                                </div>

                                {/* Content */}
                                <div className='flex-1 px-8'>
                                    <div className='flex justify-between items-start mb-12'>
                                        <div className='w-32 h-40 border border-gray-300 flex items-center justify-center bg-gray-50'>
                                            {(student.stuPhoto || student.stuphoto) ? (
                                                <img
                                                    src={student.stuPhoto || student.stuphoto}
                                                    alt='Student'
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <span className='text-xs text-gray-400 text-center p-2'>Photo</span>
                                            )}
                                        </div>
                                        <div className='text-lg font-bold'>
                                            Date: {currentDate}
                                        </div>
                                    </div>

                                    <div className='space-y-8 text-[20px] leading-[2.2]'>
                                        <p className='text-justify'>
                                            This is to Certify that Kumar/Kumari
                                            <span className='font-bold uppercase mx-2 px-2 border-b border-dotted border-black'>
                                                {student.stuFN || student.stufn || ''} {student.stuMN || student.stumn || ''} {student.stuLN || student.stuln || ''}
                                            </span>
                                            {(student.fatherName || student.fathername) && (
                                                <>
                                                    Child of Sri.
                                                    <span className='font-bold uppercase mx-2 px-2 border-b border-dotted border-black'>
                                                        {student.fatherName || student.fathername}
                                                    </span>
                                                </>
                                            )}
                                            is/was a Student of this Institution studying in Class
                                            <span className='font-bold uppercase mx-2 px-2 border-b border-dotted border-black'>
                                                {student.class || student.className || 'N/A'}
                                            </span>
                                            during the academic year
                                            <span className='font-bold mx-2 px-2 border-b border-dotted border-black'>
                                                {student.acadamicyear || 'N/A'}
                                            </span>.
                                        </p>

                                        <p className='text-justify'>
                                            His/Her Date of Birth according to our Admission Register is
                                            <span className='font-bold mx-2 px-2 border-b border-dotted border-black'>
                                                {formatDate(student.dob)}
                                            </span>
                                            <br />
                                            (in words)
                                            <span className='font-bold uppercase mx-2 px-2 border-b border-dotted border-black'>
                                                {student.dobWord || student.dobword || 'Not Available'}
                                            </span>.
                                        </p>

                                        {purpose && (
                                            <p className='mt-8'>
                                                This Certificate is issued for the purpose of
                                                <span className='font-bold italic mx-2 px-2 border-b border-dotted border-black'>
                                                    &quot;{purpose}&quot;
                                                </span>.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className='mt-auto mb-12 px-8 grid grid-cols-2 gap-8'>
                                    <div className='self-end'>
                                        <p className='font-bold'>Place: {ivrmmctName}</p>
                                        <p className='font-bold mt-2'>Date: {currentDate}</p>
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        <div className='h-16 w-32 mb-2 flex items-end justify-end'>
                                            {signImg && <img src={signImg} alt='Signature' className='max-w-full max-h-full object-contain' />}
                                        </div>
                                        <div className='text-center border-t border-black w-48 pt-2'>
                                            <p className='font-bold text-lg'>Principal</p>
                                            <p className='text-sm'>(Signature & Seal)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
);

BirthCertificatePrint.displayName = 'BirthCertificatePrint';

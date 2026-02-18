'use client';

import { format } from 'date-fns';
import { StudyCertificateResponse } from '@/types/admission/preadmission/reports';
import React from 'react';

type CertificateProps = {
    data: StudyCertificateResponse | null;
    selectedDate: Date | null;
    qrCode?: string;
};

const classToWords = (className: string) => {
    switch (className?.toUpperCase()) {
        case 'I': return 'FIRST';
        case 'II': return 'SECOND';
        case 'III': return 'THIRD';
        case 'IV': return 'FOURTH';
        case 'V': return 'FIFTH';
        case 'VI': return 'SIXTH';
        case 'VII': return 'SEVENTH';
        case 'VIII': return 'EIGHTH';
        case 'IX': return 'NINTH';
        case 'X': return 'TENTH';
        default: return className || '';
    }
};

const CharacterCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(
    ({ data, selectedDate, qrCode }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) {
            return (
                <div ref={ref} className="p-10 text-center text-gray-400 bg-white">
                    No student data available for Character Certificate.
                </div>
            );
        }

        const students = data.studentList;
        const principalSign = data.principalSign?.[0]?.ivrmgC_PrincipalSign || data.principalSign?.[0]?.IVRMSIG_Signature || '';
        const mI_Id = data.masterCompany?.[0]?.mI_Id;
        const masterCompany = data.masterCompany?.[0];

        return (
            <div ref={ref} className='bg-white text-black w-full'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
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
                            .print-component-wrapper {
                                display: block !important;
                                position: static !important;
                                visibility: visible !important;
                            }
                            .char-a4-page {
                                page-break-after: always;
                                width: 210mm;
                                min-height: 297mm;
                                margin: 0 auto;
                                position: relative;
                            }
                            .char-a4-page:last-child {
                                page-break-after: auto;
                            }
                        }

                        .char-a4-container {
                            width: 210mm;
                            height: 297mm;
                            padding: 20mm;
                            margin: 0 auto;
                            position: relative;
                            overflow: hidden;
                            background: white;
                            display: flex;
                            flex-direction: column;
                            font-family: 'Times New Roman', Times, serif;
                        }

                        .char-bg-watermark::before {
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
                        }

                        .char-content-wrapper {
                            position: relative;
                            z-index: 1;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }
                    `
                    }}
                />
                <div className='print-component-wrapper bg-gray-100 print:bg-white flex flex-col items-center gap-8 py-8 print:py-0 print:gap-0'>
                    {students.map((student, index) => {
                        const classWords = classToWords(student.class);
                        const isStAnnas = student.IVRMMCT_Name?.toLowerCase().includes('annas') || mI_Id === 135;

                        const studentName = student.studentnam || '';
                        const fatherName = student.fathername || '';
                        const academicYear = student.acadamicyear || '';
                        const admNo = student.admno || '';

                        if (isStAnnas) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='char-a4-page shadow-2xl print:shadow-none bg-white'>
                                    <div className='char-a4-container char-bg-watermark'>
                                        <div className='char-content-wrapper pt-[120px]'>
                                            <div className='text-center mb-20'>
                                                <h2 className='text-[40px] font-bold uppercase tracking-tight mb-2'>ST. ANNAS SCHOOL</h2>
                                                <h3 className='text-[24px] font-bold underline uppercase tracking-wide'>CONDUCT & CHARACTER CERTIFICATE</h3>
                                            </div>

                                            <div className='text-[22px] leading-[3rem] text-justify px-4 font-serif flex-1'>
                                                <p className='mb-12 indent-20'>
                                                    Certified that <span className='font-bold uppercase'>{studentName}</span>,
                                                    Son / Daughter of <span className='font-bold uppercase'>{fatherName}</span>, was a student of this school
                                                    of <span className='font-bold uppercase'>{student.class}</span> class. He / She has passed / appeared at / failed
                                                    in the ................. Examinations in <strong className='underline'>............</strong>.
                                                </p>
                                                <p className='mb-12'>He / She bears a good moral Character.</p>
                                                <p className=''>I wish him / her all success in life.</p>
                                            </div>

                                            <div className='mt-auto flex items-end justify-between px-4 pb-12'>
                                                <div className='text-[20px] font-bold text-gray-800'>
                                                    Date: <span className='font-normal'>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '___________'}</span>
                                                </div>
                                                <div className='text-center hidden print:block'>
                                                    <div className='h-24 w-32 flex flex-col items-center justify-center text-gray-300 text-xs font-bold border-2 border-dashed border-gray-200 rounded-lg'>
                                                        <span>OFFICE SEAL</span>
                                                    </div>
                                                </div>
                                                <div className='text-center min-w-[200px]'>
                                                    {principalSign && <img src={principalSign} className='h-24 w-auto object-contain mb-2 mx-auto mix-blend-multiply' alt="Principal Sign" />}
                                                    <p className='text-[20px] font-bold uppercase border-t border-black pt-2'>Principal</p>
                                                </div>
                                            </div>
                                            {qrCode && (
                                                <div className='absolute bottom-8 left-8 w-24 h-24 border border-gray-100 p-1 bg-white'>
                                                    <img src={qrCode} alt='QR' className='w-full h-full' />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Default Character Certificate (BCHARCERT style)
                        return (
                            <div key={`${student.AMST_Id || 's'}-${index}`} className='char-a4-page shadow-2xl print:shadow-none bg-white'>
                                <div className='char-a4-container char-bg-watermark'>
                                    <div className='char-content-wrapper pt-[200px]'>
                                        <div className='text-center space-y-6'>
                                            <h2 className='text-[48px] font-black underline uppercase tracking-[0.1em] text-gray-900'>CHARACTER CERTIFICATE</h2>
                                            <h3 className='text-[22px] italic font-serif text-gray-600 tracking-wider'>TO WHOMSOEVER IT MAY CONCERNS</h3>
                                        </div>

                                        <div className='flex justify-end mt-16 px-8'>
                                            <h4 className='text-[22px] font-medium'>Date : <span className='font-bold underline'>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</span></h4>
                                        </div>

                                        <div className='text-[26px] leading-[3.8rem] text-justify px-8 mt-24 font-serif'>
                                            <p className='indent-24'>
                                                This is certified that Kumar/Kumari <span className='font-bold uppercase underline decoration-2 underline-offset-8'>{studentName}</span>
                                                child of Sri. <span className='font-bold uppercase'>{fatherName}</span> is a bonafide student of class <span className='font-bold uppercase'>{student.class} {classWords ? `(${classWords})` : ''}</span>
                                                for the academic year <span className='font-bold underline'>{academicYear}</span>.
                                                Her/His admission number is <span className='font-bold underline'>{admNo}.</span>
                                                He/She is good in studies, sports as well as in co-curricular activities.
                                            </p>
                                            <p className='mt-20 indent-24'>He / She bears a good moral character.</p>
                                        </div>

                                        <div className='mt-auto pb-12 px-8 grid grid-cols-2 items-end gap-20'>
                                            <div className='flex flex-col items-start'>
                                                {qrCode && (
                                                    <div className='border-2 border-gray-100 p-2 bg-white shadow-sm' style={{ width: '130px', height: '130px' }}>
                                                        <img src={qrCode} alt='QR' className='w-full h-full object-contain' />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex flex-col items-center'>
                                                {principalSign && (
                                                    <div className='h-28 w-60 mb-2'>
                                                        <img src={principalSign} alt='Signature' className='h-full w-full object-contain mix-blend-multiply' />
                                                    </div>
                                                )}
                                                <div className='w-full border-t-2 border-gray-900 mt-2 pt-2 text-center'>
                                                    <h4 className='font-bold text-[24px] uppercase tracking-wide'>Head of the School</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

CharacterCertificate.displayName = 'CharacterCertificate';

export default CharacterCertificate;

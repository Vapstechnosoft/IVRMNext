'use client';

import { format } from 'date-fns';
import { StudyCertificateResponse } from '@/types/admission/preadmission/reports';
import React from 'react';

type CertificateProps = {
    data: StudyCertificateResponse | null;
    selectedDate: Date | null;
    addressType?: 'address_per' | 'address_con';
    parentType?: '0' | '1' | '2';
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

const getOrdinalSuffix = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) {
        return 'st';
    }
    if (j === 2 && k !== 12) {
        return 'nd';
    }
    if (j === 3 && k !== 13) {
        return 'rd';
    }
    return 'th';
};

const StudyCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(
    ({ data, selectedDate, addressType = 'address_per', parentType = '0', qrCode }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) {
            return (
                <div ref={ref} className="p-10 text-center text-gray-400 bg-white">
                    No student data available for Study Certificate.
                </div>
            );
        }

        const students = data.studentList;
        const principalSign = data.principalSign?.[0]?.ivrmgC_PrincipalSign || data.principalSign?.[0]?.IVRMSIG_Signature || '';
        const mI_Id = data.masterCompany?.[0]?.mI_Id;

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
                            .study-a4-page {
                                page-break-after: always;
                                width: 210mm;
                                min-height: 297mm;
                                margin: 0 auto;
                                position: relative;
                            }
                            .study-a4-page:last-child {
                                page-break-after: auto;
                            }
                        }

                        .study-a4-container {
                            width: 210mm;
                            height: 297mm;
                            padding: 15mm;
                            margin: 0 auto;
                            position: relative;
                            overflow: hidden;
                            background: white;
                            display: flex;
                            flex-direction: column;
                            font-family: 'Times New Roman', Times, serif;
                        }

                        .study-content-wrapper {
                            position: relative;
                            z-index: 1;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }

                        .text-justify {
                            text-align: justify;
                        }
                    `
                    }}
                />
                <div className='print-component-wrapper bg-gray-100 print:bg-white flex flex-col items-center gap-8 py-8 print:py-0 print:gap-0'>
                    {students.map((student, index) => {
                        const logoBase64 = student.MI_Logo || '';

                        // Address Logic
                        const perAddr = `${student.street || ''} ${student.area || ''} ${student.city || ''} ${student.pincode || ''}`.trim() || student.addressd1;
                        const conAddr = `${student.constreet || ''} ${student.conarea || ''} ${student.concity || ''}`.trim() || student.addressd13;
                        const fullAddress = addressType === 'address_per' ? perAddr : conAddr;
                        const countryName = addressType === 'address_per' ? student.addressd1 : student.addressd13;

                        const fatherName = student.fathername || '';
                        const motherName = student.mothername || '';
                        let parentDisplay = fatherName;
                        if (parentType === '1') parentDisplay = motherName;
                        if (parentType === '2') parentDisplay = `Mr. ${fatherName} and Mrs. ${motherName}`;

                        const formattedDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
                        const formattedDateLong = selectedDate ? format(selectedDate, 'dd MMMM, yyyy') : format(new Date(), 'dd MMMM, yyyy');

                        const dateObj = selectedDate || new Date();
                        const day = dateObj.getDate();
                        const month = format(dateObj, 'MMMM');
                        const year = dateObj.getFullYear();
                        const suffix = getOrdinalSuffix(day);

                        const dobObj = student.dob ? new Date(student.dob) : null;
                        const dobDay = dobObj ? dobObj.getDate() : '';
                        const dobMonth = dobObj ? format(dobObj, 'MMMM') : '';
                        const dobYear = dobObj ? dobObj.getFullYear() : '';
                        const dobSuffix = dobObj ? getOrdinalSuffix(dobObj.getDate()) : '';

                        // Baldwin Co-Education (MI_Id = 5)
                        if (mI_Id === 5) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page shadow-2xl print:shadow-none bg-white'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mt-[160px] mx-[40px]'>
                                            <div className='text-center mb-12'>
                                                <h2 className='text-[36px] font-bold underline tracking-wider'>STUDY CERTIFICATE</h2>
                                            </div>

                                            <table className='w-full text-[20px] leading-[3rem]'>
                                                <tbody>
                                                    <tr>
                                                        <td className='w-[160px] border-none uppercase'>ADMN NO.</td>
                                                        <td className='font-bold border-none uppercase'>: {student.admno}</td>
                                                        <td className='font-bold text-right border-none'>Date : {formattedDate}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className='mt-16 text-[22px] leading-[3.2rem] space-y-4'>
                                                <p>This is to certify that <span className='font-bold uppercase'>{student.studentnam}</span></p>
                                                <p>son / daughter of <span className='font-bold uppercase'>MR. {fatherName} and MRS. {motherName}</span></p>
                                                <p>is bonafide student of this school studying in <span className='font-bold uppercase'>{student.class} {student.section}</span></p>
                                                <p>of the school year being <span className='font-bold'>{student.acadamicyear}</span></p>
                                                <p>residing at <span className='font-bold uppercase'>{countryName || fullAddress}</span></p>
                                                <p>His / Her date of birth, as per our records is (in figures) <span className='font-bold underline'>{student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : ''}</span></p>
                                                <p>(in words) <span className='font-bold uppercase underline'>{student.dobwords}</span></p>
                                            </div>

                                            <div className='mt-auto mb-16 flex flex-col items-end'>
                                                {principalSign && <img src={principalSign} className='w-[220px] h-auto object-contain mb-2 mix-blend-multiply' alt="Principal Sign" />}
                                                <p className='text-[20px] font-bold border-t-2 border-black pt-2'>Signature of Head of the School</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Baldwin Girls (MI_Id = 4)
                        if (mI_Id === 4) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page shadow-2xl print:shadow-none bg-white'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mt-[200px] mx-[20px]'>
                                            <div className='text-center mb-8'>
                                                <h2 className='text-[32px] font-bold underline decoration-2'>STUDY CERTIFICATE</h2>
                                            </div>
                                            <div className='flex justify-end mb-20'>
                                                <h5 className='text-[20px] font-medium'>{formattedDateLong}</h5>
                                            </div>
                                            <div className='space-y-12'>
                                                <h4 className='text-[24px] font-bold underline mb-8'>TO WHOMSOEVER IT MAY CONCERN</h4>
                                                <div className='text-justify leading-[2.5] text-[21px]'>
                                                    <p>
                                                        This is to certify that <span className='font-bold uppercase underline'>{student.studentnam}</span> son / daughter of<br />
                                                        Mr. {fatherName} & Mrs. {motherName} <br />
                                                        is a bonafide student of this Institution. She is studying<br />
                                                        in Std. <span className='font-bold uppercase underline'>{student.class}'{student.section}'</span> during the academic year <span className='font-bold underline'>{student.acadamicyear}</span>.
                                                    </p>
                                                    <p className='mt-8'>
                                                        Her date of birth according to our Admission register<br />
                                                        is <span className='font-bold underline'>{student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : ''}</span>. Her address is as follows:
                                                    </p>
                                                    <div className='mt-10 pl-6 border-l-4 border-gray-100 uppercase font-bold text-[20px] tracking-wide'>
                                                        Mr. {fatherName}<br />
                                                        {student.street} <br />
                                                        {student.area} <br />
                                                        {student.city} {student.pincode ? `- ${student.pincode}` : ''}.
                                                    </div>
                                                </div>
                                                <div className='mt-auto pt-24 flex justify-end pb-12'>
                                                    <div className='text-right'>
                                                        {principalSign && <img src={principalSign} className='w-[200px] h-auto object-contain mb-2 ml-auto mix-blend-multiply' alt="Principal Sign" />}
                                                        <div className='border-t-2 border-black pt-2'>
                                                            <p className='text-[20px] font-bold leading-tight'>
                                                                Mrs. Indira Williams<br />
                                                                <span className='text-[18px] font-normal'>Principal</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Baldwin Boys (MI_Id = 6)
                        if (mI_Id === 6) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page shadow-2xl print:shadow-none bg-white'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mt-[180px] mx-[20px]'>
                                            <div className='flex justify-end mb-12'>
                                                <h5 className='text-[20px] font-medium border-b border-black'>
                                                    {day}<sup>{suffix}</sup> {month} {year}
                                                </h5>
                                            </div>
                                            <div className='text-center mb-16'>
                                                <h4 className='text-[32px] font-extrabold uppercase tracking-[0.2em] underline decoration-4 underline-offset-8'>STUDY CERTIFICATE</h4>
                                            </div>
                                            <div className='text-justify leading-[2.8] text-[22px] font-serif'>
                                                <p className='indent-20'>
                                                    This is to certify that Master <span className='font-bold uppercase underline'>{student.studentnam}</span>, son of
                                                    <span className='font-bold'> {parentDisplay}</span> is a bonafide student of this institution and
                                                    is studying in <span className='font-bold uppercase'>{student.class} {student.section}</span> for the academic year <span className='font-bold underline'>{student.acadamicyear}</span>. His
                                                    admission no. is <span className='font-bold underline'>{student.admno}</span> and date of birth is <span className='font-bold underline'>{dobDay}<sup>{dobSuffix}</sup> {dobMonth} {dobYear}</span>
                                                    as per the school records. He resides at the address mentioned below.
                                                </p>
                                            </div>
                                            <div className='mt-16'>
                                                <h5 className='font-bold text-[20px] mb-4 font-serif underline'>ADDRESS:</h5>
                                                <div className='ml-10 text-[20px] leading-relaxed uppercase border-l-4 border-gray-100 pl-6 font-bold tracking-wider'>
                                                    <div>{student.street}</div>
                                                    <div>{student.area}</div>
                                                    <div>{student.city} {student.pincode ? `- ${student.pincode}` : ''}</div>
                                                </div>
                                            </div>
                                            <div className='mt-auto mb-16 flex flex-col items-end'>
                                                {principalSign && <img src={principalSign} className='w-[200px] h-auto object-contain mb-2 mix-blend-multiply' alt="Principal Sign" />}
                                                <p className='font-bold text-[22px] border-t-2 border-black pt-2 px-8'>Principal</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Common Layout
                        return (
                            <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page shadow-2xl print:shadow-none bg-white'>
                                <div className='study-a4-container'>
                                    <div className='study-content-wrapper p-8 border-4 border-black border-double h-full'>
                                        <div className='mb-8'>
                                            {logoBase64 ? <img src={logoBase64} className='max-h-[120px] mx-auto object-contain' alt="Logo" /> : <div className='text-center font-bold text-2xl h-[120px] flex items-center justify-center border-2 border-dashed border-gray-200'>INSTITUTION LOGO</div>}
                                        </div>

                                        <div className='text-center mb-12 border-y-2 border-black py-4'>
                                            <h3 className='text-[32px] font-black uppercase tracking-[0.1em]'>STUDY CERTIFICATE</h3>
                                        </div>

                                        <div className='flex justify-between items-start mt-8 relative'>
                                            <div className='space-y-8 flex-1 text-[22px] leading-[3rem]'>
                                                <div className='flex items-center gap-4'>
                                                    <span className='font-bold whitespace-nowrap'>This is to certify that</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 font-bold uppercase text-center'>{student.studentnam}</div>
                                                </div>
                                                <div className='flex items-center gap-4'>
                                                    <span className='font-bold whitespace-nowrap'>Address</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 uppercase text-center'>{fullAddress}</div>
                                                </div>
                                                <div className='flex items-center gap-4 flex-wrap'>
                                                    <span className='font-bold whitespace-nowrap'>Is studying in</span>
                                                    <div className='min-w-[150px] border-b-2 border-dotted border-black px-4 font-bold text-center'>{student.class}</div>
                                                    <span className='font-bold'>Std. during the year</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 font-bold text-center'>{student.acadamicyear}</div>
                                                </div>
                                                <div className='flex items-center gap-4'>
                                                    <span className='font-bold whitespace-nowrap'>His/her Date of birth is</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 font-bold uppercase text-center'>
                                                        {student.dob ? format(new Date(student.dob), 'dd MMMM, yyyy') : ''}
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-4'>
                                                    <span className='font-bold whitespace-nowrap'>In words:</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 font-bold uppercase text-center text-[18px]'>{student.dobwords}</div>
                                                </div>
                                                <div className='flex items-center gap-4'>
                                                    <span className='font-bold whitespace-nowrap'>Caste :</span>
                                                    <div className='flex-1 border-b-2 border-dotted border-black px-4 uppercase text-center'>{student.caste_name}</div>
                                                    <span className='font-bold whitespace-nowrap'>Adm No. :</span>
                                                    <div className='min-w-[200px] border-b-2 border-dotted border-black px-4 font-bold uppercase text-center'>{student.admno}</div>
                                                </div>
                                            </div>

                                            {qrCode && (
                                                <div className='absolute right-0 top-0 w-[140px] h-[140px] border-2 border-gray-100 p-2 bg-white shadow-sm'>
                                                    <img src={qrCode} className='w-full h-full object-contain' alt="QR Code" />
                                                </div>
                                            )}
                                        </div>

                                        <div className='mt-12 text-[20px] italic font-medium text-center px-12 leading-relaxed'>
                                            "I do hereby declare that the above particulars are correct as mentioned in the relevant school records."
                                        </div>

                                        <div className='mt-auto pt-16 grid grid-cols-2 gap-20 items-end px-4'>
                                            <div className='space-y-4 font-bold text-[20px]'>
                                                <div className='flex gap-2'><span>Place:</span><span className='uppercase'>{student.IVRMMCT_Name || 'BANGALORE'}</span></div>
                                                <div className='flex gap-2'><span>Date:</span><span>{formattedDateLong}</span></div>
                                            </div>
                                            <div className='text-center'>
                                                {principalSign && <img src={principalSign} className='h-24 mx-auto mb-2 mix-blend-multiply' alt="Principal Sign" />}
                                                <div className='border-t-2 border-black pt-2'>
                                                    <p className='font-bold text-[22px] uppercase'>Principal Signature</p>
                                                    <p className='text-sm'>(With School Seal)</p>
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

StudyCertificate.displayName = 'StudyCertificate';

export default StudyCertificate;

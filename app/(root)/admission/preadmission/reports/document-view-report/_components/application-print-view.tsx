'use client';

import { format } from 'date-fns';
import type React from 'react';

interface ApplicationPrintViewProps {
    data: any;
    printRef?: React.RefObject<HTMLDivElement>;
}

export default function ApplicationPrintView({ data, printRef }: ApplicationPrintViewProps) {
    if (!data) return null;

    const details = data.details?.[0] || data.details || {};
    const academicYear = data.academic_year || '';
    const _className = data.asmcL_ClassName || '';

    // Helper to format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch (_e) {
            return dateStr;
        }
    };

    // Extract DOB parts
    const dob = details.PASR_DOB ? new Date(details.PASR_DOB) : null;
    const dobDay = dob ? format(dob, 'dd') : '';
    const dobMonth = dob ? format(dob, 'MM') : '';
    const dobYear = dob ? format(dob, 'yyyy') : '';

    return (
        <div ref={printRef} className='max-h-[80vh] overflow-auto bg-white p-4 text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .img-style {
                    width: 110px;
                    height: 100px;
                    border: 1px solid #ddd;
                    float: right;
                }
                .office-use-box {
                    width: 400px;
                    margin: auto;
                    border: 1px solid #000;
                    padding: 10px;
                }
                .inlineTable1 {
                    display: inline-block;
                    float: left;
                    width: 30% !important;
                    padding-top: 15px !important;
                }
                .inlineTable2 {
                    display: inline-block;
                    float: left;
                    width: 48% !important;
                    padding-top: 10px !important;
                }
                .inlineTable3 {
                    display: inline-block;
                    float: right;
                    width: 20% !important;
                }
                .border-bottom {
                    border-bottom: 1px solid #000;
                    display: inline-block;
                    min-width: 50px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                td {
                    padding: 5px;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
            `
                }}
            />

            <div id='printSectionId'>
                {/* Header Section */}
                <div className='mb-6 flex items-start justify-between'>
                    <div className='inlineTable1'>
                        <table className='w-full'>
                            <tbody>
                                <tr>
                                    <td className='w-32'>Registration No.</td>
                                    <td className='border-bottom'>{details.PASR_RegistrationNo}</td>
                                </tr>
                                <tr>
                                    <td>Date:</td>
                                    <td className='border-bottom'>{formatDate(details.PASR_Date)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='inlineTable2 text-center'>
                        <h2 className='font-bold text-xl uppercase'>Baldwin Girls' High School</h2>
                        <p className='text-sm'># Richmond Road, Bangalore - 560 025</p>
                        <h3 className='mt-2 font-bold text-lg'>PRE-ADMISSION REGISTRATION FORM</h3>
                        <p className='font-bold'>Academic Year {academicYear}</p>
                    </div>

                    <div className='inlineTable3'>
                        <img src={details.PASR_Student_Pic_Path || '/placeholder-user.png'} className='img-style' alt='Student' />
                    </div>
                </div>

                <div className='clear-both' />

                {/* Form Content */}
                <div className='mt-4'>
                    <table className='w-full border-black border-t border-r border-b border-l'>
                        <tbody>
                            <tr>
                                <td className='w-1/4 border-black border-r border-b font-bold'>Name of the Candidate</td>
                                <td className='border-black border-b uppercase'>
                                    {details.PASR_FirstName} {details.PASR_MiddleName} {details.PASR_LastName}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Date of Birth</td>
                                <td className='border-black border-b'>
                                    <span className='mr-4'>
                                        Day: <span className='border-bottom px-2'>{dobDay}</span>
                                    </span>
                                    <span className='mr-4'>
                                        Month: <span className='border-bottom px-2'>{dobMonth}</span>
                                    </span>
                                    <span>
                                        Year: <span className='border-bottom px-4'>{dobYear}</span>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Place of Birth</td>
                                <td className='border-black border-b'>{details.PASR_BirthPlace}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Nationality</td>
                                <td className='border-black border-b'>{details.PASR_Nationality}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Religion & Caste</td>
                                <td className='border-black border-b'>
                                    {details.PASR_Religion} / {details.PASR_Caste}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Residential Address</td>
                                <td className='border-black border-b'>
                                    {details.PASR_PerStreet}, {details.PASR_PerCity}, {details.PASR_PerState} - {details.PASR_PerPincode}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Mobile No.</td>
                                <td className='border-black border-b'>{details.PASR_MobileNo}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Email ID</td>
                                <td className='border-black border-b'>{details.PASR_EmailId}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h4 className='mt-4 mb-2 font-bold underline'>Parent Details</h4>
                    <table className='w-full border border-black'>
                        <thead>
                            <tr className='border-black border-b'>
                                <th className='border-black border-r p-2'>Particulars</th>
                                <th className='border-black border-r p-2'>Father</th>
                                <th className='p-2'>Mother</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Name</td>
                                <td className='border-black border-r'>{details.PASR_FatherName}</td>
                                <td>{details.PASR_MotherName}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Qualification</td>
                                <td className='border-black border-r'>{details.PASR_FatherEducation}</td>
                                <td>{details.PASR_MotherEducation}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Occupation</td>
                                <td className='border-black border-r'>{details.PASR_FatherOccupation}</td>
                                <td>{details.PASR_MotherOccupation}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Designation</td>
                                <td className='border-black border-r'>{details.PASR_FatherDesignation}</td>
                                <td>{details.PASR_MotherDesignation}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r font-bold'>Mobile No.</td>
                                <td className='border-black border-r'>{details.PASR_FatherMobleNo}</td>
                                <td>{details.PASR_MotherMobleNo}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-6 flex justify-between'>
                        <div className='w-48 border-black border-t pt-10 text-center'>Parent Signature</div>
                        <div className='w-48 border-black border-t pt-10 text-center'>Principal Signature</div>
                    </div>
                </div>

                {/* Office Use Box */}
                <div className='office-use-box mt-10'>
                    <p className='text-center font-bold underline'>FOR OFFICE USE ONLY</p>
                    <div className='mt-4 space-y-2'>
                        <p>
                            Admitted to Class: <span className='ml-2 w-32 border-bottom' />
                        </p>
                        <p>
                            Date of Admission: <span className='ml-2 w-32 border-bottom' />
                        </p>
                        <p>
                            Admission No: <span className='ml-4 w-32 border-bottom' />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ApplicationPrintViewProps {
    data: any;
    printRef?: React.RefObject<HTMLDivElement>;
}

export default function ApplicationPrintView({ data, printRef }: ApplicationPrintViewProps) {
    if (!data) return null;

    const rawDetails = data.studentReg_DTObj?.[0] || data.result?.student_details || data.details?.[0] || data.details || {};

    // Create a case-insensitive proxy for details to handle API response variations
    const details = new Proxy(rawDetails, {
        get(target, prop) {
            if (typeof prop !== 'string') return target[prop as keyof typeof target];
            if (target[prop] !== undefined) return target[prop];
            const lowerProp = prop.toLowerCase();
            const key = Object.keys(target).find(k => k.toLowerCase() === lowerProp);
            return key ? target[key] : undefined;
        }
    });

    const academicYear = data.academic_year || data.academicdrp?.[0]?.asmaY_Year || details.asmaY_Year || '';
    const className = data.asmcL_ClassName || data.studentClass?.[0]?.asmcL_ClassName || details.asmcL_ClassName || '';
    const schoolLogo = data.masterCompany?.[0]?.logo || '';

    // Helper to format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    // Extract DOB parts
    const dob = details.PASR_DOB ? new Date(details.PASR_DOB) : null;
    const dobDay = dob ? format(dob, 'dd') : '';
    const dobMonth = dob ? format(dob, 'MM') : '';
    const dobYear = dob ? format(dob, 'yyyy') : '';

    return (
        <div ref={printRef} className="bg-white p-4 text-black overflow-auto max-h-[80vh]">
            <style dangerouslySetInnerHTML={{
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
            ` }} />

            <div id="printSectionId">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="inlineTable1">
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32">Registration No.</td>
                                    <td className="border-bottom">{details.PASR_RegistrationNo}</td>
                                </tr>
                                <tr>
                                    <td>Date:</td>
                                    <td className="border-bottom">{formatDate(details.PASR_Date)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="inlineTable2 text-center">
                        {schoolLogo && (
                            <img src={schoolLogo} alt="Institution Logo" style={{ height: '80px', margin: '0 auto', display: 'block' }} />
                        )}
                        <h3 className="text-lg font-bold mt-2">PRE-ADMISSION REGISTRATION FORM</h3>
                        <p className="font-bold">Academic Year {academicYear}</p>
                    </div>

                    <div className="inlineTable3">
                        <img src={details.PASR_Student_Pic_Path || '/placeholder-user.png'} className="img-style" alt="Student" />
                    </div>
                </div>

                <div className="clear-both"></div>

                {/* Form Content */}
                <div className="mt-4">
                    <table className="w-full border-t border-l border-r border-b border-black">
                        <tbody>
                            <tr>
                                <td className="w-1/4 font-bold border-r border-b border-black">Name of the Candidate</td>
                                <td className="border-b border-black uppercase">
                                    {details.PASR_FirstName} {details.PASR_MiddleName} {details.PASR_LastName}
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Date of Birth</td>
                                <td className="border-b border-black">
                                    <span className="mr-4">Day: <span className="border-bottom px-2">{dobDay}</span></span>
                                    <span className="mr-4">Month: <span className="border-bottom px-2">{dobMonth}</span></span>
                                    <span>Year: <span className="border-bottom px-4">{dobYear}</span></span>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Place of Birth</td>
                                <td className="border-b border-black">{details.PASR_BirthPlace}</td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Nationality</td>
                                <td className="border-b border-black">{details.PASR_Nationality}</td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Religion & Caste</td>
                                <td className="border-b border-black">
                                    {details.PASR_Religion} / {details.PASR_Caste}
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Residential Address</td>
                                <td className="border-b border-black">
                                    {details.PASR_PerStreet}, {details.PASR_PerCity}, {details.PASR_PerState} - {details.PASR_PerPincode}
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Mobile No.</td>
                                <td className="border-b border-black">{details.PASR_MobileNo}</td>
                            </tr>
                            <tr>
                                <td className="font-bold border-r border-b border-black">Email ID</td>
                                <td className="border-b border-black">{details.PASR_EmailId}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h4 className="font-bold mt-4 mb-2 underline">Parent Details</h4>
                    <table className="w-full border border-black">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="border-r border-black p-2">Particulars</th>
                                <th className="border-r border-black p-2">Father</th>
                                <th className="p-2">Mother</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="border-r border-black font-bold">Name</td>
                                <td className="border-r border-black">{details.PASR_FatherName}</td>
                                <td>{details.PASR_MotherName}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-r border-black font-bold">Qualification</td>
                                <td className="border-r border-black">{details.PASR_FatherEducation}</td>
                                <td>{details.PASR_MotherEducation}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-r border-black font-bold">Occupation</td>
                                <td className="border-r border-black">{details.PASR_FatherOccupation}</td>
                                <td>{details.PASR_MotherOccupation}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-r border-black font-bold">Designation</td>
                                <td className="border-r border-black">{details.PASR_FatherDesignation}</td>
                                <td>{details.PASR_MotherDesignation}</td>
                            </tr>
                            <tr>
                                <td className="border-r border-black font-bold">Mobile No.</td>
                                <td className="border-r border-black">{details.PASR_FatherMobleNo}</td>
                                <td>{details.PASR_MotherMobleNo}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-16 flex justify-between">
                        <div className="text-center pt-2 border-t border-black w-40">Parent Signature</div>
                        <div className="text-center pt-2 border-t border-black w-40">Principal Signature</div>
                    </div>
                </div>

                {/* Office Use Box */}
                <div className="office-use-box mt-30">
                    <p className="font-bold text-center underline">FOR OFFICE USE ONLY</p>
                    <div className="mt-4 space-y-2 text-left px-4">
                        <p>Admitted to Class: <span className="border-bottom w-48 ml-2 text-center">{className}</span></p>
                        <p>Date of Admission: <span className="border-bottom w-48 ml-2 text-center">{formatDate(details.PASR_Date)}</span></p>
                        <p>Admission No: <span className="border-bottom w-48 ml-4 text-center">{details.PASR_RegistrationNo}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

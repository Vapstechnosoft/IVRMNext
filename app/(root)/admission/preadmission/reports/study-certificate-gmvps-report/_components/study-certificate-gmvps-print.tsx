'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StudyCertificateGMVPSPrintProps {
    data: any;
    certificateType: 'study' | 'character';
    selectedDate: Date | null;
    addressType: 'permanent' | 'communication';
    parentType: '0' | '1' | '2';
    qrCode?: string;
}

const getOrdinalSuffix = (day: number) => {
    const j = day % 10, k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
};

const mapClassToWords = (className: string) => {
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
        default: return className?.toUpperCase() || '';
    }
};

export const StudyCertificateGMVPSPrint = React.forwardRef<HTMLDivElement, StudyCertificateGMVPSPrintProps>(
    ({ data, certificateType, selectedDate, addressType, parentType, qrCode }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) return null;

        const students = data.studentList;
        const formattedCurrentDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

        return (
            <div ref={ref} className="bg-white text-black font-serif">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 0; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                        }
                        .page-container {
                            width: 210mm !important;
                            height: 290mm !important;
                            padding: 5mm !important;
                            box-sizing: border-box !important;
                            page-break-after: always !important;
                            background: white !important;
                            display: block !important;
                        }
                    }
                    .page-container {
                        width: 210mm;
                        height: 290mm;
                        padding: 10mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                        font-family: "Times New Roman", Times, serif;
                    }
                    .outer-border {
                        border: 1px solid black !important;
                        height: 100%;
                        width: 100%;
                        padding: 1mm;
                        box-sizing: border-box;
                    }
                    .inner-border {
                        border: 2px solid black !important;
                        height: 100%;
                        width: 100%;
                        padding: 10mm 10mm;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        position: relative;
                    }
                    .underline { border-bottom: 1.5px solid black !important; display: inline-block; min-width: 50px; text-align: center; }
                    .border-bottom { border-bottom: 1.5px solid black !important; padding-bottom: 2px; }
                    .text-bold { font-weight: bold !important; }
                    .header-margin { margin-top: 20px; }
                    .certificate-content { line-height: 2.2; font-size: 17px; margin-top: 30px; }
                ` }} />

                {students.map((student: any, index: number) => (
                    <div key={index} className="page-container">
                        <div className="outer-border">
                            <div className="inner-border">
                                {certificateType === 'study' ? (
                                    <>
                                        <div className="header-margin text-center mb-6">
                                            <h3 className="text-xl font-bold uppercase underline tracking-wider">TO WHOMSOEVER IT MAY CONCERN</h3>
                                        </div>

                                        <div className="flex justify-end mb-4">
                                            <div className="font-bold">
                                                Date: <span >{formattedCurrentDate}</span>
                                            </div>
                                        </div>

                                        <div className="certificate-content space-y-4">
                                            <div className="flex items-end leading-relaxed">
                                                <span className="font-bold whitespace-nowrap">This is to certify that Sri/Kum</span>
                                                <span className="flex-1 border-bottom border-black text-center font-bold px-2">{student.studentnam?.toUpperCase()}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">S/o / D/o</span>
                                            </div>

                                            <div className="flex items-end leading-relaxed">
                                                <span className="flex-1 border-bottom border-black text-center font-bold px-2">{student.fatherName || student.fathername}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">has studied from Class</span>
                                                <span className="w-[120px] border-bottom border-black text-center font-bold px-2">{mapClassToWords(student.admitedclass)}</span>
                                            </div>

                                            <div className="flex items-end leading-relaxed">
                                                <span className="font-bold whitespace-nowrap">to</span>
                                                <span className="w-[120px] border-bottom border-black text-center font-bold px-2">{mapClassToWords(student.class)}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">in our institution from</span>
                                                <span className="border-bottom border-black text-center font-bold px-2 w-[120px]">{student.admitedyear || (student.joindate ? format(new Date(student.joindate), 'yyyy') : '')}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">To</span>
                                                <span className="border-bottom border-black text-center font-bold px-2 flex-1">{student.acadamicyear}</span>
                                            </div>

                                            <div className="font-bold">academic years.</div>

                                            <div className="flex items-end leading-relaxed pt-2">
                                                <span className="font-bold whitespace-nowrap">He / She belong to</span>
                                                <span className="border-bottom border-black text-center font-bold px-4 flex-1">{student.caste_name?.toUpperCase()}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">Religion/Caste and mother tongue of the</span>
                                            </div>

                                            <div className="flex items-end leading-relaxed">
                                                <span className="font-bold whitespace-nowrap">Candidate is</span>
                                                <span className="border-bottom border-black text-center font-bold px-4 w-[200px]">{(student.stumt || student.stuMT)?.toUpperCase()}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">as per the Admission register of the Institution.</span>
                                            </div>

                                            <div className="font-bold pt-4">The above details are true and correct to the best of my knowledge.</div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 pt-16">
                                            <div className="flex flex-col justify-end">
                                                <div className="font-bold mb-10 text-lg">Institution Seal</div>
                                                {(student.qrCode || qrCode) && (
                                                    <div className="mb-4">
                                                        <img src={student.qrCode || qrCode} alt="QR Code" className="w-24 h-24" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center text-center">
                                                <div className="font-bold whitespace-nowrap leading-tight">Signature Head of the<br />Institution</div>
                                                <div className="font-bold mt-4">Name in block letters</div>
                                                <div className="font-bold border-bottom border-black mt-1 px-4 min-w-[150px]">({student.area?.toUpperCase() || '__________'})</div>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-4 text-center border-t border-black">
                                            <div className="font-bold uppercase tracking-widest text-base mb-1">COUNTER SIGNED BY ME</div>
                                            <div className="text-sm font-bold">Address, Seal & Office Telephone Number</div>
                                            <div className="text-sm font-bold">Of the Block Educational officer / DDPI</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="margin-top-250">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold underline">CHARACTER CERTIFICATE</h2>
                                            <div className="mt-2">TO WHOMSOEVER IT MAY CONCERN</div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <h4 className="font-bold">Date : {formattedCurrentDate}</h4>
                                        </div>
                                        <div className="mt-10 leading-relaxed text-lg">
                                            <p className="indent-10">
                                                This is certified that Kumar/Kumari <span className="font-bold uppercase">{student.studentnam}</span> child of Sri. <span className="font-bold">{student.fatherName || student.fathername}</span> is a bonafide student of class <span className="font-bold">{student.class}</span> for the academic year <span className="font-bold">{student.acadamicyear}</span>. Her admission number is <b>{student.admNo || student.admno}.</b> He/She is good in studies, sports as well as in co-curricular activities.
                                            </p>
                                            <p className="mt-10">
                                                He/She bears a good moral character.
                                            </p>
                                        </div>
                                        <div className="mt-20 flex flex-col items-end">
                                            <div className="pt-2 font-bold">Signature of Head of the School</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
);

StudyCertificateGMVPSPrint.displayName = 'StudyCertificateGMVPSPrint';

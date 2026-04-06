'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BbhsCertificatePrintProps {
    data: any;
    mode: '0' | '1'; // 0: Study, 1: Character
}

export const BbhsCertificatePrint = forwardRef<HTMLDivElement, BbhsCertificatePrintProps>(
    ({ data, mode }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) return null;

        const student = data.studentList[0];
        const { currentDate, principalsign } = data;

        const getOrdinalSuffix = (day: number) => {
            const j = day % 10,
                k = day % 100;
            if (j === 1 && k !== 11) return "st";
            if (j === 2 && k !== 12) return "nd";
            if (j === 3 && k !== 13) return "rd";
            return "th";
        };

        const formatDateWithSuffix = (dateStr: any) => {
            if (!dateStr) return { day: '', suffix: '', month: '', year: '' };
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { day: '', suffix: '', month: '', year: '' };
            
            const monthNames = [
                "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
            ];
            
            const day = date.getDate();
            return {
                day: day,
                suffix: getOrdinalSuffix(day),
                month: monthNames[date.getMonth()],
                year: date.getFullYear()
            };
        };

        const currentFormatted = formatDateWithSuffix(currentDate);
        const dobFormatted = formatDateWithSuffix(student.dob);

        const getClassNameInWords = (className: string) => {
            if (!className) return "";
            const romanToWords: { [key: string]: string } = {
                'I': 'FIRST', 'II': 'SECOND', 'III': 'THIRD', 'IV': 'FOURTH',
                'V': 'FIFTH', 'VI': 'SIXTH', 'VII': 'SEVENTH', 'VIII': 'EIGHTH',
                'IX': 'NINTH', 'X': 'TENTH'
            };
            return romanToWords[className.toString().toUpperCase()] || "";
        };

        const classInWords = getClassNameInWords(student.className);

        const StudyCert = () => (
            <div className="p-[20mm] font-serif text-[#333] leading-relaxed min-h-[297mm] w-[210mm] relative">
                {/* Header Padding for Letterhead */}
                <div className="h-[40mm]"></div>

                {/* Date */}
                <div className="text-right mb-12">
                    <span className="text-base font-semibold">
                        {currentFormatted.day}<sup>{currentFormatted.suffix}</sup> {currentFormatted.month} {currentFormatted.year}
                    </span>
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">STUDY CERTIFICATE</h2>
                </div>

                {/* Content */}
                <div className="text-lg text-justify mb-12 space-y-6">
                    <p>
                        This is to certify that Master <b className="uppercase">{student.studentname}</b>, son of {student.parentNameText} is a bonafide student of this institution and is studying in <b>STD {classInWords} [{student.className}]</b> for the academic year {student.fromYear} to {student.toYear}. 
                        His admission no. is {student.admNo} and date of birth is {dobFormatted.day}<sup>{dobFormatted.suffix}</sup> {dobFormatted.month} {dobFormatted.year} as per the school records. He resides at the address mentioned below.
                    </p>
                </div>

                {/* Address Section */}
                <div className="mt-16 space-y-2">
                    <h4 className="font-bold underline uppercase">Address:</h4>
                    <div className="text-lg pl-2">
                        <p>{student.street}</p>
                        <p>{student.area}</p>
                        <p>{student.city}{student.pincode ? ` - ${student.pincode}` : ''}</p>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-24 flex justify-end pr-[20mm]">
                    <div className="flex flex-col items-center">
                        {principalsign?.ivrmgC_PrincipalSign && (
                            <img 
                                src={principalsign.ivrmgC_PrincipalSign} 
                                alt="Principal Signature" 
                                className="h-16 object-contain mb-2"
                            />
                        )}
                        <p className="font-bold text-xl mt-4">Principal</p>
                    </div>
                </div>
            </div>
        );

        const CharacterCert = () => (
            <div className="p-[20mm] font-serif text-[#333] leading-relaxed min-h-[297mm] w-[210mm] relative">
                {/* Header Padding */}
                <div className="h-[40mm]"></div>

                {/* Title */}
                <div className="text-center mb-10 space-y-2">
                    <h2 className="text-2xl font-bold underline uppercase">Character Certificate</h2>
                    <p className="text-lg font-medium">TO WHOMSOEVER IT MAY CONCERN</p>
                </div>

                {/* Date */}
                <div className="text-right mb-8">
                    <p className="text-lg">Date : {new Date(currentDate).toLocaleDateString('en-GB')}</p>
                </div>

                {/* Content */}
                <div className="text-xl text-justify space-y-10 mt-10">
                    <p className="leading-loose">
                        &nbsp;&nbsp;&nbsp;&nbsp;This is certified that Kumar/Kumari <span className="uppercase font-semibold">{student.studentname}</span> child of Sri. {student.fathername} is a bonafide student of class {student.className} for the academic year {student.acadamicyear}. Her admission number is <b>{student.admNo}.</b>
                    </p>
                    <p>
                        &nbsp;&nbsp;&nbsp;&nbsp;He/She is good in studies, sports as well as in co-curricular activities.
                    </p>
                    <p className="mt-12">
                        He/She bears a good moral character.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-24 flex justify-end pr-[20mm]">
                    <div className="flex flex-col items-end">
                        {principalsign?.ivrmgC_PrincipalSign && (
                            <img 
                                src={principalsign.ivrmgC_PrincipalSign} 
                                alt="Principal Signature" 
                                className="h-20 object-contain mb-4"
                            />
                        )}
                        <p className="text-lg font-bold">Signature of Head of the School</p>
                    </div>
                </div>
            </div>
        );

        return (
            <div ref={ref} className="bg-white text-black print-container">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { 
                            size: A4 portrait; 
                            margin: 0; 
                        }
                        body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                            background: white !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            background: white !important;
                        }
                        .page-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            position: relative !important;
                            overflow: hidden !important;
                            background: white !important;
                            page-break-after: always !important;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                    }
                    .page-container {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                    }
                ` }} />
                <div className="page-container">
                    {mode === '1' ? <CharacterCert /> : <StudyCert />}
                </div>
            </div>
        );
    }
);

BbhsCertificatePrint.displayName = 'BbhsCertificatePrint';

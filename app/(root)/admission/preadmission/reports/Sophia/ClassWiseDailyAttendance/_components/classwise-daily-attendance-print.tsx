'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface ClassWiseDailyAttendancePrintProps {
    data: any[];
    academicYear?: string;
    className?: string;
    sectionName?: string;
    date?: Date;
    logoUrl?: string;
    username?: string;
    disclaimer?: string;
}

export const ClassWiseDailyAttendancePrint = forwardRef<HTMLDivElement, ClassWiseDailyAttendancePrintProps>(
    ({ data, academicYear, className, sectionName, date, logoUrl, username, disclaimer }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const reportDate = date ? format(date, 'dd/MM/yyyy') : '';

        const presentCount = data.filter((r) => r.asa_class_attended === 1 || r.ASA_Class_Attended === 1).length;
        const absentCount = data.filter((r) => r.asa_class_attended === 0 || r.ASA_Class_Attended === 0).length;
        const halfDayCount = data.filter((r) => r.asa_class_attended === 0.5 || r.ASA_Class_Attended === 0.5).length;

        return (
            <div ref={ref} className="print-only bg-white text-black w-full">
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media screen {
                        .print-only {
                            display: none !important;
                        }
                    }
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 5mm;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        .print-only, .print-only * {
                            visibility: visible !important;
                        }
                        .print-only {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            display: block !important;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            border: 1px solid black;
                        }
                        th, td {
                            border: 0.5pt solid black;
                            padding: 4px 6px;
                            text-align: center;
                            font-size: 10px;
                            color: black !important;
                        }
                        th {
                            background-color: transparent !important;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                    }
                    `,
                    }}
                />

                <div className="flex flex-col items-center w-full p-4">
                    {/* Header Section */}
                    <div className="w-full flex items-center justify-between border-b border-black pb-2 mb-2">
                        <div className="flex-shrink-0">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-20 w-100 object-contain" text-align="center" />
                            ) : (
                                <div className="h-20 w-20 border border-dashed flex items-center justify-center text-[20px]">Logo</div>
                            )}
                        </div>

                    </div>

                    {/* Metadata Bars */}
                    <div className="w-full border border-black mb-1">
                        <div className="bg-white text-center py-1 font-bold text-[11px] border-b border-black uppercase">
                            ClassWise Daily Attendance Report For Academic Year: {academicYear}
                        </div>
                        <div className="bg-white text-center py-1 font-bold text-[11px] uppercase">
                            Attendance Details For Class: {className} Section : {sectionName} Date : {reportDate}
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full border-black">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>SL.No.</th>
                                <th className="text-left font-bold border-black">Student Name</th>
                                <th style={{ width: '80px' }}>Roll No.</th>
                                <th style={{ width: '120px' }}>Admission No.</th>
                                <th style={{ width: '80px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="text-left uppercase font-medium">{user.studentname || user.AMST_FirstName}</td>
                                    <td>{user.amay_rollno || user.AMAY_RollNo}</td>
                                    <td>{user.amst_admno || user.AMST_AdmNo}</td>
                                    <td>
                                        {(user.asa_class_attended === 1 || user.ASA_Class_Attended === 1) ? 'Present' :
                                            (user.asa_class_attended === 0.5 || user.ASA_Class_Attended === 0.5) ? 'Half Day' : 'Absent'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Counts Box */}
                    <div className="w-full border-x border-b border-black mt-0">
                        <div className="grid grid-cols-1 border-t border-black text-center text-[10px] font-bold uppercase">
                            <div className="py-0.5 border-b border-black">Number of Present Students: {presentCount}</div>
                            <div className="py-0.5 border-b border-black">Number of Absent Students: {absentCount}</div>
                            <div className="py-0.5">Number of Half Day Present Students(Half Day): {halfDayCount}</div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="w-full text-center mt-4 text-[9px] italic opacity-60">
                        Date: {currentDate} | Generated by: {username || 'System Administrator'} | {disclaimer}
                    </div>
                </div>
            </div>
        );
    }
);

ClassWiseDailyAttendancePrint.displayName = 'ClassWiseDailyAttendancePrint';

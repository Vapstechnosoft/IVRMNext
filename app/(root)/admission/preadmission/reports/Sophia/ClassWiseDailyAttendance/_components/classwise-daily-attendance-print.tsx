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

        const presentCount = data.filter((r) => r.ASA_Class_Attended === 1).length;
        const absentCount = data.filter((r) => r.ASA_Class_Attended === 0).length;
        const halfDayCount = data.filter((r) => r.ASA_Class_Attended === 0.5).length;

        return (
            <div ref={ref} className="print-container bg-white text-black min-h-[100vh] w-full">
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        body {
                            visibility: hidden !important;
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            position: absolute;
                            left: 0mm;
                            top: 0mm;
                            width: 100%;
                            padding: 10mm;
                            margin: 0;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 0.5pt solid black;
                            padding: 6px;
                            text-align: center;
                            font-size: 11px;
                        }
                        th {
                            background-color: #f1f1f1 !important;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                    `,
                    }}
                />

                <div className="p-2 flex flex-col items-center w-full">
                    {/* Header */}
                    {logoUrl && (
                        <div className="flex justify-center mb-4">
                            <img src={logoUrl} alt="Logo" className="h-24 object-contain" />
                        </div>
                    )}
                    <h2 className="text-lg font-bold uppercase underline mb-4 text-center">ClassWise Daily Attendance Report</h2>

                    <div className="w-full grid grid-cols-2 gap-4 text-sm font-semibold mb-2">
                        <div className="border p-2">Academic Year: {academicYear}</div>
                        <div className="border p-2">Date: {reportDate}</div>
                        <div className="border p-2">Class: {className}</div>
                        <div className="border p-2">Section: {sectionName}</div>
                    </div>

                    {/* Table */}
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th style={{ width: '50px' }}>SL.No.</th>
                                <th className="text-left font-bold border-black">Student Name</th>
                                <th style={{ width: '80px' }}>Roll No.</th>
                                <th style={{ width: '120px' }}>Admission No.</th>
                                <th style={{ width: '100px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="text-left">{user.AMST_FirstName}</td>
                                    <td>{user.AMAY_RollNo}</td>
                                    <td>{user.AMST_AdmNo}</td>
                                    <td className="font-medium">
                                        {user.ASA_Class_Attended === 1 ? 'Present' : user.ASA_Class_Attended === 0.5 ? 'Half Day' : 'Absent'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t">
                            <tr>
                                <td colSpan={5} className="p-0">
                                    <div className="p-2 text-left space-y-1 font-bold bg-gray-50">
                                        <div>
                                            Number of Present Students:{' '}
                                            <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs">
                                                {presentCount}
                                            </span>
                                        </div>
                                        <div>
                                            Number of Absent Students:{' '}
                                            <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs">
                                                {absentCount}
                                            </span>
                                        </div>
                                        <div>
                                            Number of Half Day Present Students:{' '}
                                            <span className="ml-2 inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs">
                                                {halfDayCount}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={5} className="text-center p-4 border-none text-[10px] italic pt-8 opacity-70">
                                    Date: {currentDate} | Generated by: {username || 'System Administrator'} | {disclaimer}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    }
);

ClassWiseDailyAttendancePrint.displayName = 'ClassWiseDailyAttendancePrint';

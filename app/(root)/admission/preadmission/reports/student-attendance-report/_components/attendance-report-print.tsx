'use client';

import React from 'react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceReportPrintProps {
    data: any;
    isDateWise: boolean;
}

export const AttendanceReportPrint = React.forwardRef<HTMLDivElement, AttendanceReportPrintProps>(
    ({ data, isDateWise }, ref) => {
        const rows = data?.studentAttendanceList ?? [];
        const monthList = data?.monthList ?? [];
        const institution = data?.institutionDetails?.[0];
        const countClass = data?.countClass ?? 0;

        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!rows || rows.length === 0) {
            return (
                <div ref={ref} className="p-8 text-center bg-white text-black">
                    No data available for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className="print-preview-container bg-white text-black p-4 w-full" style={{ minHeight: '100%' }}>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page {
                            size: ${isDateWise ? 'A4 landscape' : 'A4 portrait'};
                            margin: 10mm;
                        }
                        .print-preview-container {
                            display: block !important;
                            visibility: visible !important;
                            width: 100% !important;
                            background: white !important;
                            color: black !important;
                            padding: 0 !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid black !important;
                            padding: 4px !important;
                            font-size: 10px !important;
                        }
                    }
                `
                    }}
                />

                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    {institution?.mI_Logo && (
                        <img
                            src={institution.mI_Logo}
                            alt="Logo"
                            className="mx-auto mb-2"
                            style={{ height: '60px', width: 'auto' }}
                        />
                    )}
                    <h1 className="text-xl font-bold uppercase">{institution?.mI_Name || 'Institution Name'}</h1>
                    <p className="text-xs">{institution?.mI_Address1}, {institution?.mI_Address2}, {institution?.mI_Address3}</p>
                    <h2 className="text-lg font-bold underline mt-2">STUDENT ATTENDANCE REPORT</h2>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-black text-[10px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 text-center w-10">SL.NO</th>
                            <th className="border border-black p-1 text-left min-w-[150px]">STUDENT NAME</th>
                            <th className="border border-black p-1 text-left">ADM. NO</th>
                            <th className="border border-black p-1 text-center">ROLL NO</th>

                            {isDateWise ? (
                                <>
                                    {monthList.map((col: any, idx: number) => (
                                        <th key={idx} className="border border-black p-1 text-center w-6">
                                            {col.day}
                                        </th>
                                    ))}
                                    <th className="border border-black p-1 text-center font-bold">HELD</th>
                                    <th className="border border-black p-1 text-center font-bold">ATTD</th>
                                    <th className="border border-black p-1 text-center font-bold">%</th>
                                </>
                            ) : (
                                <>
                                    <th className="border border-black p-1 text-center">CLASS HELD</th>
                                    <th className="border border-black p-1 text-center">ATTENDANCE</th>
                                    <th className="border border-black p-1 text-center">PERCENTAGE (%)</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row: any, index: number) => (
                            <tr key={index}>
                                <td className="border border-black p-1 text-center">{index + 1}</td>
                                <td className="border border-black p-1 font-medium">{row.name}</td>
                                <td className="border border-black p-1">{row.AMST_AdmNo}</td>
                                <td className="border border-black p-1 text-center">{row.AMAY_RollNo}</td>

                                {isDateWise ? (
                                    <>
                                        {monthList.map((col: any, idx: number) => (
                                            <td key={idx} className="border border-black p-1 text-center">
                                                {row[col.day] || ''}
                                            </td>
                                        ))}
                                        <td className="border border-black p-1 text-center font-bold">{countClass}</td>
                                        <td className="border border-black p-1 text-center font-bold">{row.total ?? 0}</td>
                                        <td className="border border-black p-1 text-center font-bold">{(row.Percentage || row.percentage)?.toFixed(2)}%</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border border-black p-1 text-center">{row.ASA_ClassHeld?.toFixed(2)}</td>
                                        <td className="border border-black p-1 text-center">{row.ASA_Class_Attended?.toFixed(2)}</td>
                                        <td className="border border-black p-1 text-center font-bold">{row.Percentage?.toFixed(2)}%</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="mt-8 flex justify-between text-[10px] italic opacity-70">
                    <div>Date: {currentDate}</div>
                    <div>Generated by VAPS Technosoft Pvt. Ltd.</div>
                </div>
            </div>
        );
    }
);

AttendanceReportPrint.displayName = 'AttendanceReportPrint';

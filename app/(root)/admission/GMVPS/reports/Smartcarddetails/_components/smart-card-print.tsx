'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SmartcardPrintProps {
    data: any[];
    summaryData?: any[];
    detailedSummaryData?: any[];
    imgName?: string;
    institutionName?: string;
}

export const SmartcardPrint = forwardRef<HTMLDivElement, SmartcardPrintProps>(
    function SmartcardPrint({ data, summaryData, detailedSummaryData, imgName, institutionName }, ref) {
        if (!data || data.length === 0) return null;

        const date = new Date().toLocaleDateString('en-GB');

        return (
            <div ref={ref} className="w-full p-8 bg-white min-h-[297mm] font-serif text-[12px] relative printable-content">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-8 border-b-2 border-slate-900 pb-4">
                    {imgName && (
                        <img src={imgName} alt="Logo" className="max-h-60 object-contain mb-2" />
                    )}
                    <h2 className="text-xl font-bold underline uppercase tracking-widest text-slate-700">Smart Card Details Report</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400 text-center" id="smart-card-export">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">SL.NO</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Student Name</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Father Name</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Adm No.</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Street</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Area</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">City</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Mobile</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Email ID</th>
                                <th className="border border-slate-400 p-2 font-bold uppercase tracking-tight">Blood Group</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((student, index) => (
                                <tr key={student.amst_id || index} className="hover:bg-slate-50 transition-colors">
                                    <td className="border border-slate-400 p-2 px-3 font-semibold">{index + 1}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 font-semibold uppercase">{student.studentname}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 uppercase">{student.fathername}</td>
                                    <td className="border border-slate-400 p-2">{student.admno}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 uppercase">{student.street}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 uppercase">{student.area}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 uppercase">{student.city}</td>
                                    <td className="border border-slate-400 p-2">{student.mobile}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 lowercase">{student.emailid}</td>
                                    <td className="border border-slate-400 p-2 font-bold">{student.bloodgroup || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>





                {/* <div className="mt-8 pt-4 border-t border-slate-300 text-center font-bold text-[10px] italic">
                    Date: {date} | Copyright © 2025 - All Rights Reserved
                </div> */}

                <style type="text/css" media="print">
                    {`
                        @page { 
                            size: portrait; 
                            margin: 10mm; 
                        }
                        body { 
                            background: white !important; 
                            -webkit-print-color-adjust: exact;
                        }
                        .printable-content { 
                            pointer-events: none;
                            padding: 0 !important;
                            width: 100% !important;
                        }
                        table {
                            font-size: 8.5px !important;
                            width: 100% !important;
                            table-layout: auto !important;
                        }
                        thead {
                            display: table-row-group !important;
                        }
                        th, td {
                            padding: 2px 1px !important;
                            word-break: break-all !important;
                        }
                        tr {
                            page-break-inside: avoid;
                        }
                        .page-break-before-always {
                            page-break-before: always;
                        }
                        h2 {
                            font-size: 14px !important;
                        }
                        .detailed-summary-scale {
                            width: 100% !important;
                        }
                        .detailed-summary-scale table {
                            font-size: 6px !important;
                        }
                        .detailed-summary-scale th, .detailed-summary-scale td {
                            padding: 1px !important;
                        }
                    `}
                </style>
            </div>
        );
    }
);

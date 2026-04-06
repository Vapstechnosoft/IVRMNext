'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SmartcardPrintProps {
    data: any[];
    imgName?: string;
}

export const SmartcardPrint = forwardRef<HTMLDivElement, SmartcardPrintProps>(
    function SmartcardPrint({ data, imgName }, ref) {
        if (!data || data.length === 0) return null;

        const date = new Date().toLocaleDateString('en-GB');

        return (
            <div ref={ref} className="w-full p-8 bg-white min-h-[297mm] font-serif text-[12px] relative printable-content">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-8 border-b-2 border-slate-900 pb-4">
                    {imgName ? (
                        <img src={imgName} alt="Logo" className="max-h-24 object-contain mb-4" />
                    ) : (
                        <div className="h-24 w-full flex items-center justify-center text-2xl font-bold uppercase underline">
                            Smart Card Details Report
                        </div>
                    )}
                    <h2 className="text-xl font-bold underline uppercase">Smart Card Details Report</h2>
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
                                    <td className="border border-slate-400 p-2">{index + 1}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 font-semibold">{student.studentnam}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3">{student.FatherName}</td>
                                    <td className="border border-slate-400 p-2">{student.AdmNo}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3">{student.Street}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3">{student.Area}</td>
                                    <td className="border border-slate-400 p-2 text-left px-3 lowercase">{student.city}</td>
                                    <td className="border border-slate-400 p-2">{student.Mobile}</td>
                                    <td className="border border-slate-400 p-2 text-left lowercase px-3">{student.Emailid}</td>
                                    <td className="border border-slate-400 p-2">{student.BloodGroup}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="print-only">
                            <tr>
                                <td colSpan={10} className="border border-slate-400 p-4 text-center font-bold bg-slate-50 italic">
                                    Date: {date} | Copyright © 2025 - All Rights Reserved
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <style type="text/css" media="print">
                    {`
                        @page { size: portrait; margin: 20mm; }
                        body { background: white !important; }
                        .printable-content { pointer-events: none; }
                        tfoot { display: table-footer-group; position: fixed; bottom: 0; }
                    `}
                </style>
            </div>
        );
    }
);

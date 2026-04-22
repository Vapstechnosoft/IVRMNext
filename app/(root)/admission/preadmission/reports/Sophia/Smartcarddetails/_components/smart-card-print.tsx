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

                {/* Section Summary Section */}
                {summaryData && summaryData.length > 0 && (
                    <div className="mt-12 page-break-before-always pt-8">
                        <h3 className="text-lg font-bold underline uppercase text-center mb-6">Section Wise Summary</h3>
                        <table className="w-full border-collapse border border-slate-400 text-center">
                            <thead className="bg-[#f8f9fa]">
                                <tr>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">SL.NO</th>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">Class</th>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">Section</th>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">Male</th>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">Female</th>
                                    <th className="border border-slate-400 p-2 font-bold uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border border-slate-400 p-2">{index + 1}</td>
                                        <td className="border border-slate-400 p-2 text-left px-4">{row.asmcl_classname}</td>
                                        <td className="border border-slate-400 p-2">{row.asmc_sectionname}</td>
                                        <td className="border border-slate-400 p-2 font-medium">{row.male}</td>
                                        <td className="border border-slate-400 p-2 font-medium">{row.female}</td>
                                        <td className="border border-slate-400 p-2 font-bold bg-slate-50">{row.totalcount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Detailed Summary (Religion/Category) Section */}
                {detailedSummaryData && detailedSummaryData.length > 0 && (
                    <div className="mt-12 page-break-before-always pt-8">
                        <h3 className="text-lg font-bold underline uppercase text-center mb-6">Religious/Category Summary</h3>
                        <div className="detailed-summary-scale">
                        <table className="w-full border-collapse border border-slate-400 text-center text-[7px]" style={{ tableLayout: 'fixed' }}>
                            <thead className="bg-[#f8f9fa]">
                                <tr className="text-[6px]">
                                    <th rowSpan={2} style={{ width: '25px' }} className="border border-slate-400 p-1 font-bold">SL.</th>
                                    <th rowSpan={2} className="border border-slate-400 p-1 font-bold">Class</th>
                                    <th rowSpan={2} className="border border-slate-400 p-1 font-bold">Sec</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Gen</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">OBC</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">SC</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">ST</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Hindu</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Chris</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Islam</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Other</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Gender</th>
                                    <th colSpan={2} className="border border-slate-400 p-1 font-bold">Enrollm</th>
                                    <th rowSpan={2} className="border border-slate-400 p-1 font-bold">Total</th>
                                </tr>
                                <tr className="text-[5px]">
                                    <th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th>
                                    <th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th>
                                    <th>M</th><th>F</th><th>N</th><th>O</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedSummaryData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border border-slate-400 p-1">{index + 1}</td>
                                        <td className="border border-slate-400 p-1 text-left px-1 whitespace-nowrap overflow-hidden">{row.asmcl_classname}</td>
                                        <td className="border border-slate-400 p-1 px-1 whitespace-nowrap overflow-hidden">{row.asmc_sectionname}</td>
                                        <td className="border border-slate-400 p-1">{row.male_general}</td>
                                        <td className="border border-slate-400 p-1">{row.female_general}</td>
                                        <td className="border border-slate-400 p-1">{row.male_obc}</td>
                                        <td className="border border-slate-400 p-1">{row.female_obc}</td>
                                        <td className="border border-slate-400 p-1">{row.male_sc}</td>
                                        <td className="border border-slate-400 p-1">{row.female_sc}</td>
                                        <td className="border border-slate-400 p-1">{row.male_st}</td>
                                        <td className="border border-slate-400 p-1">{row.female_st}</td>
                                        <td className="border border-slate-400 p-1">{row.male_hindu}</td>
                                        <td className="border border-slate-400 p-1">{row.female_hindu}</td>
                                        <td className="border border-slate-400 p-1">{row.male_christian}</td>
                                        <td className="border border-slate-400 p-1">{row.female_christian}</td>
                                        <td className="border border-slate-400 p-1">{row.male_islam}</td>
                                        <td className="border border-slate-400 p-1">{row.female_islam}</td>
                                        <td className="border border-slate-400 p-1">{row.male_other}</td>
                                        <td className="border border-slate-400 p-1">{row.female_other}</td>
                                        <td className="border border-slate-400 p-1 font-bold">{row.male}</td>
                                        <td className="border border-slate-400 p-1 font-bold">{row.female}</td>
                                        <td className="border border-slate-400 p-1">{row.newst_totalcount}</td>
                                        <td className="border border-slate-400 p-1">{row.oldst_totalcount}</td>
                                        <td className="border border-slate-400 p-1 font-bold bg-slate-50">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}

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

'use client';

import React from 'react';
import type { IGroupedReport } from '../page';
import { format } from 'date-fns';

interface PDAReportPrintProps {
    reportData: IGroupedReport[];
    filters: any;
    year: string;
}

export default function PDAReportPrint({
    reportData,
    filters,
    year
}: PDAReportPrintProps) {
    const isDetailed = filters?.studentdata === 1;
    const isFormat1 = filters?.format1 === true;
    const isConsolidated = !isDetailed && !isFormat1;

    return (
        <div className="print-container bg-white p-4">
            {reportData.map((report, rIdx) => (
                <div key={rIdx} className="report-page mb-8 last:mb-0" style={{ pageBreakAfter: 'always' }}>
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold uppercase">Fees and Deposit Details for {year}</h2>
                        <h3 className="text-md font-semibold">GST No : 29AAATR3497G3Z1</h3>
                    </div>

                    {/* Student Info Table */}
                    <table className="w-full mb-6 text-sm border-collapse">
                        <tbody>
                            <tr>
                                <td className="font-bold w-32">STUDENT NAME</td>
                                <td className="w-1">:</td>
                                <td className="px-2">{report.stu_rpt[0]?.AMST_FirstName}</td>
                                <td className="font-bold w-32 text-right">CLASS & SECTION</td>
                                <td className="w-1">:</td>
                                <td className="px-2">{report.stu_rpt[0]?.ASMCL_ClassName} - {report.stu_rpt[0]?.ASMC_SectionName}</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Adm No</td>
                                <td>:</td>
                                <td className="px-2">{report.stu_rpt[0]?.AMST_AdmNo}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Report Table - Varies by format */}
                    {isDetailed && (
                        <table className="w-full mb-6 border-collapse border border-gray-400 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-400 p-2">Sl.No</th>
                                    <th className="border border-gray-400 p-2">Receipt No</th>
                                    <th className="border border-gray-400 p-2">Receipt Date</th>
                                    <th className="border border-gray-400 p-2">Expenditure Head</th>
                                    <th className="border border-gray-400 p-2 text-right">Amount</th>
                                    <th className="border border-gray-400 p-2">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.stu_rpt.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-400 p-2 text-center">{i + 1}</td>
                                        <td className="border border-gray-400 p-2">{item.PDAE_TransactionNo}</td>
                                        <td className="border border-gray-400 p-2 text-center">
                                            {item.PDAE_Date ? format(new Date(item.PDAE_Date), 'dd-MMM-yyyy') : ''}
                                        </td>
                                        <td className="border border-gray-400 p-2">{item.PDAMH_HeadName}</td>
                                        <td className="border border-gray-400 p-2 text-right">{item.PDAEH_Amount.toFixed(2)}</td>
                                        <td className="border border-gray-400 p-2">{item.PDAE_Remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 font-bold">
                                    <td colSpan={4} className="border border-gray-400 p-2 text-right uppercase">Total Expenditure</td>
                                    <td className="border border-gray-400 p-2 text-right">{report.tot.toFixed(2)}</td>
                                    <td className="border border-gray-400 p-2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}

                    {isConsolidated && (
                        <table className="w-full mb-6 border-collapse border border-gray-400 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-400 p-2 w-16">Sl.No</th>
                                    <th className="border border-gray-400 p-2 text-left">Expenditure Head</th>
                                    <th className="border border-gray-400 p-2 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.stu_rpt.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-400 p-2 text-center">{i + 1}</td>
                                        <td className="border border-gray-400 p-2">{item.PDAMH_HeadName}</td>
                                        <td className="border border-gray-400 p-2 text-right">{item.PDAEH_Amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 font-bold">
                                    <td colSpan={2} className="border border-gray-400 p-2 text-center uppercase">Total Expenditure</td>
                                    <td className="border border-gray-400 p-2 text-right">{report.tot.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}

                    {isFormat1 && (
                        <table className="w-full mb-6 border-collapse border border-gray-400 text-xs">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-400 p-1 w-10">Sl No</th>
                                    <th className="border border-gray-400 p-1 text-left">Expenditure Head</th>
                                    <th className="border border-gray-400 p-1 text-right w-24">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100 font-bold"><td colSpan={3} className="border border-gray-400 p-1 text-center">Fee Details</td></tr>
                                {report.fees.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-400 p-1 text-center">{i + 1}</td>
                                        <td className="border border-gray-400 p-1">{item.PDAMH_HeadName}</td>
                                        <td className="border border-gray-400 p-1 text-right">{item.PDAEH_Amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border border-gray-400 p-1 text-center">Total</td>
                                    <td className="border border-gray-400 p-1 text-right">{report.feestotal.toFixed(2)}</td>
                                </tr>

                                <tr className="bg-gray-100 font-bold"><td colSpan={3} className="border border-gray-400 p-1 text-center">Donation Details</td></tr>
                                {report.donation.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-400 p-1 text-center">{i + 1}</td>
                                        <td className="border border-gray-400 p-1">{item.PDAMH_HeadName}</td>
                                        <td className="border border-gray-400 p-1 text-right">{item.PDAEH_Amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border border-gray-400 p-1 text-center">Total</td>
                                    <td className="border border-gray-400 p-1 text-right">{report.donationtotal.toFixed(2)}</td>
                                </tr>

                                <tr className="bg-gray-100 font-bold"><td colSpan={3} className="border border-gray-400 p-1 text-center">Personal Expenditure Deposit Details</td></tr>
                                {report.other.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-400 p-1 text-center">{i + 1}</td>
                                        <td className="border border-gray-400 p-1">{item.PDAMH_HeadName}</td>
                                        <td className="border border-gray-400 p-1 text-right">{item.PDAEH_Amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border border-gray-400 p-1 text-center">Total</td>
                                    <td className="border border-gray-400 p-1 text-right">{report.othertotal.toFixed(2)}</td>
                                </tr>

                                <tr className="bg-gray-200 font-bold text-sm">
                                    <td colSpan={2} className="border border-gray-400 p-2 text-center uppercase">Total Expenditure</td>
                                    <td className="border border-gray-400 p-2 text-right">{report.tot.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {/* Summary Section */}
                    <div className="space-y-1 text-sm font-medium">
                        <div className="flex justify-between max-w-md">
                            <span>Total Fee and Deposit Collected :</span>
                            <span>{report.paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between max-w-md">
                            <span>Total Expenditure Amount :</span>
                            <span>{report.tot.toFixed(2)}</span>
                        </div>
                        
                        {report.studentInfo && (
                            <>
                                {report.studentInfo.pdaS_OBExcessPaid !== 0 && (
                                    <div className="flex justify-between max-w-md">
                                        <span>Opening Balance-School Dues :</span>
                                        <span>{report.studentInfo.pdaS_OBExcessPaid.toFixed(2)}</span>
                                    </div>
                                )}
                                {report.studentInfo.pdaS_OBStudentDue !== 0 && (
                                    <div className="flex justify-between max-w-md">
                                        <span>Opening Balance-Student Dues :</span>
                                        <span>{report.studentInfo.pdaS_OBStudentDue.toFixed(2)}</span>
                                    </div>
                                )}
                                {report.studentInfo.pdaS_CYRefundAmt !== 0 && (
                                    <div className="flex justify-between max-w-md">
                                        <span>Refunded Amount :</span>
                                        <span>{report.studentInfo.pdaS_CYRefundAmt.toFixed(2)}</span>
                                    </div>
                                )}
                                {report.conces > 0 && (
                                    <div className="flex justify-between max-w-md font-bold">
                                        <span>Concession Amount :</span>
                                        <span>{report.conces.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between max-w-md border-t pt-1 mt-2 text-lg font-bold">
                                    { (report.paid + report.studentInfo.pdaS_OBExcessPaid - report.studentInfo.pdaS_OBStudentDue + report.conces - report.tot - report.studentInfo.pdaS_CYRefundAmt) > 0 ? (
                                        <>
                                            <span>School Balance :</span>
                                            <span className="text-green-700">
                                                {(report.paid + report.studentInfo.pdaS_OBExcessPaid - report.studentInfo.pdaS_OBStudentDue + report.conces - report.tot - report.studentInfo.pdaS_CYRefundAmt).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Student Balance :</span>
                                            <span className="text-red-700">
                                                {(report.tot - (report.paid + report.studentInfo.pdaS_OBExcessPaid - report.studentInfo.pdaS_OBStudentDue + report.conces) - report.studentInfo.pdaS_CYRefundAmt).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-20 border-t pt-4 text-xs italic text-gray-500">
                        This is Computer Generated Statement does not require Signature.
                    </div>
                </div>
            ))}

            <style jsx global>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 1.5cm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}

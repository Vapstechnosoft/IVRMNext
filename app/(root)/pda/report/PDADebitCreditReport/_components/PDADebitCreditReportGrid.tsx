'use client';
 
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IPDADebitCreditReportRow, IPDADebitCreditStudentDetail } from '@/types/pettycash/report/PDADebitCreditReport';
import { BookOpen } from 'lucide-react';
 
interface PDADebitCreditReportGridProps {
    rows: IPDADebitCreditReportRow[];
    student: IPDADebitCreditStudentDetail[];
    fromDate: Date | null;
    toDate: Date | null;
    printRef: React.RefObject<HTMLDivElement | null>;
}
 
export default function PDADebitCreditReportGrid({
    rows,
    student,
    fromDate,
    toDate,
    printRef,
}: PDADebitCreditReportGridProps) {
    if (!rows || rows.length === 0) return null;
 
    const totalDebit = rows.reduce((acc, r) => acc + (Number(r.DEBIT) || 0), 0);
    const totalCredit = rows.reduce((acc, r) => acc + (Number(r.CREDIT) || 0), 0);
    const lastRecord = rows[rows.length - 1];
    const closingBalance = lastRecord?.BALANCE ?? 0;
    const balType = lastRecord?.TYPEORG1 ?? '';
 
    const studentInfo = student?.[0];
 
    return (
        <Card className="shadow-md border-purple-50 overflow-hidden bg-white animate-in fade-in duration-500">
            <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                    PDA Debit Credit Report — Statement of Personal Expense Account
                </CardTitle>
            </CardHeader>
 
            <CardContent className="p-4">
                {/* Printable section */}
                <div id="pdaDebitCreditPrintSection">
                    {/* Header info */}
                    <div className="mb-4 text-center space-y-1">
                        <p className="text-sm font-semibold text-slate-700">
                            STATEMENT of Personal Expense Account
                        </p>
                        {fromDate && toDate && (
                            <p className="text-xs text-slate-500">
                                From:&nbsp;
                                <span className="font-semibold">{format(fromDate, 'dd-MMM-yyyy')}</span>
                                &nbsp;&nbsp;To:&nbsp;
                                <span className="font-semibold">{format(toDate, 'dd-MMM-yyyy')}</span>
                            </p>
                        )}
                    </div>
 
                    {/* Student Info */}
                    {studentInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-xs text-slate-700 bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
                            <div>
                                <span className="font-bold uppercase tracking-wide text-slate-500">Name</span>
                                <p className="font-semibold mt-0.5">{studentInfo.amsT_FirstName}</p>
                            </div>
                            <div>
                                <span className="font-bold uppercase tracking-wide text-slate-500">Adm No</span>
                                <p className="font-semibold mt-0.5">{studentInfo.amsT_AdmNo}</p>
                            </div>
                            <div>
                                <span className="font-bold uppercase tracking-wide text-slate-500">Class &amp; Section</span>
                                <p className="font-semibold mt-0.5">
                                    {studentInfo.asmcL_ClassName} – {studentInfo.asmC_SectionName}
                                </p>
                            </div>
                        </div>
                    )}
 
                    {/* Data Table */}
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700">
                                    <th className="border border-slate-300 px-3 py-2 text-center font-bold whitespace-nowrap">SL.NO</th>
                                    <th className="border border-slate-300 px-3 py-2 text-left font-bold whitespace-nowrap">DATE</th>
                                    <th className="border border-slate-300 px-3 py-2 text-left font-bold whitespace-nowrap">CODE</th>
                                    <th className="border border-slate-300 px-3 py-2 text-left font-bold whitespace-nowrap">PARTICULARS</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right font-bold whitespace-nowrap">DEBIT</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right font-bold whitespace-nowrap">CREDIT</th>
                                    <th className="border border-slate-300 px-3 py-2 text-center font-bold whitespace-nowrap">TYPES</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right font-bold whitespace-nowrap">BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={idx % 2 === 0 ? 'bg-white hover:bg-orange-50/40 transition-colors' : 'bg-slate-50/60 hover:bg-orange-50/40 transition-colors'}
                                    >
                                        <td className="border border-slate-200 px-3 py-1.5 text-center">{idx + 1}</td>
                                        <td className="border border-slate-200 px-3 py-1.5 whitespace-nowrap">
                                            {row.PAYMENT_DATE ? format(new Date(row.PAYMENT_DATE), 'dd/MM/yyyy') : '—'}
                                        </td>
                                        <td className="border border-slate-200 px-3 py-1.5">{row.CODE}</td>
                                        <td className="border border-slate-200 px-3 py-1.5">{row.PARTICULARS}</td>
                                        <td className="border border-slate-200 px-3 py-1.5 text-right text-red-600 font-medium">
                                            {row.DEBIT > 0 ? Number(row.DEBIT).toFixed(2) : '—'}
                                        </td>
                                        <td className="border border-slate-200 px-3 py-1.5 text-right text-green-700 font-medium">
                                            {row.CREDIT > 0 ? Number(row.CREDIT).toFixed(2) : '—'}
                                        </td>
                                        <td className="border border-slate-200 px-3 py-1.5 text-center">{row.TYPEORG}</td>
                                        <td className="border border-slate-200 px-3 py-1.5 text-right font-semibold">
                                            {Number(row.BALANCE).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold">
                                    <td colSpan={4} className="border border-slate-300 px-3 py-2 text-center">
                                        Total
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2 text-right text-red-600">
                                        {totalDebit.toFixed(2)}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2 text-right text-green-700">
                                        {totalCredit.toFixed(2)}
                                    </td>
                                    <td colSpan={2} className="border border-slate-300 px-3 py-2" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
 
                    {/* Closing Balance */}
                    <div className="mt-4 text-center">
                        <span className="inline-block bg-orange-50 border border-orange-200 rounded-lg px-6 py-2 text-sm font-bold text-slate-800">
                            Closing Balance:&nbsp;
                            <span className={closingBalance >= 0 ? 'text-green-700' : 'text-red-600'}>
                                {Number(closingBalance).toFixed(2)}
                            </span>
                            {balType && (
                                <span className="ml-2 text-slate-500 font-medium text-xs">{balType}</span>
                            )}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
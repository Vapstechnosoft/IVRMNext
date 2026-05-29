import React, { forwardRef } from 'react';
import { IBankCopyReportSummary, IBankCopyReportDetail } from '@/types/pettycash/report/BankCopyReport';

interface SummaryPrintProps {
    summaryData: IBankCopyReportSummary[];
    totalDebit: number;
    totalCredit: number;
    asmayYear: string;
}

export const SummaryPrintTemplate = forwardRef<HTMLDivElement, SummaryPrintProps>(
    ({ summaryData, totalDebit, totalCredit, asmayYear }, ref) => {
        return (
            <div ref={ref} className="p-12 space-y-8 bg-white text-black">
                <div className="flex flex-col items-center justify-center gap-4 border-b-2 border-slate-900 pb-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold uppercase tracking-tight">Vidya Vikasa Vidya Samsthe(R)</h1>
                        <h2 className="text-2xl font-semibold uppercase mt-1">Vidya Vikasa English School</h2>
                        <p className="text-lg font-medium mt-2">Basaveshwar Talkies Road - {asmayYear}</p>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold border-2 border-black inline-block px-8 py-2 uppercase">
                        Bank Credit And Debit Report Summary
                    </h3>
                </div>

                <table className="w-full border-collapse border-2 border-slate-900 mt-6">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="border-2 border-slate-900 p-3 text-center font-bold">SL.NO</th>
                            <th className="border-2 border-slate-900 p-3 text-center font-bold">MONTH</th>
                            <th className="border-2 border-slate-900 p-3 text-center font-bold">DEBIT</th>
                            <th className="border-2 border-slate-900 p-3 text-center font-bold">CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border-2 border-slate-900 p-3 text-center">{idx + 1}</td>
                                <td className="border-2 border-slate-900 p-3 text-center font-medium">{item.Month}</td>
                                <td className="border-2 border-slate-900 p-3 text-right font-medium">
                                    {(Number(item.TotalDebit) || 0).toFixed(2)}
                                </td>
                                <td className="border-2 border-slate-900 p-3 text-right font-medium">
                                    {(Number(item.TotalCredit) || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-100 font-bold">
                            <td colSpan={2} className="border-2 border-slate-900 p-3 text-right text-lg">TOTAL</td>
                            <td className="border-2 border-slate-900 p-3 text-right text-lg">₹ {totalDebit.toFixed(2)}</td>
                            <td className="border-2 border-slate-900 p-3 text-right text-lg">₹ {totalCredit.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-24 grid grid-cols-2 gap-20 pt-10">
                    <div className="text-center border-t-2 border-black pt-2 font-bold">Verified By</div>
                    <div className="text-center border-t-2 border-black pt-2 font-bold">Authorized Signature</div>
                </div>
            </div>
        );
    }
);
SummaryPrintTemplate.displayName = 'SummaryPrintTemplate';

interface DetailPrintProps {
    detailData: IBankCopyReportDetail[];
    selectedMonth: string;
    asmayYear: string;
}

export const DetailPrintTemplate = forwardRef<HTMLDivElement, DetailPrintProps>(
    ({ detailData, selectedMonth, asmayYear }, ref) => {
        const totalDebit = detailData.reduce((acc, curr) => acc + (Number(curr.TotalDebit) || 0), 0);
        const totalCredit = detailData.reduce((acc, curr) => acc + (Number(curr.TotalCredit) || 0), 0);

        return (
            <div ref={ref} className="p-12 space-y-8 bg-white text-black">
                <div className="flex flex-col items-center justify-center gap-4 border-b-2 border-slate-900 pb-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold uppercase tracking-tight">Vidya Vikasa Vidya Samsthe(R)</h1>
                        <h2 className="text-2xl font-semibold uppercase mt-1">Vidya Vikasa English School</h2>
                        <p className="text-lg font-medium mt-2">Basaveshwar Talkies Road - {asmayYear}</p>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold border-2 border-black inline-block px-8 py-2 uppercase">
                        Bank Credit And Debit Report ({selectedMonth}, {asmayYear})
                    </h3>
                </div>

                <table className="w-full border-collapse border-2 border-slate-900 mt-6">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">SL.NO</th>
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">DATE</th>
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">PARTICULAR</th>
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">VOUCHER</th>
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">DEBIT</th>
                            <th className="border-2 border-slate-900 p-2 text-center font-bold text-sm">CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailData.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border-2 border-slate-900 p-2 text-center text-xs">{idx + 1}</td>
                                <td className="border-2 border-slate-900 p-2 text-center text-xs">
                                    {new Date(item.PaymentDate).toLocaleDateString('en-GB')}
                                </td>
                                <td className="border-2 border-slate-900 p-2 text-left text-xs uppercase">
                                    {item.Particular}
                                </td>
                                <td className="border-2 border-slate-900 p-2 text-center text-xs">
                                    {item.Voucher}
                                </td>
                                <td className="border-2 border-slate-900 p-2 text-right text-xs font-medium">
                                    {(Number(item.TotalDebit) || 0).toFixed(2)}
                                </td>
                                <td className="border-2 border-slate-900 p-2 text-right text-xs font-medium">
                                    {(Number(item.TotalCredit) || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-100 font-bold">
                            <td colSpan={4} className="border-2 border-slate-900 p-3 text-right font-bold">TOTAL</td>
                            <td className="border-2 border-slate-900 p-3 text-right font-bold">₹ {totalDebit.toFixed(2)}</td>
                            <td className="border-2 border-slate-900 p-3 text-right font-bold">₹ {totalCredit.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-24 grid grid-cols-2 gap-20 pt-10">
                    <div className="text-center border-t-2 border-black pt-2 font-bold">Verified By</div>
                    <div className="text-center border-t-2 border-black pt-2 font-bold">Authorized Signature</div>
                </div>
            </div>
        );
    }
);
DetailPrintTemplate.displayName = 'DetailPrintTemplate';

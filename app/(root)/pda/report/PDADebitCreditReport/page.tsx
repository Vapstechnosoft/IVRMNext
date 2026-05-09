'use client';
 
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { XCircle } from 'lucide-react';
 
import PDADebitCreditReportForm from './_components/PDADebitCreditReportForm';
import PDADebitCreditReportGrid from './_components/PDADebitCreditReportGrid';
import { IPDADebitCreditReportRow, IPDADebitCreditStudentDetail } from '@/types/pettycash/report/PDADebitCreditReport';
 
export default function PDADebitCreditReportPage() {
    const [reportRows, setReportRows] = useState<IPDADebitCreditReportRow[]>([]);
    const [studentInfo, setStudentInfo] = useState<IPDADebitCreditStudentDetail[]>([]);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
 
    const printRef = useRef<HTMLDivElement>(null);
 
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'PDA_Debit_Credit_Report',
    });
 
    const handleReportGenerated = (
        rows: IPDADebitCreditReportRow[],
        student: IPDADebitCreditStudentDetail[],
        from: Date,
        to: Date
    ) => {
        setReportRows(rows);
        setStudentInfo(student);
        setFromDate(from);
        setToDate(to);
        setHasSearched(true);
    };
 
    const handleCancel = () => {
        setReportRows([]);
        setStudentInfo([]);
        setFromDate(null);
        setToDate(null);
        setHasSearched(false);
    };
 
    const handleExport = () => {
        if (reportRows.length === 0) return;
 
        const data = reportRows.map((r, idx) => ({
            'SL.NO': idx + 1,
            DATE: r.PAYMENT_DATE ? format(new Date(r.PAYMENT_DATE), 'dd/MM/yyyy') : '',
            CODE: r.CODE,
            PARTICULARS: r.PARTICULARS,
            DEBIT: r.DEBIT,
            CREDIT: r.CREDIT,
            TYPES: r.TYPEORG,
            BALANCE: r.BALANCE,
        }));
 
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PDA Debit Credit Report');
        XLSX.writeFile(wb, `PDA_Debit_Credit_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };
 
    const hasReport = reportRows.length > 0;
 
    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="container space-y-6 p-6">
                <PDADebitCreditReportForm
                    onReportGenerated={handleReportGenerated}
                    onCancel={handleCancel}
                    onPrint={() => handlePrint()}
                    onExport={handleExport}
                    showReportButtons={hasReport}
                />
 
                {hasReport && (
                    <PDADebitCreditReportGrid
                        rows={reportRows}
                        student={studentInfo}
                        fromDate={fromDate}
                        toDate={toDate}
                        printRef={printRef}
                    />
                )}
 
                {!hasReport && hasSearched && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <XCircle className="h-12 w-12 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No records found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import * as XLSX from 'xlsx';

interface MultipleExamCumulativeReportCalcuttaListProps {
    data: any;
}

const MultipleExamCumulativeReportCalcuttaList = ({ data }: MultipleExamCumulativeReportCalcuttaListProps) => {
    const {
        getinstitution = [],
        getsubjectslist = [],
        studentlistd = [],
        subcolmns = [],
        yr,
        cla,
        sec,
        colnspan
    } = data;

    const inst = getinstitution[0] || {};

    const handlePrint = () => {
        const printContent = document.getElementById('printidnew');
        if (printContent) {
            const windowUrl = 'about:blank';
            const uniqueName = new Date().getTime();
            const windowName = 'Print' + uniqueName;
            const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
            
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Consolidated Marks Sheet Report</title>
                            <style>
                                @media print {
                                    @page { size: landscape; margin: 10mm; }
                                    body { font-family: 'Times New Roman', serif; -webkit-print-color-adjust: exact !important; }
                                    .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: #212529; }
                                    .table-bordered { border: 1px solid #dee2e6; }
                                    .table-bordered th, .table-bordered td { border: 1px solid #000 !important; padding: 4px; font-size: 10px; }
                                    .text-center { text-align: center; }
                                    .text-left { text-align: left; }
                                    .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
                                    .font-bold { font-weight: bold; }
                                    .uppercase { text-transform: uppercase; }
                                }
                                .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: #212529; border: 1px solid #000; }
                                .table th, .table td { border: 1px solid #000; padding: 4px; font-size: 10px; }
                                .text-center { text-align: center; }
                                .text-left { text-align: left; }
                                .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); display: inline-block; white-space: nowrap; }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const handleExport = () => {
        const table = document.getElementById('table1');
        if (table) {
            const wb = XLSX.utils.table_to_book(table);
            XLSX.writeFile(wb, 'CONSOLIDATED_MARKS_SHEET_REPORT.xlsx');
        }
    };

    if (!studentlistd || studentlistd.length === 0) return null;

    return (
        <div className="space-y-4 mt-6">
            <div className="flex justify-end gap-2 no-print">
                <Button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
            </div>

            <div className="bg-white p-4 overflow-x-auto rounded-lg border shadow-sm" id="printidnew">
                <table className="w-full border-collapse border border-black text-[12px]" id="table1">
                    <thead>
                        <tr>
                            <th colSpan={colnspan + 2} className="p-4 bg-white text-black border border-black">
                                <div className="text-center space-y-1">
                                    <h1 className="text-2xl font-bold uppercase text-purple-800">{inst.mI_Name}</h1>
                                    <p className="text-sm font-bold text-gray-700">{inst.mI_Address1}, {inst.ivrmmcT_Name}-{inst.mI_Pincode}</p>
                                    <div className="border-b border-black py-1">
                                        <h2 className="text-lg font-bold text-purple-800">CONSOLIDATED MARKS SHEET</h2>
                                    </div>
                                    <div className="flex justify-center gap-12 mt-2 font-bold text-sm text-purple-900">
                                        <span>ACADEMIC YEAR : {yr}</span>
                                        <span>CLASS & SEC : {cla} - {sec}</span>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th className="border border-black p-2 bg-purple-800 text-white w-10" rowSpan={2}>
                                <div className="vertical-text font-bold mx-auto">Roll No</div>
                            </th>
                            <th className="border border-black p-2 bg-purple-800 text-white min-w-[200px]" rowSpan={2}>
                                <div className="vertical-text font-bold mx-auto">Student Name</div>
                            </th>
                            <th className="border border-black p-2 bg-purple-800 text-white w-24" rowSpan={2}>
                                <div className="vertical-text font-bold mx-auto">Reg.NO</div>
                            </th>
                            <th className="border border-black p-2 bg-purple-800 text-white w-16" rowSpan={2}>
                                <div className="vertical-text font-bold mx-auto">ATTENDANCE %</div>
                            </th>
                            {getsubjectslist.map((sub: any, idx: number) => (
                                <th key={idx} colSpan={sub.colspan} className="border border-black p-2 text-center bg-purple-800 text-white font-bold">
                                    {sub.ISMS_SubjectName}
                                </th>
                            ))}
                            <th className="border border-black p-2 bg-purple-800 text-white text-center" rowSpan={2}>Total</th>
                            <th className="border border-black p-2 bg-purple-800 text-white text-center" rowSpan={2}>Percentage</th>
                        </tr>
                        <tr>
                            {subcolmns.map((col: any, idx: number) => (
                                <th key={idx} className="border border-black p-2 bg-purple-800 text-white text-center w-10">
                                    <div className="vertical-text mx-auto text-[10px]">{col.EMSE_SubExamName}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {studentlistd.map((stu: any, sIdx: number) => (
                            <tr key={sIdx} className="hover:bg-purple-50 transition-colors">
                                <td className="border border-black p-2 text-center">{stu.AMAY_RollNo}</td>
                                <td className="border border-black p-2 text-left font-medium">{stu.AMST_FirstName}</td>
                                <td className="border border-black p-2 text-left">{stu.AMST_AdmNo}</td>
                                <td className="border border-black p-2 text-left">{stu.ATTENDANCEPERCENTAGE}</td>
                                {stu.markslist?.map((mark: any, mIdx: number) => (
                                    <td key={mIdx} className="border border-black p-1 text-center">
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' && mark.EYCES_MarksDisplayFlg === true && mark.ESTMPSSS_ObtainedMarks > 0 && (
                                            <span className={mark.EME_Id === 98000 || mark.EME_Id === 98001 ? 'font-bold' : ''}>
                                                {mark.ESTMPSSS_ObtainedMarks}
                                            </span>
                                        )}
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' && mark.EYCES_GradeDisplayFlg === true && mark.ESTMPSSS_ObtainedGrade && mark.ESTMPSSS_ObtainedGrade !== '0' && (
                                            <span>{mark.ESTMPSSS_ObtainedGrade}</span>
                                        )}
                                        {mark.ESTMPSSS_PassFailFlg === 'AB' && mark.ESTMPSSS_ObtainedMarks === 0 && (
                                            <span className="text-red-500 font-bold">{mark.ESTMPSSS_PassFailFlg}</span>
                                        )}
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' && mark.ESTMPSSS_ObtainedMarks === 0 && mark.EYCES_MarksDisplayFlg === true && (
                                            <span>{mark.ESTMPSSS_ObtainedMarks}</span>
                                        )}
                                    </td>
                                ))}
                                <td className="border border-black p-2 text-center bg-orange-100 font-bold text-purple-900">
                                    {stu.totallist?.find((colt: any) => colt.ISMS_Id === 1000000)?.MARKSOBTAINED || ''}
                                </td>
                                <td className="border border-black p-2 text-center bg-orange-100 font-bold text-purple-900">
                                    {stu.totallist?.find((colt: any) => colt.ISMS_Id === 1000000)?.PERCENTAGE || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx global>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    display: inline-block;
                    white-space: nowrap;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MultipleExamCumulativeReportCalcuttaList;

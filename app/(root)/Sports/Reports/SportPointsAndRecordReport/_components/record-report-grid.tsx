'use client';

import { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: IPointsRecordReportData[];
}

export const ReportGrid = ({ data }: ReportGridProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Sport_Points_And_Record_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "SportPointsAndRecordReport.xlsx");
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-semibold">Sport Points And Record Report</h3>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint()} className="flex items-center gap-2 border-2">
                        <Printer size={16} className="text-primary" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2 border-2">
                        <FileSpreadsheet size={16} className="text-green-600" /> Excel
                    </Button>
                </div>
            </div>

            <div ref={componentRef} className="overflow-x-auto print:p-0">
                <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead className="bg-[#3a5dae] text-white">
                        <tr>
                            <th className="border p-2">SL. No.</th>
                            <th className="border p-2">Adm. No.</th>
                            <th className="border p-2">Student Name</th>
                            <th className="border p-2">Place</th>
                            <th className="border p-2">Points</th>
                            <th className="border p-2">Division Name</th>
                            <th className="border p-2">House Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.amst_Id} className="hover:bg-gray-50 text-center">
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{item.adm_no}</td>
                                <td className="border p-2">{item.studentname}</td>
                                <td className="border p-2">{item.spccestR_Place}</td>
                                <td className="border p-2">{item.spccestR_Points}</td>
                                <td className="border p-2">{item.spccmD_DivisionName}</td>
                                <td className="border p-2">{item.spccmH_HouseName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-sm text-gray-500 pt-2">
                Total Records: {data.length}
            </div>
        </div>
    );
};

import { Button } from "@/components/ui/button";
import type {
  IMasterInstitution,
  Institution,
} from "@/types/exam/exam-module/report";
import { FileSpreadsheet, Printer } from "lucide-react";
import React from "react";
import {
  dummyHeaderInfo,
  dummyTopperListData,
} from "./mockData";

interface SophiaTopperListReportViewProps {
  data?: any[];
  institution?: IMasterInstitution | Institution | null;
}

const SophiaTopperListReportView = ({
  data,
  institution,
}: SophiaTopperListReportViewProps) => {
  const handleExport = () => {};
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <style>
        {`
            @media print {
                @page { margin: 10mm; }
                body {
                    visibility: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                #printable-area, #printable-area * {
                    visibility: visible;
                }
                #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `}
      </style>
      <div className="no-print mb-6 flex justify-end gap-3 px-6 py-3 border-b border-gray-200 bg-gray-50/50 rounded-t-md">
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-sky-800 text-white hover:bg-sky-900 transition-colors shadow-sm w-fit font-medium"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2 bg-sky-800 text-white hover:bg-sky-900 transition-colors shadow-sm w-fit font-medium"
        >
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </Button>
      </div>

      <div
        id="printable-area"
        className="min-w-[1000px] bg-white font-sans text-[12px] text-gray-800 px-6 py-4"
      >

        <div className="overflow-hidden border border-[#0066cc]">
          <table className="w-full text-[13px] border-collapse bg-white">
            <thead>
              <tr className="bg-[#0066cc] text-white font-bold">
                <th colSpan={3} className="border-r border-b border-white/20 p-2.5 text-center px-4 uppercase tracking-wider">
                  ACADEMIC YEAR: {dummyHeaderInfo.academicYear}
                </th>
                <th colSpan={4} className="border-b border-white/20 p-2.5 text-center px-4 uppercase tracking-wider">
                  EXAM NAME: {dummyHeaderInfo.examName}
                </th>
              </tr>
              <tr className="bg-[#0066cc] text-white font-bold border-b border-white/20">
                <th colSpan={3} className="border-r border-b border-white/20 p-2.5 text-center px-4 uppercase tracking-wider">
                  CLASS NAME: {dummyHeaderInfo.className}
                </th>
                <th colSpan={4} className="border-b border-white/20 p-2.5 text-center px-4 uppercase tracking-wider">
                  SECTION NAME: {dummyHeaderInfo.sectionName}
                </th>
              </tr>
              <tr className="bg-[#0066cc] text-white font-bold text-center">
                <th className="border-r border-white/20 p-2.5 w-[80px]">SL. NO.</th>
                <th className="border-r border-white/20 p-2.5">STUDENT NAME</th>
                <th className="border-r border-white/20 p-2.5 w-[150px]">ADM. NO</th>
                <th className="border-r border-white/20 p-2.5 w-[120px]">TOTAL MARKS</th>
                <th className="border-r border-white/20 p-2.5 w-[120px]">OBT. MARKS</th>
                <th className="border-r border-white/20 p-2.5 w-[120px]">PERCENTAGE</th>
                <th className="p-2.5 w-[80px]">RANK</th>
              </tr>
            </thead>
            <tbody>
              {dummyTopperListData.map((row, idx) => (
                <tr key={idx} className="text-center font-bold text-gray-700 bg-white">
                  <td className="border-t border-r border-[#e5e7eb] p-3">{row.slNo}</td>
                  <td className="border-t border-r border-[#e5e7eb] p-3 text-center">{row.studentName}</td>
                  <td className="border-t border-r border-[#e5e7eb] p-3">{row.admNo}</td>
                  <td className="border-t border-r border-[#e5e7eb] p-3">{row.totalMarks}</td>
                  <td className="border-t border-r border-[#e5e7eb] p-3">{row.obtMarks}</td>
                  <td className="border-t border-r border-[#e5e7eb] p-3">{row.percentage}</td>
                  <td className="border-t border-[#e5e7eb] p-3">{row.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default SophiaTopperListReportView;

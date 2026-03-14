"use client";

import React from "react";
import { mockData } from "./mock-data";
import {
  IMasterInstitution,
  Institution,
} from "@/types/exam/exam-module/report";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";

interface StJamesConsolidateReportProps {
  data: any[];
  institution: IMasterInstitution | Institution | null;
}
export default function StJamesConsolidationReportList({
  data,
  institution,
}: StJamesConsolidateReportProps) {
  const subjects = [
    { key: "englishLanguage", title: "English Language" },
    { key: "englishLiterature", title: "English Literature" },
    { key: "english", title: "English" },
    { key: "secondLanguage", title: "Second Language" },
    { key: "mathematics", title: "Mathematics" },
    { key: "generalScience", title: "General Science" },
    { key: "history", title: "History" },
    { key: "geography", title: "Geography" },
    { key: "computer", title: "Computer" },
    { key: "thirdLanguage", title: "Third Language" },
    { key: "art", title: "Art" },
    { key: "valueEducation", title: "Value Education/ Scripture" },
    { key: "discipline", title: "Discipline" },
    { key: "coCurricular", title: "Co-Curricular Activities" },
  ];

  const columns = [
    { key: "total", title: "Total" },
    { key: "grandTotal", title: "Grand Total" },
    { key: "percentage", title: "Percentage" },
    { key: "rank", title: "Rank" },
    { key: "attendance", title: "Attendance" },
    { key: "remarks", title: "Remarks" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {};

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
                            display: none;
                        }
                }`}
      </style>
      <div className="no-print mb-6 flex justify-end gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/50 rounded-t-md">
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
      <div className="w-full overflow-x-auto p-4 bg-white" id="printable-area">
        <p className="text-center py-10 font-bold text-blue-500">
          CONSOLIDATED FINAL REPORT
        </p>
        <table className="w-full border-collapse border border-gray-400 text-sm text-center">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-400 p-2 font-bold w-12 h-48 align-bottom">
                <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center mb-2">
                  Roll Number
                </div>
              </th>
              <th className="border border-gray-400 p-2 font-bold min-w-[150px] align-middle">
                NAME
              </th>
              <th className="border border-gray-400 p-2 font-bold w-12 h-48 align-bottom">
                <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center whitespace-nowrap mb-2">
                  Reg.No.
                </div>
              </th>
              <th className="border border-gray-400 p-2 font-bold w-12 h-48 align-bottom">
                <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center mb-2">
                  House
                </div>
              </th>
              <th className="border border-gray-400 p-2 font-bold w-20 h-48 align-bottom">
                <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center mb-2">
                  Term
                </div>
              </th>
              {subjects.map((sub, index) => (
                <th
                  key={index}
                  className="border border-gray-400 p-2 font-bold w-12 h-48 align-bottom"
                >
                  <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center whitespace-nowrap mb-2">
                    {sub.title}
                  </div>
                </th>
              ))}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="border border-gray-400 p-2 font-bold w-12 h-48 align-bottom"
                >
                  <div className="[writing-mode:vertical-lr] rotate-180 m-auto text-center mb-2">
                    {col.title}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((student, studentIndex) => {
              return student.terms.map((term, termIndex) => (
                <tr
                  key={`${studentIndex}-${termIndex}`}
                  className="bg-white hover:bg-gray-50"
                >
                  {termIndex === 0 && (
                    <>
                      <td
                        rowSpan={student.terms.length}
                        className="border border-gray-400 p-2 font-medium align-middle"
                      >
                        {student.rollNumber}
                      </td>
                      <td
                        rowSpan={student.terms.length}
                        className="border border-gray-400 p-2 font-medium text-left max-w-[150px] whitespace-normal align-middle"
                      >
                        {student.name}
                      </td>
                      <td
                        rowSpan={student.terms.length}
                        className="border border-gray-400 p-2 font-medium align-middle"
                      >
                        <div className="[writing-mode:vertical-lr] rotate-180 m-auto h-full flex justify-center items-center py-4">
                          {student.regNo}
                        </div>
                      </td>
                      <td
                        rowSpan={student.terms.length}
                        className="border border-gray-400 p-2 font-medium align-middle"
                      >
                        {student.house}
                      </td>
                    </>
                  )}
                  <td className="border border-gray-400 p-2 font-medium text-gray-700 w-24 whitespace-normal break-words text-center">
                    {term.termName}
                  </td>
                  {subjects.map((sub, idx) => (
                    <td
                      key={`sub-${idx}`}
                      className="border border-gray-400 p-1 w-12 max-w-[60px] text-center whitespace-pre-line"
                    >
                      {term[sub.key as keyof typeof term] !== null
                        ? term[sub.key as keyof typeof term]
                        : ""}
                    </td>
                  ))}
                  {columns.map((col, idx) => (
                    <td
                      key={`col-${idx}`}
                      className="border border-gray-400 p-2 text-center w-14"
                    >
                      {term[col.key as keyof typeof term] !== null
                        ? term[col.key as keyof typeof term]
                        : ""}
                    </td>
                  ))}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

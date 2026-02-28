import { Button } from "@/components/ui/button";
import type {
  IMasterInstitution,
  Institution,
} from "@/types/exam/exam-module/report";
import { FileSpreadsheet, Printer } from "lucide-react";
import React from 'react';
import { dummyScholasticData, dummyPerformanceData } from './mockData';

interface SophiaReportCardIXXViewProps {
  data: any[];
  institution: IMasterInstitution | Institution | null;
}

const SophiaReportCardIXXView = ({
  data,
  institution,
}: SophiaReportCardIXXViewProps) => {
  const handleExport = () => { };
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

      <div
        id="printable-area"
        className="min-w-[1000px] bg-white p-4 font-sans text-[12px] text-black"
      >
        <div className="flex justify-between font-medium mb-1">
          <div className="flex-1"></div>
          <div className="flex-1 text-center text-[15px] font-medium text-gray-800">First Term Examination</div>
          <div className="flex-1 text-right text-gray-700">2025-2026</div>
        </div>

        <div className="border border-gray-400 mb-6 flex justify-between p-2 pl-12 pr-12">
          <div className="w-1/2 flex flex-col gap-1">
            <div className="flex"><span className="w-48 font-bold">Name</span> <span>: <span className="font-bold">AANYA E DEV</span></span></div>
            <div className="flex"><span className="w-48 font-bold">Class & Division</span> <span>: <span className="font-bold">10th Division A</span></span></div>
            <div className="flex"><span className="w-48 font-bold">Date of Birth</span> <span>: <span className="font-bold">26-Mar-2010</span></span></div>
            <div className="flex"><span className="w-48 font-bold">Student House</span> <span>: <span className="font-bold">Bennett</span></span></div>
          </div>
          <div className="w-1/2 flex flex-col gap-1 items-start pl-8">
            <div className="flex"><span className="w-56 font-bold">Standard Strength</span> <span>: <span className="font-bold">199</span></span></div>
            <div className="flex"><span className="w-56 font-bold">Division Strength</span> <span>: <span className="font-bold">51</span></span></div>
            <div className="flex"><span className="w-56 font-bold">Attendance</span> <span>: <span className="font-bold">103/111</span></span></div>
            <div className="flex"><span className="w-56 font-bold">Attendance %</span> <span>: <span className="font-bold">93</span></span></div>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-400 text-center mb-6">
          <thead>
            <tr className="border font-bold border-gray-400">
              <td rowSpan={2} className="border border-gray-400 p-1 w-12 text-gray-800">SL.No</td>
              <td rowSpan={2} className="border border-gray-400 p-1 text-center font-bold text-gray-800 w-64">Subjects</td>
              <td colSpan={3} className="border border-gray-400 p-1 text-center text-gray-800 font-bold">Marks</td>
              <td colSpan={2} className="border border-gray-400 p-1 text-center text-gray-800 font-bold">Highest</td>
              <td colSpan={2} className="border border-gray-400 p-1 text-center text-gray-800 font-bold">Average</td>
              <td colSpan={2} className="border border-gray-400 p-1 text-center text-gray-800 font-bold">Position</td>
              <td rowSpan={2} className="border border-gray-400 p-1 w-24 text-center text-gray-800 font-bold">Percentile</td>
              <td rowSpan={2} className="border border-gray-400 p-1 w-32 text-center text-gray-800 font-bold">Remarks</td>
            </tr>
            <tr className="border font-bold border-gray-400">
              <td className="border border-gray-400 p-1 w-10 text-gray-800 font-bold">Max</td>
              <td className="border border-gray-400 p-1 w-10 text-gray-800 font-bold">Min</td>
              <td className="border border-gray-400 p-1 w-16 text-gray-800 font-bold">Obtained</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Std.</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Div.</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Std.</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Div.</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Std.</td>
              <td className="border border-gray-400 p-1 w-12 text-gray-800 font-bold">Div.</td>
            </tr>
          </thead>
          <tbody>
            {dummyScholasticData.map((group, groupIndex) => {
              const hasMultipleSubjects = group.subjects.length > 1;
              const isLastGroup = groupIndex === dummyScholasticData.length - 1;

              return (
                <React.Fragment key={groupIndex}>
                  {/* Group Header */}
                  {hasMultipleSubjects && (
                    <tr className="">
                      <td className="font-bold p-1 align-top border-r border-gray-400 text-gray-800 pt-2">{group.id || ''}</td>
                      <td className="font-bold text-left p-1 text-gray-800 border-r border-gray-400 pt-2 pl-2">{group.groupName}</td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className=""></td>
                    </tr>
                  )}

                  {/* Subjects */}
                  {group.subjects.map((subj, subjIndex) => (
                    <tr key={subjIndex} className={isLastGroup ? "border-b border-gray-400" : ""}>
                      {hasMultipleSubjects ? (
                        <td className="border-r border-gray-400"></td>
                      ) : (
                        <td className={`font-bold p-1 text-gray-800 border-r border-gray-400 ${isLastGroup ? 'pb-2' : ''}`}>
                          {group.id || ''}
                        </td>
                      )}
                      <td className={`${hasMultipleSubjects ? 'text-left p-1 py-0 pl-6 text-gray-600' : 'font-bold text-left p-1 pl-2 text-gray-800'} border-r border-gray-400 ${isLastGroup ? 'pb-2' : ''}`}>
                        {subj.name}
                      </td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r text-gray-600 border-gray-400 ${isLastGroup ? 'pb-2' : ''}`}>{subj.max}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r text-gray-600 border-gray-400 ${isLastGroup ? 'pb-2' : ''}`}>{subj.min}</td>
                      <td className={`font-bold p-1 ${hasMultipleSubjects ? 'py-0' : ''} text-gray-800 border-r border-gray-400 ${isLastGroup ? 'pb-2' : ''}`}>{subj.obtained}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.highStd}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.highDiv}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.avgStd}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.avgDiv}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.posStd}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.posDiv}</td>
                      <td className={`p-1 ${hasMultipleSubjects ? 'py-0' : ''} border-r border-gray-400 text-gray-600 ${isLastGroup ? 'pb-2' : ''}`}>{subj.remarks}</td>
                      <td className={`${isLastGroup ? 'pb-2' : ''}`}></td>
                    </tr>
                  ))}

                  {/* Average Row */}
                  {group.average && (
                    <tr className="">
                      <td className="border-r border-gray-400 p-1 pb-4"></td>
                      <td className="font-bold text-gray-800 text-right p-1 pb-4 border-r border-gray-400 pr-2">Average</td>
                      <td className="p-1 pb-4 border-r border-gray-400 text-gray-600">{group.average.max}</td>
                      <td className="p-1 pb-4 border-r border-gray-400 text-gray-600">{group.average.min}</td>
                      <td className="font-bold text-gray-800 p-1 pb-4 border-r border-gray-400">{group.average.obtained}</td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className=""></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* TOTAL */}
            <tr className="border-b border-gray-400">
              <td colSpan={2} className="font-bold text-gray-800 text-right p-2 border-r border-gray-400 pr-4">TOTAL</td>
              <td className="p-2 border-r border-gray-400 text-gray-600">600</td>
              <td className="p-2 border-r border-gray-400 text-gray-600">198</td>
              <td className="p-2 border-r text-gray-800 border-gray-400 font-bold">344</td>
              <td colSpan={2} className="p-2 border-r border-gray-400 text-gray-600">Percentage : 57</td>
              <td colSpan={2} className="p-2 border-r border-gray-400 text-gray-600">Std.Position : 112</td>
              <td colSpan={3} className="p-2 border-r border-gray-400 text-left pl-4 text-gray-600">Div.Position : 41</td>
              <td className=""></td>
            </tr>
          </tbody>
        </table>

        {/* Performance Table */}
        <table className="w-full border-collapse border border-gray-400 text-center mb-0 mt-8">
          <thead>
            <tr className="border font-bold text-gray-800 border-gray-400 bg-gray-50/20">
              <td colSpan={13} className="font-bold p-1 border-b border-gray-400 uppercase">PERFORMANCE OF THE YEAR</td>
            </tr>
            <tr className="border-b border-gray-400 font-bold text-gray-800 bg-white">
              <td className="p-1 border-r border-gray-400 w-10 text-gray-800 font-bold">Sl.No</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">Examination</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">ENGL</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">ELIT</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">PHY</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">CHEM</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">BIO</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">H & C</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">GEO</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">KAN</td>
              <td className="p-1 border-r border-gray-400 text-gray-800 font-bold">MAT</td>
              <td className="p-1 text-gray-800 whitespace-nowrap font-bold">Com Appl</td>
            </tr>
          </thead>
          <tbody>
            {dummyPerformanceData.map((perf, idx) => (
              <tr key={idx} className={perf.isLast ? "" : "border-b border-gray-400"}>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'h-24 align-top pt-2' : ''}`}>{perf.id}</td>
                <td className={`text-left p-1 border-r border-gray-400 pl-2 text-gray-600 ${perf.isLast ? 'align-top pt-2' : 'whitespace-nowrap'}`}>{perf.exam}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["ENGL"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["ELIT"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["PHY"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["CHEM"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["BIO"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["H & C"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["GEO"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["KAN"]}</td>
                <td className={`p-1 border-r border-gray-400 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["MAT"]}</td>
                <td className={`p-1 text-gray-600 ${perf.isLast ? 'align-top pt-2' : ''}`}>{perf.scores["Com Appl"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border border-gray-400 border-t-0 p-1 pl-2 mb-16 h-12">
          <span className="text-gray-600">Teacher's Remarks : </span><span className="font-bold text-gray-800">Good understanding of key concepts—more focus will boost your performance.</span>
        </div>

        {/* Signatures */}
        <div className="flex justify-between font-bold text-[12px] px-24 pb-8 pt-4">
          <p className="text-gray-600">CLASS TEACHER</p>
          <p className="text-gray-600">PRINCIPAL</p>
          <p className="text-gray-600">PARENT</p>
        </div>
      </div>
    </div>
  );
};

export default SophiaReportCardIXXView;


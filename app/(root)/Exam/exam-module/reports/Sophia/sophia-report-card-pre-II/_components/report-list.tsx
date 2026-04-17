import { Button } from "@/components/ui/button";
import type {
  IMasterInstitution,
  Institution,
} from "@/types/exam/exam-module/report";
import { FileSpreadsheet, Printer } from "lucide-react";
import React from "react";
import {
  dummyStudentInfo,
  dummyScholasticAreas,
  dummyStudyHabits,
  dummyPersonalAndSocialHabits,
} from "./mockData";

interface SophiaProgressReportPreIIViewProps {
  data?: any[];
  institution?: IMasterInstitution | Institution | null;
}

const SophiaProgressReportPreIIView = ({
  data,
  institution,
}: SophiaProgressReportPreIIViewProps) => {
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
        className="min-w-[1000px] bg-white font-sans text-[12px] text-gray-800 px-6"
      >
        <div className="flex justify-end font-medium mb-1 ">
          <div className="text-sm font-bold text-gray-600">2025-2026</div>
        </div>

        <div className="border-t border-b border-gray-400 mb-6 flex justify-between py-4 text-sm text-gray-800 font-bold">
          {/* LEFT SIDE */}
          <div className="w-1/2 flex flex-col gap-1">
            <div className="flex">
              <span className="w-[150px]">Name</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600 uppercase">
                  {dummyStudentInfo.name}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[150px]">Class & Div</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.classDiv}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[150px]">Date of Birth</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.dob}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[150px]">Student House</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.house}
                </span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-1/2 flex flex-col gap-1 items-start pl-8">
            <div className="flex">
              <span className="w-[180px]">Standard Strength</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.stdStrength}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[180px]">Division Strength</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.divStrength}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[180px]">Attendance</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.attendance}
                </span>
              </span>
            </div>

            <div className="flex">
              <span className="w-[180px]">Attendance %</span>
              <span>
                :{" "}
                <span className="font-bold text-gray-600">
                  {dummyStudentInfo.attendancePercentage}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="text-center my-4 text-lg font-bold">
          PERFORMANCE OF THE YEAR 2025 - 2026
        </div>
        <table className="w-full  text-center text-[13px] font-bold">
          <thead>
            <tr>
              <td className="border border-gray-400 p-2 w-16 text-center">
                Sl. No
              </td>
              <td className="border border-gray-400 p-2 text-center w-[400px]">
                Subjects
              </td>
              <td className="border border-gray-400 p-2 w-48 text-center text-[11px]">
                Term I
              </td>
              <td className="border border-gray-400 p-2 w-48 text-center text-[11px]">
                Term II
              </td>
              <td className="p-2 w-48 text-center border-gray-400 border text-[11px]">
                Term III
              </td>
            </tr>
          </thead>
          <tbody>
            {/* SCHOLASTIC AREAS */}
            <tr>
              <td
                colSpan={5}
                className=" border-gray-400 pt-8 pb-2 font-extrabold text-left  text-gray-700 uppercase tracking-widest text-[11px]"
              >
                SCHOLASTIC AREAS
              </td>
              <td className="border-none w-1"></td>
            </tr>

            {dummyScholasticAreas.map((area, idx) => (
              <React.Fragment key={idx}>
                <tr className="">
                  <td
                    className={`border border-gray-400 p-2 font-bold text-gray-700 text-center ${area.subSubjects ? "align-top pt-2" : ""}`}
                  >
                    {area.id}
                  </td>
                  <td
                    className={`border border-gray-400 p-2 font-extrabold text-left pl-4 text-gray-800 ${area.subSubjects ? "align-top pt-2" : ""}`}
                  >
                    {area.subject}
                  </td>
                  <td
                    className={`border border-gray-400 p-2 font-bold text-gray-800 text-center ${area.subSubjects ? "align-top pt-2" : ""}`}
                  >
                    {area.term1 || ""}
                  </td>
                  <td
                    className={`border border-gray-400 p-2 font-bold text-gray-800 text-center ${area.subSubjects ? "align-top pt-2" : ""}`}
                  >
                    {area.term2 || ""}
                  </td>
                  <td
                    className={`border border-gray-400 p-2 font-bold text-center text-gray-800 ${area.subSubjects ? "align-top pt-2" : ""}`}
                  >
                    {area.term3 || ""}
                  </td>
                  <td className="border-none w-1"></td>
                </tr>
                {area.subSubjects &&
                  area.subSubjects.map((sub, i) => (
                    <tr key={i} className="">
                      <td className="border border-gray-400"></td>
                      <td className="border border-gray-400 p-2 pl-12 text-left text-gray-600 font-semibold">
                        {sub.name}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold text-gray-700 text-center">
                        {sub.term1 || ""}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold text-gray-700 text-center">
                        {sub.term2 || ""}
                      </td>
                      <td className="p-2 font-bold border border-gray-400 text-center text-gray-700">
                        {sub.term3 || ""}
                      </td>
                      <td className="border-none w-1"></td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}

            {/* STUDY HABITS */}
            <tr>
              <td colSpan={5} className="border-none pt-8 pb-2 text-left ">
                <span className="font-extrabold text-gray-800 uppercase tracking-widest text-[12px] ">
                  STUDY HABITS
                </span>
              </td>
              <td className="border-none w-1"></td>
            </tr>
            {dummyStudyHabits.map((area, idx) => (
              <tr key={idx} className="">
                <td className="border border-gray-400 p-2 font-bold text-gray-700 text-center">
                  {area.id}
                </td>
                <td className="border border-gray-400 p-2 font-extrabold text-left pl-4 text-gray-800">
                  {area.subject}
                </td>
                <td className="border border-gray-400 p-2 font-bold text-gray-800 text-center">
                  {area.term1 || ""}
                </td>
                <td className="border border-gray-400 p-2 font-bold text-gray-800 text-center">
                  {area.term2 || ""}
                </td>
                <td className="p-2 font-bold border border-gray-400 text-center text-gray-800">
                  {area.term3 || ""}
                </td>
                <td className="border-none w-1"></td>
              </tr>
            ))}

            {/* PERSONAL AND SOCIAL HABITS */}
            <tr>
              <td colSpan={5} className="border-none pt-8 pb-2 text-left ">
                <span className="font-extrabold text-gray-800 uppercase tracking-widest text-[12px] ">
                  PERSONAL AND SOCIAL HABITS
                </span>
              </td>
              <td className="border-none w-1"></td>
            </tr>
            {dummyPersonalAndSocialHabits.map((area, idx) => (
              <React.Fragment key={idx}>
                <tr
                  className={
                    idx === dummyPersonalAndSocialHabits.length - 1
                      ? "border-b border-gray-400"
                      : ""
                  }
                >
                  <td className="border border-gray-400 p-2 font-bold text-gray-700 text-center">
                    {area.id}
                  </td>
                  <td className="border border-gray-400 p-2 font-extrabold text-left pl-4 text-gray-800">
                    {area.subject}
                  </td>
                  <td className="border border-gray-400 p-2 font-bold text-gray-800 text-center">
                    {area.term1 || ""}
                  </td>
                  <td className="border border-gray-400 p-2 font-bold text-gray-800 text-center">
                    {area.term2 || ""}
                  </td>
                  <td className="p-2 font-bold border border-gray-400 text-center text-gray-800">
                    {area.term3 || ""}
                  </td>
                  <td className="border-none w-1"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Remarks and Signatures inside one big border block based on the mock */}
        <div className="border border-gray-400 text-sm mt-8 p-8">
          Teacher's Remarks :
        </div>
        <div className="flex font-bold text-[12px] min-h-[80px] text-center pb-2 mr-1">
          <div className="flex-1 pt-12 flex items-end justify-center pb-2">
            <span className="text-gray-500 uppercase tracking-widest text-[11px]">
              CLASS TEACHER
            </span>
          </div>
          <div className="flex-1 pt-12 flex items-end justify-center pb-2">
            <span className="text-gray-500 uppercase tracking-widest text-[11px]">
              PRINCIPAL
            </span>
          </div>
          <div className="flex-1 pt-12 flex items-end justify-center pb-2">
            <span className="text-gray-500 uppercase tracking-widest text-[11px]">
              PARENT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SophiaProgressReportPreIIView;

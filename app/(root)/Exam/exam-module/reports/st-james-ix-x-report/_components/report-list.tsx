"use client";

import React from "react";
import { mockData } from "./mock-data";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";

interface StJamesIxXReportListProps {
    data: any[];
    institution: any;
}

export default function StJamesIxXReportList({ data, institution }: StJamesIxXReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => { };

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

            <div className="w-full overflow-x-auto p-8 bg-white" id="printable-area">
                {/* Header Section */}
                <div className="flex flex-col mb-6 text-sm font-bold">
                    <div className="text-center mb-6">
                        ACADEMIC YEAR {mockData.academicYear}
                    </div>

                    <div className="flex justify-between mb-2">
                        <div>{mockData.studentDetails.name}</div>
                        <div>Class : {mockData.studentDetails.class}</div>
                        <div>Roll : {mockData.studentDetails.roll}</div>
                        <div>Reg.No.: {mockData.studentDetails.regNo}</div>
                    </div>

                    <div className="flex justify-between">
                        <div>{mockData.studentDetails.house}</div>
                        <div className="col-span-2 text-center ml-20">Number of boys in class : {mockData.studentDetails.numberOfBoys}</div>
                        <div>D.O.B : {mockData.studentDetails.dob}</div>
                    </div>
                </div>

                {/* Grades Table */}
                <table className="w-full border-collapse border-2 border-gray-400 text-sm font-bold text-center">
                    <thead>
                        <tr>
                            <th rowSpan={2} className="border border-gray-400 p-2 w-[35%] bg-white"></th>
                            <th colSpan={2} className="border border-gray-400 p-2 font-bold bg-white">
                                First Term
                            </th>
                            <th colSpan={2} className="border border-gray-400 p-2 font-bold bg-white">
                                Second Term
                            </th>
                        </tr>
                        <tr>
                            <th className="border border-gray-400 p-2 font-bold bg-white w-[16%]">Marks</th>
                            <th className="border border-gray-400 p-2 font-bold bg-white w-[16%]">Point</th>
                            <th className="border border-gray-400 p-2 font-bold bg-white w-[16%]">Marks</th>
                            <th className="border border-gray-400 p-2 font-bold bg-white w-[16%]">Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Subjects with Marks and Points */}
                        {mockData.subjects.map((subject, index) => (
                            <tr key={index}>
                                <td className="border border-gray-400 p-2 text-left pl-4">
                                    {subject.name}
                                </td>
                                <td className="border border-gray-400 p-2 font-bold">
                                    {subject.term1Marks || 0}
                                </td>
                                <td className="border border-gray-400 p-2 font-bold">
                                    {subject.term1Point || 0}
                                </td>
                                <td className="border border-gray-400 p-2 font-bold">
                                    {subject.term2Marks || 0}
                                </td>
                                <td className="border border-gray-400 p-2 font-bold">
                                    {subject.term2Point || 0}
                                </td>
                            </tr>
                        ))}

                        {/* Subjects with only Grades */}
                        {mockData.grades.map((grade, index) => (
                            <tr key={`grade-${index}`}>
                                <td className="border border-gray-400 p-2 text-left pl-4">
                                    {grade.name}
                                </td>
                                <td className="border border-gray-400 p-2 font-bold text-center">
                                    {grade.term1Grade}
                                </td>
                                <td className="border border-gray-400 p-2 bg-white"></td>
                                <td className="border border-gray-400 p-2 font-bold text-center">
                                    {grade.term2Grade}
                                </td>
                                <td className="border border-gray-400 p-2 bg-white"></td>
                            </tr>
                        ))}

                        {/* Third Language */}
                        <tr>
                            <td className="border border-gray-400 p-2 text-left pl-4">
                                {mockData.thirdLanguage.name}
                            </td>
                            <td colSpan={2} className="border border-gray-400 p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                {mockData.thirdLanguage.term1Marks}
                            </td>
                            <td colSpan={2} className="border border-gray-400 p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                {mockData.thirdLanguage.term2Marks}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Summary Table spacing */}
                <div className="h-8"></div>

                {/* Summary Table */}
                <table className="w-full border-collapse border-2 border-gray-400 text-sm font-bold mb-12 text-center mt-2">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 p-2 text-left pl-4 w-[35%]">
                                Total (Eng + 4)
                            </td>
                            <td className="border border-gray-400 p-2 w-[16%]">
                                {mockData.summary.totalTerm1}
                            </td>
                            <td className="border border-gray-400 p-2 w-[16%]">
                                {mockData.summary.totalTerm1Points}
                            </td>
                            <td className="border border-gray-400 p-2 w-[16%]">
                                {mockData.summary.totalTerm2}
                            </td>
                            <td className="border border-gray-400 p-2 w-[16%]">
                                {mockData.summary.totalTerm2Points}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 p-2 text-left pl-4">
                                Average (Eng + 4)
                            </td>
                            <td className="border border-gray-400 p-2">
                                {mockData.summary.averageTerm1}
                            </td>
                            <td className="border border-gray-400 p-2"></td>
                            <td className="border border-gray-400 p-2">
                                {mockData.summary.averageTerm2}
                            </td>
                            <td className="border border-gray-400 p-2"></td>
                        </tr>
                        {data && data[0]?.displayAttendance && (
                            <tr>
                                <td className="border border-gray-400 p-2 text-left pl-4">
                                    Attendance
                                </td>
                                <td className="border border-gray-400 p-2">
                                    {mockData.summary.attendanceTerm1}
                                </td>
                                <td className="border border-gray-400 p-2"></td>
                                <td className="border border-gray-400 p-2">
                                    {mockData.summary.attendanceTerm2}
                                </td>
                                <td className="border border-gray-400 p-2"></td>
                            </tr>
                        )}
                        <tr>
                            <td className="border border-gray-400 p-2 text-left pl-4">
                                Position
                            </td>
                            <td className="border border-gray-400 p-2">
                                {mockData.summary.positionTerm1}
                            </td>
                            <td className="border border-gray-400 p-2"></td>
                            <td className="border border-gray-400 p-2">
                                {mockData.summary.positionTerm2}
                            </td>
                            <td className="border border-gray-400 p-2"></td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-12 text-sm font-bold">
                    <div className="mb-8">Class Teacher's Comment :</div>
                    <div className="flex mt-14 justify-between">
                        <div className="text-center flex flex-col items-center">
                            <div className="border-t-[1.5px] border-black w-48 pt-1 text-sm font-bold">
                                {mockData.signatures.principal}
                            </div>
                            <div className="text-sm font-bold">Principal/Secretary</div>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <div className="border-t-[1.5px] border-black w-48 pt-1 text-sm font-bold">
                                {mockData.signatures.classTeacher}
                            </div>
                            <div className="text-sm font-bold">Class Teacher</div>
                        </div>
                        <div className="text-center flex flex-col items-center ">
                            <div className="border-t-[1.5px] border-black w-32 mt-[2px] pt-1 text-sm font-bold">
                                Parent
                            </div>
                        </div>
                    </div>
                </div>            
            </div>
        </div>
    );
}

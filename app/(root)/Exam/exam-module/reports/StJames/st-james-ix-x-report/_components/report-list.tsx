'use client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { mockData } from './mock-data';

interface StJamesIxXReportListProps {
    data: any[];
    institution: any;
}

export default function StJamesIxXReportList({ data, institution }: StJamesIxXReportListProps) {
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
          }
        `}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div className='w-full overflow-x-auto bg-white p-8' id='printable-area'>
                {/* Header Section */}
                <div className='mb-6 flex flex-col font-bold text-sm'>
                    <div className='mb-6 text-center'>ACADEMIC YEAR {mockData.academicYear}</div>

                    <div className='mb-2 flex justify-between'>
                        <div>{mockData.studentDetails.name}</div>
                        <div>Class : {mockData.studentDetails.class}</div>
                        <div>Roll : {mockData.studentDetails.roll}</div>
                        <div>Reg.No.: {mockData.studentDetails.regNo}</div>
                    </div>

                    <div className='flex justify-between'>
                        <div>{mockData.studentDetails.house}</div>
                        <div className='col-span-2 ml-20 text-center'>Number of boys in class : {mockData.studentDetails.numberOfBoys}</div>
                        <div>D.O.B : {mockData.studentDetails.dob}</div>
                    </div>
                </div>

                {/* Grades Table */}
                <table className='w-full border-collapse border-2 border-gray-400 text-center font-bold text-sm'>
                    <thead>
                        <tr>
                            <th rowSpan={2} className='w-[35%] border border-gray-400 bg-white p-2' />
                            <th colSpan={2} className='border border-gray-400 bg-white p-2 font-bold'>
                                First Term
                            </th>
                            <th colSpan={2} className='border border-gray-400 bg-white p-2 font-bold'>
                                Second Term
                            </th>
                        </tr>
                        <tr>
                            <th className='w-[16%] border border-gray-400 bg-white p-2 font-bold'>Marks</th>
                            <th className='w-[16%] border border-gray-400 bg-white p-2 font-bold'>Point</th>
                            <th className='w-[16%] border border-gray-400 bg-white p-2 font-bold'>Marks</th>
                            <th className='w-[16%] border border-gray-400 bg-white p-2 font-bold'>Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Subjects with Marks and Points */}
                        {mockData.subjects.map((subject, index) => (
                            <tr key={index}>
                                <td className='border border-gray-400 p-2 pl-4 text-left'>{subject.name}</td>
                                <td className='border border-gray-400 p-2 font-bold'>{subject.term1Marks || 0}</td>
                                <td className='border border-gray-400 p-2 font-bold'>{subject.term1Point || 0}</td>
                                <td className='border border-gray-400 p-2 font-bold'>{subject.term2Marks || 0}</td>
                                <td className='border border-gray-400 p-2 font-bold'>{subject.term2Point || 0}</td>
                            </tr>
                        ))}

                        {/* Subjects with only Grades */}
                        {mockData.grades.map((grade, index) => (
                            <tr key={`grade-${index}`}>
                                <td className='border border-gray-400 p-2 pl-4 text-left'>{grade.name}</td>
                                <td className='border border-gray-400 p-2 text-center font-bold'>{grade.term1Grade}</td>
                                <td className='border border-gray-400 bg-white p-2' />
                                <td className='border border-gray-400 p-2 text-center font-bold'>{grade.term2Grade}</td>
                                <td className='border border-gray-400 bg-white p-2' />
                            </tr>
                        ))}

                        {/* Third Language */}
                        <tr>
                            <td className='border border-gray-400 p-2 pl-4 text-left'>{mockData.thirdLanguage.name}</td>
                            <td colSpan={2} className='border border-gray-400 p-2 text-center' style={{ verticalAlign: 'middle' }}>
                                {mockData.thirdLanguage.term1Marks}
                            </td>
                            <td colSpan={2} className='border border-gray-400 p-2 text-center' style={{ verticalAlign: 'middle' }}>
                                {mockData.thirdLanguage.term2Marks}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Summary Table spacing */}
                <div className='h-8' />

                {/* Summary Table */}
                <table className='mt-2 mb-12 w-full border-collapse border-2 border-gray-400 text-center font-bold text-sm'>
                    <tbody>
                        <tr>
                            <td className='w-[35%] border border-gray-400 p-2 pl-4 text-left'>Total (Eng + 4)</td>
                            <td className='w-[16%] border border-gray-400 p-2'>{mockData.summary.totalTerm1}</td>
                            <td className='w-[16%] border border-gray-400 p-2'>{mockData.summary.totalTerm1Points}</td>
                            <td className='w-[16%] border border-gray-400 p-2'>{mockData.summary.totalTerm2}</td>
                            <td className='w-[16%] border border-gray-400 p-2'>{mockData.summary.totalTerm2Points}</td>
                        </tr>
                        <tr>
                            <td className='border border-gray-400 p-2 pl-4 text-left'>Average (Eng + 4)</td>
                            <td className='border border-gray-400 p-2'>{mockData.summary.averageTerm1}</td>
                            <td className='border border-gray-400 p-2' />
                            <td className='border border-gray-400 p-2'>{mockData.summary.averageTerm2}</td>
                            <td className='border border-gray-400 p-2' />
                        </tr>
                        {data?.[0]?.displayAttendance && (
                            <tr>
                                <td className='border border-gray-400 p-2 pl-4 text-left'>Attendance</td>
                                <td className='border border-gray-400 p-2'>{mockData.summary.attendanceTerm1}</td>
                                <td className='border border-gray-400 p-2' />
                                <td className='border border-gray-400 p-2'>{mockData.summary.attendanceTerm2}</td>
                                <td className='border border-gray-400 p-2' />
                            </tr>
                        )}
                        <tr>
                            <td className='border border-gray-400 p-2 pl-4 text-left'>Position</td>
                            <td className='border border-gray-400 p-2'>{mockData.summary.positionTerm1}</td>
                            <td className='border border-gray-400 p-2' />
                            <td className='border border-gray-400 p-2'>{mockData.summary.positionTerm2}</td>
                            <td className='border border-gray-400 p-2' />
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className='mt-12 font-bold text-sm'>
                    <div className='mb-8'>Class Teacher's Comment :</div>
                    <div className='mt-14 flex justify-between'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>{mockData.signatures.principal}</div>
                            <div className='font-bold text-sm'>Principal/Secretary</div>
                        </div>
                        <div className='flex flex-col items-center text-center'>
                            <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>
                                {mockData.signatures.classTeacher}
                            </div>
                            <div className='font-bold text-sm'>Class Teacher</div>
                        </div>
                        <div className='flex flex-col items-center text-center '>
                            <div className='mt-[2px] w-32 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Parent</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

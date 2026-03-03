import { format } from 'date-fns';
import React from 'react';

interface StudentAttendancePrintProps {
    data: any;
    academicYear: string;
    className: string;
    sectionName: string;
    monthName?: string;
}

export const StudentAttendancePrint = React.forwardRef<HTMLDivElement, StudentAttendancePrintProps>(
    ({ data, academicYear, className, sectionName, monthName }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const institution = data?.data?.institutionDetails?.[0];
        const studentList = data?.data?.studentAttendanceList ?? [];
        const totalRecords = data?.total ?? studentList.length;

        if (!studentList || studentList.length === 0) {
            return (
                <div ref={ref} className='p-5 text-center bg-white text-black'>
                    No data available for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container bg-white text-black min-h-full w-full'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 portrait;
                            }
                            body {
                                visibility: hidden;
                                background: white !important;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white !important;
                                z-index: 9999;
                                color: black !important;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 6px 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            .data-table th {
                                background-color: #f3f4f6 !important;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .header-section {
                                text-align: center;
                                padding-bottom: 15px;
                            }
                            .footer-section {
                                padding-top: 20px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `}
                </style>

                <table className='main-table no-border'>
                    <thead>
                        <tr>
                            <td className='no-border'>
                                <div className='header-section'>
                                    {institution && (
                                        <>
                                            <div className='flex flex-col items-center mb-2'>
                                                {institution.mI_Logo && (
                                                    <img src={institution.mI_Logo} alt='Logo' style={{ height: '60px' }} />
                                                )}
                                                <h1 className='text-xl font-bold uppercase'>{institution.mI_Name}</h1>
                                                <p className='text-xs'>
                                                    {institution.mI_Address1}
                                                    {institution.mI_Address2 && `, ${institution.mI_Address2}`}
                                                    {institution.mI_Address3 && `, ${institution.mI_Address3}`}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <h2 className='text-lg font-bold uppercase underline'>Student Attendance Report</h2>
                                    <div className='mt-2 flex justify-center gap-4 text-xs font-semibold'>
                                        <span>Academic Year: {academicYear}</span>
                                        <span>Class: {className}</span>
                                        <span>Section: {sectionName}</span>
                                        {monthName && <span>Month: {monthName}</span>}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                <table className='data-table'>
                                    <thead>
                                        <tr>
                                            <th>Sl.No</th>
                                            <th>Student Name</th>
                                            <th>Admission No</th>
                                            <th>Roll No</th>
                                            <th>Class Held</th>
                                            <th>Class Attended</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentList.map((student: any, index: number) => (
                                            <tr key={index}>
                                                <td>{student.RowNo || index + 1}</td>
                                                <td style={{ textAlign: 'left' }}>{student.name}</td>
                                                <td>{student.AMST_AdmNo}</td>
                                                <td>{student.AMAY_RollNo}</td>
                                                <td>{student.ASA_ClassHeld}</td>
                                                <td>{student.ASA_Class_Attended}</td>
                                                <td>{Number(student.Percentage).toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                        <tr className='bg-gray-100 font-bold'>
                                            <td colSpan={6} className='text-right px-4 uppercase'>
                                                Total Records
                                            </td>
                                            <td className='px-4'>
                                                {totalRecords}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                <div className='footer-section'>
                                    <div>Printed Date: {currentDate}</div>
                                    <div style={{ marginRight: '50px' }}>Signature</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

StudentAttendancePrint.displayName = 'StudentAttendancePrint';

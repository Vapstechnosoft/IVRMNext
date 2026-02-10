import { type IClassTeacherReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface ClassTeacherReportPrintProps {
    data: IClassTeacherReportList[];
    reportType: string;
}

export const ClassTeacherReportPrint = React.forwardRef<HTMLDivElement, ClassTeacherReportPrintProps>(
    ({ data, reportType }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!data || data.length === 0) {
            debugger;
            return (
                <div ref={ref} className='p-5 text-center bg-white text-black'>
                    No data selected for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container p-5 bg-white text-black min-h-full w-full'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 portrait;
                            }
                            body {
                                background: white;
                                color: black;
                                font-family: sans-serif;
                            }
                            .print-preview-container {
                                display: block !important;
                                visibility: visible !important;
                                padding: 10mm;
                                background: white;
                                color: black;
                                width: 100%;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #d1d5db; /* gray-300 */
                            }
                            th, td {
                                border: 1px solid #d1d5db;
                                padding: 8px 16px; /* px-4 py-2 */
                                text-align: left;
                                font-size: 12px;
                            }
                            th {
                                background-color: #f3f4f6; /* gray-100 */
                                font-weight: 600;
                            }
                            .header-section {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .footer-section {
                                margin-top: 20px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                            }
                        }
                    `
                    }}
                />

                {/* Header */}
                <div className='header-section mb-6 text-center'>
                    <h2 className='text-lg font-bold uppercase'>Class Teacher Report</h2>
                    <p className='text-sm text-gray-600'>Date: {currentDate}</p>
                </div>

                {/* Table */}
                <table className='w-full'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='w-16 text-center'>Sl.No</th>
                            <th>Staff Name</th>
                            <th>Class Name</th>
                            <th>Section</th>
                            {(reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher') && <th>Subject</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className='text-center'>{index + 1}</td>
                                <td>{item.IVRMSTAUL_UserName || '-'}</td>
                                <td>{item.ASMCL_ClassName || '-'}</td>
                                <td>{item.ASMC_SectionName || '-'}</td>
                                {(reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher') && (
                                    <td>{item.PAMS_SubjectName || '-'}</td>
                                )}
                            </tr>
                        ))}
                        <tr className='bg-gray-100 font-bold'>
                            <td colSpan={reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher' ? 4 : 3} className='text-right px-4'>
                                Total
                            </td>
                            <td colSpan={1} className='text-left px-4'>
                                {data.length}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer */}
                <div className='footer-section'>
                    <div>Printed Date: {currentDate}</div>
                    <div>Signature</div>
                </div>
            </div >
        );
    }
);

ClassTeacherReportPrint.displayName = 'ClassTeacherReportPrint';

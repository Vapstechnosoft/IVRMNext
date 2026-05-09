'use client';

import { Printer } from 'lucide-react';
import React from 'react';

interface StJamesI_IIIReportListProps {
    data: any;
    institution: any;
}

export default function StJamesI_IIIReportList({ data, institution }: StJamesI_IIIReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const {
        getstudentdetails = [],
        year = '',
        exam = '',
        displayattendance = false,
        readmit = false,
        displayMarks = false,
        clastechname = ''
    } = data;

    return (
        <div className='mt-8 space-y-8'>
            <div className='flex justify-end gap-2 px-4 no-print'>
                <button
                    onClick={handlePrint}
                    className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-md transition-all'>
                    <Printer className='h-4 w-4' /> Print
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .page-break { page-break-before: always; }
                    .stjames-report { padding: 40px; border: none !important; box-shadow: none !important; }
                }
                .stjames-report {
                    font-family: 'Times New Roman', serif;
                    color: black;
                }
                .border-bottom {
                    border-bottom: 1px solid #000;
                }
                .border-top {
                    border-top: 1px solid #000;
                }
                .borderdiv {
                    border: 1px solid black;
                    width: 30%;
                    min-height: 95px;
                    padding: 10px;
                    margin-left: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .link {
                    text-transform: lowercase;
                    display: inline-block;
                }
                .link::first-line {
                    text-transform: capitalize;
                }
                .table-bordered {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table-bordered th, .table-bordered td {
                    border: 1px solid black;
                    padding: 8px;
                }
                .width-200 {
                    width: 200px;
                }
                .width-1 {
                    width: 1px;
                }
            `}</style>

            <div id='Baldwin' className='bg-white'>
                {getstudentdetails.map((report: any, index: number) => (
                    <div key={index} className={`stjames-report ${index > 0 ? 'page-break' : ''} max-w-[1000px] mx-auto p-10 border border-gray-200 shadow-lg mb-10`}>
                        <div className='text-center mb-8'>
                            <h4 className='text-lg font-bold uppercase'>
                                {exam || 'FINAL'} EXAMINATION REPORT CARD {year || '2023-2024'}
                            </h4>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 text-sm font-bold'>
                            <div className='md:col-span-5 space-y-2'>
                                <div>NAME : <span className='uppercase'>{report.studentname}</span></div>
                                <div className='flex gap-1'>
                                    <span>CLASS TEACHER :</span>
                                    <span className='link lowercase first-letter:capitalize'>{clastechname || 'Class Teacher'}</span>
                                </div>
                            </div>
                            <div className='md:col-span-4 space-y-2'>
                                <div>CLASS : <span>{report.asmcL_ClassName}</span></div>
                                <div>ROLL NO. : <span>{report.amaY_RollNo}</span></div>
                            </div>
                            <div className='md:col-span-3 space-y-2'>
                                <div>SECTION : <span>{report.asmC_SectionName}</span></div>
                                <div>ADM.NO. : <span>{report.amsT_AdmNo}</span></div>
                            </div>
                        </div>

                        <div className='mb-6'>
                            <table className='table-bordered text-sm'>
                                <thead>
                                    <tr>
                                        <th className='text-center'>SUBJECTS</th>
                                        <th className='text-center'>{displayMarks ? 'MARKS OBTAINED' : 'GRADE OBTAINED'}</th>
                                        <th className='text-center'>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='text-left font-extrabold' style={{ paddingLeft: '10px' }}>
                                            General :
                                        </td>
                                        <td className='text-center font-bold'>
                                            {report.ESTMP_TotalGrade}
                                        </td>
                                        <td className='text-center'>&nbsp;</td>
                                    </tr>
                                </tbody>
                                <tbody>
                                    {report.stdmarks?.map((subj: any, sIdx: number) => (
                                        <tr key={sIdx}>
                                            <td className={`text-left ${subj.Displaymarks === 0 ? 'font-bold' : ''}`} style={{ paddingLeft: '10px' }}>
                                                {subj.Display_Name} {subj.Displaymarks === 0 ? ' : ' : ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {subj.Displaymarks === 1 && (
                                                    <>
                                                        {subj.Marksdispaly === 1 && (
                                                            subj.PassFailFlg === 'AB' ? 'AB' : subj.Marks
                                                        )}
                                                        {subj.Gradedisplay === 1 && (
                                                            subj.PassFailFlg === 'AB' ? 'AB' : subj.Grade
                                                        )}
                                                    </>
                                                )}
                                                {subj.Displaymarks === 0 && <>&nbsp;</>}
                                            </td>
                                            <td className='text-center font-bold' style={{ paddingLeft: '10px' }}>
                                                {subj.Displaymarks === 1 && (
                                                    subj.PassFailFlg === 'AB' ? 'AB' : subj.GRADEREMAKS
                                                )}
                                                {subj.Displaymarks === 0 && <>&nbsp;</>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {displayattendance && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={3} className='text-center font-bold p-2'>
                                                NO.OF WORKING DAYS : {report.TOTALWORKINGDAYS} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NO.OF DAYS PRESENT : {report.PRESENTDAYS}
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </div>

                        <div className='flex flex-wrap md:flex-nowrap gap-4 mb-10'>
                            <div className='flex-1 space-y-6 font-bold text-sm'>
                                <div className='flex items-end gap-2'>
                                    <span className='whitespace-nowrap'>NEXT TERM BEGINS ON :</span>
                                    <div className='border-bottom flex-1 min-w-[100px]'>&nbsp;</div>
                                    <span>AT</span>
                                    <div className='border-bottom w-24'>&nbsp;</div>
                                </div>
                                <div className='flex items-start gap-2'>
                                    <span className='whitespace-nowrap'>CLASS TEACHER'S REMARKS:</span>
                                    <div className='border-bottom flex-1 font-normal italic min-h-[20px]'>
                                        {report.remaks}
                                    </div>
                                </div>
                            </div>
                            {readmit && (
                                <div className='borderdiv font-bold text-sm'>
                                    <div className='text-center'>
                                        Promotion
                                        <br />
                                        <br />
                                        Granted / Refused
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='mt-16'>
                            <div className='grid grid-cols-4 gap-4 text-center'>
                                <div className='space-y-6'>
                                    <div className='h-6'></div>
                                    <div className='border-top text-[10px] font-bold pt-1'>PARENT'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='h-6 text-sm font-bold link lowercase first-letter:capitalize'>{clastechname}</div>
                                    <div className='border-top text-[10px] font-bold pt-1'>CLASS TEACHER'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='h-6 text-sm font-bold'>Mrs. B. Mathew</div>
                                    <div className='border-top text-[10px] font-bold pt-1'>JUNIOR HEAD'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='h-6 text-sm font-bold'>Dr.T.H.Ireland</div>
                                    <div className='border-top text-[10px] font-bold pt-1'>PRINCIPAL'S SIGNATURE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

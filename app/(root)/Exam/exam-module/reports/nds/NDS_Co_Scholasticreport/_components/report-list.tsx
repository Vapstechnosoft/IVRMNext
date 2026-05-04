'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { format } from 'date-fns';

interface ReportListProps {
    data: any;
    academicYear: string;
}

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { studentdetails, gettermdetails } = data;

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=800,height=600');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>NDS Co-Scholastic Report</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
                        <style>
                            @page { size: auto; margin: 5mm; }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; font-size: 12px; }
                            .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; page-break-after: always; }
                            .text-bold { font-weight: bold; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .table-bordered > thead > tr > th, 
                            .table-bordered > tbody > tr > th, 
                            .table-bordered > tfoot > tr > th, 
                            .table-bordered > thead > tr > td, 
                            .table-bordered > tbody > tr > td, 
                            .table-bordered > tfoot > tr > td {
                                border: 1px solid #000 !important;
                                padding: 8px !important;
                                text-align: center;
                            }
                            .text-left { text-align: left !important; }
                            .Ndsreport { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact; }
                            .Ndsreport1 { background-color: #f7db99 !important; -webkit-print-color-adjust: exact; }
                            .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; padding: 0 5px; }
                            @media print {
                                .no-print { display: none; }
                                .pagelayout { border: 1px solid black !important; }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWinindow.document.close();
        }
    };

    if (!studentdetails || studentdetails.length === 0) return null;

    const logoPath = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("admfigsettings") || '[]')?.[0]?.asC_Logo_Path : "";

    return (
        <div className="space-y-6">
            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:scale-105">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Reports
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-white p-4">
                {studentdetails.map((report: any, index: number) => (
                    <div key={index} className="pagelayout bg-white mb-8 border border-black p-8 shadow-sm">
                        <div className="row margin-top-5">
                            <div className="col-sm-12 text-center">
                                {logoPath ? (
                                    <img src={logoPath} className="img-responsive inline-block" style={{ width: '100%' }} alt="Header" />
                                ) : (
                                    <img 
                                        src="https://vapsinhouse.blob.core.windows.net/files/7/ISM_Attachments/0126ed08-0ea1-4594-9bde-6080d947db50.jpg" 
                                        className="img-responsive w-full" 
                                        alt="School Header"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <h4 className="text-center font-bold my-8 uppercase text-lg border-b-2 border-black pb-2">
                            Report Card for Co-Scholastic Areas (Class {report.classname} Academic Session : {academicYear})
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 mb-8 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Roll No.:</span>
                                <span className="border-b border-black flex-1 max-w-[200px]">{report.rollno?.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Student's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{(report.studentName || report.studentname)?.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Father's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{report.fathername?.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Mother's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{report.mothername?.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Date Of Birth:</span>
                                <span className="border-b border-black flex-1 max-w-[200px]">{report.dob?.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="row margin-top-10">
                            <div className="col-sm-12">
                                <table className="table table-bordered w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-center font-bold p-3 bg-[#f7db99] border-black" colSpan={2}>
                                                Co-Scholastic Areas : {`{on 5- Point(A-E) grading scale}`}
                                            </th>
                                        </tr>
                                        <tr className="bg-[#c9eaf0]">
                                            <th className="text-left font-bold p-3 border-black w-3/4">Skill Name</th>
                                            <th className="text-center font-bold p-3 border-black">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.skill_main_list?.map((subjco: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className="text-left p-2 font-semibold border-black">{subjco.ECS_SkillName}</td>
                                                <td className="text-center p-2 border-black">
                                                    {gettermdetails?.map((term: any) => (
                                                        <span key={term.ecT_Id}>
                                                            {subjco.skill_score_details
                                                                ?.filter((sc: any) => sc.ecT_Id === term.ecT_Id)
                                                                .map((sc: any, scIdx: number) => (
                                                                    <b key={scIdx}>{sc.scoregrade}</b>
                                                                ))}
                                                        </span>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100">
                                            <th className="text-left font-bold p-3 border-black" colSpan={2}>Activities</th>
                                        </tr>
                                        {report.activity_main_list?.map((subjco: any, aIdx: number) => (
                                            <tr key={aIdx}>
                                                <td className="text-left p-2 font-semibold border-black">{subjco.ECACTA_SkillArea}</td>
                                                <td className="text-center p-2 border-black">
                                                    {gettermdetails?.map((term: any) => (
                                                        <span key={term.ecT_Id}>
                                                            {subjco.activity_score_details
                                                                ?.filter((sc: any) => sc.ecT_Id === term.ecT_Id)
                                                                .map((sc: any, scIdx: number) => (
                                                                    <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                ))}
                                                        </span>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-16 flex justify-between items-end text-sm">
                            <div className="space-y-1">
                                <div className="font-bold">Date : {format(new Date(), 'dd/MM/yyyy')}</div>
                            </div>
                            <div className="text-center font-bold pb-2 border-t border-black min-w-[180px]">
                                Sig of Teacher
                            </div>
                            <div className="text-center font-bold pb-2 border-t border-black min-w-[180px]">
                                Sign of Principal
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


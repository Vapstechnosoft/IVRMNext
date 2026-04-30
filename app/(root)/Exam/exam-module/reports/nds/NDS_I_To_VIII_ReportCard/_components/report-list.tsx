'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { format } from 'date-fns';

interface ReportListProps {
    data: any;
    academicYear: string;
}

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { 
        studentdetails, 
        gettermdetails, 
        getgroupdetails, 
        getgroupexamdetails 
    } = data;

    // Transform group details and exam list as per AngularJS logic
    const { transformedGroups, fullExamList } = useMemo(() => {
        const groups = [...(getgroupdetails || [])];
        const examList: any[] = [];
        
        groups.forEach((group: any) => {
            const groupExams = getgroupexamdetails?.filter(
                (d: any) => d.empG_DistplayName === group.empG_DistplayName
            ) || [];
            
            const counttotal = groupExams.reduce((sum: number, d: any) => sum + (d.empsgE_ForMaxMarkrs || 0), 0);
            
            const groupExamItems = groupExams.map((d: any) => ({
                EME_Id: d.emE_Id,
                EME_ExamName: d.emE_ExamName,
                EMPG_DistplayName: d.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                examnamedisplay: d.emE_ExamCode
            }));
            
            // Add Total and Grade placeholders
            const finalGroupExams = [
                ...groupExamItems,
                { EME_Id: 9800000, EMPG_DistplayName: group.empG_DistplayName, EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: 'Total' },
                { EME_Id: 9800001, EMPG_DistplayName: group.empG_DistplayName, EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: 'Grade' }
            ];
            
            group.groupewiseexam = finalGroupExams;
            group.empsG_MarksValue = counttotal;
            examList.push(...finalGroupExams);
        });
        
        return { transformedGroups: groups, fullExamList: examList };
    }, [getgroupdetails, getgroupexamdetails]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1000,height=800');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>NDS 1 to 8 Report Card</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
                        <style>
                            @page { size: landscape; margin: 5mm; }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px; font-size: 11px; }
                            .pagelayout { border: 1px solid black !important; padding: 10px !important; margin-bottom: 20px; page-break-after: always; }
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
                                padding: 4px !important;
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

    // Get logo from local storage if available, else use institution default logic
    const logoPath = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("admfigsettings") || '[]')?.[0]?.asC_Logo_Path : "";

    return (
        <div className="space-y-6">
            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:scale-105">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Reports
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-white p-4 overflow-x-auto">
                {studentdetails.map((report: any, index: number) => (
                    <div key={index} className="pagelayout bg-white mb-8 border border-black p-4 shadow-sm min-w-[900px]">
                        <div className="row margin-top-5">
                            <div className="col-sm-12 text-center">
                                {logoPath ? (
                                    <img src={logoPath} className="img-responsive inline-block" style={{ width: '100%' }} alt="Header" />
                                ) : (
                                    <div className="h-24 bg-gray-100 flex items-center justify-center font-bold text-gray-400">[INSTITUTION LOGO]</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 my-6">
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">SATS NO:</span>
                                <span className="border-b border-black flex-1 max-w-[200px]">{report.amsT_RegistrationNo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Student's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{(report.studentName || report.studentname)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Father's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{report.fathername}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Mother's Name:</span>
                                <span className="border-b border-black flex-1 max-w-[400px]">{report.mothername}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold min-w-[120px]">Date Of Birth:</span>
                                <span className="border-b border-black flex-1 max-w-[200px]">{report.dob}</span>
                            </div>
                        </div>

                        {/* Scholastic Areas */}
                        <div className="row margin-top-10">
                            <div className="col-sm-12">
                                <table className="table table-bordered w-full text-xs">
                                    <thead>
                                        <tr>
                                            <td className="text-left font-bold bg-[#f7db99] p-2">Scholastic Areas(A)</td>
                                            {transformedGroups.map((grp: any, gIdx: number) => (
                                                <td key={gIdx} colSpan={grp.groupewiseexam.length} className="bg-[#f7db99] font-bold p-2">
                                                    {grp.empG_DistplayName} ({grp.empsG_MarksValue} Marks)
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-[#c9eaf0]">
                                            <th className="text-center font-bold p-2">Subject Name</th>
                                            {fullExamList.map((exam: any, eIdx: number) => (
                                                <th key={eIdx} className="text-center p-2">
                                                    <div>{exam.examnamedisplay}</div>
                                                    <div className="text-[10px]">({exam.EMPSGE_ForMaxMarkrs})</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Result Subjects */}
                                        {report.studentsubjects?.filter((s: any) => s.EMPS_AppToResultFlg).map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className="text-left font-bold bg-[#c9eaf0] p-2">{subj.ISMS_SubjectName}</td>
                                                {fullExamList.map((exam: any, eIdx: number) => (
                                                    <td key={eIdx} className="p-1">
                                                        {report.studentmarks?.filter((m: any) => 
                                                            m.ISMS_Id === subj.ISMS_Id && 
                                                            m.EME_Id === exam.EME_Id && 
                                                            m.EMPSG_DisplayName === exam.EMPG_DistplayName
                                                        ).map((mrks: any, mIdx: number) => (
                                                            <div key={mIdx}>
                                                                {['AB', 'M', 'L'].includes(mrks.PassFailFlag) ? (
                                                                    <div className="font-bold">
                                                                        {mrks.PassFailFlag}
                                                                        {mrks.ObtainedMarks > 0 && exam.EME_ExamName !== 'Grade' && ` (${mrks.ObtainedMarks})`}
                                                                    </div>
                                                                ) : (
                                                                    <div className="font-bold">
                                                                        {exam.examnamedisplay === 'Grade' || exam.EME_ExamName === 'Grade' ? mrks.ObtainedGrade : mrks.ObtainedMarks}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {/* Non-Result Subjects */}
                                        {report.studentsubjects?.filter((s: any) => !s.EMPS_AppToResultFlg).map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className="text-left p-2">{subj.ISMS_SubjectName}</td>
                                                {fullExamList.map((exam: any, eIdx: number) => (
                                                    <td key={eIdx} className="p-1">
                                                        {/* Same logic as above */}
                                                        {report.studentmarks?.filter((m: any) => 
                                                            m.ISMS_Id === subj.ISMS_Id && 
                                                            m.EME_Id === exam.EME_Id && 
                                                            m.EMPSG_DisplayName === exam.EMPG_DistplayName
                                                        ).map((mrks: any, mIdx: number) => (
                                                            <div key={mIdx}>
                                                                {['AB', 'M', 'L'].includes(mrks.PassFailFlag) ? (
                                                                    <div className="font-bold">{mrks.PassFailFlag}</div>
                                                                ) : (
                                                                    <div className="font-bold">
                                                                        {exam.examnamedisplay === 'Grade' || exam.EME_ExamName === 'Grade' ? mrks.ObtainedGrade : mrks.ObtainedMarks}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Co-Scholastic and Discipline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {/* Co-Scholastic */}
                            <div>
                                <table className="table table-bordered w-full text-[10px]">
                                    <thead>
                                        <tr>
                                            <th colSpan={gettermdetails?.length + 1} className="bg-[#f7db99] p-2">Co-Scholastic Areas : {`{on 3- Point(A-C) grading scale}`}</th>
                                        </tr>
                                        <tr className="bg-[#c9eaf0]">
                                            <th className="p-2 w-1/2"></th>
                                            {gettermdetails?.map((cos: any) => (
                                                <th key={cos.ecT_Id} className="p-2">{cos.ecT_TermName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.skill_main_list?.map((subjco: any, scIdx: number) => (
                                            <tr key={scIdx}>
                                                <td className="text-left font-bold bg-[#c9eaf0] p-2">{subjco.ECS_SkillName}</td>
                                                {gettermdetails?.map((term: any) => (
                                                    <td key={term.ecT_Id} className="p-2">
                                                        {subjco.skill_score_details?.find((sc: any) => sc.ecT_Id === term.ecT_Id)?.scoregrade}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Discipline */}
                            <div>
                                <table className="table table-bordered w-full text-[10px]">
                                    <thead>
                                        <tr>
                                            <th colSpan={gettermdetails?.length + 1} className="bg-[#f7db99] p-2">Discipline : {`{on 3- Point(A-C) grading scale}`}</th>
                                        </tr>
                                        <tr className="bg-[#c9eaf0]">
                                            <th className="p-2 w-1/2"></th>
                                            {gettermdetails?.map((cos: any) => (
                                                <th key={cos.ecT_Id} className="p-2">{cos.ecT_TermName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.activity_main_list?.map((subjco: any, aIdx: number) => (
                                            <tr key={aIdx}>
                                                <td className="text-left font-bold bg-[#c9eaf0] p-2">{subjco.ECACTA_SkillArea}</td>
                                                {gettermdetails?.map((term: any) => (
                                                    <td key={term.ecT_Id} className="p-2">
                                                        {subjco.activity_score_details?.find((sc: any) => sc.ecT_Id === term.ecT_Id)?.EMGD_Name}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Remarks and Promotion */}
                        <div className="mt-6 space-y-4 text-xs">
                            <div className="flex gap-2">
                                <span className="font-bold">Class Teacher's Remarks :</span>
                                <span className="border-b border-black flex-1 italic">{report.remarks}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold">Promoted To Class :</span>
                                <span className="border-b border-black flex-1 font-bold">{report.promotedclass}</span>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 flex justify-between items-end text-xs">
                            <div className="space-y-1">
                                <div className="font-bold">Place : Vasai</div>
                                <div className="font-bold">Date : {format(new Date(), 'dd/MM/yyyy')}</div>
                            </div>
                            <div className="text-center font-bold pb-2 border-t border-black min-w-[150px]">
                                Signature of Class Teacher
                            </div>
                            <div className="text-center font-bold pb-2 border-t border-black min-w-[150px]">
                                Signature of Principal
                            </div>
                            <div className="text-center font-bold pb-2 border-t border-black min-w-[150px]">
                                Signature of Parents
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

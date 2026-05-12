'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';

interface ReportViewProps {
    data: any;
    params: any;
}

export const ReportView = ({ data, params }: ReportViewProps) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'NDS_9_Progress_Card_Report',
    });

    if (!data || !data.getstudentdetails) return null;

    const {
        getstudentdetails,
        gettermdetails,
        getgroupdetails,
        getstudentmarksdetails,
        getstudentwisesubjectlist,
        getstudentwiseskillslist,
        getstudentwiseactiviteslist,
        getpromotionremarksdetails,
        getinstitution,
    } = data;

    const institution = getinstitution?.[0] || {};

    // Process Group Details (Adding "Marks Obtained" and "Grade" as per legacy logic)
    const processedGroupDetails = [...(getgroupdetails || [])];
    if (!processedGroupDetails.some(g => g.empG_DistplayName === 'Marks Obtained')) {
        processedGroupDetails.push({
            empG_DistplayName: "Marks Obtained", empsG_GroupName: "Marks Obtained", empsG_MarksValue: 100
        });
    }
    if (!processedGroupDetails.some(g => g.empG_DistplayName === 'Grade')) {
        processedGroupDetails.push({
            empG_DistplayName: "Grade", empsG_GroupName: "Grade", empsG_MarksValue: ""
        });
    }

    return (
        <div className="flex flex-col w-[1400px] mx-auto">
            <div className="flex justify-end pr-0 -mt-12 mb-4 relative z-50 no-print">
                <Button 
                    onClick={() => handlePrint()} 
                    className="w-24 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                >
                    <Printer className="mr-1 h-3 w-3" /> Print
                </Button>
            </div>

            <div ref={componentRef} className="print-area">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { 
                            size: A4; 
                            margin: 10mm; 
                        }
                        body {
                            visibility: hidden !important;
                            background: white !important;
                        }
                        .print-area, .print-area * {
                            visibility: visible !important;
                        }
                        .print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                        }
                        .pagelayout { 
                            margin: 0 auto !important;
                            box-shadow: none !important;
                            border: 1px solid black !important; 
                            padding: 10px !important; 
                            width: 100% !important;
                            page-break-after: always !important; 
                            background: white !important;
                            color: black !important;
                        }
                        .no-print { display: none !important; }
                    }
                    .pagelayout { 
                        border: 1px solid black; 
                        padding: 15px; 
                        margin-bottom: 20px; 
                        background: white; 
                        width: 100%;
                    }
                    .table-bordered { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    .table-bordered th, .table-bordered td { border: 1px solid black; padding: 4px; text-align: center; font-size: 11px; }
                    .text-left { text-align: left !important; }
                    .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 100px; padding-left: 5px; font-weight: bold; }
                    .Ndsreport { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact; }
                    .Ndsreport1 { background-color: #f7db99 !important; -webkit-print-color-adjust: exact; }
                    .header-logo { width: 100%; max-height: 100px; object-fit: contain; }
                    .uppercase { text-transform: uppercase; }
                `}} />

                {(getstudentdetails || []).map((student: any, idx: number) => {
                    const studentId = student.amsT_Id || student.AMST_Id;
                    const studentSubjects = (getstudentwisesubjectlist || []).filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
                    const studentMarks = (getstudentmarksdetails || []).filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);
                    const studentSkills = (getstudentwiseskillslist || []).filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
                    const studentActivities = (getstudentwiseactiviteslist || []).filter((a: any) => (a.amsT_Id || a.AMST_Id) === studentId);
                    const studentRemarks = (getpromotionremarksdetails || []).find((r: any) => (r.amsT_Id || r.AMST_Id) === studentId);

                    const uniqueSkills = Array.from(new Set(studentSkills.map((s: any) => s.ECS_SkillName || s.ecS_SkillName)));
                    const uniqueActivities = Array.from(new Set(studentActivities.map((a: any) => a.ECACTA_SkillArea || a.ecsA_SkillArea)));

                    // Specific "Skill Subject" table data (Theory, Practical, Total, Grade)
                    // In the legacy code, this uses the same getstudentdetails but filtered differently
                    const skillSubjects = Array.from(new Set((getstudentdetails || [])
                        .filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId && s.ismS_Id)
                        .map((s: any) => s.ismS_Id || s.ISMS_Id)));

                    return (
                        <div key={`report-${studentId}-${idx}`} className="pagelayout">
                            {/* Logo */}
                            <div className="flex justify-center mb-4">
                                <img
                                    src={institution.mI_Logo || institution.mI_Logo_Path || "/images/NDSLogoexam.jpg"}
                                    className="header-logo"
                                    alt="School Logo"
                                />
                            </div>

                            {/* Info */}
                            <div className="space-y-1 mb-4 text-xs">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <span className="font-bold">Class/Section/Roll No. : </span>
                                        <span className="border-bottom">
                                            {(student.className || student.classname || student.asmcL_ClassName || '')} / {(student.sectionName || student.sectionname || student.asmC_SectionName || '')} / {(student.rollNo || student.rollno || student.amaY_RollNo || '')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <span className="font-bold">Student's Name : </span>
                                        <span className="border-bottom uppercase">{student.studentName || student.studentname || student.amsT_FirstName || ''}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <span className="font-bold">Father's/Mother's/Guardian's Name : </span>
                                        <span className="border-bottom uppercase">{student.fathername || student.amsT_FatherName || student.amsT_FatherName || ''}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <span className="font-bold">Date Of Birth : </span>
                                        <span className="border-bottom">{student.dob || student.amsT_DOB || ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scholastic Areas Table */}
                            <table className="table-bordered mb-4">
                                <thead>
                                    <tr>
                                        <td className="text-left Ndsreport1 font-bold">Scholastic Areas(A)</td>
                                        <td className="Ndsreport1 font-bold" colSpan={processedGroupDetails.length}>Academic Year(100 Marks)</td>
                                    </tr>
                                    <tr className="Ndsreport">
                                        <th className="text-center">Subject Name</th>
                                        {processedGroupDetails.map((grp: any, gidx: number) => (
                                            <th key={`grp-${gidx}`}>
                                                {grp.empG_DistplayName} <br />
                                                {grp.empG_DistplayName !== 'Grade' && grp.empsG_MarksValue ? `(${grp.empsG_MarksValue})` : ''}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentSubjects.map((subj: any, sidx: number) => {
                                        const subjectId = subj.ismS_Id || subj.ISMS_Id;
                                        const subjName = subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName;
                                        return (
                                            <tr key={`subj-${sidx}`}>
                                                <td className={`text-left font-bold ${subj.empS_AppToResultFlg ? 'Ndsreport' : ''}`}>
                                                    {subjName}
                                                </td>
                                                {processedGroupDetails.map((grpexam: any, geidx: number) => {
                                                    // For "Marks Obtained" and "Grade" columns, use data from the subject list directly
                                                    if (grpexam.empG_DistplayName === 'Marks Obtained') {
                                                        return <td key={`mark-${geidx}`}><b>{subj.subjectObtainedMarks ?? ''}</b></td>;
                                                    }
                                                    if (grpexam.empG_DistplayName === 'Grade') {
                                                        return <td key={`mark-${geidx}`}><b>{subj.subjectGrade ?? ''}</b></td>;
                                                    }

                                                    // For regular exams, look into studentMarks
                                                    const mark = studentMarks.find((m: any) => 
                                                        ((m.ismS_Id || m.ISMS_Id) === subjectId || (m.ismS_SubjectName || m.ISMS_SubjectName) === subjName) && 
                                                        (m.empsG_DisplayName || m.EMPSG_DisplayName || m.empG_DistplayName || m.EMPG_DistplayName) === grpexam.empG_DistplayName
                                                    );
                                                    
                                                    const obtainedMarks = mark ? (mark.obtainedMarks ?? mark.ObtainedMarks) : '';
                                                    const passFailFlag = mark ? (mark.passFailFlag || mark.PassFailFlag) : '';

                                                    return (
                                                        <td key={`mark-${geidx}`}>
                                                            {mark ? (
                                                                ['AB', 'M', 'L'].includes(passFailFlag) ? (
                                                                    <b>{passFailFlag} {obtainedMarks > 0 ? `(${obtainedMarks})` : ''}</b>
                                                                ) : (
                                                                    <b>{obtainedMarks}</b>
                                                                )
                                                            ) : ''}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Skill Subject Table (Theory/Practical) */}
                            <table className="table-bordered mb-4">
                                <thead>
                                    <tr className="Ndsreport1">
                                        <th>Skill Subject</th>
                                        <th>Theory</th>
                                        <th>Practical</th>
                                        <th>Total</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skillSubjects.map((sId: any) => {
                                        const subDetails = (getstudentdetails || []).filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId && (s.ismS_Id || s.ISMS_Id) === sId);
                                        const theory = subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'THEORY')?.estmpssS_ObtainedMarks ?? subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'THEORY')?.ESTMPSSS_ObtainedMarks ?? '';
                                        const practical = subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'PRACTICAL 1')?.estmpssS_ObtainedMarks ?? subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'PRACTICAL 1')?.ESTMPSSS_ObtainedMarks ?? '';
                                        const total = subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'Total')?.estmpssS_ObtainedMarks ?? subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'Total')?.ESTMPSSS_ObtainedMarks ?? '';
                                        const grade = subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'Grade')?.estmpssS_ObtainedGrade ?? subDetails.find((s: any) => (s.emsE_SubExamName || s.EMSE_SubExamName) === 'Grade')?.ESTMPSSS_ObtainedGrade ?? '';
                                        const subjectName = subDetails[0]?.ismS_SubjectName || subDetails[0]?.ISMS_SubjectName || '';

                                        if (!subjectName) return null;

                                        return (
                                            <tr key={`skill-sub-${sId}`}>
                                                <td className="text-left Ndsreport font-bold">{subjectName}</td>
                                                <td><b>{theory}</b></td>
                                                <td><b>{practical}</b></td>
                                                <td><b>{total}</b></td>
                                                <td><b>{grade}</b></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Co-Scholastic Table */}
                            <table className="table-bordered mb-4">
                                <thead>
                                    <tr>
                                        <th colSpan={gettermdetails.length + 1} className="Ndsreport1">Co-Scholastic Areas : on 5- Point(A-C) grading scale</th>
                                    </tr>
                                    <tr className="Ndsreport">
                                        <th className="width-40"></th>
                                        {gettermdetails.map((term: any) => (
                                            <th key={`term-${term.ecT_Id}`}>{term.ecT_TermName}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {uniqueSkills.map((skillName: any, sidx: number) => (
                                        <tr key={`skill-${sidx}`}>
                                            <td className="text-left Ndsreport font-bold">{skillName}</td>
                                            {gettermdetails.map((term: any) => {
                                                const skill = studentSkills.find((s: any) => (s.ECS_SkillName || s.ecS_SkillName) === skillName && (s.ECT_Id || s.ecT_Id) === term.ecT_Id);
                                                return <td key={`term-val-${term.ecT_Id}`}><b>{skill?.EMGD_Name || skill?.emgD_Name || ''}</b></td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Discipline Table */}
                            <table className="table-bordered mb-4">
                                <thead>
                                    <tr>
                                        <th colSpan={gettermdetails.length + 1} className="Ndsreport1">Discipline : on 5- Point(A-C) grading scale</th>
                                    </tr>
                                    <tr className="Ndsreport">
                                        <th className="width-40"></th>
                                        {gettermdetails.map((term: any) => (
                                            <th key={`term-d-${term.ecT_Id}`}>{term.ecT_TermName}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {uniqueActivities.map((activityName: any, aidx: number) => (
                                        <tr key={`act-${aidx}`}>
                                            <td className="text-left Ndsreport font-bold">{activityName}</td>
                                            {gettermdetails.map((term: any) => {
                                                const activity = studentActivities.find((a: any) => (a.ECACTA_SkillArea || a.ecsA_SkillArea) === activityName && (a.ECT_Id || a.ecT_Id) === term.ecT_Id);
                                                return <td key={`term-val-d-${term.ecT_Id}`}><b>{activity?.EMGD_Name || activity?.emgD_Name || ''}</b></td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Remarks and Promotion */}
                            <div className="space-y-2 mt-4 text-xs">
                                <div>
                                    <span className="font-bold">Promoted To Class : </span>
                                    <span className="border-bottom">{studentRemarks?.eprD_ClassPromoted || studentRemarks?.EPRD_ClassPromoted || ''}</span>
                                </div>
                                <div>
                                    <span className="font-bold">Class Teacher's Remarks : </span>
                                    <span className="border-bottom">{studentRemarks?.eprD_Remarks || studentRemarks?.EPRD_Remarks || ''}</span>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-4 gap-4 text-center mt-12 text-[10px]">
                                <div className="text-left space-y-1">
                                    <div className="font-bold">Place : {student.city || institution.ivrmmcT_Name || 'Vasai'}</div>
                                    <div className="font-bold">Date : {params.generatedDate ? format(params.generatedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</div>
                                </div>
                                <div className="flex flex-col justify-end h-16">
                                    <div className="font-bold uppercase mb-2">{(data.clstchname?.[0]?.hrmE_EmployeeFirstName || '')}</div>
                                    <div className="border-t border-black pt-1 font-bold uppercase">Signature of Class Teacher</div>
                                </div>
                                <div className="flex flex-col justify-end h-16">
                                    <div className="border-t border-black pt-1 font-bold uppercase">Signature of Principal</div>
                                </div>
                                <div className="flex flex-col justify-end h-16">
                                    <div className="border-t border-black pt-1 font-bold uppercase">Signature of Parents</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

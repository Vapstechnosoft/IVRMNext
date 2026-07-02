import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportItoIXViewProps {
    data: any;
    dateInfo: any;
    institution: IMasterInstitution | Institution | null;
}

const CalcuttaPromotionReportItoIXView = ({ data, dateInfo, institution }: CalcuttaPromotionReportItoIXViewProps) => {
    const handleExport = () => { };
    const handlePrint = () => {
        window.print();
    };

    if (!data || !data.studentdetails || data.studentdetails.length === 0) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm'>
                <p className='font-medium text-gray-500 text-lg'>No data available. Please generate the report.</p>
            </div>
        );
    }

    const { getgroupdetails, groupwiseexamlist, studentdetails, examwiseremarkstemp, skilllist_temp, activitylist_temp, gettermdetails } = data;

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
                    .page-break {
                        page-break-after: always;
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

            <div id='printable-area' className='printable-content'>
                {studentdetails.map((student: any, index: number) => {
                    const semesterRemarks = examwiseremarkstemp?.find((r: any) => r.amsT_Id === student.amsT_Id || r.AMST_Id === student.amsT_Id);

                    return (
                        <div key={student.amsT_Id || index} className={`mx-auto max-w-[1000px] bg-white p-4 font-sans text-black ${index < studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>

                            {/* Academic Session Badge */}
                            <div className='mb-2 flex justify-center mt-12'>
                                <div className='border border-black bg-white px-8 py-1'>
                                    <h2 className='font-bold text-[20px] tracking-wider uppercase'>ACADEMIC SESSION {student.asmaY_Year}</h2>
                                </div>
                            </div>

                            {/* Student Info Box */}
                            <div className='mb-2 flex border-[0.5px] border-black p-1'>
                                <div className='flex-1 pr-2'>
                                    <div className='grid grid-cols-[120px_10px_1fr] gap-y-1 font-bold text-[14px] mt-2'>
                                        <div>Student's Name</div><div>:</div><div className='uppercase'>{student.amsT_FirstName || student.studentname}</div>
                                        <div>Scholar No.</div><div>:</div><div>{student.amsT_AdmNo || student.admno}</div>
                                        <div>Total Students</div><div>:</div><div>{studentdetails.length}</div>
                                    </div>
                                </div>
                                <div className='flex-1 px-2'>
                                    <div className='grid grid-cols-[100px_10px_1fr] gap-y-1 font-bold text-[14px] mt-2'>
                                        <div>Class & sec</div><div>:</div><div className='uppercase'>{student.asmcL_ClassName} - {student.asmC_SectionName}</div>
                                        <div>Roll No</div><div>:</div><div>{student.amaY_RollNo || student.rollno || 1}</div>
                                    </div>
                                </div>
                                <div className='flex h-[100px] w-[100px] items-center justify-center mr-1 mt-2'>
                                    {student.amsT_Photoname ? (
                                        <img src={student.amsT_Photoname} alt="Student" className="h-full w-full object-contain" />
                                    ) : (
                                        <div className='border border-black w-full h-full flex items-center justify-center text-gray-400 text-xs'>Photo</div>
                                    )}
                                </div>
                            </div>

                            {/* Main Subject Table */}
                            <div className='pt-2'>
                                <table className='mb-2 w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className='border-black border-[0.5px] p-2 text-center align-middle font-bold w-[300px] break-words'>SUBJECTS</th>
                                            {getgroupdetails?.map((grp: any, idx: number) => (
                                                <th key={idx} colSpan={grp.groupewiseexam?.length || 1} className='border-black border-[0.5px] bg-gray-400 p-2 text-center uppercase'>
                                                    {grp.empG_DistplayName}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                <th key={idx} className='border-black border-[0.5px] p-2 text-center break-words font-bold w-[150px]'>
                                                    {exam.examnamedisplay}
                                                    {exam.EMPSGE_ForMaxMarkrs && exam.examnamedisplay !== 'Highest in Class' ? <><br />[{exam.EMPSGE_ForMaxMarkrs}]</> : ''}
                                                    {!exam.EMPSGE_ForMaxMarkrs && exam.EME_Id === 9800000 && exam.examnamedisplay === 'Total' ? <><br />[200]</> : ''}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Applicable Subjects */}
                                        {student.studentsubjects?.filter((s: any) => s.EYCES_MarksDisplayFlg || s.eyceS_MarksDisplayFlg).map((subj: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className='border-black border-[0.5px] p-2 text-left break-words font-bold'>{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                    const marks = student.studentmarks?.filter((mrks: any) => {
                                                        const mSubjId = mrks.ISMS_Id || mrks.ismS_Id;
                                                        const sSubjId = subj.ISMS_Id || subj.ismS_Id;
                                                        const mEmeId = mrks.EME_Id || mrks.emE_Id;
                                                        const gEmeId = exam.EME_Id || exam.emE_Id;

                                                        // Robust group matching (casing and key variants)
                                                        const mGrp = (mrks.EMPG_GroupName || mrks.empG_GroupName || mrks.EMPSG_DisplayName || mrks.empsG_DisplayName || '')?.trim().toUpperCase();
                                                        const gGrp = (exam.EMPG_GroupName || exam.empG_GroupName || exam.EMPG_DistplayName || exam.empG_DistplayName || '')?.trim().toUpperCase();

                                                        const subjMatch = mSubjId && sSubjId && Number(mSubjId) === Number(sSubjId);
                                                        const grpMatch = !mGrp || !gGrp || mGrp === gGrp;

                                                        if (exam.EME_ExamName === 'Highest in Class') {
                                                            return subjMatch && grpMatch && (Number(mEmeId) === 9800000 || Number(mEmeId) === Number(gEmeId));
                                                        }

                                                        return subjMatch && grpMatch && Number(mEmeId) === Number(gEmeId);
                                                    });

                                                    let cellValue: any = '-';

                                                    if (marks && marks.length > 0) {
                                                        const isHighestExam = exam.EME_ExamName === 'Highest in Class';

                                                        if (isHighestExam) {
                                                            const highestEntry = marks.find((m: any) => m.ESTMPPS_ClassHighest !== undefined && m.ESTMPPS_ClassHighest !== null && m.ESTMPPS_ClassHighest !== '' && m.ESTMPPS_ClassHighest !== 0)
                                                                 || marks.find((m: any) => m.estmppS_ClassHighest !== undefined && m.estmppS_ClassHighest !== null && m.estmppS_ClassHighest !== '' && m.estmppS_ClassHighest !== 0)
                                                                 || marks.find((m: any) => Number(m.EME_Id || m.emE_Id) === 98000012)
                                                                 || marks[0];
                                                            cellValue = highestEntry?.ESTMPPS_ClassHighest ?? highestEntry?.estmppS_ClassHighest ?? highestEntry?.ESTMPPS_MaxHighest ?? '';
                                                        } else {
                                                            const mr = marks[0];
                                                            const passFail = mr.PassFailFlag || mr.passFailFlag;
                                                            const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                            if (isAbsent) {
                                                                cellValue = passFail;
                                                            } else {
                                                                cellValue = mr.ObtainedMarks !== undefined ? mr.ObtainedMarks : mr.obtainedMarks;
                                                                if (cellValue === undefined || cellValue === null) {
                                                                    cellValue = mr.GroupMarks || mr.ObtainedGrade || mr.obtainedGrade || '-';
                                                                }
                                                            }
                                                        }
                                                    } else if (exam.EME_Id === 9800000) {
                                                        cellValue = subj.ESTMPPSG_GroupObtMarks ?? subj.estmppsG_GroupObtMarks ?? '-';
                                                    }

                                                    return (
                                                        <td key={eIdx} className='border-black border-[0.5px] p-2 text-center'>{cellValue}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                        {/* TOTAL row */}
                                        <tr>
                                            <td className='border-black border-[0.5px] p-2 text-left uppercase font-bold'>TOTAL</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let totalValue: any = '';
                                                const mr = student.student_marks?.find((m: any) =>
                                                    (Number(m.EME_Id ?? m.emE_Id) === Number(exam.EME_Id)) &&
                                                    ((m.EMPSG_DisplayName ?? m.empsG_DisplayName) === exam.EMPG_DistplayName)
                                                );
                                                if (mr) {
                                                    totalValue = `${mr.ObtainedMarks ?? mr.obtainedMarks ?? mr.ESTMPS_ObtainedMarks ?? ''} / ${mr.maxmarks ?? mr.maxMarks ?? mr.EMPS_MaxMarks ?? ''}`;
                                                }
                                                return <td key={eIdx} className='border-black border-[0.5px] p-2 text-center font-bold'>{totalValue}</td>;
                                            })}
                                        </tr>

                                        {/* Percentage row */}
                                        <tr>
                                            <td className='border-black border-[0.5px] p-2 text-left uppercase font-bold'>PERCENTAGE</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let percValue: any = '';
                                                const mr = student.student_marks?.find((m: any) =>
                                                    (Number(m.EME_Id ?? m.emE_Id) === Number(exam.EME_Id)) &&
                                                    ((m.EMPSG_DisplayName ?? m.empsG_DisplayName) === exam.EMPG_DistplayName)
                                                );
                                                if (mr) {
                                                    const p = mr.TotalPercentage ?? mr.totalPercentage ?? mr.ESTMPS_Percentage ?? mr.estmpS_Percentage;
                                                    percValue = p !== undefined && p !== null ? `${Math.round(Number(p))}%` : '';
                                                }
                                                return <td key={eIdx} className='border-black border-[0.5px] p-2 text-center font-bold'>{percValue}</td>;
                                            })}
                                        </tr>

                                        {/* Attendance row */}
                                        <tr>
                                            <td className='border-black border-[0.5px] p-2 text-left font-bold'>Attendance</td>
                                            {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                const att = student.attendance?.find((a: any) => a.term === grp.empG_DistplayName);
                                                return (
                                                    <td key={gIdx} colSpan={grp.groupewiseexam?.length || 1} className='border-black border-[0.5px] p-2 text-center'>
                                                        {att?.percentage ? `${att.percentage} %` : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>

                                    {/* Non-Applicable Subjects (Grades mostly) */}
                                    <tbody>
                                        {student.studentsubjects?.filter((s: any) => !s.EYCES_MarksDisplayFlg && !s.eyceS_MarksDisplayFlg).map((subj: any, idx: number) => (
                                            <tr key={`non-app-${idx}`}>
                                                <td className='border-black border-[0.5px] p-2 text-left break-words font-bold'>{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                    let cellValue: any = '';
                                                    const mr = student.studentmarks?.find((m: any) => m.EME_Id === exam.EME_Id && (m.ISMS_Id === subj.ISMS_Id || m.ismS_Id === subj.ismS_Id) && m.EMPSG_DisplayName === exam.EMPG_DistplayName);
                                                    if (mr) {
                                                        if (mr.ESTMPS_PassFailFlg !== 'AB' && mr.ESTMPS_PassFailFlg !== 'M' && mr.ESTMPS_PassFailFlg !== 'L' && mr.PassFailFlag !== 'AB' && mr.PassFailFlag !== 'M' && mr.PassFailFlag !== 'L') {
                                                            if (exam.EME_ExamName === 'Grade') {
                                                                cellValue = mr.ObtainedGrade || mr.ESTMPS_ObtainedGrade || '';
                                                            } else {
                                                                cellValue = mr.ObtainedMarks || mr.ESTMPS_ObtainedMarks || mr.ObtainedGrade || mr.ESTMPS_ObtainedGrade || '';
                                                            }
                                                        } else {
                                                            cellValue = mr.ESTMPS_PassFailFlg || mr.PassFailFlag;
                                                        }
                                                    }
                                                    return (
                                                        <td key={eIdx} className='border-black border-[0.5px] p-2 text-center'>{cellValue}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='bg-gray-400 text-black p-2 text-center font-bold uppercase'>
                                                SEMESTER-II
                                            </th>
                                        </tr>
                                        <tr>
                                            <td className='p-2 text-left font-bold border-black border-[0.5px] min-h-[40px]'>
                                                {semesterRemarks?.ECTERE_Remarks || semesterRemarks?.ecterE_Remarks || ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className='pt-2 pb-2'>
                                    <h5 className='font-bold text-[16px]'>Conduct : <span className='font-normal'>{semesterRemarks?.ECTERE_Conduct || semesterRemarks?.ecterE_Conduct || ''}</span></h5>
                                </div>
                            </div>

                            {/* Skills Section (Co-Scholastic) */}
                            {skilllist_temp && skilllist_temp.length > 0 && (
                                <div className="flex flex-wrap pt-2 pb-4 gap-y-4 gap-x-2">
                                    {skilllist_temp.map((skill: any, skIdx: number) => {
                                        const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                        const skillName = skill.ECS_SkillName ?? skill.ecS_SkillName;
                                        
                                        return (
                                            <div key={skIdx} className="w-full sm:w-[48%] flex-grow p-1">
                                                <table className="w-full border-collapse border-[0.5px] border-black text-[14px]">
                                                    <tbody>
                                                        <tr className="border-[0.5px] border-black">
                                                            <td className="border-black border-[0.5px] p-2 font-bold bg-gray-400 uppercase">{skillName}</td>
                                                            {gettermdetails?.map((cos: any, cIdx: number) => {
                                                                const termName = cos.ecT_TermName ?? cos.ECT_TermName ?? cos.termName ?? '';
                                                                return (
                                                                    <td key={cIdx} className="border-black border-[0.5px] bg-gray-400 p-2 text-center uppercase font-bold w-[120px]">{termName}</td>
                                                                );
                                                            })}
                                                        </tr>
                                                        {activitylist_temp?.filter((ax: any) => (ax.ECS_Id ?? ax.ecS_Id) === skillId).map((skillx: any, axIdx: number) => {
                                                            const skillAreaId = skillx.ECSA_Id ?? skillx.ecsA_Id;
                                                            const skillAreaName = skillx.ECSA_SkillArea ?? skillx.ecsA_SkillArea;
                                                            
                                                            return (
                                                                <tr key={axIdx} className="border-[0.5px] border-black">
                                                                    <td className="border-black border-[0.5px] p-2 font-semibold">{skillAreaName}</td>
                                                                    {gettermdetails?.map((cosx: any, cIdx: number) => {
                                                                        const termId = cosx.ecT_Id ?? cosx.ECT_Id;
                                                                        const matchingSkills = student.studentSkills?.filter((gradex: any) => {
                                                                            const gTermId = gradex.ECT_Id ?? gradex.ecT_Id;
                                                                            const gAreaId = gradex.ECSA_Id ?? gradex.ecsA_Id;
                                                                            return Number(gTermId) === Number(termId) && Number(gAreaId) === Number(skillAreaId);
                                                                        });
                                                                        
                                                                        return (
                                                                            <td key={cIdx} className="border-black border-[0.5px] p-2 text-center font-bold">
                                                                                {matchingSkills?.map((gradex: any, gxIdx: number) => {
                                                                                    const gradeName = gradex.EMGD_Name ?? gradex.emgD_Name ?? '';
                                                                                    return <span key={gxIdx}>{gradeName}</span>;
                                                                                })}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Graph Analysis Box */}
                            <div className='pt-2'>
                                <table className='mb-8 w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th colSpan={3} className='bg-gray-400 p-2 text-center uppercase font-bold text-black'>
                                                GRAPHICAL ANALYSIS
                                            </th>
                                        </tr>
                                        <tr className='border-[0.5px] border-black'>
                                            <td colSpan={3} className='p-2'>
                                                <div className='mx-auto h-[250px] w-[98%]'>
                                                    <ResponsiveContainer width='100%' height='100%'>
                                                        <BarChart data={student.chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                            <XAxis dataKey='subject' tick={{ fontSize: 10 }} tickLine={false} axisLine={true} interval={0} angle={-25} textAnchor="end" />
                                                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                            <Bar dataKey='highest' fill='#3f51b5' barSize={20} />
                                                            <Bar dataKey='average' fill='#ff5722' barSize={20} />
                                                            <Bar dataKey='obtained' fill='#00ff00' barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className='border-[0.5px] border-black'>
                                            <td className='p-2 text-center font-bold'><span className='mr-2 inline-block h-3 w-3 bg-[#3f51b5]'></span> Highest Marks</td>
                                            <td className='p-2 text-center font-bold'><span className='mr-2 inline-block h-3 w-3 bg-[#ff5722]'></span> Average Marks</td>
                                            <td className='p-2 text-center font-bold'><span className='mr-2 inline-block h-3 w-3 bg-[#00ff00]'></span> Obtained Marks</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Promotion Status Box */}
                            {student.remarks && (
                                <div className='pt-2'>
                                    <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                        <tbody>
                                            <tr className='border-[0.5px] border-black'>
                                                <th className='bg-gray-400 text-black p-2 text-center font-bold uppercase'>
                                                    PROMOTION STATUS
                                                </th>
                                            </tr>
                                            <tr>
                                                <td className='p-2 text-left font-bold border-black border-[0.5px] min-h-[40px]'>
                                                    {student.remarks}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Signatures Box */}
                            <div className='mt-16'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-center text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='p-2 w-1/3 font-bold border-black border-[0.5px]'>Principal's Signature</th>
                                            <th className='p-2 w-1/3 font-bold border-black border-[0.5px]'>Class Teacher's Signature</th>
                                            <th className='p-2 w-1/3 font-bold border-black border-[0.5px]'>Parent's Signature</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Issue Dates Box */}
                            <div className='pt-8 text-right'>
                                <span className='font-bold text-[16px]'>Date of issue : &emsp;{dateInfo?.issueDate ? new Date(dateInfo.issueDate).toLocaleDateString('en-GB') : ''}</span>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportItoIXView;

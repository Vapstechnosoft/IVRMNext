import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    institution: IMasterInstitution | Institution | null;
}

const CalcuttaPromotionReportView = ({ data, institution }: CalcuttaPromotionReportViewProps) => {
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

    const { getgroupdetails, groupwiseexamlist, studentdetails, skilllist_temp } = data;
    const EMPG_GroupName = data.EMPG_GroupName || data.empG_GroupName;

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
                    const dob = student.amsT_DOB ? new Date(student.amsT_DOB).toLocaleDateString('en-GB') : '';

                    return (
                        <div key={student.amsT_Id || index} className={`mx-auto max-w-[1000px] bg-white p-4 font-sans text-black ${index < studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>

                            {/* Academic Session Badge */}
                            <div className='mb-2 flex justify-center'>
                                <div className='border-2 border-black bg-white px-8 py-1'>
                                    <h2 className='font-bold text-[16px] tracking-wider uppercase'>ACADEMIC SESSION {student.asmaY_Year}</h2>
                                </div>
                            </div>

                            {/* Student Info Box */}
                            <div className='mb-2 flex border-[1.5px] border-black p-1'>
                                <div className='flex-1 pr-2'>
                                    <div className='grid grid-cols-[120px_10px_1fr] gap-y-1 font-bold text-[13px]'>
                                        <div>Student's Name</div><div>:</div><div className='uppercase'>{student.amsT_FirstName || student.studentname}</div>
                                        <div>Scholar No.</div><div>:</div><div>{student.amsT_AdmNo || student.admno}</div>
                                        <div>Total Students</div><div>:</div><div>{studentdetails.length}</div>
                                    </div>
                                </div>
                                <div className='flex-1 px-2'>
                                    <div className='grid grid-cols-[100px_10px_1fr] gap-y-1 font-bold text-[13px]'>
                                        <div>Class & sec</div><div>:</div><div className='uppercase'>{student.asmcL_ClassName} - {student.asmC_SectionName}</div>
                                        <div>Roll No</div><div>:</div><div>{student.amaY_RollNo || student.rollno || 1}</div>
                                    </div>
                                </div>
                                <div className='flex h-[80px] w-[80px] items-center justify-center border border-black ml-auto mr-1'>
                                    {student.amsT_Photoname || student.student_photo ? (
                                        <img src={student.amsT_Photoname || student.student_photo} alt="Student" className="h-full w-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Photo</span>
                                    )}
                                </div>
                            </div>

                            {/* Main Split Table */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black text-[12px]'>
                                <tbody>
                                    <tr>
                                        {/* Left section: Subjects */}
                                        <td className='w-[60%] border-black border-r p-0 align-top'>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr>
                                                        <th rowSpan={2} className='border-black border-b border-r p-1 text-left'>SUBJECTS</th>
                                                        {getgroupdetails?.map((grp: any, idx: number) => (
                                                            <th key={idx} colSpan={grp.groupewiseexam?.length || 1} className='border-black border-b bg-gray-500 text-white p-1 text-center uppercase font-bold text-[12px]'>
                                                                {EMPG_GroupName || grp.empG_DistplayName}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                            <th key={idx} className='border-black border-b border-l p-1 text-center leading-tight whitespace-pre-wrap'>
                                                                {exam.examnamedisplay}
                                                                {exam.EMPSGE_ForMaxMarkrs ? `\n[${exam.EMPSGE_ForMaxMarkrs}]` : ''}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {student.studentsubjects?.filter((s: any) => s.EYCES_MarksDisplayFlg || s.eyceS_MarksDisplayFlg).map((subj: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td className='border-black border-b border-r p-1 text-left'>{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                                let cellValue: any = '';

                                                                if (exam.EME_Id === 9800000) {
                                                                    const mr1 = student.studentmarks?.find((t: any) => t.emE_Id === 9800000 && (t.ISMS_Id === subj.ISMS_Id || t.ismS_Id === subj.ismS_Id));
                                                                    if (mr1) {
                                                                        cellValue = mr1.obtainedMarks || mr1.ObtainedMarks || mr1.estmpS_ObtainedMarks;
                                                                    } else {
                                                                        cellValue = subj.estmppsG_GroupObtMarks || '';
                                                                    }
                                                                } else if (exam.EME_Id === 98000012) {
                                                                    const mr1 = student.studentmarks?.find((t: any) => t.emE_Id === 98000012 && (t.ISMS_Id === subj.ISMS_Id || t.ismS_Id === subj.ismS_Id));
                                                                    if (mr1) {
                                                                        cellValue = mr1.estmppS_ClassHighest || mr1.ESTMPPS_ClassHighest || mr1.obtainedMarks;
                                                                    }
                                                                } else {
                                                                    const mr = student.studentmarks?.find((m: any) => m.emE_Id === exam.EME_Id && (m.ismS_Id === subj.ismS_Id));
                                                                    if (mr) {
                                                                        if (mr.passFailFlag !== 'AB' && mr.passFailFlag !== 'M') {
                                                                            cellValue = mr.obtainedMarks || mr.ObtainedMarks;
                                                                        } else {
                                                                            cellValue = mr.passFailFlag;
                                                                        }
                                                                    }
                                                                }

                                                                return (
                                                                    <td key={eIdx} className='border-black border-b border-l p-1 text-center font-semibold'>{cellValue}</td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}

                                                    {/* TOTAL row */}
                                                    <tr>
                                                        <td className='border-black border-b border-r p-1 text-left uppercase'>TOTAL</td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            let totalValue: any = '';
                                                            if (exam.EME_Id === 9800000) {
                                                                const mr = student.studentmarks?.find((m: any) => m.emE_Id === exam.EME_Id && m.ismS_SubjectName === 'GRAND TOTAL');
                                                                if (mr) totalValue = `${mr.obtainedMarks || mr.ESTMPS_ObtainedMarks} / ${mr.maxMarks || mr.maxmarks}`;
                                                            }
                                                            return <td key={eIdx} className='border-black border-b border-l p-1 text-center font-bold'>{totalValue}</td>;
                                                        })}
                                                    </tr>

                                                    {/* Percentage row */}
                                                    <tr>
                                                        <td className='border-black border-b border-r p-1 text-left uppercase'>Percentage</td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            let percValue: any = '';
                                                            if (exam.EME_Id === 9800000) {
                                                                const mr = student.studentmarks?.find((m: any) => m.emE_Id === exam.EME_Id && m.ismS_SubjectName === 'GRAND TOTAL');
                                                                if (mr && mr.totalPercentage) percValue = `${mr.totalPercentage.toFixed(2)}%`;
                                                            }
                                                            return <td key={eIdx} className='border-black border-b border-l p-1 text-center font-bold'>{percValue}</td>;
                                                        })}
                                                    </tr>

                                                    {/* Attendance row */}
                                                    <tr>
                                                        <td className='border-black border-r p-1 text-left uppercase'>Attendance</td>
                                                        {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                            const att = student.attendance?.find((a: any) => a.term === EMPG_GroupName || a.term === grp.empG_DistplayName);
                                                            const attText = att?.percentage ? `${att.percentage}%` : (student.attendancepercentage ? `${student.attendancepercentage}%` : '');
                                                            return (
                                                                <td key={gIdx} colSpan={grp.groupewiseexam?.length || 1} className='border-black border-l p-1 text-center font-bold'>
                                                                    {attText}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>

                                        {/* Right section: Skills */}
                                        <td className='w-[40%] p-0 align-top'>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr>
                                                        <th className='border-black border-b border-r p-1'>&nbsp;</th>
                                                        <th className='w-20 border-black border-b bg-gray-500 text-white p-1 text-center uppercase font-bold text-[12px]'>
                                                            {EMPG_GroupName || 'SEMESTER 1'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const selectedTerm = EMPG_GroupName ? EMPG_GroupName.trim().toUpperCase() : '';
                                                        const termToFilter = selectedTerm || 'SEMESTER 1';

                                                        // Filter student skills for the selected term
                                                        const termFilteredSkills = student.studentSkills?.filter((s: any) => {
                                                            const termName = (s.ecT_TermName || s.ECT_TermName)?.trim().toUpperCase();
                                                            return termName === termToFilter;
                                                        }) || [];

                                                        // Get unique active skill IDs/Names that are actually present for this term
                                                        const activeSkillIds = new Set(termFilteredSkills.map((s: any) => s.ECS_Id ?? s.ecS_Id));
                                                        console.log('skilllist_temp', skilllist_temp);
                                                        // Filter skill list headings
                                                        const filteredSkillHeadings = skilllist_temp?.filter((skill: any) => {
                                                            const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                                            return activeSkillIds.has(skillId);
                                                        }) || [];

                                                        return filteredSkillHeadings.map((skill: any) => {
                                                            const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                                            const skillName = skill.ecS_SkillName || skill.ECS_SkillName;

                                                            // Sub-skills for this specific heading
                                                            const subSkills = termFilteredSkills.filter((s: any) => (s.ECS_Id ?? s.ecS_Id) === skillId);

                                                            return (
                                                                <React.Fragment key={skillId}>
                                                                    <tr>
                                                                        <td colSpan={2} className='border-black border-b p-1 text-center font-bold uppercase text-[12px]'>
                                                                            {skillName}
                                                                        </td>
                                                                    </tr>
                                                                    {subSkills.map((sct: any, sIdx: number) => {
                                                                        const skillArea = sct.ecsA_SkillArea || sct.ECSA_SkillArea;
                                                                        const grade = sct.emgD_Name_F4 || sct.EMGD_Name_F4 || sct.emgD_Name || sct.EMGD_Name;
                                                                        return (
                                                                            <tr key={sIdx}>
                                                                                <td className='border-black border-b border-r p-1 font-semibold text-[11px]'>{skillArea}</td>
                                                                                <td className='border-black border-b p-1 text-center font-bold'>{grade}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </React.Fragment>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Suggestion Box */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black text-[12px] font-bold'>
                                <tbody>
                                    <tr>
                                        <td className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                            {EMPG_GroupName || 'SEMESTER 1'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 uppercase'>
                                            Suggestion : {student.suggestions?.length > 0 ? student.suggestions.join(', ') : ''}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Graph Analysis Box */}
                            <table className='mb-8 w-full border-collapse border-[1.5px] border-black text-[12px] font-bold'>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                            GRAPHICAL ANALYSIS
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className='border-black border-b p-2'>
                                            <div className='mx-auto h-[250px] w-[98%]'>
                                                <ResponsiveContainer width='100%' height='100%'>
                                                    <BarChart data={student.chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                        <XAxis dataKey='subject' tick={{ fontSize: 9 }} tickLine={false} axisLine={true} interval={0} angle={-15} textAnchor="end" />
                                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                        <Bar dataKey='highest' fill='#3f51b5' barSize={15} />
                                                        <Bar dataKey='average' fill='#ff5722' barSize={15} />
                                                        <Bar dataKey='obtained' fill='#00ff00' barSize={15} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-black border-r p-2 text-center'><span className='mr-2 inline-block h-3 w-3 bg-[#3f51b5]'></span> Highest Marks</td>
                                        <td className='border-black border-r p-2 text-center'><span className='mr-2 inline-block h-3 w-3 bg-[#ff5722]'></span> Average Marks</td>
                                        <td className='p-2 text-center'><span className='mr-2 inline-block h-3 w-3 bg-[#00ff00]'></span> Obtained Marks</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Signatures Box */}
                            <table className='w-full border-collapse border-[1.5px] border-black text-center text-[13px] font-bold'>
                                <tbody>
                                    <tr>
                                        <td className='border-black border-r p-2 w-1/3'>Principal's Signature</td>
                                        <td className='border-black border-r p-2 w-1/3'>Class Teacher's Signature</td>
                                        <td className='p-2 w-1/3'>Parent's Signature</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Issue Date */}
                            <div className='mt-2 font-bold text-[13px]'>
                                Date of issue : {new Date().toLocaleDateString('en-GB')}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;

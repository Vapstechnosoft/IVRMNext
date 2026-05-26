'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportListProps {
    data: any;
    academicYear: string;
    generatedDate?: Date;
}

export const ReportList = ({ data, academicYear, generatedDate }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // --- Data Processing (Optimized Binding) ---
    const studentDetails = useMemo(() => data.getstudentdetails || [], [data]);
    const studentWiseSubjects = useMemo(() => data.getstudentwisesubjectlist || [], [data]);
    const termDetails = useMemo(() => data.gettermdetails || [], [data]);
    const groupDetails = useMemo(() => data.getgroupdetails || [], [data]);
    const groupExamDetails = useMemo(() => data.getgroupexamdetails || [], [data]);
    const studentMarksDetails = useMemo(() => data.getstudentmarksdetails || data.savelist || [], [data]);
    const promotionRemarks = useMemo(() => data.getpromotionremarksdetails || [], [data]);
    const activityMainListArea = useMemo(() => data.getstudentwiseactiviteslist || [], [data]);

    const workAttendence = useMemo(() => data.work_attendence || [], [data]);
    const presentAttendence = useMemo(() => data.present_attendence || [], [data]);

    const institutionDetails = useMemo(() => data.getinstitution || [], [data]);
    const classTeacherName = useMemo(() => data.clstchname || [], [data]);

    // Build the dynamic columns for the scholastic table
    const groupWiseExamList = useMemo(() => {
        const list: any[] = [];
        if (groupDetails.length > 0) {
            groupDetails.forEach((group: any) => {
                const exams = groupExamDetails.filter(
                    (ge: any) => (ge.empG_DistplayName || ge.EMPG_DistplayName) === (group.empG_DistplayName || group.EMPG_DistplayName)
                );
                exams.forEach((exam: any) => {
                    list.push({
                        ...exam,
                        EMPG_GroupName: exam.empG_GroupName || exam.EMPG_GroupName,
                        EME_Id: exam.emE_Id || exam.EME_Id,
                        EME_ExamName: exam.emE_ExamName || exam.EME_ExamName,
                        EMPSGE_ForMaxMarkrs: exam.empsgE_ForMaxMarkrs || exam.EMPSGE_ForMaxMarkrs,
                        isTotal: false,
                        isGrade: false
                    });
                });
            });
        }
        // Add Total and Grade columns based on Angular Logic
        list.push({
            EME_Id: 9800000,
            EMPG_DistplayName: 'Total',
            EME_ExamName: 'Total',
            EME_Marks: 'Total',
            isTotal: true,
            isGrade: false
        });
        list.push({
            EME_Id: 9800001,
            EMPG_DistplayName: 'Grade',
            EME_ExamName: 'Grade',
            EME_Marks: 'Grade',
            isTotal: false,
            isGrade: true
        });
        return list;
    }, [groupDetails, groupExamDetails]);

    return (
        <div className='printable-content space-y-6'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area' style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        const studentID = report.amsT_Id || report.AMST_Id;

                        // Extract subjects for this student
                        const studentSubjects = studentWiseSubjects.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentID);
                        const studentMarks = studentMarksDetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentID);

                        // Co-Scholastic Activities grouped logic
                        const activityAreas = Array.from(
                            new Set(
                                activityMainListArea
                                    .filter((a: any) => (a.amsT_Id || a.AMST_Id) === studentID)
                                    .map((a: any) => a.ECACT_SkillName || a.ecacT_SkillName)
                            )
                        );

                        const activityDetails = activityMainListArea.filter((a: any) => (a.amsT_Id || a.AMST_Id) === studentID);

                        // Health details from report
                        const height = report.amsT_height || report.AMST_height;
                        const weight = report.amsT_Weight || report.AMST_Weight;
                        const bloodGroup = report.amsT_BloodGroup || report.AMST_BloodGroup;

                        // Attendance details
                        const workAtt = workAttendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === studentID) || {};
                        const presentAtt = presentAttendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === studentID) || {};

                        // Remarks
                        const remarkObj = promotionRemarks.find((r: any) => (r.amsT_Id || r.AMST_Id) === studentID);

                        // Graph data for Class Average vs Student Score
                        const graphSubjects = studentSubjects.filter(
                            (s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName
                        );
                        const graphLabels = graphSubjects.map((s: any) => s.ISMS_SubjectName || s.ismS_SubjectName || s.subjectName);
                        const graphScores = graphSubjects.map(
                            (s: any) => s.ESTMPPS_ObtainedMarks || s.estmppS_ObtainedMarks || s.subjectObtainedMarks || 0
                        );
                        const graphClassAverages = graphSubjects.map((s: any) => s.ESTMPPS_ClassAverage || s.estmppS_ClassAverage || 0);
                        const graphSectionAverages = graphSubjects.map(
                            (s: any) => s.ESTMPPS_SectionAverage || s.estmppS_SectionAverage || 0
                        );

                        return (
                            <div
                                key={index}
                                className='page-break-before-always mx-auto mb-8 w-full max-w-5xl border border-gray-300 bg-white p-6 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                <div className='mb-4 flex w-full justify-center'>
                                    <img
                                        src={
                                            institutionDetails.length > 0 && institutionDetails[0].mI_Logo
                                                ? institutionDetails[0].mI_Logo
                                                : 'https://vapsclg.blob.core.windows.net/files/3/InstitutionLogo/6ef102c1-0117-446e-93fa-9b6d9cad9fda.jpg'
                                        }
                                        alt='Report Header'
                                        className='w-full object-contain'
                                    />
                                </div>

                                <h3 className='mb-6 text-center font-bold text-xl uppercase'>ACHIEVEMENT RECORD {academicYear}</h3>

                                {/* Student Profile */}
                                <div className='relative mb-8 px-4'>
                                    <div className='flex w-3/4 flex-col space-y-2 text-sm'>
                                        {[
                                            { label: 'Name of the student', value: report.studentname || report.studentName },
                                            { label: 'Admission number', value: report.admno || report.admNo || report.admissionNo },
                                            {
                                                label: 'Class & Section',
                                                value: `${report.classname || report.className}   ${report.sectionname || report.sectionName}`
                                            },
                                            { label: 'Date of birth', value: report.dob },
                                            { label: "Mother's name", value: report.mothername || report.motherName },
                                            { label: "Father's name", value: report.fathername || report.fatherName }
                                        ].map((item, i) => (
                                            <div key={i} className='flex'>
                                                <div className='ml-[5%] w-48 font-bold'>{item.label}</div>
                                                <div className='w-4'>:</div>
                                                <div className='font-bold'>{item.value || ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='absolute top-[-20px] right-[10%]'>
                                        <div className='flex h-[150px] w-[150px] items-center justify-center overflow-hidden border border-black bg-gray-100'>
                                            {report.AMST_Photoname || report.amsT_Photoname ? (
                                                <img
                                                    src={report.AMST_Photoname || report.amsT_Photoname}
                                                    alt='Student Photo'
                                                    className='h-full w-full object-cover'
                                                />
                                            ) : (
                                                <span className='text-gray-500 text-xs'>Photo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Scholastic Section */}
                                <h3 className='mb-2 text-center font-bold text-xl uppercase'>SCHOLASTIC REPORT</h3>
                                <div className='px-4'>
                                    <table className='mb-6 w-full border-collapse border border-gray-400 text-sm'>
                                        <thead>
                                            <tr>
                                                <th className='w-48 border border-gray-400 bg-[#BABABA] p-2 text-left text-black'>
                                                    <b>&nbsp;</b>
                                                </th>
                                                {groupDetails.map((group: any, gi: number) => {
                                                    const examsInGroup = groupExamDetails.filter(
                                                        (ge: any) =>
                                                            (ge.empG_DistplayName || ge.EMPG_DistplayName) ===
                                                            (group.empG_DistplayName || group.EMPG_DistplayName)
                                                    );
                                                    return (
                                                        <th
                                                            key={gi}
                                                            colSpan={examsInGroup.length}
                                                            className='max-w-[150px] break-words border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black'>
                                                            <strong>{group.empG_GroupName || group.EMPG_GroupName}</strong>
                                                        </th>
                                                    );
                                                })}
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black' />
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center font-bold text-black' />
                                            </tr>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left font-bold text-black uppercase'>
                                                    SUBJECT
                                                </th>
                                                {groupWiseExamList.map((exam: any, i: number) => (
                                                    <th
                                                        key={i}
                                                        className='max-w-[150px] break-words border border-gray-400 bg-[#BABABA] p-2 text-center text-black'>
                                                        <strong>{exam.EME_ExamName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects
                                                .filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName)
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='break-words border border-gray-400 p-2 text-left'>
                                                            {subj.ISMS_SubjectName || subj.ismS_SubjectName || subj.subjectName}
                                                        </td>
                                                        {groupWiseExamList.map((exam: any, eIdx: number) => {
                                                            const mark = studentMarks.find(
                                                                (m: any) =>
                                                                    (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) &&
                                                                    (m.EME_Id || m.emE_Id) === exam.EME_Id
                                                            );

                                                            let displayValue = '';

                                                            if (exam.isTotal) {
                                                                const totalMarks = studentMarks
                                                                    .filter(
                                                                        (m: any) =>
                                                                            (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800000 &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800001
                                                                    )
                                                                    .reduce(
                                                                        (acc: number, curr: any) =>
                                                                            acc + (curr.ObtainedMarks || curr.obtainedMarks || 0),
                                                                        0
                                                                    );
                                                                displayValue = totalMarks > 0 ? totalMarks.toString() : '';
                                                            } else if (exam.isGrade) {
                                                                const totalMarks = studentMarks
                                                                    .filter(
                                                                        (m: any) =>
                                                                            (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800000 &&
                                                                            (m.EME_Id || m.emE_Id) !== 9800001
                                                                    )
                                                                    .reduce(
                                                                        (acc: number, curr: any) =>
                                                                            acc + (curr.ObtainedMarks || curr.obtainedMarks || 0),
                                                                        0
                                                                    );

                                                                if (totalMarks > 0) {
                                                                    if (totalMarks >= 91) displayValue = 'A1';
                                                                    else if (totalMarks >= 81) displayValue = 'A2';
                                                                    else if (totalMarks >= 71) displayValue = 'B1';
                                                                    else if (totalMarks >= 61) displayValue = 'B2';
                                                                    else if (totalMarks >= 51) displayValue = 'C1';
                                                                    else if (totalMarks >= 41) displayValue = 'C2';
                                                                    else if (totalMarks >= 33) displayValue = 'D';
                                                                    else displayValue = 'E';
                                                                }
                                                            } else if (mark) {
                                                                const pfFlag = mark.PassFailFlag || mark.passFailFlag;
                                                                if (pfFlag === 'AB' || pfFlag === 'M' || pfFlag === 'L') {
                                                                    displayValue = pfFlag;
                                                                } else {
                                                                    displayValue = mark.ObtainedMarks ?? mark.obtainedMarks ?? '';
                                                                }
                                                            }

                                                            return (
                                                                <td key={eIdx} className='border border-gray-400 p-2 text-center'>
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Grading Scale */}
                                <div className='mt-6 mb-6 px-4'>
                                    <h3 className='mb-2 text-left font-bold text-lg uppercase underline'>SCHOLASTIC GRADING SCALE</h3>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Grade</th>
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].map((g) => (
                                                    <th key={g} className='border border-gray-400 p-2 font-bold'>
                                                        {g}
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Mark</td>
                                                {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '33-40', '0-32'].map((m) => (
                                                    <td key={m} className='border border-gray-400 p-2'>
                                                        {m}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph 1 */}
                                <div className='mt-10 mb-10 flex w-full justify-center px-4'>
                                    <div className='flex w-3/4 flex-col items-center'>
                                        <h4 className='mb-4 text-center font-bold text-lg uppercase'>STUDENT PERFORMANCE INDEX</h4>
                                        <div className='flex h-[300px] w-full justify-center'>
                                            <Bar
                                                data={{
                                                    labels: graphLabels,
                                                    datasets: [
                                                        {
                                                            label: 'Class Average',
                                                            data: graphClassAverages,
                                                            backgroundColor: '#FF5733',
                                                            borderColor: 'black',
                                                            borderWidth: 1,
                                                            barPercentage: 0.4,
                                                            categoryPercentage: 0.5
                                                        },
                                                        {
                                                            label: 'Student Score',
                                                            data: graphScores,
                                                            backgroundColor: '#00c1e4',
                                                            borderColor: 'black',
                                                            borderWidth: 1,
                                                            barPercentage: 0.4,
                                                            categoryPercentage: 0.5
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'top' as const },
                                                        tooltip: { enabled: true }
                                                    },
                                                    scales: {
                                                        y: { beginAtZero: true },
                                                        x: { ticks: { minRotation: 0, maxRotation: 0 } }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Co-Scholastic activities & Graph 2 */}
                                <div className='mt-8 grid grid-cols-2 gap-8 px-4'>
                                    <div>
                                        {activityAreas.map((skillName: any, idx) => {
                                            const skillsInArea = Array.from(
                                                new Set(
                                                    activityDetails
                                                        .filter((a: any) => (a.ECACT_SkillName || a.ecacT_SkillName) === skillName)
                                                        .map((a: any) => a.ECACTA_SkillArea || a.ecactA_SkillArea)
                                                )
                                            );

                                            return (
                                                <div key={idx} className='mb-6'>
                                                    <h4 className='mb-2 text-center font-bold text-lg uppercase'>{skillName}</h4>
                                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                                        <thead className='bg-[#BABABA]'>
                                                            <tr>
                                                                <th className='border border-gray-400 p-2 text-left font-bold text-black'>
                                                                    Particulars
                                                                </th>
                                                                {termDetails.map((term: any, ti: number) => (
                                                                    <th
                                                                        key={ti}
                                                                        className='border border-gray-400 p-2 text-center font-bold text-black'>
                                                                        {term.ecT_TermName}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {skillsInArea.map((areaName: any, ai: number) => (
                                                                <tr key={ai}>
                                                                    <td className='break-words border border-gray-400 p-2 text-left font-bold'>
                                                                        {areaName}
                                                                    </td>
                                                                    {termDetails.map((term: any, ti: number) => {
                                                                        const scoreDetail = activityDetails.find(
                                                                            (a: any) =>
                                                                                (a.ECACTA_SkillArea || a.ecactA_SkillArea) === areaName &&
                                                                                (a.ECT_Id || a.ecT_Id) === term.ecT_Id
                                                                        );
                                                                        return (
                                                                            <td
                                                                                key={ti}
                                                                                className='border border-gray-400 p-2 text-center font-bold'>
                                                                                {scoreDetail
                                                                                    ? scoreDetail.EMGD_Name || scoreDetail.emgD_Name
                                                                                    : ''}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <h4 className='mb-4 text-center font-bold text-lg uppercase'>STUDENT PERFORMANCE ANALYSIS</h4>
                                        <div className='h-[350px] w-[350px]'>
                                            <Bar
                                                data={{
                                                    labels: graphLabels,
                                                    datasets: [
                                                        {
                                                            label: 'Section Average',
                                                            data: graphSectionAverages,
                                                            backgroundColor: '#1cc405',
                                                            borderColor: 'black',
                                                            borderWidth: 1,
                                                            barPercentage: 0.4,
                                                            categoryPercentage: 0.5
                                                        },
                                                        {
                                                            label: 'Student Score',
                                                            data: graphScores,
                                                            backgroundColor: '#770396',
                                                            borderColor: 'black',
                                                            borderWidth: 1,
                                                            barPercentage: 0.4,
                                                            categoryPercentage: 0.5
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'top' as const },
                                                        tooltip: { enabled: true }
                                                    },
                                                    scales: {
                                                        y: { beginAtZero: true },
                                                        x: { ticks: { minRotation: 0, maxRotation: 0 } }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className='mt-12 px-4'>
                                    <h4 className='mb-4 text-center font-bold text-lg uppercase underline'>HEALTH STATUS</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr className='bg-[#BABABA] font-bold text-black'>
                                                <td className='border border-gray-400 p-2'>Height (in cm)</td>
                                                <td className='border border-gray-400 p-2'>Weight (in kg)</td>
                                                <td className='border border-gray-400 p-2'>Blood Group</td>
                                                <td className='border border-gray-400 p-2'>Dental Hygiene</td>
                                                <td className='border border-gray-400 p-2'>Vision</td>
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 p-2 font-bold'>{height || ''}</td>
                                                <td className='border border-gray-400 p-2 font-bold'>{weight || ''}</td>
                                                <td className='border border-gray-400 p-2 font-bold'>{bloodGroup || ''}</td>
                                                <td className='border border-gray-400 p-2' />
                                                <td className='border border-gray-400 p-2' />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance */}
                                <div className='mt-12 px-4'>
                                    <h3 className='mb-4 text-center font-bold text-xl uppercase underline'>ATTENDANCE DETAILS</h3>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left text-black'>
                                                    Total number of <br /> working days
                                                </th>
                                                <th className='w-24 border border-gray-400 p-2'>
                                                    <b>{workAtt.TotalSchoolDays !== 0 ? workAtt.TotalSchoolDays : ''}</b>
                                                </th>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left text-black'>
                                                    Number of days <br /> attended
                                                </th>
                                                <th className='w-24 border border-gray-400 p-2'>
                                                    <b>{workAtt.Total_Percentage !== 0 ? workAtt.Total_Percentage : ''}</b>
                                                </th>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left text-black'>
                                                    Attendance <br /> Percentage
                                                </th>
                                                <th className='w-24 border border-gray-400 p-2'>
                                                    <b>{presentAtt.Total_Percentage !== 0 ? presentAtt.Total_Percentage : ''}</b>
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className='mt-12 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='w-32 border border-gray-400 bg-[#BABABA] p-2 text-left text-black uppercase'>
                                                    REMARKS
                                                </th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>
                                                    {remarkObj?.eprD_Remarks || 'pass'}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Result */}
                                <div className='mt-8 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='w-32 border border-gray-400 bg-[#BABABA] p-2 text-left text-black uppercase'>
                                                    RESULT
                                                </th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>
                                                    {report.ESTMP_Result || report.estmP_Result || ''}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className='mt-20 flex justify-between px-4 font-bold text-sm'>
                                    <div className='flex w-1/3 flex-col items-center pt-8 text-center'>
                                        <span>Principal’s Signature</span>
                                    </div>
                                    <div className='flex w-1/3 flex-col items-center pt-8 text-center'>
                                        <span>Institution Seal</span>
                                    </div>
                                    <div className='flex w-1/3 flex-col items-center justify-end text-center'>
                                        {classTeacherName.length > 0 && (
                                            <span className='mb-2 uppercase'>{classTeacherName[0].hrmE_EmployeeFirstName}</span>
                                        )}
                                        <span>Class Teacher’s Signature</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='p-10 text-center text-gray-500'>No student records found to display the report.</div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .page-break-before-always { page-break-before: always !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
                .print-area table { border-color: #000 !important; }
                .print-area th, .print-area td { border-color: #000 !important; }
            `}</style>
        </div>
    );
};

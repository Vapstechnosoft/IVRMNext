'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

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
                const exams = groupExamDetails.filter((ge: any) =>
                    (ge.empG_DistplayName || ge.EMPG_DistplayName) === (group.empG_DistplayName || group.EMPG_DistplayName)
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
        list.push({ EME_Id: 9800000, EMPG_DistplayName: "Total", EME_ExamName: "Total", EME_Marks: "Total", isTotal: true, isGrade: false });
        list.push({ EME_Id: 9800001, EMPG_DistplayName: "Grade", EME_ExamName: "Grade", EME_Marks: "Grade", isTotal: false, isGrade: true });
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
                {/* Fixed Print Footer */}
                <div className="print-footer hidden print:block">
                    {groupDetails.length === 2 && (
                        <p><b>G M GLOBAL SCHOOL – ANNUAL EXAMINATION REPORT &emsp;&emsp;</b></p>
                    )}
                    {groupDetails.length === 1 && (
                        <p><b>G M GLOBAL SCHOOL – MID TERM EXAMINATION REPORT &emsp;&emsp;</b></p>
                    )}
                </div>

                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        const studentID = report.amsT_Id || report.AMST_Id;

                        // Extract subjects for this student
                        const studentSubjects = studentWiseSubjects.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentID);
                        const studentMarks = studentMarksDetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentID);

                        // Co-scholastic activities data processing
                        const studentActivities = activityMainListArea.filter((act: any) => {
                            const actAmstId = act.AMST_Id ?? act.amsT_Id ?? act.studentId;
                            return String(actAmstId) === String(studentID);
                        });

                        // Extract unique activity categories (ECACT_SkillName / activityName) for this student
                        const activity_main_list_area: any[] = [];
                        studentActivities.forEach((act: any) => {
                            const catName = act.activityName ?? act.ECACT_SkillName ?? act.ecacT_SkillName;
                            const catId = act.ecacT_Id ?? act.ECACT_Id;
                            if (catName) {
                                const exists = activity_main_list_area.some(
                                    (item: any) => (item.activityName ?? item.ECACT_SkillName) === catName
                                );
                                if (!exists) {
                                    activity_main_list_area.push({
                                        ECACT_SkillName: catName,
                                        activityName: catName,
                                        ECACT_Id: catId,
                                        ecacT_Id: catId
                                    });
                                }
                            }
                        });

                        // Extract unique activity skill areas (ECACTA_SkillArea / activityArea) for this student
                        const activity_main_list: any[] = [];
                        studentActivities.forEach((act: any) => {
                            const areaName = act.activityArea ?? act.ECACTA_SkillArea ?? act.ecactA_SkillArea;
                            const catId = act.ecacT_Id ?? act.ECACT_Id;
                            if (areaName) {
                                const exists = activity_main_list.some(
                                    (item: any) => (item.activityArea ?? item.ECACTA_SkillArea) === areaName
                                );
                                if (!exists) {
                                    activity_main_list.push({
                                        ECACTA_SkillArea: areaName,
                                        activityArea: areaName,
                                        activityGrade: act.activityGrade ?? act.EMGD_Name ?? act.emgD_Name ?? act.ecsactT_Score,
                                        ECACT_Id: catId,
                                        ecacT_Id: catId,
                                        activity_score_details: []
                                    });
                                }
                            }
                        });

                        // Build activity score details per term
                        activity_main_list.forEach((act: any) => {
                            termDetails.forEach((term: any) => {
                                const termId = term.ecT_Id ?? term.ect_Id ?? term.ECT_Id;
                                const matchingAct = studentActivities.find((dd: any) => {
                                    const ddTermId = dd.activity_ECT_Id ?? dd.ECT_Id ?? dd.ecT_Id ?? dd.ect_Id;
                                    const actArea = act.activityArea ?? act.ECACTA_SkillArea;
                                    const ddArea = dd.activityArea ?? dd.ECACTA_SkillArea ?? dd.ecactA_SkillArea;
                                    return ddArea === actArea && String(ddTermId) === String(termId);
                                });
                                if (matchingAct) {
                                    act.activity_score_details.push({
                                        EMGD_Name: matchingAct.activityGrade ?? matchingAct.EMGD_Name ?? matchingAct.emgD_Name ?? matchingAct.ecsactT_Score,
                                        activityGrade: matchingAct.activityGrade ?? matchingAct.EMGD_Name ?? matchingAct.emgD_Name ?? matchingAct.ecsactT_Score,
                                        ecT_Id: termId
                                    });
                                }
                            });
                        });

                        // Health details from report
                        const height = report.height || report.SPCCSHW_Height || report.AMST_height || report.AMST_Height || '';
                        const weight = report.weight || report.SPCCSHW_Weight || report.AMST_Weight || '';
                        const bloodGroup = report.bloodGroup || report.AMST_BloodGroup || '';
                        const dentalHygiene = report.dentalHygiene || report.HMDNHY_DentalHygiene || '';
                        const visionHygiene = report.visionHygiene || report.HMVSN_VisionHygiene || '';

                        // Attendance details
                        const workAtt = workAttendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === studentID) || {};
                        const presentAtt = presentAttendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === studentID) || {};

                        // Remarks
                        const remarkObj = promotionRemarks.find((r: any) => (r.amsT_Id || r.AMST_Id) === studentID);

                        // Graph data for Class Average vs Student Score
                        const graphSubjects = studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName);
                        const graphLabels = graphSubjects.map((s: any) => s.ISMS_SubjectName || s.ismS_SubjectName || s.subjectName);
                        
                        // Default to GMVPS logic if properties exist on subject
                        const graphScores = graphSubjects.map((s: any) => {
                            const subjScore = s.subjectObtainedMarks ?? s.subjectPercentage ?? s.ESTMPPS_ObtainedMarks;
                            if (subjScore !== undefined) return Number(subjScore);
                            
                            // Otherwise calculate sum of marks across all groups
                            let total = 0;
                            groupWiseExamList.filter(e => e.isTotal).forEach((groupTotalExam: any) => {
                                const groupExams = groupWiseExamList.filter(e => !e.isTotal && !e.isGrade && (e.EMPG_DistplayName || e.empG_DistplayName) === (groupTotalExam.EMPG_DistplayName || groupTotalExam.empG_DistplayName));
                                groupExams.forEach(ge => {
                                    const mark = studentMarks.find((m: any) => (m.ISMS_Id || m.ismS_Id) === (s.ISMS_Id || s.ismS_Id) && (m.EME_Id || m.emE_Id) === ge.EME_Id);
                                    if (mark) total += (mark.ObtainedMarks || mark.obtainedMarks || 0);
                                });
                            });
                            return total;
                        });

                        const graphClassAverages = graphSubjects.map((s: any) => {
                            const subjAvg = s.classAverage ?? s.ESTMPPS_ClassAverage ?? s.estmpps_ClassAverage;
                            if (subjAvg !== undefined) return Number(subjAvg);
                            
                            // If missing, look for it in studentMarks
                            let avg = 0;
                            const markWithAvg = studentMarks.find((m: any) => (m.ISMS_Id || m.ismS_Id) === (s.ISMS_Id || s.ismS_Id) && (m.ESTMPPS_ClassAverage || m.estmpps_ClassAverage || m.classAverage));
                            if (markWithAvg) avg = markWithAvg.ESTMPPS_ClassAverage || markWithAvg.estmpps_ClassAverage || markWithAvg.classAverage;
                            return avg;
                        });

                        // Graph 2: Performance Analysis (Term wise)
                        const groupedMarksBySubject = graphSubjects.map((subj: any) => {
                            let subjObj: any = { subject: subj.ISMS_SubjectName || subj.ismS_SubjectName || subj.subjectName, terms: {} };
                            groupDetails.forEach((group: any) => {
                                const groupName = group.EMPG_DistplayName || group.empG_DistplayName;
                                const examsInGroup = groupExamDetails.filter((ge: any) => (ge.EMPG_DistplayName || ge.empG_DistplayName) === groupName);
                                let groupTotal = 0;
                                examsInGroup.forEach((exam: any) => {
                                    const mark = studentMarks.find((m: any) => (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) && (m.EME_Id || m.emE_Id) === (exam.EME_Id || exam.emE_Id));
                                    if (mark) groupTotal += (mark.ObtainedMarks || mark.obtainedMarks || 0);
                                });
                                subjObj.terms[groupName] = groupTotal;
                            });
                            return subjObj;
                        });

                        const graph2Labels = groupedMarksBySubject.map((item: any) => item.subject);
                        const allTerms = groupDetails.map((g: any) => g.EMPG_DistplayName || g.empG_DistplayName);
                        const termColors: any = { "TERM I": "#1cc405", "TERM II": "#770396" };
                        const graph2Datasets = allTerms.map((term: any, idx: number) => ({
                            label: term as string,
                            data: groupedMarksBySubject.map((subject: any) => subject.terms[term] || 0),
                            backgroundColor: termColors[term as string] || (idx === 0 ? '#1cc405' : '#770396'),
                            borderColor: 'black',
                            borderWidth: 1,
                        }));

                        console.log(`Student ${studentID} API DATA:`, {
                            studentSubjects,
                            studentMarks,
                            graph1_Labels: graphLabels,
                            graph1_Scores: graphScores,
                            graph1_Averages: graphClassAverages,
                            graph2_GroupedMarks: groupedMarksBySubject,
                            graph2_Datasets: graph2Datasets
                        });

                        return (
                            <div
                                key={index}
                                className={`mx-auto mb-8 w-[90%] max-w-[90%] bg-white p-2 shadow-sm border border-gray-300 ${index > 0 ? 'page-break-before-always' : ''}`}
                                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>

                                <div className='mb-4 w-full flex justify-center'>
                                    <img
                                        src={institutionDetails.length > 0 && institutionDetails[0].mI_Logo ? institutionDetails[0].mI_Logo : "https://vapsclg.blob.core.windows.net/files/50/ISM_Attachments/9c0a51f6-e413-4b67-84cd-4294e541d50c.jpg"}
                                        alt="Report Header"
                                        className='w-full object-contain'
                                    />
                                </div>

                                <h3 className='mb-6 text-center text-xl font-bold uppercase'>
                                    ACHIEVEMENT RECORD {academicYear}
                                </h3>

                                {/* Student Profile */}
                                <div className='relative mb-8 px-8'>
                                    <div className='flex flex-col space-y-1 text-[15px] w-3/4'>
                                        {[
                                            { label: 'Name of the Student', value: report.studentname || report.studentName },
                                            { label: 'Admission Number', value: report.admno || report.admNo || report.admissionNo },
                                            { label: 'Class & Section', value: `${report.classname || report.className}    ${report.sectionname || report.sectionName}` },
                                            { label: 'Date of Birth', value: report.dob },
                                            { label: "Mother's Name", value: report.mothername || report.motherName },
                                            { label: "Father's Name", value: report.fathername || report.fatherName }
                                        ].map((item, i) => (
                                            <div key={i} className='flex'>
                                                <div className='w-48 font-bold'>{item.label}</div>
                                                <div className='w-4 font-bold'>:</div>
                                                <div className='font-bold ml-2'>{item.value || ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='absolute right-8 top-[-20px]'>
                                        <div className='flex items-center justify-center border border-gray-400 p-1 h-[130px] w-[110px] bg-gray-100 self-center'>
                                            {report.photo || report.AMST_Photoname || report.amsT_Photoname ? (
                                                <img
                                                    src={report.photo || report.AMST_Photoname || report.amsT_Photoname}
                                                    alt="Student Photo"
                                                    className='h-full w-full object-cover'
                                                />
                                            ) : (
                                                <span className='text-xs text-gray-500 font-bold'>PHOTO</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Scholastic Section */}
                                <h3 className='mb-2 text-center text-xl font-bold uppercase text-[#1a3b7c]'>SCHOLASTIC REPORT</h3>
                                <div className='px-4'>
                                    <table className='mb-6 w-full border-collapse border border-gray-400 text-sm'>
                                        <thead>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left text-black w-48'><b>&nbsp;</b></th>
                                                {groupDetails.map((group: any, gi: number) => {
                                                    const examsInGroup = groupExamDetails.filter((ge: any) =>
                                                        (ge.empG_DistplayName || ge.EMPG_DistplayName) === (group.empG_DistplayName || group.EMPG_DistplayName)
                                                    );
                                                    return (
                                                        <th key={gi} colSpan={examsInGroup.length} className='border border-gray-400 bg-[#BABABA] p-2 text-center text-black font-bold max-w-[150px] break-words'>
                                                            <strong>{group.empG_GroupName || group.EMPG_GroupName}</strong>
                                                        </th>
                                                    );
                                                })}
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center text-black font-bold'></th>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-center text-black font-bold'></th>
                                            </tr>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-left text-black font-bold uppercase'>SUBJECT</th>
                                                {groupWiseExamList.map((exam: any, i: number) => (
                                                    <th key={i} className='border border-gray-400 bg-[#BABABA] p-2 text-center text-black max-w-[150px] break-words'>
                                                        <strong>{exam.EME_ExamName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg || s.subjectName).map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className='border border-gray-400 p-2 text-left break-words'>{subj.ISMS_SubjectName || subj.ismS_SubjectName || subj.subjectName}</td>
                                                    {groupWiseExamList.map((exam: any, eIdx: number) => {
                                                        const mark = studentMarks.find((m: any) =>
                                                            (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) &&
                                                            (m.EME_Id || m.emE_Id) === exam.EME_Id
                                                        );

                                                        let displayValue = '';

                                                        if (exam.isTotal) {
                                                            const totalMarks = studentMarks
                                                                .filter((m: any) => (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) && (m.EME_Id || m.emE_Id) !== 9800000 && (m.EME_Id || m.emE_Id) !== 9800001)
                                                                .reduce((acc: number, curr: any) => acc + (curr.ObtainedMarks || curr.obtainedMarks || 0), 0);
                                                            displayValue = totalMarks > 0 ? totalMarks.toString() : '';
                                                        } else if (exam.isGrade) {
                                                            const totalMarks = studentMarks
                                                                .filter((m: any) => (m.ISMS_Id || m.ismS_Id) === (subj.ISMS_Id || subj.ismS_Id) && (m.EME_Id || m.emE_Id) !== 9800000 && (m.EME_Id || m.emE_Id) !== 9800001)
                                                                .reduce((acc: number, curr: any) => acc + (curr.ObtainedMarks || curr.obtainedMarks || 0), 0);

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
                                <div className='mb-6 px-4 mt-6'>
                                    <h3 className='mb-2 text-left text-lg font-bold underline uppercase text-[#1a3b7c]'>SCHOLASTIC GRADING SCALE</h3>
                                    <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Grade</th>
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].map(g => (
                                                    <th key={g} className='border border-gray-400 p-2 font-bold'>{g}</th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 bg-[#BABABA] p-2 font-bold'>Mark</td>
                                                {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '33-40', '0-32'].map(m => (
                                                    <td key={m} className='border border-gray-400 p-2'>{m}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph 1 */}
                                <div className='mb-10 mt-10 w-full px-4 flex justify-center'>
                                    <div className='w-3/4 flex flex-col items-center'>
                                        <h4 className='mb-4 text-center text-lg font-bold uppercase text-[#1a3b7c]'>STUDENT PERFORMANCE INDEX</h4>
                                        <div className='w-full h-[300px] flex justify-center'>
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
                                                        },
                                                        {
                                                            label: 'Student Score',
                                                            data: graphScores,
                                                            backgroundColor: '#00c1e4',
                                                            borderColor: 'black',
                                                            borderWidth: 1,
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
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: { color: 'red' }
                                                        },
                                                        x: {
                                                            ticks: { color: 'blue' }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Co-Scholastic activities & Graph 2 */}
                                <div className='mt-8 px-4 grid grid-cols-2 gap-8'>
                                    <div>
                                        <h3 className='mb-4 text-center text-lg font-bold uppercase text-[#1a3b7c]'>
                                            Co-SCHOLASTIC ACTIVITIES
                                        </h3>
                                        {activity_main_list_area.map((acti: any, idx: number) => {
                                            const actiId = acti.ecacT_Id ?? acti.ECACT_Id;
                                            const subActivities = activity_main_list.filter((subjco: any) => {
                                                const subjcoId = subjco.ecacT_Id ?? subjco.ECACT_Id;
                                                return subjcoId === actiId;
                                            });

                                            return (
                                                <div key={idx} className="mb-6">
                                                    <h4 className="text-center font-bold mb-2 uppercase text-lg text-[#1a3b7c]">{acti.activityName ?? acti.ECACT_SkillName}</h4>
                                                    <table className="w-full border-collapse border border-gray-400 text-sm">
                                                        <thead className="bg-[#BABABA]">
                                                            <tr>
                                                                <th className="border border-gray-400 p-2 text-left font-bold text-black uppercase">Particulars</th>
                                                                {termDetails.map((term: any, ti: number) => (
                                                                    <th key={ti} className="border border-gray-400 p-2 font-bold text-black text-center uppercase">{term.ecT_TermName}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {subActivities.map((subjco: any, ai: number) => (
                                                                <tr key={ai}>
                                                                    <td className="border border-gray-400 p-2 text-left font-bold break-words uppercase">
                                                                        {subjco.activityArea ?? subjco.ECACTA_SkillArea}
                                                                    </td>
                                                                    {termDetails.map((term: any, ti: number) => {
                                                                        const termId = term.ecT_Id ?? term.ect_Id ?? term.ECT_Id;
                                                                        const score = (subjco.activity_score_details || []).find((s: any) => String(s.ecT_Id) === String(termId));
                                                                        return (
                                                                            <td key={ti} className="border border-gray-400 p-2 text-center font-bold">
                                                                                {score?.activityGrade ?? score?.EMGD_Name ?? ''}
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
                                    <div className='flex flex-col items-center pl-6'>
                                        <h4 className='mb-4 text-center text-lg font-bold uppercase text-[#1a3b7c]'>STUDENT PERFORMANCE ANALYSIS</h4>
                                        <div className='w-[350px] h-[400px]'>
                                            <Bar
                                                data={{
                                                    labels: graph2Labels,
                                                    datasets: graph2Datasets
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
                                                        x: {
                                                            ticks: { minRotation: 40, maxRotation: 40 },
                                                            barPercentage: 0.2,
                                                            categoryPercentage: 0.5,
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className='mt-10 px-4'>
                                    <h4 className='mb-4 text-center text-lg font-bold underline text-[#1a3b7c] uppercase'>HEALTH STATUS</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-sm text-center'>
                                        <tbody>
                                            <tr className='bg-[#BABABA] text-black font-bold'>
                                                <td className='border border-gray-400 p-2'>Height (in cm)</td>
                                                <td className='border border-gray-400 p-2'>Weight (in kg)</td>
                                                <td className='border border-gray-400 p-2'>Blood Group</td>
                                                <td className='border border-gray-400 p-2'>Dental Hygiene</td>
                                                <td className='border border-gray-400 p-2'>Vision ( Right & Left )</td>
                                            </tr>
                                            <tr>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{height}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{weight}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{bloodGroup}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{dentalHygiene}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{visionHygiene}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance */}
                                <div className='mt-10 px-4'>
                                    <h3 className='mb-4 text-center text-lg font-bold underline text-[#1a3b7c] uppercase'>ATTENDANCE DETAILS</h3>
                                    <table className='w-full border-collapse border border-gray-400 text-sm text-center'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-1/6'>Total number of <br /> working days</th>
                                                <td className='border border-gray-400 p-2 w-1/6 font-bold'>
                                                    {report.totalSchoolDays ?? workAtt.TotalSchoolDays ?? workAtt.totalSchoolDays ?? workAtt.TotalSchool_Days ?? workAtt.totalSchool_Days ?? workAtt.TotalWorkingDays ?? workAtt.totalWorkingDays ?? ''}
                                                </td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-1/6'>Number of days <br /> attended</th>
                                                <td className='border border-gray-400 p-2 w-1/6 font-bold'>
                                                    {report.totalPresentDays ?? presentAtt.TotalWorkingDays ?? presentAtt.totalWorkingDays ?? presentAtt.TotalPresentDays ?? presentAtt.totalPresentDays ?? presentAtt.TotalPresent_Days ?? presentAtt.totalPresent_Days ?? presentAtt.presentDays ?? presentAtt.present_days ?? ''}
                                                </td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-1/6'>Attendance <br /> Percentage</th>
                                                <td className='border border-gray-400 p-2 w-1/6 font-bold'>
                                                    {presentAtt.Total_Percentage ?? presentAtt.total_Percentage ?? presentAtt.TotalPercentage ?? presentAtt.totalPercentage ?? ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className='mt-12 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-32 text-left uppercase'>REMARKS</th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>{remarkObj?.eprD_Remarks || ''}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Result */}
                                <div className='mt-8 px-4'>
                                    <table className='w-full border-collapse border border-gray-400 text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 text-black w-32 text-left uppercase'>RESULT</th>
                                                <th className='border border-gray-400 p-2 text-left font-bold uppercase'>{remarkObj?.eprD_PromotionName || report.ESTMP_Result || report.estmP_Result || ''}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className='mt-12 px-8 flex flex-col space-y-4'>
                                    <div className='flex w-full items-center justify-between'>
                                        <div className='w-1/3 text-left'>
                                        </div>
                                        <div className='w-1/3 text-center flex justify-center'>
                                            <img src="https://vapsclg.blob.core.windows.net/files/50/managersign/ebca00dc-ae10-43fe-a6ea-99658b662e07.jpg"
                                                style={{ width: '100px' }} alt="Manager Sign" />
                                        </div>
                                        <div className='w-1/3 text-right'>
                                            &nbsp;
                                        </div>
                                    </div>

                                    <div className='flex w-full justify-between font-bold' style={{ fontFamily: 'sans-serif' }}>
                                        <div className='w-1/3 text-left'>
                                            Principal’s Signature
                                        </div>
                                        <div className='w-1/3 text-center'>
                                            Institution Seal
                                        </div>
                                        <div className='w-1/3 text-right flex flex-col items-end'>
                                            {classTeacherName.length > 0 && (
                                                <span className='uppercase'>{classTeacherName[0].hrmE_EmployeeFirstName}</span>
                                            )}
                                            <span>Class Teacher’s Signature</span>
                                            <span>Date: {generatedDate ? format(generatedDate, 'dd/MM/yyyy') : ''}</span>
                                        </div>
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
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; margin-bottom: 5mm !important; }
                    .page-break-before-always { page-break-before: always !important; }
                    @page { size: A4 portrait; margin: 10mm; margin-bottom: 5mm !important; }
                    .print-footer {
                        position: fixed !important;
                        bottom: 0mm !important;
                        right: 5mm !important;
                        width: auto !important;
                        text-align: right !important;
                        font-size: 12px !important;
                        color: #000 !important;
                        font-family: sans-serif !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                }
                .print-area table { border-color: #000 !important; }
                .print-area th, .print-area td { border-color: #000 !important; }
            `}</style>
        </div>
    );
};

'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // --- Data Processing (Optimized Binding) ---
    const studentDetails = useMemo(() => data.getstudentdetails || [], [data]);
    const institution = useMemo(() => data.getinstitution?.[0] || {}, [data]);
    const studentWiseSubjects = useMemo(() => data.getstudentwisesubjectlist || [], [data]);
    const termDetails = useMemo(() => data.gettermdetails || [], [data]);
    const groupDetails = useMemo(() => data.getgroupdetails || [], [data]);
    const groupExamDetails = useMemo(() => data.getgroupexamdetails || [], [data]);
    const studentMarksDetails = useMemo(() => data.getstudentmarksdetails || [], [data]);
    const examMaxMarks = useMemo(() => data.getexammaxmarks || [], [data]);
    const classTeachers = useMemo(() => data.clstchname || [], [data]);
    const promotionRemarks = useMemo(() => data.getpromotionremarksdetails || [], [data]);
    const activityMainList = useMemo(() => data.getstudentwiseactiviteslist || [], [data]);

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
        // Add Total and Grade columns
        list.push({ EME_Id: 9800000, EMPG_DistplayName: "Total", EME_ExamName: "MARKS SCORED(100)", isTotal: true, isGrade: false });
        list.push({ EME_Id: 9800001, EMPG_DistplayName: "Grade", EME_ExamName: "GRADE", isTotal: false, isGrade: true });
        return list;
    }, [groupDetails, groupExamDetails]);

    const reportDate = params.date ? format(new Date(params.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
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
                        const studentID = report.amsT_Id || report.studentId;

                        // Extract subjects for this student
                        const studentSubjects = Array.from(new Set(studentWiseSubjects
                            .filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentID)
                            .map((s: any) => s.subjectName || s.ISMS_SubjectName || s.ismS_SubjectName)))
                            .map(name => {
                                const subjObj = studentWiseSubjects.find((s: any) =>
                                    (s.amsT_Id || s.AMST_Id) === studentID &&
                                    (s.subjectName === name || s.ISMS_SubjectName === name || s.ismS_SubjectName === name)
                                );
                                return {
                                    subjectName: name,
                                    ismS_Id: subjObj?.ismS_Id || subjObj?.ISMS_Id || 0,
                                    EMPS_AppToResultFlg: true,
                                    amsT_Id: subjObj.amsT_Id
                                };
                            });
                        console.log('report Data', data);
                        const studentMarks = studentMarksDetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentID);
                        const studentSummary = examMaxMarks.find((emm: any) => (emm.amsT_Id || emm.AMST_Id) === studentID) || {};
                        const remarksObj = promotionRemarks.find((rem: any) => (rem.amsT_Id || rem.AMST_Id) === studentID) || {};

                        const workAtt = (data.work_attendence || []).find((a: any) => (a.studentId || a.StudentId) === studentID) || {};
                        const presentAtt = (data.present_attendence || []).find((a: any) => (a.studentId || a.studentId) === studentID) || {};
                        console.log("workAtt", data.work_attendence);
                        console.log("presentAtt", presentAtt);
                        // Graph data
                        const graphSubjects = studentWiseSubjects.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentID);
                        const graphLabels = graphSubjects.map((s: any) => s.subjectName || s.ISMS_SubjectName || s.ismS_SubjectName);
                        const graphScores = graphSubjects.map((s: any) => s.subjectPercentage || s.TotalPercentage || 0);
                        const graphAverages = graphSubjects.map((s: any) => s.classAverage || 0);
                        const hasAverage = graphSubjects.some((s: any) => s.classAverage !== undefined && s.classAverage !== null);
                        return (
                            <div
                                key={index}
                                className='page-break-before-always mx-auto mb-8 w-full max-w-5xl border border-gray-300 bg-white p-4 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>

                                <div className='mb-4 w-full'>
                                    <img
                                        src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/35f336e8-28d7-4fbe-94f6-4fdfd733ecf6.jpg"
                                        alt="Report Header"
                                        className='w-full object-contain'
                                    />
                                </div>

                                <h3 className='mb-6 text-center text-xl font-bold uppercase'>
                                    ACHIEVEMENT RECORD {data.asmaY_Year}
                                </h3>

                                {/* Student Profile */}
                                <div className='relative mb-8 flex flex-row px-4'>
                                    <div className='flex-1 space-y-2 text-sm'>
                                        {[
                                            { label: 'Name of the Student', value: report.studentName || report.studentname },
                                            { label: 'Admission Number', value: report.admissionNo || report.admno },
                                            { label: 'Class & Section', value: `${report.className || report.classname} - ${report.sectionName || report.sectionname}` },
                                            { label: 'Date of Birth', value: report.dob },
                                            { label: 'Mother\'s Name', value: report.motherName || report.mothername },
                                            { label: 'Father\'s Name', value: report.fatherName || report.fathername }
                                        ].map((item, i) => (
                                            <div key={i} className='flex'>
                                                <div className='w-48 font-bold'>{item.label}</div>
                                                <div className='w-4'>:</div>
                                                <div className='font-bold uppercase'>{item.value || '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='absolute right-4 top-[-20px]'>
                                        {(report.studentPhoto || report.AMST_Photoname) && (
                                            <img
                                                src={report.studentPhoto || report.AMST_Photoname}
                                                alt="Student"
                                                className='h-[150px] w-[150px] border border-black object-cover'
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Scholastic Section */}
                                <h3 className='mb-2 text-center text-lg font-bold uppercase'>SCHOLASTIC REPORT</h3>
                                <div className='overflow-x-auto px-4'>
                                    <table className='mb-6 w-full border-collapse border border-gray-400 text-xs'>
                                        <thead>
                                            <tr>
                                                <th rowSpan={2} className='w-40 border border-gray-400 bg-[#BABABA] p-2 text-left text-black uppercase'><b>SUBJECT</b></th>
                                                {groupDetails.map((group: any, gi: number) => {
                                                    const examsInGroup = groupExamDetails.filter((ge: any) =>
                                                        (ge.empG_DistplayName || ge.EMPG_DistplayName) === (group.empG_DistplayName || group.EMPG_DistplayName)
                                                    );
                                                    return (
                                                        <th key={gi} colSpan={examsInGroup.length} className='border border-gray-400 bg-[#BABABA] p-1 text-center text-black font-bold uppercase'>
                                                            {group.empG_GroupName || group.EMPG_GroupName}
                                                        </th>
                                                    );
                                                })}
                                                <th rowSpan={2} className='border border-gray-400 bg-[#BABABA] p-1 text-center text-black min-w-[100px] font-bold uppercase'>
                                                    MARKS SCORED(100)
                                                </th>
                                                <th rowSpan={2} className='border border-gray-400 bg-[#BABABA] p-1 text-center text-black min-w-[100px] font-bold uppercase'>
                                                    GRADE
                                                </th>
                                            </tr>
                                            <tr>
                                                {groupWiseExamList.filter((e: any) => !e.isTotal && !e.isGrade).map((exam: any, i: number) => (
                                                    <th key={i} className='border border-gray-400 bg-[#BABABA] p-1 text-center text-black min-w-[60px]'>
                                                        <div className='font-bold uppercase'>{exam.EME_ExamName}</div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects.map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className='border border-gray-400 p-2 text-left font-semibold uppercase'>{subj.subjectName}</td>
                                                    {groupWiseExamList.map((exam: any, eIdx: number) => {
                                                        const mark = studentMarks.find((m: any) =>
                                                            m.ismS_SubjectName === subj.subjectName &&
                                                            m.emE_ExamName === exam.EME_ExamName &&
                                                            m.amsT_Id === subj.amsT_Id
                                                        );
                                                        const summaryMark = graphSubjects.find((gs: any) =>
                                                            (gs.subjectName === subj.subjectName || gs.ISMS_SubjectName === subj.subjectName || gs.ismS_SubjectName === subj.subjectName)
                                                        );
                                                        let displayValue = '';
                                                        if (exam.isTotal) {
                                                            displayValue = summaryMark?.subjectObtainedMarks || summaryMark?.TotalMarks || '';
                                                        } else if (exam.isGrade) {
                                                            displayValue = summaryMark?.subjectGrade || summaryMark?.TotalGrade || '';
                                                        } else if (mark) {
                                                            displayValue = mark.passFailFlag === 'AB' || mark.PassFailFlag === 'AB'
                                                                ? 'AB'
                                                                : (mark.obtainedMarks !== undefined ? mark.obtainedMarks : mark.ObtainedMarks || '');
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
                                <div className='mb-6 px-4'>
                                    <h3 className='mb-2 text-center text-lg font-bold underline uppercase'>SCHOLASTIC GRADING SCALE</h3>
                                    <table className='mx-auto w-3/4 border-collapse border border-gray-400 text-center text-sm'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 uppercase'>Grade</th>
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].map(g => (
                                                    <td key={g} className='border border-gray-400 p-2 font-bold'>{g}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>Mark</th>
                                                {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '33-40', '0-32'].map(m => (
                                                    <td key={m} className='border border-gray-400 p-2'>{m}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph */}
                                <div className='mb-12 mt-10 w-full px-4'>
                                    <h4 className='mb-4 text-center text-lg font-bold uppercase'>STUDENT PERFORMANCE INDEX</h4>
                                    <div className='mx-auto h-[400px] w-full max-w-4xl'>
                                        <Bar
                                            data={{
                                                labels: graphLabels,
                                                datasets: [
                                                    {
                                                        label: 'Student Score',
                                                        data: graphScores,
                                                        backgroundColor: '#FF5733',
                                                        borderColor: 'black',
                                                        borderWidth: 1
                                                    },
                                                    ...(hasAverage ? [{
                                                        label: 'Class Average',
                                                        data: graphAverages,
                                                        backgroundColor: '#00c1e4',
                                                        borderColor: 'black',
                                                        borderWidth: 1
                                                    }] : [])
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: { y: { beginAtZero: true, max: 100 } }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className='page-break-before-always mb-8' />

                                {/* Co-Scholastic activities */}
                                {activityMainList.length > 0 && (
                                    <div className='mt-8 px-4'>
                                        <h4 className='mb-4 text-center text-lg font-bold underline uppercase'>Co-Scholastic Activities</h4>
                                        <div className='mx-auto w-full max-w-4xl'>
                                            {Array.from(new Set(activityMainList.map((a: any) => a.ECACT_SkillName))).map((skillName: any, idx) => {
                                                const areaActivities = activityMainList.filter((a: any) => a.ECACT_SkillName === skillName && a.amsT_Id == studentID);
                                                return (
                                                    <div key={idx} className="mb-6">
                                                        <h5 className="text-center font-bold mb-2 uppercase">{skillName}</h5>
                                                        <table className="w-full border-collapse border border-gray-400 text-xs text-center">
                                                            <thead className="bg-[#BABABA]">
                                                                <tr>
                                                                    <th className="border border-gray-400 p-2 text-left font-bold uppercase">Particulars</th>
                                                                    {termDetails.map((term: any, ti: number) => (
                                                                        <th key={ti} className="border border-gray-400 p-2 font-bold uppercase">Grade</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {areaActivities.map((act: any, ai: number) => (
                                                                    <tr key={ai}>
                                                                        <td className="border border-gray-400 p-2 text-left font-medium uppercase">{act.activityArea}</td>
                                                                        <td className="border border-gray-400 p-2 font-bold">{act.activityGrade || ''}</td>
                                                                        {/* {termDetails.map((term: any, ti: number) => {
                                                                            const score = (act.activity_score_details || []).find((s: any) => s.ecT_Id === term.ecT_Id);
                                                                            return (
                                                                                <td key={ti} className="border border-gray-400 p-2 font-bold">{score?.EMGD_Name || ''}</td>
                                                                            );
                                                                        })} */}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Health Status */}
                                <div className='mt-8 px-4'>
                                    <h4 className='mb-4 text-center text-lg font-bold underline uppercase'>Health Status</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-xs text-center'>
                                        <thead className='bg-[#BABABA]'>
                                            <tr>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Height (in cm)</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Weight (in kg)</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Blood Group</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Dental Hygiene</th>
                                                <th className='border border-gray-400 p-2 font-bold uppercase'>Vision (Right & Left)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.SPCCSHW_Height || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.SPCCSHW_Weight || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.AMST_BloodGroup || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.HMDNHY_DentalHygiene || '-'}</td>
                                                <td className='border border-gray-400 p-2 font-bold uppercase'>{report.HMVSN_VisionHygiene || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance */}
                                <div className='mt-8 px-4'>
                                    <h4 className='mb-4 text-center text-lg font-bold underline uppercase'>Attendance Details</h4>
                                    <table className='w-full border-collapse border border-gray-400 text-xs text-center'>
                                        <tbody>
                                            <tr>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>Total number of working days</th>
                                                <td className='border border-gray-400 p-2 font-bold w-32'>{presentAtt.totalSchoolDays || presentAtt.totalSchoolDays || ''}</td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>Number of days attended</th>
                                                <td className='border border-gray-400 p-2 font-bold w-32'>{presentAtt.totalWorkingDays || presentAtt.totalWorkingDays || ''}</td>
                                                <th className='border border-gray-400 bg-[#BABABA] p-2 font-bold uppercase'>Attendance Percentage</th>
                                                <td className='border border-gray-400 p-2 font-bold w-32'>{presentAtt.attendancePercentage || presentAtt.total_Percentage ? `${presentAtt.attendancePercentage || presentAtt.total_Percentage}%` : ''}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Results & Signatures */}
                                <div className='mt-12 px-4'>
                                    <div className='mb-8 border border-gray-400 text-sm'>
                                        <div className='flex border-b border-gray-400'>
                                            <div className='w-32 bg-[#BABABA] p-2 font-bold border-r border-gray-400 text-center uppercase'>Results</div>
                                            <div className='flex-1 p-2 font-bold uppercase'>{report.eprD_PromotionName || studentSummary.overallResult || '-'}</div>
                                        </div>
                                    </div>

                                    <div className='mt-24 grid grid-cols-3 gap-4 px-4'>
                                        <div className='flex flex-col items-start'>
                                            <img
                                                style={{ width: '150px' }}
                                                src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg"
                                                alt="Principal Sign"
                                                className="mb-2"
                                            />
                                            <p className='font-bold text-sm uppercase'>Principal Signature</p>
                                        </div>
                                        <div className='flex flex-col items-center justify-end pb-1'>
                                            <p className='font-bold text-sm uppercase'>Institution Seal</p>
                                        </div>
                                        <div className='flex flex-col items-end justify-end pb-1'>
                                            <p className='italic font-bold text-sm underline mb-1 uppercase'>
                                                {classTeachers?.[index]?.hrmE_EmployeeFirstName || classTeachers?.[0]?.hrmE_EmployeeFirstName || ''}
                                            </p>
                                            <p className='font-bold text-sm uppercase'>Class Teacher Signature</p>
                                            <p className='font-bold text-sm mt-1 uppercase'>Date: {reportDate}</p>
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

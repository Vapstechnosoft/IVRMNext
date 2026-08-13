'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface Props {
    reportData: any;
    onPrint?: () => void;
    reportType?: string;
}

const getArray = (data: any, keys: string[]) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const source = data.data || data;
    for (const k of keys) {
        if (Array.isArray(source[k])) return source[k];
        if (source[k] && Array.isArray(source[k].$values)) return source[k].$values;
    }
    for (const k of Object.keys(source)) {
        if (keys.some(key => key.toLowerCase() === k.toLowerCase())) {
            if (Array.isArray(source[k])) return source[k];
            if (source[k] && Array.isArray(source[k].$values)) return source[k].$values;
        }
    }
    return [];
};

export default function ProgressCardReport({ reportData, onPrint, reportType = 'REPORT' }: Props) {
    const getstudentdetails = getArray(reportData, ['getstudentdetails', 'studentdetails', 'getStudentDetails', 'studentlist', 'getstudentlist']);
    const getstudentwisesubjectlist = getArray(reportData, ['getstudentwisesubjectlist', 'studentwisesubjectlist', 'getStudentWiseSubjectList']);
    const getstudentmarksdetails = getArray(reportData, ['getstudentmarksdetails', 'studentmarksdetails', 'getStudentMarksDetails']);
    const getgroupexamdetails = getArray(reportData, ['getgroupexamdetails', 'groupexamdetails', 'getGroupExamDetails', 'examlist', 'getexamlist']);
    const getstudentwiseattendancedetails = getArray(reportData, ['getstudentwiseattendancedetails', 'studentwiseattendancedetails', 'getStudentWiseAttendanceDetails']);
    const clstchname = getArray(reportData, ['clstchname', 'clsTchName', 'classTeacherName']);

    // Filter students based on selected student list from payload if available
    const selectedStudentIds = (reportData?.temp_Amstids || reportData?.studentList || []).map((s: any) => Number(s.amsT_Id ?? s.AMST_Id ?? s));
    
    let rawStudentsToRender = getstudentdetails.length > 0 ? getstudentdetails : [
        { AMST_Id: 1, studentname: 'Rohan Sharma', classname: 'Class 5', sectionname: 'A', admno: 'ADM101', asmaY_Year: '2025-2026' },
        { AMST_Id: 2, studentname: 'Ananya Verma', classname: 'Class 5', sectionname: 'A', admno: 'ADM102', asmaY_Year: '2025-2026' }
    ];

    if (selectedStudentIds.length > 0) {
        const filtered = rawStudentsToRender.filter((s: any) => selectedStudentIds.includes(Number(s.AMST_Id ?? s.amsT_Id)));
        if (filtered.length > 0) rawStudentsToRender = filtered;
    }

    const studentsToRender = rawStudentsToRender;

    // Filter exams based on selected exam list from payload if available
    const selectedExamIds = (reportData?.examlist || reportData?.examList || []).map((e: any) => Number(e.emE_Id ?? e.EME_Id ?? e));

    let rawTermList = getgroupexamdetails && getgroupexamdetails.length > 0 
        ? getgroupexamdetails 
        : Array.from(new Set((getstudentwisesubjectlist || []).map((s: any) => s.EME_Id || s.emE_Id)))
            .filter(Boolean)
            .map((id: any) => {
                const sub = getstudentwisesubjectlist.find((s: any) => (s.EME_Id || s.emE_Id) === id);
                return { emE_Id: id, emE_ExamName: sub?.EME_ExamName || sub?.emE_ExamName || `Exam ${id}` };
            });

    if (selectedExamIds.length > 0) {
        const filteredExams = rawTermList.filter((e: any) => selectedExamIds.includes(Number(e.emE_Id ?? e.EME_Id)));
        if (filteredExams.length > 0) rawTermList = filteredExams;
    }

    const termList = rawTermList;

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                    body {
                        visibility: hidden !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #progress-card-print-area,
                    #progress-card-print-area * {
                        visibility: visible !important;
                    }
                    #progress-card-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: #ffffff !important;
                    }
                    .no-print, header, nav, footer, sidebar, button {
                        display: none !important;
                    }
                    .report-page {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin-bottom: 20px !important;
                        display: block !important;
                    }
                    .table-custom {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .table-custom th, .table-custom td {
                        border: 1px solid #000000 !important;
                        padding: 6px !important;
                        font-size: 12px !important;
                    }
                }

                .report-container {
                    font-family: 'Poppins', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    background-color: transparent !important;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: center;
                    font-size: 13px;
                }
                
                .table-header {
                    background-color: #f9f9f9;
                    font-weight: 600;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                
                .blue-border-box {
                    border: 2px solid #3b82f6;
                    padding: 20px;
                    height: 100%;
                }
            `}} />

            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700'>
                    <Printer className='h-4 w-4' />
                    Print Cards
                </Button>
            </div>

            <div id='progress-card-print-area' className='report-container bg-white p-4 rounded-lg shadow-sm border'>
                {studentsToRender.map((report: any, index: number) => {
                    const studentId = report.AMST_Id || report.amsT_Id || Number(report.subject_wise_total_per);
                    
                    const studentName = report.studentname || report.studentName || report.amsT_FirstName || report.r_amst_id || `Student ${index + 1}`;
                    const className = report.classname || report.className || report.asmcL_ClassName || report.r_grporder || 'Class 5';
                    const sectionName = report.sectionname || report.sectionName || report.asmC_SectionName || report.r_emps_apptoresultflg || 'A';
                    const admNo = report.admno || report.admNo || report.amsT_AdmNo || report.r_isms_id || `ADM${101 + index}`;
                    const academicYear = report.asmaY_Year || '2025-2026';
                    const studentPhoto = report.r_eyces_marksdisplayflg || report.photo || 'https://vapsclg.blob.core.windows.net/files/27/StudentProfilePics/default.png';

                    // For TEMPLATE view
                    const studentAttendance = (getstudentwiseattendancedetails || []).filter((a: any) => (a.AMST_Id || a.amsT_Id) === studentId);

                    // For REPORT view
                    const studentSubjectsList = (getstudentwisesubjectlist || []).filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
                    
                    // Distinct subjects
                    const distinctSubjects = Array.from(new Set(studentSubjectsList.map((s: any) => s.ISMS_Id || s.ismS_Id)))
                        .map(id => studentSubjectsList.find((s: any) => (s.ISMS_Id || s.ismS_Id) === id))
                        .filter(Boolean);

                    const subjectsToDisplay = distinctSubjects.length > 0 ? distinctSubjects : [
                        { ISMS_Id: 101, ISMS_SubjectName: 'English' },
                        { ISMS_Id: 102, ISMS_SubjectName: 'Mathematics' },
                        { ISMS_Id: 103, ISMS_SubjectName: 'Science' },
                        { ISMS_Id: 104, ISMS_SubjectName: 'Social Studies' }
                    ];

                    return (
                        <div key={studentId + '-' + index} className="report-page mb-8">
                            {reportType === 'TEMPLATE' ? (
                                <div className="grid grid-cols-12 gap-6 p-2">
                                    {/* Left Side Details */}
                                    <div className="col-span-7 flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            {/* Attendance Table */}
                                            <div className="flex-1">
                                                <table className="table-custom">
                                                    <thead>
                                                        <tr>
                                                            <th className="table-header">ATTENDANCE</th>
                                                            {termList.map((exm: any, idx: number) => (
                                                                <th key={idx} className="table-header">{exm.emE_ExamName || exm.EME_ExamName}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="text-left font-medium">Days Present :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find((a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id);
                                                                return <td key={idx}>{att?.TOTALPRESENTDAYS || att?.PRESENTDAYS || '46'}</td>;
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td className="text-left font-medium">Total Days :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find((a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id);
                                                                return <td key={idx}>{att?.TOTALWORKINGDAYS || '50'}</td>;
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td className="text-left font-medium">Percentage :</td>
                                                            {termList.map((exm: any, idx: number) => {
                                                                const att = studentAttendance.find((a: any) => a.EME_Id === exm.emE_Id || a.EME_Id === exm.EME_Id);
                                                                return <td key={idx}>{att?.TOTALAttendancePercentage || att?.ATTENDANCEPERCENTAGE || '92%'}</td>;
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Promotion Image Block */}
                                            <div className="w-[200px] border border-gray-300 flex flex-col">
                                                <div className="bg-blue-50 flex-1 flex items-center justify-center p-2">
                                                    <Image 
                                                        src="https://vapsclg.blob.core.windows.net/files/27/promotion_kids.png" 
                                                        alt="Promotion" 
                                                        width={150} 
                                                        height={120} 
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="border-t border-gray-300 p-2 text-sm font-medium">
                                                    Promotion : Promoted
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Teacher's Remarks */}
                                        <div className="border border-gray-300 p-3 mt-4 h-32 text-sm text-gray-600 flex items-start">
                                            Teacher's Remarks: Excellent academic performance and active participation in class activities.
                                        </div>
                                        
                                        <div className="mt-auto pt-4">
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-center w-1/3">Class Teacher's Signature | date</td>
                                                        <td className="text-center w-1/3">Principal's Signature | date</td>
                                                        <td className="text-center w-1/3">Parent's Signature | date</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="pt-8 text-center w-1/3">T1</td>
                                                        <td className="pt-8 text-center">T1</td>
                                                        <td className="pt-8 text-center">T1</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="pt-8 text-center w-1/3">T2</td>
                                                        <td className="pt-8 text-center">T2</td>
                                                        <td className="pt-8 text-center">T2</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Right Side Cover Page */}
                                    <div className="col-span-5">
                                        <div className="blue-border-box flex flex-col items-center text-center relative h-[800px]">
                                            <Image 
                                                src="https://vapsclg.blob.core.windows.net/files/27/Logo02.jpg" 
                                                alt="Tunbridge High School" 
                                                width={100} 
                                                height={100}
                                                unoptimized
                                            />
                                            <h2 className="text-xl font-bold text-blue-900 mt-4 mb-2">TUNBRIDGE HIGH SCHOOL</h2>
                                            <p className="text-xs text-gray-700 mb-6 px-4">
                                                86/2, Infantry Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001
                                                KA025 (Affiliated to the Council for the Indian School Certificate Examinations, New Delhi)
                                            </p>
                                            
                                            <h3 className="text-lg font-bold mb-1">PERFORMANCE REPORT</h3>
                                            <h4 className="text-md font-bold mb-6">ACADEMIC YEAR : {academicYear}</h4>
                                            
                                            <div className="border-2 border-blue-400 p-1 mb-6">
                                                <Image 
                                                    src={studentPhoto} 
                                                    alt="Student Profile" 
                                                    width={120} 
                                                    height={150}
                                                    className="object-cover"
                                                    unoptimized
                                                    onError={(e: any) => { e.target.src = 'https://vapsclg.blob.core.windows.net/files/27/StudentProfilePics/default.png'; }}
                                                />
                                            </div>
                                            
                                            <div className="w-full text-left px-8 space-y-3 mt-4 text-sm font-medium">
                                                <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                    <span className="w-32">Name</span>
                                                    <span className="mr-2">:</span>
                                                    <span className="font-bold">{studentName}</span>
                                                </div>
                                                <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                    <span className="w-32">Admission No.</span>
                                                    <span className="mr-2">:</span>
                                                    <span className="font-bold">{admNo}</span>
                                                </div>
                                                <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                    <span className="w-32">Class & Section</span>
                                                    <span className="mr-2">:</span>
                                                    <span className="font-bold">{className} & {sectionName}</span>
                                                </div>
                                                <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                    <span className="w-32">Class Teacher</span>
                                                    <span className="mr-2">:</span>
                                                    <span className="font-bold">{clstchname && clstchname.length > 0 ? (Array.isArray(clstchname) ? clstchname.join(', ') : String(clstchname)) : 'Mrs. Radhika S'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="absolute bottom-4">
                                                <Image 
                                                    src="https://vapsclg.blob.core.windows.net/files/27/image_2024_03_15T08_35_44_566Z-removebg-preview (1).png" 
                                                    alt="Footer Decoration" 
                                                    width={200} 
                                                    height={100}
                                                    unoptimized
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2">
                                    <table className="table-custom">
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-left font-bold text-lg p-3">TUNBRIDGE HIGH SCHOOL</th>
                                                <th colSpan={termList.length || 2} className="text-right font-bold text-lg p-3">AY &nbsp; &nbsp; {academicYear}</th>
                                            </tr>
                                            <tr>
                                                <th className="table-header w-12" rowSpan={2}>#</th>
                                                <th className="table-header w-1/4" rowSpan={2}>FOCUS AREA</th>
                                                <th className="table-header w-1/4" rowSpan={2}>LEARNING OUTCOMES</th>
                                                {termList.map((exm: any, idx: number) => (
                                                    <th key={idx} className="table-header">{exm.emE_ExamName || exm.EME_ExamName}</th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="text-center bg-gray-50" colSpan={termList.length || 2}>
                                                    <div className="flex justify-center gap-6">
                                                        <span className="text-xl">🤩</span>
                                                        <span className="text-xl">😊</span>
                                                        <span className="text-xl">😃</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjectsToDisplay.map((sub: any, idx: number) => {
                                                const outcomesList = studentSubjectsList
                                                    .filter((s: any) => (s.ISMS_Id || s.ismS_Id) === (sub.ISMS_Id || sub.ismS_Id))
                                                    .map((s: any) => s.EMSE_SubExamName || s.emse_SubExamName || s.EMSS_SubSubjectName || s.emss_SubSubjectName || s.subExamName || s.subSubjectName || s.outcome || s.subExam)
                                                    .filter(Boolean);

                                                const outcomes = Array.from(new Set(outcomesList));
                                                if (outcomes.length === 0) {
                                                    outcomes.push(sub.ISMS_SubjectName || sub.isms_SubjectName || 'Basic Concepts & Skills');
                                                }

                                                return (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td className="text-left font-medium">{sub.ISMS_SubjectName || sub.isms_SubjectName}</td>
                                                        <td className="p-0 border-0">
                                                            <table className="w-full h-full border-hidden">
                                                                <tbody>
                                                                    {outcomes.map((outcome: any, oIdx: number) => (
                                                                        <tr key={oIdx}>
                                                                            <td className="border-0 border-b border-gray-300 last:border-0 p-2 text-left min-h-[40px]">
                                                                                {outcome}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        {termList.map((exm: any, eIdx: number) => (
                                                            <td key={eIdx} className="p-0 border-0">
                                                                <table className="w-full h-full border-hidden">
                                                                    <tbody>
                                                                        {outcomes.map((outcome: any, oIdx: number) => {
                                                                            const examData = studentSubjectsList.find((s: any) => 
                                                                                (s.ISMS_Id || s.ismS_Id) === (sub.ISMS_Id || sub.ismS_Id) && 
                                                                                (s.EME_Id === exm.emE_Id || s.EME_Id === exm.EME_Id || s.emE_Id === exm.emE_Id) &&
                                                                                (s.EMSE_SubExamName === outcome || s.emse_SubExamName === outcome || s.EMSS_SubSubjectName === outcome || outcome === sub.ISMS_SubjectName || outcome === 'Basic Concepts & Skills')
                                                                            );
                                                                            
                                                                            const markData = (getstudentmarksdetails || []).find((m: any) => 
                                                                                (m.AMST_Id || m.amsT_Id) === studentId &&
                                                                                (m.ISMS_Id || m.ismS_Id) === (sub.ISMS_Id || sub.ismS_Id) &&
                                                                                (m.EME_Id === exm.emE_Id || m.EME_Id === exm.EME_Id || m.emE_Id === exm.emE_Id)
                                                                            );

                                                                            const markVal = examData?.ESTMPSSS_ObtainedMarks ?? examData?.ObtainedMarks ?? markData?.ObtainedMarks ?? markData?.obtainedMarks ?? markData?.estmpssS_ObtainedMarks ?? markData?.ESTMPSSS_ObtainedMarks ?? (idx % 2 === 0 ? 1 : 2);

                                                                            let emoji = '😊';
                                                                            if (markVal === 1 || markVal >= 85 || String(markVal).toUpperCase() === 'A' || String(markVal).toUpperCase() === 'A+') emoji = '🤩';
                                                                            else if (markVal === 2 || markVal >= 70 || String(markVal).toUpperCase() === 'B') emoji = '😊';
                                                                            else if (markVal === 3 || markVal >= 50 || String(markVal).toUpperCase() === 'C') emoji = '😃';

                                                                            return (
                                                                                <tr key={oIdx}>
                                                                                    <td className="border-0 border-b border-gray-300 last:border-0 p-2 text-center min-h-[40px]">
                                                                                        {emoji && <span className="text-xl">{emoji}</span>}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ReportListProps {
    data: any;
    academicYear: string;
    performanceAnalysis: boolean;
    generatedDate?: Date;
}

export const ReportList = ({ data, academicYear, performanceAnalysis, generatedDate }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getstudentmarksdetails = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseactiviteslist = [],
        work_attendence = [],
        present_attendence = [],
        getinstitution = [],
    } = data;

    const getpromotionremarksdetails = data.getpromotionremarksdetails || data.getyearlist || [];
    const getstudentwiseskillslist = data.getstudentwiseskillslist || [];

    const rawActivities = useMemo(() => {
        if (getstudentwiseactiviteslist && getstudentwiseactiviteslist.length > 0) return getstudentwiseactiviteslist;
        return getstudentwiseskillslist.map((skill: any) => ({
            ...skill,
            ECACT_SkillName: skill.skillName || skill.ECACT_SkillName,
            ecacT_SkillName: skill.skillName || skill.ecacT_SkillName,
            ECACTA_SkillArea: skill.skillArea || skill.ECACTA_SkillArea,
            ecactA_SkillArea: skill.skillArea || skill.ecactA_SkillArea,
            EMGD_Name: skill.skillGrade || skill.EMGD_Name,
            emgD_Name: skill.skillGrade || skill.emgD_Name,
            ECACT_Id: skill.ecS_Id || skill.ecsA_Id || skill.ECACT_Id,
            ecacT_Id: skill.ecS_Id || skill.ecsA_Id || skill.ecacT_Id,
            ecT_Id: skill.ecT_Id
        }));
    }, [getstudentwiseactiviteslist, getstudentwiseskillslist]);

    const gettermdetails = useMemo(() => {
        let termList = data.gettermdetails || data.getTermDetails || [];
        if (termList.length === 0 && rawActivities.length > 0) {
            const uniqueEcTIds = Array.from(new Set(rawActivities.map((act: any) => String(act.ecT_Id || '')))).filter(Boolean);
            uniqueEcTIds.sort((a, b) => Number(a) - Number(b));
            termList = uniqueEcTIds.map((id, index) => {
                const actWithId = rawActivities.find((act: any) => String(act.ecT_Id) === id);
                const termName = actWithId?.ecT_TermName || actWithId?.termName ||
                    (index === 0 ? "MIDTERM EXAMINATION" : "ANNUAL EXAMINATION");
                return {
                    ecT_Id: Number(id),
                    ecT_TermName: termName
                };
            });
        }
        return termList;
    }, [data.gettermdetails, data.getTermDetails, rawActivities]);

    // Transformation Logic (Exact Parity with legacy JS)
    const { processedReports, groupwiseexamlist } = useMemo(() => {
        const fullGroupWiseExamList: any[] = [];

        getgroupdetails.forEach((grp: any) => {
            const tempExams: any[] = [];
            let counttotal = 0;
            getgroupexamdetails.forEach((d: any) => {
                if ((grp.empG_DistplayName || grp.EMPG_DistplayName) === (d.empG_DistplayName || d.EMPG_DistplayName)) {
                    counttotal += d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs || 0;
                    const exam = {
                        EMPG_GroupName: d.empG_GroupName || d.EMPG_GroupName,
                        EME_Id: d.emE_Id || d.EME_Id,
                        EME_ExamName: d.emE_ExamName || d.EME_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder || d.EME_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName || d.EMPG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode || d.examnamedisplay
                    };
                    tempExams.push(exam);
                    fullGroupWiseExamList.push(exam);
                }
            });

            const totalCol = {
                EMPG_GroupName: grp.empG_GroupName || grp.EMPG_GroupName,
                EME_Id: 9800000,
                EME_ExamName: "Total",
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: grp.empG_DistplayName || grp.EMPG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Total'
            };
            const gradeCol = {
                EMPG_GroupName: grp.empG_GroupName || grp.EMPG_GroupName,
                EME_Id: 9800001,
                EME_ExamName: "Grade",
                EME_ExamOrder: 9800001,
                EMPG_DistplayName: grp.empG_DistplayName || grp.EMPG_DistplayName,
                EMPSGE_ForMaxMarkrs: 0,
                examnamedisplay: "Grade"
            };

            tempExams.push(totalCol);
            tempExams.push(gradeCol);
            fullGroupWiseExamList.push(totalCol);
            fullGroupWiseExamList.push(gradeCol);

            grp.empsG_MarksValue = counttotal;
            grp.groupewiseexam = tempExams;
        });

        const reports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            // Student Wise Subject List
            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
            console.log("studentsubjects", studentsubjects)
            // Student Wise Discipline List (Main Areas)
            const activity_main_list_area: any[] = [];
            rawActivities.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    const skillName = act.ECACT_SkillName || act.ecacT_SkillName;
                    if (skillName && !activity_main_list_area.some(a => a.ECACT_SkillName === skillName)) {
                        activity_main_list_area.push({
                            ECACT_SkillName: skillName,
                            ECACT_Id: act.ECACT_Id || act.ecacT_Id
                        });
                    }
                }
            });

            // Student Wise Skills/Sub-Activities
            const activity_main_list: any[] = [];
            rawActivities.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    const skillArea = act.ECACTA_SkillArea || act.ecactA_SkillArea;
                    if (skillArea && !activity_main_list.some(a => a.ECACTA_SkillArea === skillArea)) {
                        activity_main_list.push({
                            ECACTA_SkillArea: skillArea,
                            ECACT_Id: act.ECACT_Id || act.ecacT_Id,
                            activity_score_details: []
                        });
                    }
                }
            });

            // Populate scores
            activity_main_list.forEach((act: any) => {
                const scores: any[] = [];
                gettermdetails.forEach((term: any) => {
                    rawActivities.forEach((dd: any) => {
                        const ddStudentId = dd.AMST_Id || dd.amsT_Id;
                        const ddSkillArea = dd.ECACTA_SkillArea || dd.ecactA_SkillArea;
                        const ddTermId = dd.ECT_Id || dd.ecT_Id;
                        const termId = term.ecT_Id || term.ECT_Id;

                        if (ddStudentId === studentId && act.ECACTA_SkillArea === ddSkillArea && termId === ddTermId) {
                            scores.push({ EMGD_Name: dd.EMGD_Name || dd.emgD_Name, ecT_Id: ddTermId });
                        }
                    });
                });
                act.activity_score_details = scores;
            });

            // Marks
            const studentmarks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);

            // Remarks
            const promo = getpromotionremarksdetails.find((d: any) => (d.AMST_Id || d.amsT_Id) === studentId);

            return {
                ...stu,
                studentsubjects,
                activity_main_list_area,
                activity_main_list,
                studentmarks,
                remarks: promo?.eprD_Remarks || promo?.EPRD_Remarks || '',
                promotedclass: promo?.eprD_ClassPromoted || promo?.EPRD_ClassPromoted || '',
                eprD_PromotionName: promo?.eprD_PromotionName || promo?.EPRD_PromotionName || '',
                workAttendance: work_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId),
                presentAttendance: present_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId),
                totalSchoolDays: stu.totalSchoolDays || stu.TotalSchoolDays,
                totalPresentDays: stu.totalPresentDays || stu.TotalPresentDays,
                total_Percentage: stu.total_Percentage || stu.Total_Percentage
            };
        });

        return { processedReports: reports, groupwiseexamlist: fullGroupWiseExamList };
    }, [data, rawActivities, gettermdetails, getpromotionremarksdetails]);

    const dynamicLogo = useMemo(() => {
        return getinstitution?.[0]?.mI_Logo || getinstitution?.[0]?.logo || getinstitution?.[0]?.asC_Logo_Path || 'https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/35f336e8-28d7-4fbe-94f6-4fdfd733ecf6.jpg';
    }, [getinstitution]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>Progress Card Report</title>
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/PrintPdf_Bootstrap.css">
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/printpdf.css">
                        <style>
                            @page { size: A4 portrait; margin: 10mm; }
                            body { font-family: 'Source Sans Pro', sans-serif !important; font-size: 13px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; page-break-after: always; background: white; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid black !important; }
                            .bg-gray { background-color: #BABABA !important; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .margin-top-20 { margin-top: 20px; }
                            .margin-top-50 { margin-top: 50px; }
                            .margin-top-100 { margin-top: 100px; }
                            table { width: 100%; border-collapse: collapse; }
                            td, th { padding: 4px; }
                            .grade-table th, .grade-table td { text-align: center; }
                            .photo-img { border: 1px solid black !important; margin-left: 72%; margin-top: -140px; position: relative; z-index: 10; }
                            .page-break-before-always { page-break-before: always !important; }
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

    if (processedReports.length === 0) return null;

    const reportDate = generatedDate ? new Date(generatedDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

    return (
        <div className="space-y-6">
            <style>{`
                .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; background: white; max-width: 1000px; margin-left: auto; margin-right: auto; font-family: 'Source Sans Pro', sans-serif; }
                .table-bordered td, .table-bordered th { border: 1px solid black !important; padding: 5px; }
                .bg-gray { background-color: #BABABA !important; color: black !important; }
                .photo-img { border: 1px solid black !important; margin-left: 72%; margin-top: -140px; position: relative; z-index: 10; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>

            <div className="flex justify-end no-print gap-4">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-gray-100 p-4">
                {processedReports.map((report: any, index: number) => {
                    // Extract obtained total marks (EME_Id === 9800000) for this student
                    const obtainedTotalMarks = report.studentmarks.filter((m: any) =>
                        Number(m.EME_Id || m.emE_Id) === 9800000
                    );

                    // Group marks by subject name
                    const groupedMarksBySubject: { [key: string]: { subject: string; terms: { [term: string]: number } } } = {};

                    obtainedTotalMarks.forEach((item: any) => {
                        const subjName = item.ISMS_SubjectName || item.ismS_SubjectName || '';
                        const termName = item.EMPSG_DisplayName || item.empG_DistplayName || '';
                        const obtained = Number(item.ObtainedMarks || item.obtainedMarks || 0);

                        if (!groupedMarksBySubject[subjName]) {
                            groupedMarksBySubject[subjName] = {
                                subject: subjName,
                                terms: {}
                            };
                        }
                        groupedMarksBySubject[subjName].terms[termName] = obtained;
                    });

                    const groupedMarksList = Object.values(groupedMarksBySubject);

                    // Identify all unique terms across all subjects
                    const uniqueTermsSet = new Set<string>();
                    groupedMarksList.forEach(item => {
                        Object.keys(item.terms).forEach(term => uniqueTermsSet.add(term));
                    });
                    const uniqueTerms = Array.from(uniqueTermsSet);

                    const termColors: { [key: string]: string } = {
                        "MIDTERM EXAMINATION": "#1cc405",  // Green
                        "ANNUAL EXAMINATION": "#770396",  // Purple
                    };
                    const fallbackColors = ['#FF5733', '#00c1e4', '#FFC300', '#C70039'];

                    const chartDatasets = uniqueTerms.map((term, tIdx) => ({
                        label: term,
                        data: groupedMarksList.map(item => item.terms[term] || 0),
                        backgroundColor: termColors[term] || fallbackColors[tIdx % fallbackColors.length],
                        borderColor: 'black',
                        borderWidth: 1
                    }));

                    const chartData = {
                        labels: groupedMarksList.map(item => item.subject),
                        datasets: chartDatasets
                    };

                    return (
                        <div key={index} id={`std_${report.AMST_Id || report.amsT_Id}`} className="mb-8">
                            <div className="pagelayout">
                                {/* First Page */}
                                {/* Header */}
                                <div className="row margin-top-5">
                                    <table align="center" className="w-full">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <img src={dynamicLogo} className="w-full" alt="Header Banner" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row mt-4">
                                    <h3 className="text-center text-xl font-bold">ACHIEVEMENT RECORD {academicYear}</h3>
                                </div>

                                {/* Student Profile */}
                                <div className="mt-4 space-y-1">
                                    {[
                                        { label: 'Name of the Student', value: report.studentname || report.studentName },
                                        { label: 'Admission Number', value: report.admno || report.admissionNo },
                                        { label: 'Class & Section', value: `${report.classname || report.className || ''} ${report.sectionname || report.sectionName || ''}` },
                                        { label: 'Date of Birth', value: report.dob },
                                        { label: 'Mother\'s Name', value: report.mothername || report.motherName },
                                        { label: 'Father\'s Name', value: report.fathername || report.fatherName },
                                    ].map((item, i) => (
                                        <div key={i} className="flex text-sm font-bold ml-[5%]">
                                            <div className="w-48">{item.label}</div>
                                            <div className="w-4 text-center">:</div>
                                            <div>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Photo */}
                                <img src={report.photo || report.photoName || report.AMST_Photoname || report.AMST_PhotoName} height="150" width="150" className="photo-img" alt="Student Photo" />

                                {/* Scholastic Report */}
                                <div className="mt-6">
                                    <h3 className="text-center font-bold text-lg mb-4">SCHOLASTIC REPORT</h3>
                                    <table className="table-bordered w-full text-[13px]">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th className="text-left"><b>Scholastic Areas(A)</b></th>
                                                {getgroupdetails.map((grp: any, i: number) => (
                                                    <th key={i} className="text-center font-bold" colSpan={grp.groupewiseexam?.length || 1}>
                                                        <b>{grp.empG_DistplayName || grp.EMPG_DistplayName}</b>
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr className="bg-gray">
                                                <th className="text-center"><b>Subject Name</b></th>
                                                {groupwiseexamlist.map((grpexam: any, i: number) => (
                                                    <th key={i} className="text-center font-bold">
                                                        {grpexam.EME_ExamName}
                                                        {grpexam.EMPSGE_ForMaxMarkrs > 0 && ` (${grpexam.EMPSGE_ForMaxMarkrs})`}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects.map((subj: any, sIdx: number) => {
                                                const isAppToResult = subj.appToResultFlg || subj.EMPS_AppToResultFlg || subj.empS_AppToResultFlg;
                                                const cellClass = (isAppToResult === 'true' || isAppToResult === true) ? "font-normal" : "font-bold";

                                                return (
                                                    <tr key={sIdx}>
                                                        <td className={`text-left p-1 ${cellClass}`}>{subj.subjectName}</td>
                                                        {groupwiseexamlist.map((grpexam: any, idx: number) => {
                                                            const mrks = report.studentmarks.find((m: any) =>
                                                                Number(subj.subjectId || subj.ISMS_Id || subj.ismS_Id) === Number(m.ISMS_Id || m.ismS_Id) &&
                                                                Number(grpexam.EME_Id || grpexam.emE_Id) === Number(m.EME_Id || m.emE_Id) &&
                                                                String(m.EMPSG_DisplayName || m.empG_DistplayName || '').trim().toUpperCase() === String(grpexam.EMPG_DistplayName || grpexam.empG_DistplayName || '').trim().toUpperCase()
                                                            );

                                                            if (!mrks) return <td key={idx} className="text-center p-1"></td>;

                                                            const isGradeCol = grpexam.EME_ExamName === 'Grade' || grpexam.EME_Id === 9800001;

                                                            return (
                                                                <td key={idx} className={`text-center p-1 ${cellClass}`}>
                                                                    {['AB', 'M', 'L'].includes(mrks.PassFailFlag || mrks.passFailFlag) ? (
                                                                        <span>
                                                                            {mrks.PassFailFlag || mrks.passFailFlag}
                                                                            {Number(mrks.ObtainedMarks || mrks.obtainedMarks) > 0 && !isGradeCol && ` (${mrks.ObtainedMarks || mrks.obtainedMarks})`}
                                                                        </span>
                                                                    ) : isGradeCol ? (
                                                                        <span>{mrks.ObtainedGrade || mrks.obtainedGrade}</span>
                                                                    ) : (
                                                                        <span>{mrks.ObtainedMarks || mrks.obtainedMarks}</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Grading Scale */}
                                <div className="mt-4">
                                    <h4 className="text-center font-bold underline text-md mb-2">SCHOLASTIC GRADING SCALE</h4>
                                    <table className="table-bordered w-full text-sm grade-table">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th className="text-center">Grade</th>
                                                <th>A1</th><th>A2</th><th>B1</th><th>B2</th><th>C1</th><th>C2</th><th>D</th><th>E</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="bg-gray font-bold">Mark</td>
                                                <td>91-100</td><td>81-90</td><td>71-80</td><td>61-70</td><td>51-60</td><td>41-50</td><td>33-40</td><td>0-32</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Graph */}
                                <div className="mt-6 flex flex-col items-center">
                                    <h4 className="text-center font-bold underline mb-2">STUDENT PERFORMANCE ANALYSIS</h4>
                                    <div className="w-[600px] h-[350px]">
                                        <Bar
                                            data={chartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { position: 'top' } },
                                                scales: {
                                                    y: { beginAtZero: true, max: 100 },
                                                    x: { ticks: { maxRotation: 0, minRotation: 0 } }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Page Break */}
                            <div className="page-break-before-always pagelayout">
                                {/* Second Page */}

                                {/* Co-Scholastic activities */}
                                {report.activity_main_list_area.length > 0 && (
                                    <div className="px-4">
                                        <h4 className="text-center font-bold underline uppercase mb-4">Co-Scholastic Activities</h4>
                                        {report.activity_main_list_area.map((acti: any, idx: number) => (
                                            <div key={idx} className="mb-6">
                                                <h4 className="text-center font-bold mb-2 uppercase">{acti.ECACT_SkillName}</h4>
                                                <table className="table-bordered w-full text-[13px] text-center">
                                                    <thead>
                                                        <tr className="bg-gray">
                                                            <th className="text-left"><b>Particulars</b></th>
                                                            {gettermdetails.map((cos: any, cidx: number) => (
                                                                <th key={cidx} className="text-center"><b>{cos.ecT_TermName}</b></th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {report.activity_main_list
                                                            .filter((subjco: any) => acti.ECACT_Id === subjco.ECACT_Id)
                                                            .map((subjco: any, sidx: number) => (
                                                                <tr key={sidx}>
                                                                    <td className="text-left font-bold">{subjco.ECACTA_SkillArea}</td>
                                                                    {gettermdetails.map((cos: any, cidx: number) => (
                                                                        <td key={cidx} className="text-center">
                                                                            {subjco.activity_score_details
                                                                                .filter((sc: any) => cos.ecT_Id === sc.ecT_Id)
                                                                                .map((sc: any, scIdx: number) => (
                                                                                    <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                                ))}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Health Status */}
                                <div className="mt-8">
                                    <h4 className="text-center font-bold underline mb-2 uppercase">HEALTH STATUS</h4>
                                    <table className="table-bordered w-full text-center text-sm">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th>Height (in cm)</th>
                                                <th>Weight (in kg)</th>
                                                <th>Blood Group</th>
                                                <th>Dental Hygiene</th>
                                                <th>Vision ( Right & Left )</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-bold">{report.height || report.SPCCSHW_Height || report.AMST_height || report.AMST_Height || '-'}</td>
                                                <td className="font-bold">{report.weight || report.SPCCSHW_Weight || report.AMST_Weight || '-'}</td>
                                                <td className="font-bold">{report.bloodGroup || report.AMST_BloodGroup || '-'}</td>
                                                <td>{report.dentalHygiene || report.HMDNHY_DentalHygiene || '-'}</td>
                                                <td>{report.visionHygiene || report.HMVSN_VisionHygiene || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance Details */}
                                <div className="mt-8">
                                    <h4 className="text-center font-bold underline mb-2 uppercase">ATTENDANCE DETAILS</h4>
                                    <table className="table-bordered w-full text-center text-sm grade-table">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray">Total number of working days</th>
                                                <td className="w-24 font-bold">{report.totalSchoolDays || report.workAttendance?.TotalSchoolDays || report.workAttendance?.totalSchoolDays || ''}</td>
                                                <th className="bg-gray">Number of days attended</th>
                                                <td className="w-24 font-bold">{report.totalPresentDays || report.presentAttendance?.TotalPresentDays || report.presentAttendance?.totalPresentDays || ''}</td>
                                                <th className="bg-gray">Attendance Percentage</th>
                                                <td className="w-24 font-bold">
                                                    {report.total_Percentage !== undefined && report.total_Percentage !== null
                                                        ? `${report.total_Percentage}`
                                                        : report.presentAttendance?.Total_Percentage !== undefined && report.presentAttendance?.Total_Percentage !== null
                                                            ? `${report.presentAttendance.Total_Percentage}`
                                                            : report.presentAttendance?.total_Percentage !== undefined && report.presentAttendance?.total_Percentage !== null
                                                                ? `${report.presentAttendance.total_Percentage}`
                                                                : ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Results & Remarks */}
                                <div className="mt-8">
                                    <table className="table-bordered w-full text-left text-sm grade-table">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray w-48 uppercase">RESULTS</th>
                                                <th className="font-bold text-left p-2">{report.eprD_PromotionName || '-'}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className="mt-24">
                                    <div className="flex justify-between items-end w-full px-4">
                                        <div className="flex flex-col items-center">
                                            <img
                                                style={{ width: '150px' }}
                                                src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg"
                                                alt="Principal Sign"
                                                className="mb-2"
                                            />
                                            <strong>Principal’s Signature</strong>
                                        </div>
                                        <div className="flex flex-col items-center pb-2">
                                            <img
                                                style={{ width: '250px' }}
                                                src="https://vapsclg.blob.core.windows.net/files/48/principalsign/784d4684-1a0f-412d-b95f-779b0d2f73e7.jpg"
                                                alt="Institution Seal"
                                                className="mb-2"
                                            />
                                            <strong>Institution Seal</strong>
                                        </div>
                                        <div className="flex flex-col items-end pb-2">
                                            <strong>Class Teacher’s Signature</strong>
                                            <b className="mt-1">Date: {reportDate}</b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

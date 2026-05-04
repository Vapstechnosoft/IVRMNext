'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Consolidated Final Report',
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    const exportToExcel = () => {
        const table = document.getElementById('report-table');
        if (!table) return;

        const wb = XLSX.utils.table_to_book(table, { raw: true });
        XLSX.writeFile(wb, 'Consolidated_Final_Report.xlsx');
    };

    // Derived data mapping based on angular logic
    console.log("DATA KEYS", Object.keys(data));
    const getstudentwisesubjectlistnew = data.getstudentwisesubjectlistnew || data.getstudentwisesubjectlist || [];

    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getexamdetails = [],
        getgroupexamdetails = [],
        getstudentwiseattendancedetails = [],
        getexamwisetotaldetails = [],
        asmaY_Year = '',
        asmcL_ClassName = '',
        asmC_SectionName = ''
    } = data;

    // Extend exam details with 'Final Average' like Angular controller does
    const extendedExamDetails = [
        ...getexamdetails,
        { empG_GroupName: "Final Average", empsG_Order: 10001, empG_DistplayName: "FI" }
    ];

    const extendedGroupExamDetails = [
        ...getgroupexamdetails,
        { empG_GroupName: "Final Average", emE_Id: 50001, emE_ExamName: "Final Average", empG_DistplayName: "FI" }
    ];

    // Map the relationships
    const studentListWithDetails = getstudentdetails.map((stu: any) => {
        const studentAmstId = stu.AMST_Id ?? stu.amsT_Id;
        const studentSubjects = getstudentwisesubjectlistnew
            .filter((sub: any) => parseInt(studentAmstId) === parseInt(sub.AMST_Id ?? sub.amsT_Id))
            .map((sub: any) => ({
                ISMS_SubjectName: sub.subjectname,
                ISMS_Id: sub.subid,
                EYCES_AplResultFlg: sub.EYCES_AplResultFlg,
                subjectorder: sub.subjectorder
            }));

        const studentMarks = getstudentmarksdetails.filter((subd: any) => parseInt(studentAmstId) === parseInt(subd.AMST_Id ?? subd.amsT_Id));
        const studentMarksTotal = getexamwisetotaldetails.filter((su: any) => parseInt(studentAmstId) === parseInt(su.AMST_Id ?? su.amsT_Id));
        const studentAttendance = getstudentwiseattendancedetails.filter((d: any) => parseInt(studentAmstId) === parseInt(d.AMST_Id ?? d.amsT_Id));

        // Process house name
        const houseName = stu.SPCCMH_HouseName ?? stu.spccmH_HouseName;
        const shortHouseName = houseName
            ? houseName.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('')
            : '';

        return {
            ...stu,
            rollno: stu.rollno ?? stu.rollNo,
            studentname: stu.studentname ?? stu.studentName,
            regno: stu.regno ?? stu.regNo,
            subjects: studentSubjects,
            marks: studentMarks,
            markstotal: studentMarksTotal,
            attendance: studentAttendance,
            shortHouseName: shortHouseName
        };
    });

    const getstudentwisesubjectlist = data.getstudentwisesubjectlist || data.getstudentwisesubjectlistnew || [];

    const cleanLabel = (text: string) => {
        return text ? text.replace(/[\r\n]+/g, ' ').trim() : '';
    };

    // Build distinct subjects from BOTH the subject list and the marks list to ensure NO subjects are missed
    const subjectMap = new Map();

    // First, add all subjects from the subject list
    getstudentwisesubjectlist.forEach((sub: any) => {
        const id = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
        if (id && id !== 'undefined' && id !== 'null') subjectMap.set(id, sub);
    });

    // Then, add any missing subjects found in the marks array
    getstudentmarksdetails.forEach((mark: any) => {
        const id = String(mark.ismS_Id ?? mark.ISMS_Id);
        if (id && id !== 'undefined' && id !== 'null' && !subjectMap.has(id)) {
            subjectMap.set(id, {
                subid: id,
                ismS_Id: id,
                subjectname: mark.ismS_SubjectName ?? mark.ISMS_SubjectName,
                EYCES_AplResultFlg: mark.empS_AppToResultFlg ?? mark.EYCES_AplResultFlg,
                subjectorder: mark.empS_SubjOrder ?? mark.subjectgrporder
            });
        }
    });

    const distinctSubjects = Array.from(subjectMap.values()).sort((a: any, b: any) => {
        const orderA = a.subjectorder ?? a.empS_SubjOrder ?? 9999;
        const orderB = b.subjectorder ?? b.empS_SubjOrder ?? 9999;
        return orderA - orderB;
    });

    const subjectsWithResultFlag = distinctSubjects.filter((sub: any) => {
        const flag = sub.EYCES_AplResultFlg ?? sub.eyceS_AplResultFlg ?? sub.eyces_aplresultflg ?? sub.EYCES_MarksDisplayFlg ?? sub.empS_AppToResultFlg;
        return flag === true || flag === 1 || flag === 'true' || flag === '1' || flag === 'Y' || flag === 'y';
    });

    console.log("Subjects with result flag", subjectsWithResultFlag);

    // Anything that doesn't strictly have a 'true' flag goes into WithoutResultFlag, ensuring NO subjects vanish
    const subjectsWithoutResultFlag = distinctSubjects.filter((sub: any) => {
        const flag = sub.EYCES_AplResultFlg ?? sub.eyceS_AplResultFlg ?? sub.eyces_aplresultflg ?? sub.EYCES_MarksDisplayFlg ?? sub.empS_AppToResultFlg;
        return !(flag === true || flag === 1 || flag === 'true' || flag === '1' || flag === 'Y' || flag === 'y');
    });

    console.log("Subjects without result flag", subjectsWithoutResultFlag);

    return (
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <style>
                {`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    text-align: center;
                    white-space: nowrap;
                }
                `}
            </style>
            <div className='mb-6 flex items-center justify-between no-print'>
                <h2 className='text-lg font-semibold'>Progress Card Report</h2>
                <div className='flex gap-2'>
                    <Button variant='outline' onClick={() => handlePrint()} className='gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                    <Button variant='outline' onClick={exportToExcel} className='gap-2'>
                        <Download className='h-4 w-4' /> Excel
                    </Button>
                </div>
            </div>

            <div className='overflow-x-auto overflow-y-auto' style={{ maxHeight: '80vh' }}>
                <div ref={printRef} className='p-4 min-w-[1200px]'>
                    <div className="text-center mb-4">
                        <h5 className="font-bold text-xl">CONSOLIDATED FINAL REPORT</h5>
                    </div>

                    <div className="flex justify-between uppercase mb-4 font-bold text-sm">
                        <div>
                            <label>CLASS & SEC : {asmcL_ClassName}-{asmC_SectionName}</label>
                        </div>
                        <div>
                            <label>ACADEMIC YEAR : {asmaY_Year}</label>
                        </div>
                    </div>

                    <table id="report-table" className="w-full border-collapse border border-black text-sm">
                        <thead>
                            <tr>
                                <th className="border border-black p-1 vertical-text h-[200px] w-12 align-middle">
                                    <b>Roll Number</b>
                                </th>
                                <th className="border border-black p-1 h-[200px] align-middle w-48">
                                    <b>NAME</b>
                                </th>
                                <th className="border border-black p-1 vertical-text align-middle">
                                    <b>Reg.No.</b>
                                </th>
                                <th className="border border-black p-1 vertical-text align-middle">
                                    <b>House</b>
                                </th>
                                <th className="border border-black p-1 vertical-text align-middle">
                                    <b>Term</b>
                                </th>
                                {subjectsWithResultFlag.map((col: any, idx: number) => (
                                    <th key={`sub-true-${idx}`} className="border border-black p-1 vertical-text align-middle">
                                        <b>{cleanLabel(col.subjectname || col.ISMS_SubjectName || col.ismS_SubjectName)}</b>
                                    </th>
                                ))}
                                {subjectsWithoutResultFlag.map((col: any, idx: number) => (
                                    <th key={`sub-false-${idx}`} className="border border-black p-1 vertical-text align-middle">
                                        <b>{cleanLabel(col.subjectname || col.ISMS_SubjectName || col.ismS_SubjectName)}</b>
                                    </th>
                                ))}
                                <th className="border border-black p-1 vertical-text align-middle"><b>Total</b></th>
                                <th className="border border-black p-1 vertical-text align-middle"><b>Grand Total</b></th>
                                <th className="border border-black p-1 vertical-text align-middle"><b>Percentage</b></th>
                                <th className="border border-black p-1 vertical-text align-middle"><b>Rank</b></th>
                                <th className="border border-black p-1 vertical-text align-middle"><b>Attendance</b></th>
                                <th className="border border-black p-1 align-middle min-w-[200px]"><b>Remarks</b></th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentListWithDetails.map((mn: any, studentIdx: number) => {
                                return (
                                    <React.Fragment key={`student-${studentIdx}`}>
                                        {extendedExamDetails.length > 0 && (
                                            <>
                                                <tr>
                                                    <td className="border border-black text-center font-bold text-lg" rowSpan={extendedExamDetails.length + 1}>
                                                        {mn.rollno}
                                                    </td>
                                                    <td className="border border-black px-2 text-left font-bold text-lg" rowSpan={extendedExamDetails.length + 1}>
                                                        {mn.studentname}
                                                    </td>
                                                    <td className="border border-black text-center font-bold text-lg vertical-text" rowSpan={extendedExamDetails.length + 1}>
                                                        {mn.regno}
                                                    </td>
                                                    <td className="border border-black text-center font-bold text-lg" rowSpan={extendedExamDetails.length + 1}>
                                                        {mn.shortHouseName}
                                                    </td>
                                                </tr>
                                                {extendedExamDetails.map((grp: any, grpIdx: number) => (
                                                    <tr key={`grp-${studentIdx}-${grpIdx}`}>
                                                        <td className="border border-black p-1 font-bold">
                                                            {grp.empG_DistplayName}
                                                        </td>

                                                        {subjectsWithResultFlag.map((sub: any, subIdx: number) => {
                                                            const markObj = mn.marks.find((m: any) => {
                                                                const mSubId = String(m.ismS_Id ?? m.ISMS_Id);
                                                                console.log("mSubId>>>>", mSubId);
                                                                const subId = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
                                                                console.log("subId>>>>", subId);

                                                                const mGroup = (m.empsG_GroupName ?? m.EMPSG_GroupName ?? m.empsg_groupname ?? '').toString().trim().toLowerCase();
                                                                console.log("mGroup>>>>", mGroup);
                                                                const grpGroup = (grp.empG_GroupName ?? grp.EMPG_GroupName ?? grp.empsG_GroupName ?? grp.EMPSG_GroupName ?? '').toString().trim().toLowerCase();
                                                                console.log("grpGroup>>>>", grpGroup);
                                                                const mSubName = (m.ismS_SubjectName ?? m.ISMS_SubjectName ?? '').toString().trim().toLowerCase();
                                                                console.log("mSubName>>>>", mSubName);
                                                                const subName = (sub.subjectname ?? sub.ISMS_SubjectName ?? sub.ismS_SubjectName ?? '').toString().trim().toLowerCase();
                                                                console.log("subName>>>>", subName);
                                                                // Match exactly like legacy: subid == ISMS_Id && empG_GroupName == EMPSG_GroupName && ISMS_SubjectName == subjectname
                                                                return mSubId === subId && mGroup === grpGroup && mSubName === subName;


                                                            });
                                                            const obtMarks = markObj?.estmppsG_GroupObtMarks ?? markObj?.ESTMPPSG_GroupObtMarks;
                                                            console.log("obtMarks>>>>", obtMarks);
                                                            return (
                                                                <td key={`mark-true-${subIdx}`} className="border border-black p-1 text-center font-bold text-base">
                                                                    {markObj ? (
                                                                        obtMarks !== 0 ? obtMarks : 'AB'
                                                                    ) : ''}
                                                                </td>
                                                            );
                                                        })}

                                                        {subjectsWithoutResultFlag.map((sub: any, subIdx: number) => {
                                                            const markObj = mn.marks.find((m: any) => {
                                                                const mSubId = String(m.ismS_Id ?? m.ISMS_Id);
                                                                const subId = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);

                                                                const mGroup = (m.empsG_GroupName ?? m.EMPSG_GroupName ?? m.empsg_groupname ?? '').toString().trim().toLowerCase();
                                                                const grpGroup = (grp.empG_GroupName ?? grp.EMPG_GroupName ?? grp.empsG_GroupName ?? grp.EMPSG_GroupName ?? '').toString().trim().toLowerCase();

                                                                const mSubName = (m.ismS_SubjectName ?? m.ISMS_SubjectName ?? '').toString().trim().toLowerCase();
                                                                const subName = (sub.subjectname ?? sub.ISMS_SubjectName ?? sub.ismS_SubjectName ?? '').toString().trim().toLowerCase();

                                                                return mSubId === subId && mGroup === grpGroup && mSubName === subName;
                                                            });

                                                            let displayValue = '';
                                                            if (markObj) {
                                                                const obtGrade = markObj.estmppsG_GroupObtGrade || markObj.ESTMPPSG_GroupObtGrade || '';
                                                                const obtMarks = markObj.estmppsG_GroupObtMarks ?? markObj.ESTMPPSG_GroupObtMarks ?? '';
                                                                const gradeDisplay = markObj.gradedisplay ?? markObj.Gradedisplay;
                                                                const marksDisplay = markObj.marksdispaly ?? markObj.Marksdispaly;

                                                                if (sub.ISMS_SubjectCode !== 'CCA') {
                                                                    if (gradeDisplay === 1) {
                                                                        displayValue = obtGrade;
                                                                    } else if (marksDisplay === 1) {
                                                                        displayValue = obtMarks;
                                                                    }
                                                                } else {
                                                                    displayValue = obtMarks;
                                                                }
                                                            }

                                                            return (
                                                                <td key={`mark-false-${subIdx}`} className="border border-black p-1 text-center font-bold text-base">
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}

                                                        <td className="border border-black p-1 text-center font-bold text-base">
                                                            {mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.TOTALOBTAINEDMARKS ?? mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.totalobtainedmarks ?? ''}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-bold text-base">
                                                            {mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.GRANDTOTALOBRAINEDMARKS ?? mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.grandtotalobrainedmarks ?? ''}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-bold text-base">
                                                            {mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.PERCENTAGEOBTAINED ?? mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.percentageobtained ?? ''}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-bold text-base">
                                                            {mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.POSITION ?? mn.markstotal.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.position ?? ''}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-bold text-base">
                                                            {mn.attendance.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.PERCENTAGEOBTAINED ?? mn.attendance.find((mt: any) => (mt.GROUPNAME || mt.groupname) === (grp.empG_GroupName || grp.empsG_GroupName || grp.EMPG_GroupName || grp.EMPSG_GroupName))?.percentageobtained ?? ''}
                                                        </td>
                                                        <td className="border border-black p-1">
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
};

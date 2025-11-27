// app/exam/electives-report/_components/elective-print-view.tsx
'use client';

import type { ElectiveGroup, StudentRow } from '@/types/exam/exam-module/report';

interface ElectiveReportPrintViewProps {
    students: StudentRow[];
    groupList: ElectiveGroup[];
    showMobile?: boolean;
    showEmail?: boolean;
}

export default function ElectiveReportPrintView({
    students,
    groupList,
    showMobile = false,
    showEmail = false
}: ElectiveReportPrintViewProps) {
    // Helper to get subjects string safely
    const getSubjectsForGroup = (student: StudentRow, groupName: string): string => {
        const match = student.sub_list.find((s) => s.emG_GroupName === groupName);
        if (!match || !match.ismS_SubjectName || match.ismS_SubjectName === '@#$%^&') {
            return '-';
        }
        return match.ismS_SubjectName;
    };

    return (
        <>
            <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 1cm; }
          body * { visibility: hidden; }
          #elective-printable, #elective-printable * { visibility: visible; }
          #elective-printable { position: absolute; left: 0; top: 0; width: 100%; }
          
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            font-size: 11px !important; 
          }
          th, td { 
            border: 0.5px solid #333 !important; 
            padding: 6px 4px !important; 
            text-align: center !important; 
            vertical-align: middle !important;
          }
          th { 
            background-color: #f0f0f0 !important; 
            font-weight: bold !important;
            font-size: 11.5px !important;
          }
          .text-left { text-align: left !important; }
          .no-data { color: #999; font-style: italic; }
          h3 { margin: 10px 0; font-size: 18px; }
          h5 { margin: 5px 0; font-size: 14px; }
        }
        @media screen {
          #elective-printable { display: none !important; }
        }
      `}</style>

            <div id='elective-printable'>
                <div className='p-6'>
                    <div className='mb-4 text-center'>
                        <h3>ELECTIVE SUBJECTS REPORT</h3>
                    </div>

                    <table className='table-bordered'>
                        <thead>
                            <tr>
                                <th rowSpan={2}>Sl.No</th>
                                <th rowSpan={2} style={{ minWidth: '160px' }}>
                                    Student Name
                                </th>
                                {showMobile && <th rowSpan={2}>Mobile No</th>}
                                {showEmail && <th rowSpan={2}>Email ID</th>}
                                <th rowSpan={2}>Class</th>
                                <th rowSpan={2}>Section</th>
                                {groupList.map((group) => (
                                    <th key={group.emG_Id} style={{ minWidth: '140px' }}>
                                        {group.emG_GroupName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6 + (showMobile ? 1 : 0) + (showEmail ? 1 : 0) + groupList.length}
                                        className='py-8 text-center'>
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, index) => (
                                    <tr key={student.amsT_Id}>
                                        <td>{index + 1}</td>
                                        <td className='text-left' style={{ paddingLeft: '8px' }}>
                                            {student.amsT_FirstName}
                                        </td>
                                        {showMobile && <td>{student.amsT_MobileNo || 0}</td>}
                                        {showEmail && <td style={{ fontSize: '10px' }}>{student.amsT_emailId || ''}</td>}
                                        <td>{student.asmcL_ClassName}</td>
                                        <td>{student.asmC_SectionName}</td>
                                        {groupList.map((group) => {
                                            const subjects = getSubjectsForGroup(student, group.emG_GroupName);
                                            return (
                                                <td key={group.emG_Id}>
                                                    {subjects === '' ? <span className='no-data'>-</span> : subjects}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import type { ElectiveGroup, StudentRow } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';

interface ElectiveReportGridViewProps {
    students: StudentRow[];
    groupList: ElectiveGroup[];
    showMobile: boolean;
    showEmail: boolean;
    onPrint?: () => void;
}

export default function ElectiveReportGridView({
    students,
    groupList,
    showMobile,
    showEmail,
    onPrint,
}: ElectiveReportGridViewProps) {
    return (
        <div className="mt-8 print:hidden">
            {/* Controls */}
            <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b-2 border-orange-500 bg-orange-50 px-4 py-3 mb-4">
                <div className="flex gap-3">
                    <Button onClick={onPrint} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Table with ORANGE headers */}
            <div className="overflow-x-auto rounded-lg border-2 border-orange-600 shadow-sm">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold">
                            <th className="border border-orange-700 px-4 py-3 text-center">SL.No</th>
                            <th className="border border-orange-700 px-6 py-3 text-left">Student Name</th>
                            {showMobile && <th className="border border-orange-700 px-4 py-3">Mobile No</th>}
                            {showEmail && <th className="border border-orange-700 px-4 py-3">Email-Id</th>}
                            <th className="border border-orange-700 px-4 py-3">Class</th>
                            <th className="border border-orange-700 px-4 py-3">Section</th>

                            {/* Elective Groups - Orange Headers */}
                            {groupList && groupList.length > 0 ? (
                                groupList.map((grp) => (
                                    <th
                                        key={grp.emG_Id}
                                        className="border border-orange-700 px-5 py-3 min-w-40 font-semibold whitespace-normal bg-orange-600"
                                    >
                                        {grp.emG_GroupName || 'No Name'}
                                    </th>
                                ))
                            ) : (
                                <th className="border border-orange-700 px-4 py-3 bg-orange-600 text-yellow-100">
                                    No Groups Available
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={6 + (showMobile ? 1 : 0) + (showEmail ? 1 : 0) + groupList.length} className="text-center py-12 text-gray-500 text-lg">
                                    No students found for the selected criteria
                                </td>
                            </tr>
                        ) : (
                            students.map((stud, idx) => (
                                <tr key={stud.amsT_Id} className="hover:bg-orange-50 transition-colors">
                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{idx + 1}</td>
                                    <td className="border border-gray-300 px-6 py-2 text-left font-semibold text-gray-800">
                                        {stud.amsT_FirstName}
                                    </td>
                                    {showMobile && (
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            {stud.amsT_MobileNo || '-'}
                                        </td>
                                    )}
                                    {showEmail && (
                                        <td className="border border-gray-300 px-4 py-2 text-center text-xs break-all">
                                            {stud.amsT_emailId || '-'}
                                        </td>
                                    )}
                                    <td className="border border-gray-300 px-4 py-2 text-center">{stud.asmcL_ClassName}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{stud.asmC_SectionName}</td>

                                    {/* Subject Cells */}
                                    {groupList.map((grp) => {
                                        const subjects =
                                            stud.sub_list
                                                .filter((s) => s.emG_GroupName === grp.emG_GroupName)
                                                .map((s) => s.ismS_SubjectName || '-')
                                                .filter(Boolean)
                                                .join(', ') || '-';

                                        return (
                                            <td
                                                key={grp.emG_Id}
                                                className="border border-gray-300 px-4 py-2 text-left text-gray-700"
                                            >
                                                {subjects}
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
    );
}
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

export default function ElectiveReportGridView({ students, groupList, showMobile, showEmail, onPrint }: ElectiveReportGridViewProps) {
    return (
        <div className='mt-8 print:hidden'>
            {/* Controls */}
            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
            <div className='no-print flex flex-wrap items-center justify-between gap-4 border-b-2 border-orange-400 bg-orange-50 px-4 py-3 mb-4'>
                <div className='flex gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-blue-600 hover:bg-blue-700'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto rounded border-2 border-blue-800'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-blue-800 text-white'>
                            <th className='border border-blue-900 px-3 py-3'>SL.No</th>
                            <th className='border border-blue-900 px-6 py-3 text-left'>Student Name</th>
                            {showMobile && <th className='border border-blue-900 px-4 py-3'>Mobile No</th>}
                            {showEmail && <th className='border border-blue-900 px-4 py-3'>Email-Id</th>}
                            <th className='border border-blue-900 px-4 py-3'>Class</th>
                            <th className='border border-blue-900 px-4 py-3'>Section</th>
                            {groupList.map((grp) => (
                                // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                <th key={grp.emG_Id} className='border border-blue-900 px-4 py-3 min-w-40'>
                                    {grp.emG_GroupName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((stud, idx) => (
                            <tr key={stud.amsT_Id} className='hover:bg-gray-50'>
                                <td className='border border-gray-400 px-3 py-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-400 px-6 py-2 text-left font-medium'>{stud.amsT_FirstName}</td>
                                {showMobile && <td className='border border-gray-400 px-4 py-2 text-center'>{stud.amsT_MobileNo || 0}</td>}
                                {showEmail && (
                                    // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                    <td className='border border-gray-400 px-4 py-2 text-center break-all'>{stud.amsT_emailId || ''}</td>
                                )}
                                <td className='border border-gray-400 px-4 py-2 text-center'>{stud.asmcL_ClassName}</td>
                                <td className='border border-gray-400 px-4 py-2 text-center'>{stud.asmC_SectionName}</td>
                                {groupList.map((grp) => {
                                    const subjects =
                                        stud.sub_list
                                            .filter((s) => s.emG_GroupName === grp.emG_GroupName)
                                            .map((s) => s.ismS_SubjectName)
                                            .join(', ') || '';
                                    return (
                                        <td key={grp.emG_Id} className='border border-gray-400 px-4 py-2 text-left'>
                                            {subjects}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

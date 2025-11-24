// app/exam/cumulative-report/_components/cumulative-report-grid-view.tsx
import { Button } from '@/components/ui/button';
import type { ICumulativeReport, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useState } from 'react';

interface CumulativeReportGridViewProps {
    reportData: ICumulativeReport[];
    subjects: ISubject[];
    headerInfo: Partial<IReportHeader>;
    columnFlags: {
        admno: boolean;
        regno: boolean;
        rollno: boolean;
        classrank: boolean;
        sectionrank: boolean;
        attendancedispaly: boolean;
    };
    onPrint: () => void;
    // Optional: you can pass initial size from parent, otherwise defaults to 10
    initialSize?: string;
}

export default function CumulativeReportGridView({
    reportData,
    subjects,
    headerInfo,
    columnFlags,
    onPrint,
    initialSize = '10'
}: CumulativeReportGridViewProps) {
    // Local state to control font size (fixes the React warning)
    const [size, setSize] = useState(initialSize);

    // Map selected value → Tailwind class
    const fontSizeClass =
        {
            '8': 'text-xs',
            '9': 'text-xs',
            '10': 'text-sm',
            '11': 'text-base',
            '12': 'text-base',
            '14': 'text-lg',
            '16': 'text-xl',
            '18': 'text-2xl',
            '20': 'text-3xl'
        }[size] || 'text-sm';

    return (
        <div className={`screen-only ${fontSizeClass}`}>
            {/* Font Size Selector – now fully controlled (no React warning) */}
            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
            <div className='form-group mb-4 no-print flex items-center gap-3'>
                <span className='control-label font-medium'>Font Size :</span>
                <div>
                    <select
                        // biome-ignore lint/nursery/useSortedClasses: <explanation>
                        className='form-control border rounded px-3 py-1 text-sm'
                        id='sel125'
                        value={size}
                        onChange={(e) => setSize(e.target.value)} // Fixed React warning
                    >
                        <option value=''>Select Font Size</option>
                        <option value='8'>8px</option>
                        <option value='9'>9px</option>
                        <option value='10'>10px</option>
                        <option value='11'>11px</option>
                        <option value='12'>12px</option>
                        <option value='14'>14px</option>
                        <option value='16'>16px</option>
                        <option value='18'>18px</option>
                        <option value='20'>20px</option>
                    </select>
                </div>
            </div>

            {/* Header Bar */}
            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
            <div className='no-print bg-orange-100 border-b-2 border-orange-400 px-4 py-2 flex justify-between items-center text-sm'>
                <span>GRID VIEW</span>
                <div className='flex items-center gap-3'>
                    {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                    <Button onClick={onPrint} size='sm' className='bg-blue-600 hover:bg-blue-700 text-sm'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className='mt-6'>
                {/* Report Header */}
                {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                <div className='text-center mb-4'>
                    {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                    <h3 className='text-xl text-blue-900'>{headerInfo.mI_name || 'VIDYA VIKASA VIDYA SAMSTHE (R)'}</h3>
                    {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                    <h5 className='text-lg text-blue-800 mt-1'>CLASS WISE CUMULATIVE REPORT</h5>
                    <div className='mt-2'>
                        <strong>Academic Year :</strong> {headerInfo.yr}
                    </div>
                    <div className='-ml-12 md:-ml-16'>
                        <strong>Class & Sec :</strong> {headerInfo.cla} - {headerInfo.sec}
                    </div>

                    {/* Exam – shifted right */}
                    <div className='ml-20 md:ml-24'>
                        <strong>Exam :</strong> {headerInfo.exmmid}
                    </div>
                </div>

                {/* Marks Table */}
                <div className='overflow-x-auto border-2 border-blue-800'>
                    <table className='w-full border-collapse'>
                        <thead>
                            <tr className='bg-blue-800 text-white'>
                                <th className='border border-blue-900 px-2 py-3'>Sl No</th>
                                <th className='border border-blue-900 px-4 py-3 text-left'>Student Name</th>
                                {columnFlags.rollno && <th className='border border-blue-900 px-3 py-3'>Roll No</th>}
                                {subjects
                                    .filter((s) => s.eyceS_AplResultFlg)
                                    .map((subj) => (
                                        <th key={subj.ismS_Id} className='border border-blue-900 px-3 py-3'>
                                            {subj.ismS_SubjectName}
                                        </th>
                                    ))}
                                <th className='border border-blue-900 px-3 py-3'>Total</th>
                                <th className='border border-blue-900 px-3 py-3'>Obtained</th>
                                <th className='border border-blue-900 px-3 py-3'>%</th>
                                <th className='border border-blue-900 px-3 py-3'>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student, idx) => {
                                const isAbsent = student.estmP_Result === 'AB';

                                return (
                                    <tr key={idx} className='hover:bg-gray-50'>
                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-center px-2 py-2'>{idx + 1}</td>
                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-left px-4 py-2'>{student.amsT_FirstName}</td>

                                        {columnFlags.rollno && (
                                            // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                            <td className='border border-gray-400 text-center px-3 py-2'>{student.amaY_RollNo ?? '-'}</td>
                                        )}

                                        {subjects
                                            .filter((s) => s.eyceS_AplResultFlg)
                                            .map((subj) => {
                                                const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);

                                                if (!mark || mark.estmpS_PassFailFlg === 'AB') {
                                                    return (
                                                        // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                                        <td
                                                            key={subj.ismS_Id}
                                                            className='border border-gray-400 text-center text-red-600 py-2'
                                                        >
                                                            AB
                                                        </td>
                                                    );
                                                }

                                                const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');
                                                if (isEVS && mark.estmpS_ObtainedMarks != null && mark.estmpS_ObtainedGrade) {
                                                    return (
                                                        <td key={subj.ismS_Id} className='border border-gray-400 py-2 text-center'>
                                                            <div className='flex items-center justify-center gap-5'>
                                                                <span>{mark.estmpS_ObtainedMarks}</span>
                                                                <span>{mark.estmpS_ObtainedGrade}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                                    <td key={subj.ismS_Id} className='border border-gray-400 text-center py-2'>
                                                        {mark.estmpS_ObtainedMarks != null
                                                            ? mark.estmpS_ObtainedMarks
                                                            : mark.estmpS_ObtainedGrade
                                                              ? mark.estmpS_ObtainedGrade
                                                              : '-'}
                                                    </td>
                                                );
                                            })}

                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-center py-2'>
                                            {isAbsent ? '' : (student.estmP_TotalMaxMarks ?? '-')}
                                        </td>
                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-center py-2'>
                                            {isAbsent ? '' : (student.estmP_TotalObtMarks ?? '-')}
                                        </td>
                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-center py-2'>
                                            {isAbsent
                                                ? '-'
                                                : student.estmP_Percentage
                                                  ? // biome-ignore lint/style/useTemplate: <explanation>
                                                    Number(student.estmP_Percentage).toFixed(1) + '%'
                                                  : '-'}
                                        </td>
                                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                        <td className='border border-gray-400 text-center py-2'>
                                            {isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

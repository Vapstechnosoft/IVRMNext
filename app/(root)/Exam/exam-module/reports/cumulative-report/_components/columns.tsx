'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ICumulativeReport, ISubject } from '@/types/exam/exam-module/report';
import type { ColumnDef } from '@tanstack/react-table';

interface ColumnFlags {
    rollno: boolean;
    admno: boolean;
    regno: boolean;
}

export const getCumulativeReportColumns = (subjects: ISubject[], columnFlags: ColumnFlags): ColumnDef<ICumulativeReport>[] => {
    const cols: ColumnDef<ICumulativeReport>[] = [];

    // Sl No
    cols.push({
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl No' />,
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination;
            return <div className='text-left font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        }
    });

    // Student Name
    cols.push({
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='text-left font-medium'>{row.getValue('amsT_FirstName')}</div>
    });

    // Conditional columns
    if (columnFlags.rollno) {
        cols.push({
            accessorKey: 'amaY_RollNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
            cell: ({ row }) => <div className='text-left'>{row.getValue('amaY_RollNo') ?? '-'}</div>
        });
    }
    if (columnFlags.admno) {
        cols.push({
            accessorKey: 'amsT_AdmNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
            cell: ({ row }) => <div className='text-left'>{row.getValue('amsT_AdmNo') ?? '-'}</div>
        });
    }
    if (columnFlags.regno) {
        cols.push({
            accessorKey: 'amsT_RegistrationNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Reg No' />,
            cell: ({ row }) => <div className='text-left'>{row.getValue('amsT_RegistrationNo') ?? '-'}</div>
        });
    }

    // Subject columns
    subjects
        .filter((s) => s.eyceS_AplResultFlg)
        .forEach((subj) => {
            cols.push({
                id: `subject_${subj.ismS_Id}`,
                header: () => (
                    <div className='break-words text-left font-bold text-xs uppercase leading-tight'>{subj.ismS_SubjectName}</div>
                ),
                cell: ({ row }) => renderStackedCell(row.original, subj)
            });
        });

    // Total columns
    cols.push(
        {
            accessorKey: 'estmP_TotalMaxMarks',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
            cell: ({ row }) => (
                <div className='text-left'>{row.original.estmP_Result === 'AB' ? '' : (row.getValue('estmP_TotalMaxMarks') ?? '-')}</div>
            )
        },
        {
            accessorKey: 'estmP_TotalObtMarks',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Obtained' />,
            cell: ({ row }) => (
                <div className='text-left'>{row.original.estmP_Result === 'AB' ? '' : (row.getValue('estmP_TotalObtMarks') ?? '-')}</div>
            )
        },
        {
            accessorKey: 'estmP_Percentage',
            header: ({ column }) => <DataTableColumnHeader column={column} title='%' />,
            cell: ({ row }) => {
                const value = row.getValue('estmP_Percentage');
                // FIXED: Type-safe handling of percentage
                if (row.original.estmP_Result === 'AB') return <div className='text-left'>-</div>;
                if (value == null) return <div className='text-left'>-</div>;

                // Now TypeScript knows `value` is a number
                return <div className='text-left'>{Number(value).toFixed(1)}%</div>;
            }
        },
        {
            accessorKey: 'estmP_TotalGrade',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Grade' />,
            cell: ({ row }) => (
                <div className='text-left font-medium'>
                    {row.original.estmP_Result === 'AB' ? '' : (row.getValue('estmP_TotalGrade') ?? '-')}
                </div>
            )
        }
    );

    return cols;
};

// EVS SUPPORT – Marks | Grade side-by-side
function renderStackedCell(row: ICumulativeReport, subj: ISubject) {
    const mark = row.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
    if (!mark) return <div className='text-left text-gray-400'>-</div>;

    if (mark.estmpS_PassFailFlg === 'AB') {
        return <div className='text-left font-bold text-red-600'>AB</div>;
    }

    const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');
    const hasMarks = mark.estmpS_ObtainedMarks != null && mark.estmpS_ObtainedMarks >= 0;
    const hasGrade = !!mark.estmpS_ObtainedGrade;

    const showMarks = subj.eyceS_MarksDisplayFlg || (hasMarks && !subj.eyceS_GradeDisplayFlg);
    const showGrade = subj.eyceS_GradeDisplayFlg || (hasGrade && !subj.eyceS_MarksDisplayFlg);

    // EVS special case
    if (isEVS && showMarks && showGrade) {
        return (
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            <div className='flex items-left justify-left gap-3 py-2'>
                <span className='font-semibold'>{mark.estmpS_ObtainedMarks}</span>
                {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                <div className='w-px bg-gray-600 h-10' />
                <span className='font-semibold text-blue-700'>{mark.estmpS_ObtainedGrade}</span>
            </div>
        );
    }

    // Normal subjects
    return (
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        <div className='text-left space-y-1 py-1'>
            {showMarks && <div className='font-medium'>{mark.estmpS_ObtainedMarks ?? '-'}</div>}
            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
            {showGrade && <div className='text-blue-700 text-xs font-medium'>{mark.estmpS_ObtainedGrade ?? '-'}</div>}
            {!showMarks && !showGrade && <span>-</span>}
        </div>
    );
}

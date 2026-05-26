'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteOralReSchedule, useOralReScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { HelpCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import OralReScheduleForm from './components/re-add-form';
import ReportModal from './components/report-modal';

export default function OralReSchedulePage() {
    const { data: details, isLoading, refetch } = useOralReScheduleDetails(0) as any;
    const { mutate: deleteSchedule } = useDeleteOralReSchedule();
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [reportSchedule, _setReportSchedule] = useState<any>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const _methods = useForm();

    const columns: ColumnDef<any>[] = [
        {
            id: 'slno',
            header: () => <div className='text-center'>SL.NO</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>
        },
        {
            accessorKey: 'paotS_ScheduleName',
            header: () => <div className='text-center'>Schedule Name</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleName}</div>
        },
        {
            accessorKey: 'paotS_ScheduleDate',
            header: () => <div className='text-center'>Date</div>,
            cell: ({ row }) => <div className='text-center'>{format(new Date(row.original.paotS_ScheduleDate), 'dd-MM-yyyy')}</div>
        },
        {
            accessorKey: 'paotS_ScheduleTime',
            header: () => <div className='text-center'>From</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleTime}</div>
        },
        {
            accessorKey: 'paotS_ScheduleTimeTo',
            header: () => <div className='text-center'>To</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleTimeTo}</div>
        }
        // {
        //     id: 'actions',
        //     header: () => <div className="text-center">Action</div>,
        //     cell: ({ row }) => (
        //         <div className="flex gap-2 justify-center">
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-blue-600 h-8 w-8"
        //                 onClick={() => {
        //                     setSelectedSchedule(row.original);
        //                     setIsAddMode(true);
        //                 }}
        //             >
        //                 <Edit className="h-4 w-4" />
        //             </Button>
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-blue-600 h-8 w-8"
        //                 onClick={() => {
        //                     setReportSchedule(row.original);
        //                     setIsReportOpen(true);
        //                 }}
        //                 title="View Report"
        //             >
        //                 <FileText className="h-4 w-4" />
        //             </Button>
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-destructive h-8 w-8"
        //                 onClick={() => {
        //                     if (confirm('Are you sure you want to delete this schedule?')) {
        //                         deleteSchedule(row.original.paotS_Id);
        //                     }
        //                 }}
        //             >
        //                 <Trash className="h-4 w-4" />
        //             </Button>
        //         </div>
        //     )
        // }
    ];

    if (isAddMode) {
        return (
            <div className='space-y-6 p-6'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <Button variant='outline' onClick={() => setIsAddMode(false)}>
                            Back to List
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <OralReScheduleForm
                            onSuccess={() => {
                                setIsAddMode(false);
                                refetch();
                            }}
                            initialData={selectedSchedule}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='space-y-6 p-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className='h-4 w-4 text-orange-500' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    This functionality helps the admin to update the student’s oral test marks on basis of schedule name &
                                    oral test conducted by the staff/teacher
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedSchedule(null);
                            setIsAddMode(true);
                        }}>
                        <Plus className='mr-2 h-4 w-4' /> Add Re-Schedule
                    </Button>
                </CardHeader>
                <CardContent className='p-0'>
                    <div className='[&_th]:font-bold [&_th]:text-[13px] [&_th]:text-black'>
                        <GenericDataTable
                            data={details?.oralTestSchedule || []}
                            columns={columns}
                            isLoading={isLoading}
                            isSearchRequired={true}
                        />
                    </div>
                </CardContent>
            </Card>
            <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} rowData={reportSchedule} />
        </div>
    );
}

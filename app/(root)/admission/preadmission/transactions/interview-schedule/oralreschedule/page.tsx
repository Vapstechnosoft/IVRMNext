'use client';

import { useState } from 'react';
import { useOralReScheduleDetails, useDeleteOralReSchedule } from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import OralReScheduleForm from './components/re-add-form';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useForm, FormProvider } from 'react-hook-form';

export default function OralReSchedulePage() {
    const { data: details, isLoading, refetch } = useOralReScheduleDetails() as any;
    const { mutate: deleteSchedule } = useDeleteOralReSchedule();
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

    const methods = useForm();

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'paotS_ScheduleName',
            header: 'Schedule Name',
        },
        {
            accessorKey: 'paotS_ScheduleDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.paotS_ScheduleDate), 'dd-MM-yyyy'),
        },
        {
            accessorKey: 'paotS_ScheduleTime',
            header: 'From',
        },
        {
            accessorKey: 'paotS_ScheduleTimeTo',
            header: 'To',
        },
        {
            accessorKey: 'paotS_Strength',
            header: 'Strength',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                            setSelectedSchedule(row.original);
                            setIsAddMode(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this schedule?')) {
                                deleteSchedule(row.original.paotS_Id);
                            }
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (isAddMode) {
        return (
            <div className="p-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <Button variant="outline" onClick={() => setIsAddMode(false)}>Back to List</Button>
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
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-orange-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    This functionality helps the admin to update the student’s oral test marks on basis of schedule name & oral test conducted by the staff/teacher
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button onClick={() => {
                        setSelectedSchedule(null);
                        setIsAddMode(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Re-Schedule
                    </Button>
                </CardHeader>
                <CardContent>
                    <GenericDataTable 
                        data={details?.oralTestSchedule || []} 
                        columns={columns}
                        isLoading={isLoading}
                        isSearchRequired={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

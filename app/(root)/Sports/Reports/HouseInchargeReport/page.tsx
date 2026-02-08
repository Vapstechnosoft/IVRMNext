'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHouseInchargeReport } from '@/hooks/sports/useHouseInchargeReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type HouseInchargeReportFormData, houseInchargeReportSchema } from './schema';

export default function HouseInchargeReportPage() {
    const { initialData, reportData } = useHouseInchargeReport();
    const [reportGenerated, setReportGenerated] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<HouseInchargeReportFormData>({
        resolver: zodResolver(houseInchargeReportSchema),
        defaultValues: {
            asmaY_Id: undefined,
            spccmH_Id: []
        }
    });

    const onSubmit = (data: HouseInchargeReportFormData) => {
        reportData.mutate(data);
        setReportGenerated(true);
    };

    const columns = [
        { accessorKey: 'id', header: 'SL. No.', cell: ({ row }: any) => <div>{row.index + 1}</div> },
        { accessorKey: 'SPCCMH_HouseName', header: 'House Name' },
        { accessorKey: 'EmpName', header: 'EMP Name' },
        { accessorKey: 'HRME_EmployeeCode', header: 'Emp Code' },
        { accessorKey: 'HRMD_DepartmentName', header: 'Department' },
        { accessorKey: 'HRMDES_DesignationName', header: 'Designation' },
        { accessorKey: 'HRME_MobileNo', header: 'Contact No.' },
        { accessorKey: 'HRME_EmailId', header: 'Email' }
    ];

    if (initialData.isLoading) {
        return (
            <div className='flex h-full items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    const academicYears = initialData.data?.data?.academicYears || [];
    const houses = initialData.data?.data?.houses || [];

    const houseOptions = houses.map((h) => ({
        label: h.label,
        value: h.id.toString()
    }));

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle>House Incharge Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.id} value={year.id.toString()}>
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <span className='text-destructive text-sm'>{errors.asmaY_Id.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    House Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='spccmH_Id'
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={houseOptions}
                                            onValueChange={(vals) => field.onChange(vals.map(Number))}
                                            defaultValue={field.value?.map(String) || []}
                                            placeholder='Select House'
                                            variant='default'
                                            maxCount={3}
                                        />
                                    )}
                                />
                                {errors.spccmH_Id && <span className='text-destructive text-sm'>{errors.spccmH_Id.message}</span>}
                            </div>
                        </div>

                        <div className='flex justify-center space-x-2'>
                            <Button type='submit' disabled={reportData.isPending}>
                                {reportData.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Report
                            </Button>
                            <Button
                                type='button'
                                variant='destructive'
                                onClick={() => {
                                    reset();
                                    setReportGenerated(false);
                                }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {reportGenerated && reportData.data?.data && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle>Report Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={reportData.data.data}
                            totalItems={reportData.data.data.length}
                            //manualPagination={false}
                        />
                        <div className='mt-4 flex justify-end space-x-2'>
                            <Button onClick={() => window.print()}>Print</Button>
                            <Button variant='outline' onClick={() => toast.info('Excel export implementation pending')}>
                                Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

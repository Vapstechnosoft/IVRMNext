'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sportHouseReportSchema, type SportHouseReportFormData } from './schema';
import { useSportHouseReport } from '@/hooks/sports/useSportHouseReport';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';

export default function SportHouseReportPage() {
    const { initialData, reportData } = useSportHouseReport();
    const [reportGenerated, setReportGenerated] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<SportHouseReportFormData>({
        resolver: zodResolver(sportHouseReportSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: undefined,
            spccmH_Id: [],
            asmcL_Id: undefined,
            asmS_Id: [],
        },
    });

    const reportType = watch('type');

    const onSubmit = (data: SportHouseReportFormData) => {
        reportData.mutate(data);
        setReportGenerated(true);
    };

    const columns = [
        { accessorKey: 'id', header: 'SL. No.', cell: ({ row }: any) => <div>{row.index + 1}</div> },
        { accessorKey: 'SPCCMH_HouseName', header: 'House Name' },
        { accessorKey: 'AMST_Name', header: 'Student Name' },
        { accessorKey: 'AMST_AdmNo', header: 'Adm. No.' },
        { accessorKey: 'ASMCL_ClassName', header: 'Class' },
        { accessorKey: 'ASMC_SectionName', header: 'Section' },
        { accessorKey: 'AMST_MobileNo', header: 'Contact No.' },
        { accessorKey: 'AMST_emailId', header: 'Email' },
    ];

    if (initialData.isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    const academicYears = initialData.data?.data?.academicYears || [];
    const houses = initialData.data?.data?.houses || [];
    const classes = initialData.data?.data?.classes || [];
    const sections = initialData.data?.data?.sections || [];

    const houseOptions = houses.map(h => ({
        label: h.label,
        value: h.id.toString(),
    }));

    const sectionOptions = sections.map(s => ({
        label: s.label,
        value: s.id.toString(),
    }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Sport House Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setReportGenerated(false);
                                            // Optional: reset specific fields when type changes
                                            // but keep academic year potentially
                                        }}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="House" id="r1" />
                                            <Label htmlFor="r1">By House</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="CS" id="r2" />
                                            <Label htmlFor="r2">By Class/Section</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Academic Year <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="asmaY_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Academic Year" />
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
                                {errors.asmaY_Id && <span className="text-sm text-destructive">{errors.asmaY_Id.message}</span>}
                            </div>

                            {reportType === 'House' && (
                                <div className="space-y-2">
                                    <Label>House Name <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="spccmH_Id"
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={houseOptions}
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder="Select House"
                                                variant="default"
                                                maxCount={3}
                                            />
                                        )}
                                    />
                                    {errors.spccmH_Id && <span className="text-sm text-destructive">{errors.spccmH_Id.message}</span>}
                                </div>
                            )}

                            {reportType === 'CS' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Class Name <span className="text-red-500">*</span></Label>
                                        <Controller
                                            control={control}
                                            name="asmcL_Id"
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Class" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classes.map((cls) => (
                                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                                {cls.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.asmcL_Id && <span className="text-sm text-destructive">{errors.asmcL_Id.message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Section Name <span className="text-red-500">*</span></Label>
                                        <Controller
                                            control={control}
                                            name="asmS_Id"
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={sectionOptions}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder="Select Section"
                                                    variant="default"
                                                    maxCount={3}
                                                />
                                            )}
                                        />
                                        {errors.asmS_Id && <span className="text-sm text-destructive">{errors.asmS_Id.message}</span>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-center space-x-2">
                            <Button type="submit" disabled={reportData.isPending}>
                                {reportData.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Report
                            </Button>
                            <Button type="button" variant="destructive" onClick={() => {
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Report Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={reportData.data.data}
                            totalItems={reportData.data.data.length}
                            manualPagination={false}
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button onClick={() => window.print()}>Print</Button>
                            <Button variant="outline" onClick={() => toast.info("Excel export implementation pending")}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

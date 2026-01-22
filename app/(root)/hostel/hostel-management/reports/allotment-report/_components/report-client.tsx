'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Printer } from 'lucide-react';
import { allotmentReportSchema, AllotmentReportSchema } from '@/schemas/hostel/reports/allotment-report.schema';
import { getAllotmentReport } from '@/server/hostel/reports/allotment-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { studentColumns, staffColumns, guestColumns } from './columns';

interface ReportFormProps {
    dropdowns: {
        yearlist: any[];
        hostellist: any[];
    };
}

export default function AllotmentReportClient({ dropdowns }: ReportFormProps) {
    const methods = useForm<AllotmentReportSchema>({
        resolver: zodResolver(allotmentReportSchema),
        defaultValues: {
            type: 'Student',
            ASMAY_Id: 0,
            HLMH_Id: 0,
            frmdate: new Date(),
            todate: new Date(),
        }
    });

    const { control, handleSubmit, formState: { errors, isSubmitting } } = methods;
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<string>('Student');

    const onSubmit = async (data: AllotmentReportSchema) => {
        try {
            setReportType(data.type);
            const res = await getAllotmentReport(data);
            if (res.griddata) {
                setReportData(res.griddata);
                if (res.griddata.length === 0) {
                    toast.info('No records found');
                }
            } else {
                setReportData([]);
                toast.error('Failed to fetch report');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    const getColumns = () => {
        switch (reportType) {
            case 'Staff': return staffColumns;
            case 'Guest': return guestColumns;
            default: return studentColumns;
        }
    };

    return (
        <div className="space-y-6">
            <div className="w-full rounded-2xl bg-white p-6 shadow-sm border">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex justify-center mb-6">
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Student" id="r1" />
                                            <Label htmlFor="r1">Student</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Staff" id="r2" />
                                            <Label htmlFor="r2">Staff</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Guest" id="r3" />
                                            <Label htmlFor="r3">Guest</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name="ASMAY_Id"
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Label required>Academic Year</Label>
                                        <Select
                                            value={String(field.value || '')}
                                            onValueChange={(v) => field.onChange(Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dropdowns.yearlist.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Hostel */}
                            <Controller
                                control={control}
                                name="HLMH_Id"
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Label required>Hostel</Label>
                                        <Select
                                            value={String(field.value || '')}
                                            onValueChange={(v) => field.onChange(Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Hostel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dropdowns.hostellist.map((h: any) => (
                                                    <SelectItem key={h.hlmH_Id} value={String(h.hlmH_Id)}>
                                                        {h.hlmH_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.HLMH_Id && <FormError>{errors.HLMH_Id.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* From Date */}
                            <Controller
                                control={control}
                                name="frmdate"
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Label required>From Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.frmdate && <FormError>{errors.frmdate.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* To Date */}
                            <Controller
                                control={control}
                                name="todate"
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Label required>To Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.todate && <FormError>{errors.todate.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button type="submit" disabled={isSubmitting}>Report</Button>
                            <Button type="button" variant="outline" onClick={() => { setReportData([]); methods.reset(); }}>Cancel</Button>
                        </div>
                    </form>
                </FormProvider>
            </div>

            {reportData.length > 0 && (
                <div className="w-full rounded-2xl bg-white p-6 shadow-sm border space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{reportType} Allotment Report</h3>
                        <div className="flex gap-2">
                            {/* Example export/print buttons */}
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
                        </div>
                    </div>
                    <DataTable columns={getColumns()} data={reportData} />
                </div>
            )}
        </div>
    );
}

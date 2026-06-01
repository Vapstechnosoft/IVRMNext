'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Search, XCircle } from 'lucide-react';
import { vacateReportSchema, type VacateReportSchema } from '@/schemas/hostel/reports/vacate-report.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentListForReport, getVacateReport } from '@/server/hostel/hostel-management/reports/vacate-report';

interface ReportFormProps {
    initialData: {
        yerlist: any[];
        hostelist: any[];
        studentlist: any[];
        stafflist: any[];
        guestlist: any[];
    };
    onReportGenerated: (data: any[], type: string) => void;
}

export default function VacateReportForm({ initialData, onReportGenerated }: ReportFormProps) {
    const [dropdowns, setDropdowns] = useState(initialData);

    const methods = useForm<VacateReportSchema>({
        resolver: zodResolver(vacateReportSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: 'student',
            type2: 'all',
            ASMAY_Id: null,
            Fromdate: undefined,
            ToDate: undefined,
            SelectedHostellist: [],
            SelectedStudentlist: [],
            Selectedstafflist: [],
            Selectedguestlist: [],
        }
    });

    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = methods;

    const selectedType = useWatch({ control, name: 'type' });
    const selectedFilter = useWatch({ control, name: 'type2' });
    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });

    // Sync initialData when loaded
    useEffect(() => {
        setDropdowns(initialData);
    }, [initialData]);

    // Handle Year Change for Student List
    useEffect(() => {
        if (selectedType === 'student' && selectedYear) {
            (async () => {
                const res = await getStudentListForReport(Number(selectedYear));
                if (res) {
                    setDropdowns(prev => ({
                        ...prev,
                        studentlist: res.studentlist || res.studentList || res || []
                    }));
                }
            })();
        }
    }, [selectedType, selectedYear]);

    // Handle Type change
    useEffect(() => {
        setValue('type2', 'all');
        setValue('SelectedHostellist', []);
        setValue('SelectedStudentlist', []);
        setValue('Selectedstafflist', []);
        setValue('Selectedguestlist', []);
    }, [selectedType, setValue]);

    const onSubmit = async (data: VacateReportSchema) => {
        try {
            const res = await getVacateReport(data);
            const list = res?.gridlistdata || res?.griddata || [];
            onReportGenerated(list, data.type);
            if (list.length === 0) {
                toast.info('No records found for selected criteria');
            } else {
                toast.success(`Successfully loaded ${list.length} record(s)`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        }
    };

    return (
        <Card className="shadow-md border-t-4 border-t-[#4255a7]">
            <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-[#4255a7] text-sm font-bold uppercase tracking-wider">
                    HOSTEL VACATE REPORT
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                        {/* Occupant Type Radio Group */}
                        <div className="bg-gray-50/50 p-4 border-b flex justify-center">
                            <div className="bg-white px-8 py-2 border rounded-md shadow-sm flex justify-center min-w-[400px]">
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex space-x-12"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="student" id="student_opt" />
                                                <Label htmlFor="student_opt" className="cursor-pointer font-bold uppercase text-xs">Student</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="staff" id="staff_opt" />
                                                <Label htmlFor="staff_opt" className="cursor-pointer font-bold uppercase text-xs">Staff</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="guest" id="guest_opt" />
                                                <Label htmlFor="guest_opt" className="cursor-pointer font-bold uppercase text-xs">Guest</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-8 space-y-6">
                            {/* Academic Year Dropdown */}
                            <div className="flex items-center justify-center py-2 max-w-2xl mx-auto">
                                <Label className="w-36 text-right text-gray-700 font-medium mr-4">
                                    Academic Year:<span className="text-red-500">*</span>
                                </Label>
                                <div className="flex-1 max-w-md">
                                    <Controller
                                        control={control}
                                        name="ASMAY_Id"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                            >
                                                <SelectTrigger className="w-full bg-white border-purple-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dropdowns.yerlist?.map((y: any) => {
                                                        const id = y.asmaY_Id ?? y.ASMAY_Id;
                                                        const name = y.asmaY_Year ?? y.ASMAY_Year;
                                                        return (
                                                            <SelectItem key={id} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.ASMAY_Id && <FormError className="mt-1">{errors.ASMAY_Id.message}</FormError>}
                                </div>
                            </div>

                            {/* Date Range Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-4xl mx-auto py-2">
                                {/* Start Date */}
                                <div className="flex items-start">
                                    <Label className="w-28 text-left text-gray-700 font-medium mr-4 mt-2">
                                        Start Date:<span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="Fromdate"
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between text-left font-normal bg-white border-b-2 border-b-blue-400 rounded-none hover:bg-gray-50/50">
                                                            <span className="text-xs text-gray-500">{field.value ? format(field.value, "dd/MM/yyyy") : "Select date..."}</span>
                                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                        {errors.Fromdate && <FormError className="mt-1">{errors.Fromdate.message}</FormError>}
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="flex items-start">
                                    <Label className="w-24 text-left text-gray-700 font-medium mr-4 mt-2">
                                        End Date:<span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="ToDate"
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between text-left font-normal bg-white border-b-2 border-b-blue-400 rounded-none hover:bg-gray-50/50">
                                                            <span className="text-xs text-gray-500">{field.value ? format(field.value, "dd/MM/yyyy") : "Select date..."}</span>
                                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                        {errors.ToDate && <FormError className="mt-1">{errors.ToDate.message}</FormError>}
                                    </div>
                                </div>
                            </div>

                            {/* Filter Type Radio Group */}
                            <div className="py-2 flex justify-center">
                                <div className="bg-white px-8 py-2 border rounded-md shadow-sm flex justify-center min-w-[400px]">
                                    <Controller
                                        control={control}
                                        name="type2"
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex space-x-12"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="all" id="all_opt" />
                                                    <Label htmlFor="all_opt" className="cursor-pointer font-bold uppercase text-xs">All</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Hostel" id="hostel_opt" />
                                                    <Label htmlFor="hostel_opt" className="cursor-pointer font-bold uppercase text-xs">Hostel</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="individual" id="ind_opt" />
                                                    <Label htmlFor="ind_opt" className="cursor-pointer font-bold uppercase text-xs">Individual</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Multi-Select Filters */}
                            {selectedFilter === 'Hostel' && (
                                <div className="space-y-2 border p-4 rounded-lg bg-gray-50 max-h-48 overflow-y-auto max-w-4xl mx-auto">
                                    <Label className="font-bold text-xs uppercase tracking-wider text-gray-600">Select Hostels</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {dropdowns.hostelist?.map((h: any) => {
                                            const id = h.hlmH_Id ?? h.HLMH_Id;
                                            const name = h.hlmH_Name ?? h.HLMH_Name ?? h.hlmH_name;
                                            return (
                                                <div key={id} className="flex items-center space-x-2">
                                                    <Controller
                                                        control={control}
                                                        name="SelectedHostellist"
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={field.value?.some((item: any) => item.HLMH_Id === id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    if (checked) field.onChange([...current, { HLMH_Id: id }]);
                                                                    else field.onChange(current.filter((x: any) => x.HLMH_Id !== id));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <span className="text-sm">{name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedFilter === 'individual' && (
                                <div className="space-y-2 border p-4 rounded-lg bg-gray-50 max-h-48 overflow-y-auto max-w-4xl mx-auto">
                                    <Label className="font-bold text-xs uppercase tracking-wider text-gray-600">Select Individuals</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedType === 'student' && dropdowns.studentlist?.map((s: any) => {
                                            const id = s.amsT_Id ?? s.AMST_Id;
                                            const name = s.studentname ?? s.studentName;
                                            return (
                                                <div key={id} className="flex items-center space-x-2">
                                                    <Controller
                                                        control={control}
                                                        name="SelectedStudentlist"
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={field.value?.some((item: any) => item.AMST_Id === id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    if (checked) field.onChange([...current, { AMST_Id: id }]);
                                                                    else field.onChange(current.filter((x: any) => x.AMST_Id !== id));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <span className="text-sm">{name}</span>
                                                </div>
                                            );
                                        })}
                                        {selectedType === 'staff' && dropdowns.stafflist?.map((s: any) => {
                                            const id = s.hrmE_Id ?? s.HRME_Id;
                                            const name = s.hrmE_EmployeeFirstName ?? s.empname ?? s.staffName;
                                            return (
                                                <div key={id} className="flex items-center space-x-2">
                                                    <Controller
                                                        control={control}
                                                        name="Selectedstafflist"
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={field.value?.some((item: any) => item.HRME_Id === id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    if (checked) field.onChange([...current, { HRME_Id: id }]);
                                                                    else field.onChange(current.filter((x: any) => x.HRME_Id !== id));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <span className="text-sm">{name}</span>
                                                </div>
                                            );
                                        })}
                                        {selectedType === 'guest' && dropdowns.guestlist?.map((g: any) => {
                                            const id = g.hlhgstalT_Id ?? g.HLHGSTALT_Id;
                                            const name = g.hlhgstalT_GuestName ?? g.hlhgstalT_GuestName;
                                            return (
                                                <div key={id} className="flex items-center space-x-2">
                                                    <Controller
                                                        control={control}
                                                        name="Selectedguestlist"
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={field.value?.some((item: any) => item.HLHGSTALT_Id === id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    if (checked) field.onChange([...current, { HLHGSTALT_Id: id }]);
                                                                    else field.onChange(current.filter((x: any) => x.HLHGSTALT_Id !== id));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <span className="text-sm">{name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Row */}
                            <div className="flex items-center justify-center gap-4 pt-4 border-t">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-36 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                                >
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-3 w-3" />}
                                    REPORT
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => reset()} 
                                    className="w-36 bg-[#ff5c33] hover:bg-[#e64d26] text-white border-none rounded-md shadow-md uppercase font-bold text-xs"
                                >
                                    <XCircle className="mr-2 h-3 w-3" />
                                    CANCEL
                                </Button>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}

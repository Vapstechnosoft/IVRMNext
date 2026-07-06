'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import {
    useStudentYearLossReportInitialDetails,
    useStudentYearLossReportData
} from '@/hooks/admission/oldsharehost/reports/useStudentYearLossReport';

import { getDynamicColumns } from './_components/columns';

const DEFAULT_HEADERS = [
    { id: 'AMST_FirstName', checked: true, value: 'Student Name' },
    { id: 'AMST_AdmNo', checked: true, value: 'Adm. No.' },
    { id: 'ASMCL_ClassName', checked: true, value: 'Class' },
    { id: 'ASMC_SectionName', checked: true, value: 'Section' },
    { id: 'AMAY_RollNo', checked: true, value: 'Roll No.' },
    { id: 'AMST_RegistrationNo', checked: true, value: 'Reg. No.' },
    { id: 'AMST_Date', checked: true, value: 'Date Of Admission' },
    { id: 'AMST_DOB', checked: true, value: 'Date Of Birth' },
    { id: 'AMST_DOB_Words', checked: true, value: 'DOB(Words)' },
    { id: 'AMST_FatherName', checked: true, value: 'Father Name' },
    { id: 'AMST_MotherName', checked: true, value: 'Mother Name' },
    { id: 'AMST_Sex', checked: true, value: 'Sex' },
    { id: 'AMST_FatherMobleNo', checked: true, value: 'Phone Number' },
    { id: 'AMST_PerAdd3', checked: true, value: 'Permanent Address' },
    { id: 'AMST_MobileNo', checked: true, value: 'Mobile Number' },
    { id: 'AMST_emailId', checked: true, value: 'Email ID' },
    { id: 'AMST_BloodGroup', checked: true, value: 'Blood Group' },
    { id: 'IMC_CasteName', checked: true, value: 'Caste' },
    { id: 'AMC_Name', checked: true, value: 'Category' },
    { id: 'AMST_ConCity', checked: true, value: 'Present Address' }
];

const formSchema = z.object({
    allOrIndi: z.enum(['all', 'indi']),
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().optional(),
    ASMC_Id: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.allOrIndi === 'indi') {
        if (!data.ASMCL_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ASMCL_Id'],
                message: 'Select Class'
            });
        }
        if (!data.ASMC_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ASMC_Id'],
                message: 'Select Section'
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

type HeaderType = {
    id: string;
    checked: boolean;
    value: string;
    selected: boolean;
};

export default function StudentYearLossReportPage() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentYearLossReportInitialDetails();
    const reportMutation = useStudentYearLossReportData();

    const [selectedHeaders, setSelectedHeaders] = useState<HeaderType[]>(
        DEFAULT_HEADERS.map(h => ({ ...h, selected: false }))
    );
    const [selectAllHeaders, setSelectAllHeaders] = useState(false);

    const [reportData, setReportData] = useState<any[]>([]);
    const [reportColumns, setReportColumns] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allOrIndi: 'all',
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMC_Id: ''
        }
    });

    const allOrIndi = form.watch('allOrIndi');

    useEffect(() => {
        if (allOrIndi === 'all') {
            form.setValue('ASMCL_Id', '');
            form.setValue('ASMC_Id', '');
        }
    }, [allOrIndi, form]);

    const handleSelectAllHeaders = (checked: boolean) => {
        setSelectAllHeaders(checked);
        setSelectedHeaders(prev => prev.map(h => ({ ...h, selected: checked })));
    };

    const handleHeaderSelect = (id: string, checked: boolean) => {
        const updated = selectedHeaders.map(h => h.id === id ? { ...h, selected: checked } : h);
        setSelectedHeaders(updated);
        setSelectAllHeaders(updated.every(h => h.selected));
    };

    const onSubmit = async (values: FormValues) => {
        const selected = selectedHeaders.filter(h => h.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one checkbox');
            return;
        }

        const albumNameArraycolumn = selected.map(h => ({
            columnID: h.id,
            columnName: h.value
        }));

        try {
            setIsGenerating(true);
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: Number(values.ASMAY_Id),
                ASMCL_Id: values.allOrIndi === 'indi' ? Number(values.ASMCL_Id) : 0,
                ASMC_Id: values.allOrIndi === 'indi' ? Number(values.ASMC_Id) : 0,
                tcallorindi: values.allOrIndi,
                tcperortemp: null,
                TempararyArrayheadList: albumNameArraycolumn
            });

            const data = res?.data?.alldatagridreport || [];
            
            if (data.length === 0) {
                toast.info('Record Not Found');
                setReportData([]);
                setReportColumns([]);
            } else {
                setReportData(data);
                const columns = res?.data?.tempararyArrayheadList || albumNameArraycolumn;
                setReportColumns(columns);
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const clearDetails = () => {
        form.reset();
        setReportData([]);
        setReportColumns([]);
        setSelectedHeaders(DEFAULT_HEADERS.map(h => ({ ...h, selected: false })));
        setSelectAllHeaders(false);
    };

    return (
        <div className="min-h-screen p-4 space-y-6 bg-gray-50">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <CollapsibleSection
                        title="Student Year Loss Report"
                        defaultOpen={true}
                        variant="outline"
                        className="shadow-md"
                    >
                        <div className="p-6 space-y-6 bg-white rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg border">
                                        <FormField
                                            control={form.control}
                                            name="allOrIndi"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-row space-x-4"
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="all" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal cursor-pointer">
                                                                    All
                                                                </FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="indi" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal cursor-pointer">
                                                                    Individual
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="ASMAY_Id"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                                <FormLabel className="text-right">Academic Year:<span className="text-red-500">*</span></FormLabel>
                                                <div className="col-span-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isInitialLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Year" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {initialData?.data?.fillyear?.map((item: any) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ASMCL_Id"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                                <FormLabel className="text-right">Class:{allOrIndi === 'indi' && <span className="text-red-500">*</span>}</FormLabel>
                                                <div className="col-span-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'all' || isInitialLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Class" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {initialData?.data?.fillclass?.map((item: any) => (
                                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                    {item.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ASMC_Id"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                                <FormLabel className="text-right">Section:{allOrIndi === 'indi' && <span className="text-red-500">*</span>}</FormLabel>
                                                <div className="col-span-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'all' || isInitialLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Section" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {initialData?.data?.fillsection?.map((item: any) => (
                                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                    {item.asmC_SectionName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 pb-2 border-b">
                                        <Checkbox
                                            id="selectAll"
                                            checked={selectAllHeaders}
                                            onCheckedChange={(checked) => handleSelectAllHeaders(checked as boolean)}
                                        />
                                        <Label htmlFor="selectAll" className="font-bold">Select All Columns</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                                        {selectedHeaders.map((header) => (
                                            <div key={header.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={header.id}
                                                    checked={header.selected}
                                                    onCheckedChange={(checked) => handleHeaderSelect(header.id, checked as boolean)}
                                                />
                                                <Label htmlFor={header.id} className="text-sm cursor-pointer">{header.value}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 pt-4 border-t">
                                <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Report
                                </Button>
                                <Button
                                    type="button"
                                    onClick={clearDetails}
                                    variant="destructive"
                                    className="min-w-[140px] font-bold"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {reportData.length > 0 && reportColumns.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-bold uppercase text-indigo-700">STUDENT YEAR LOSS REPORT</h3>
                        <div className="text-sm font-semibold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                            Total Records: {reportData.length}
                        </div>
                    </div>
                    <GenericDataTable
                        data={reportData}
                        columns={getDynamicColumns(reportColumns)}
                        isLoading={isGenerating}
                    />
                </div>
            )}
        </div>
    );
}

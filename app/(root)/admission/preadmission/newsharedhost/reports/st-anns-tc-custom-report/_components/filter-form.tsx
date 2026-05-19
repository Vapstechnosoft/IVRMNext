'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StAnnsTcCustomReportSchema, type StAnnsTcCustomReportFields } from '@/schemas/admission/preadmission/reports/st-anns-tc-custom-report';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { FileText, RotateCcw, Printer, Users, User, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    useStAnnsTcLoadData,
    useStAnnsTcYearChange,
    useStAnnsTcClassChange,
    useStAnnsTcSectionChange
} from '@/hooks/admission/preadmission/useStAnnsTcReport';

interface FilterFormProps {
    onSubmit: (data: StAnnsTcCustomReportFields) => void;
    onReset: () => void;
    onPrint: () => void;
    hasData: boolean;
}

export const FilterForm = ({ onSubmit, onReset, onPrint, hasData }: FilterFormProps) => {
    const { data: initialData } = useStAnnsTcLoadData();
    const yearChangeMutation = useStAnnsTcYearChange();
    const classChangeMutation = useStAnnsTcClassChange();
    const sectionChangeMutation = useStAnnsTcSectionChange();

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    const form = useForm<StAnnsTcCustomReportFields>({
        resolver: zodResolver(StAnnsTcCustomReportSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            AMST_Id: 0
        }
    });

    const reportType = form.watch('reporttype');
    const tcType = form.watch('temporper');
    const selectedYear = form.watch('ASMAY_Id');
    const selectedClass = form.watch('ASMCL_Id');
    const selectedSection = form.watch('ASMS_Id');

    // Handle Year Change
    useEffect(() => {
        if (selectedYear > 0) {
            const updateYearData = async () => {
                try {
                    const response = await yearChangeMutation.mutateAsync({
                        ASMAY_Id: selectedYear,
                        tctemporper: tcType,
                        report_type: reportType
                    });

                    if (response?.data) {
                        if (reportType === 'All') {
                            setStudentList(response.data.studentlist || []);
                        }
                        setClassList(response.data.accclass || []);
                        // Reset downstream fields
                        form.setValue('ASMCL_Id', 0);
                        form.setValue('ASMS_Id', 0);
                        form.setValue('AMST_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load data for selected year');
                }
            };
            updateYearData();
        }
    }, [selectedYear, tcType, reportType]);

    // Handle Class Change
    useEffect(() => {
        if (selectedClass && selectedClass > 0 && reportType === 'indi') {
            const updateClassData = async () => {
                try {
                    const response = await classChangeMutation.mutateAsync({
                        ASMAY_Id: selectedYear,
                        tctemporper: tcType,
                        report_type: reportType,
                        ASMCL_Id: selectedClass || 0
                    });

                    if (response?.data?.accsection) {
                        setSectionList(response.data.accsection);
                        form.setValue('ASMS_Id', 0);
                        form.setValue('AMST_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load sections');
                }
            };
            updateClassData();
        }
    }, [selectedClass]);

    // Handle Section Change
    useEffect(() => {
        if (selectedSection && selectedSection > 0 && reportType === 'indi') {
            const updateSectionData = async () => {
                try {
                    const response = await sectionChangeMutation.mutateAsync({
                        ASMAY_Id: selectedYear,
                        ASMCL_Id: selectedClass || 0,
                        ASMS_Id: selectedSection || 0,
                        tctemporper: tcType,
                        report_type: reportType
                    });

                    if (response?.data?.studentlist) {
                        setStudentList(response.data.studentlist);
                        form.setValue('AMST_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load students');
                }
            };
            updateSectionData();
        }
    }, [selectedSection]);

    const handleFormSubmit = (data: StAnnsTcCustomReportFields) => {
        onSubmit(data);
    };

    const onInvalid = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        } else {
            toast.error('Please fill in all required fields');
        }
    };

    const handleReset = () => {
        form.reset();
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    const yearList = initialData?.data?.accyear || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)} className="space-y-4">
                {/* Radio Selection Group - Matches Row 1 of Legacy */}
                <div className="grid grid-cols-1 md:grid-cols-2 border rounded-md p-3 bg-white shadow-sm">
                    <div className="flex items-center justify-center gap-6 border-r pr-6">
                        <FormField
                            control={form.control}
                            name="reporttype"
                            render={({ field }) => (
                                <FormItem className="space-y-0">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="All" id="r-all" className="border-blue-800 text-blue-800" />
                                                </FormControl>
                                                <FormLabel htmlFor="r-all" className="cursor-pointer font-bold text-slate-700 text-xs">
                                                    All
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="indi" id="r-indi" className="border-blue-800 text-blue-800" />
                                                </FormControl>
                                                <FormLabel htmlFor="r-indi" className="cursor-pointer font-bold text-slate-700 text-xs">
                                                    Individual
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-6 pl-6">
                        <FormField
                            control={form.control}
                            name="temporper"
                            render={({ field }) => (
                                <FormItem className="space-y-0">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Temp" id="tc-temp" className="border-blue-800 text-blue-800" />
                                                </FormControl>
                                                <FormLabel htmlFor="tc-temp" className="cursor-pointer font-bold text-slate-700 text-xs">Temporary TC</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Per" id="tc-per" className="border-blue-800 text-blue-800" />
                                                </FormControl>
                                                <FormLabel htmlFor="tc-per" className="cursor-pointer font-bold text-slate-700 text-xs">Permanent TC</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Main Filter Grid - Matches Rows 2, 3, 4 of Legacy */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 border rounded-md bg-slate-50/30">
                    {/* Left Column (Dropdowns) */}
                    <div className="md:col-span-7 space-y-4">
                        <FormField
                            control={form.control}
                            name="ASMAY_Id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right font-bold text-xs">Year:<span className="text-red-500">*</span></FormLabel>
                                    <div className="col-span-3">
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className="border-slate-300 h-9 text-xs">
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {yearList.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ASMCL_Id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right font-bold text-xs">Class:</FormLabel>
                                    <div className="col-span-3">
                                        <Select 
                                            onValueChange={(v) => field.onChange(Number(v))} 
                                            value={field.value?.toString()}
                                            disabled={reportType !== 'indi'}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-slate-300 h-9 text-xs">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classList.map((c: any) => (
                                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ASMS_Id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right font-bold text-xs">Section:</FormLabel>
                                    <div className="col-span-3">
                                        <Select 
                                            onValueChange={(v) => field.onChange(Number(v))} 
                                            value={field.value?.toString()}
                                            disabled={reportType !== 'indi' || !selectedClass}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-slate-300 h-9 text-xs">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sectionList.map((s: any) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column (Student Name & Buttons) */}
                    <div className="md:col-span-5 flex flex-col justify-between">
                        <FormField
                            control={form.control}
                            name="AMST_Id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0 mb-6">
                                    <FormLabel className="text-right font-bold text-xs whitespace-nowrap">Student Name:</FormLabel>
                                    <div className="col-span-3">
                                        <Select 
                                            onValueChange={(v) => field.onChange(Number(v))} 
                                            value={field.value?.toString()}
                                            disabled={!selectedYear || (reportType === 'indi' && !selectedSection)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-slate-300 h-9 text-xs">
                                                    <SelectValue placeholder="Select Or Search Student" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {studentList.map((s: any) => (
                                                    <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>
                                                        {s.studentname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Buttons Row - Matches Legacy Colors */}
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="submit"
                                className="h-9 px-4 bg-[#3a5999] hover:bg-[#2d4373] text-white rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"
                            >
                                <ClipboardList className="w-3 h-3" /> Report
                            </Button>
                            <Button
                                type="button"
                                onClick={handleReset}
                                className="h-9 px-4 bg-[#f15a24] hover:bg-[#d94e1c] text-white rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"
                            >
                                <RotateCcw className="w-3 h-3" /> Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onPrint}
                                disabled={!hasData}
                                className="h-9 px-4 bg-[#3a5999] hover:bg-[#2d4373] text-white rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"
                            >
                                <Printer className="w-3 h-3" /> Print
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
};

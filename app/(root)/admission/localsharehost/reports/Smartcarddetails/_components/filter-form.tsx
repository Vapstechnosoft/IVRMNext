'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SophiaSmartcardReportSchema, type SophiaSmartcardReportFields } from '@/schemas/admission/preadmission/reports/sophia-smartcard-report';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSophiaSmartcardReport } from '@/hooks/admission/preadmission/reports/useSophiaSmartcardReport';
import { toast } from 'sonner';
import { Check, ClipboardList, RotateCcw, Download, Printer } from 'lucide-react';

interface FilterFormProps {
    onSubmit: (data: SophiaSmartcardReportFields) => void;
    onReset: () => void;
    onExport: () => void;
    onPrint: () => void;
    hasData: boolean;
    hasSelectedData: boolean;
}

export const FilterForm = ({ onSubmit, onReset, onExport, onPrint, hasData, hasSelectedData }: FilterFormProps) => {
    const { loadData, reportMutation } = useSophiaSmartcardReport();

    const form = useForm<SophiaSmartcardReportFields>({
        resolver: zodResolver(SophiaSmartcardReportSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            Admnoallind: 'Regular'
        }
    });

    const handleFormSubmit = (data: SophiaSmartcardReportFields) => {
        onSubmit(data);
    };

    const handleFormError = (errors: any) => {
        const errorMessages = Object.values(errors).map((err: any) => err.message);
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
        }
    };

    const handleReset = () => {
        form.reset({
            ASMAY_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            SPCCMH_Id: undefined,
            Admnoallind: 'Regular'
        });
        onReset();
        window.location.reload();
    };

    const data = (loadData.data as any)?.data || (loadData.data as any);
    const yearList = data?.academicList || [];
    const classList = data?.classlist || [];
    const sectionList = data?.sectionList || [];
    const houseList = data?.houseList || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name="ASMAY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs">Academic Year <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="---Select---" />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name="ASMCL_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs">Class <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="---Select---" />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name="ASMS_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs">Section <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="---Select---" />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* House */}
                    {/* <FormField
                        control={form.control}
                        name="SPCCMH_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs">House</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="---Select---" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {houseList.map((h: any) => (
                                            <SelectItem key={h.spccmH_Id} value={h.spccmH_Id.toString()}>
                                                {h.spccmH_HouseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4 shadow-inner">
                    <FormField
                        control={form.control}
                        name="Admnoallind"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-8"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Regular" id="regular" className="border-slate-300 text-[#f15a24]" />
                                            </FormControl>
                                            <FormLabel htmlFor="regular" className="cursor-pointer font-bold text-slate-600 uppercase text-[10px] tracking-widest">Regular</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="New" id="new" className="border-slate-300 text-[#f15a24]" />
                                            </FormControl>
                                            <FormLabel htmlFor="new" className="cursor-pointer font-bold text-slate-600 uppercase text-[10px] tracking-widest">New</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-center pt-6">
                    <Button
                        type="submit"
                        className="w-auto min-w-[120px] bg-[#f15a24] hover:bg-[#d94e1c] text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-lg shadow-orange-200/50 transition-all hover:scale-105 active:scale-95"
                        disabled={reportMutation.isPending}
                    >
                        {reportMutation.isPending ? 'Generating...' : (
                            <span className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" /> Report
                            </span>
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleReset}
                        className="w-auto min-w-[120px] bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full font-bold uppercase tracking-wider text-xs transition-all hover:scale-105 active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onExport}
                        disabled={!hasData}
                        className="w-auto min-w-[120px] bg-[#337ab7] hover:bg-[#286090] text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-200/50 transition-all hover:scale-105 active:scale-95"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button
                        type="button"
                        onClick={onPrint}
                        disabled={!hasSelectedData}
                        className="w-auto min-w-[120px] bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-lg shadow-amber-200/50 transition-all hover:scale-105 active:scale-95"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>
            </form>
        </Form>
    );
};

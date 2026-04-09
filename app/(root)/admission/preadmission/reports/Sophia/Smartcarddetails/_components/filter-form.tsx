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
import { Check, ClipboardList, RotateCcw } from 'lucide-react';

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

    const handleReset = () => {
        form.reset({
            ASMAY_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            SPCCMH_Id: undefined,
            Admnoallind: 'Regular'
        });
        onReset();
    };

    const data = (loadData.data as any)?.data || (loadData.data as any);
    const yearList = data?.academicList || [];
    const classList = data?.classlist || [];
    const sectionList = data?.sectionList || [];
    const houseList = data?.houseList || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border rounded-lg space-y-3">
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
                                                <RadioGroupItem value="Regular" id="regular" />
                                            </FormControl>
                                            <FormLabel htmlFor="regular" className="cursor-pointer font-semibold text-slate-700">Regular</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="New" id="new" />
                                            </FormControl>
                                            <FormLabel htmlFor="new" className="cursor-pointer font-semibold text-slate-700">New</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
                    <Button
                        type="submit"
                        className="min-w-[120px] bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-none font-bold uppercase"
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
                        className="min-w-[120px] bg-[#dd4b39] hover:bg-[#c23321] text-white rounded-none font-bold uppercase"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onExport}
                        disabled={!hasData}
                        className="min-w-[120px] bg-[#337ab7] hover:bg-[#286090] text-white rounded-none font-bold uppercase"
                    >
                        <ClipboardList className="w-4 h-4 mr-2" /> Export to Excel
                    </Button>
                    <Button
                        type="button"
                        onClick={onPrint}
                        disabled={!hasSelectedData}
                        className="min-w-[120px] bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded-none font-bold uppercase"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>
            </form>
        </Form>
    );
};

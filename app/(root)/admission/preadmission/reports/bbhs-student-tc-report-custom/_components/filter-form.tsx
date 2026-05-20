'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/extension/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RefreshCcw, FileText, Search, Check, Loader2, Printer, X } from 'lucide-react';
import { useBbhsStudentTcStudentList } from '@/hooks/admission/preadmission/reports/useBbhsStudentTcReportCustom';
import { cn } from '@/lib/utils';
import { useBbhsStudentTcACS } from '@/hooks/admission/preadmission/reports/useBbhsStudentTcReportCustom';
import { bbhsStudentTcCustomSchema, type BbhsStudentTcCustomFields } from '@/schemas/admission/preadmission/reports/bbhs-student-tc-custom.schema';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: BbhsStudentTcCustomFields) => void;
    onReset: () => void;
}

const uniqueBy = <T,>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter(item => {
        const val = item[key];
        if (val === undefined || val === null) return true; // Keep items with missing keys (will be handled by index or ignored)
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    });
};

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const searchMutation = useBbhsStudentTcStudentList();
    const acsMutation = useBbhsStudentTcACS();

    const form = useForm<BbhsStudentTcCustomFields>({
        resolver: zodResolver(bbhsStudentTcCustomSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: '',
            admname: 'regno',
            asmcL_Id: '',
            asmS_Id: '',
            AMST_Id: null,
            pervious: '',
        },
    });

    const { watch, setValue, reset, formState: { errors } } = form;

    const watchYear = watch('asmaY_Id');
    const watchClass = watch('asmcL_Id');
    const watchSection = watch('asmS_Id');
    const watchAdmName = watch('admname');

    // Triggered when radio changes to fetch students based on selection
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear || !watchClass || !watchSection || !watchAdmName) return;

            try {
                const payload = {
                    ASMAY_Id: parseInt(watchYear),
                    ASMCL_Id: parseInt(watchClass),
                    ASMC_Id: parseInt(watchSection),
                };

                const response = await searchMutation.mutateAsync(payload as any);
                const data = (response?.data || response) as any;

                const studentData = data.studentlist || data.studentList || [];
                const distinctStudents = uniqueBy(Array.isArray(studentData) ? studentData : [], 'amsT_Id');
                setStudentList(distinctStudents);
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchStudents();
    }, [watchYear, watchClass, watchSection, watchAdmName]);

    // Handle initial year change student load (getACS)
    useEffect(() => {
        if (watchYear) {
            const fetchAcsStudents = async () => {
                try {
                    const response = await acsMutation.mutateAsync(parseInt(watchYear));
                    const data = (response?.data || response) as any;
                    const studentData = data.studentlist || data.studentList || [];
                    const distinctStudents = uniqueBy(Array.isArray(studentData) ? studentData : [], 'amsT_Id');
                    setStudentList(distinctStudents);
                } catch (error) {
                    console.error('getACS failed:', error);
                }
            };
            fetchAcsStudents();
        }
    }, [watchYear]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold">Left Year <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null, { shouldValidate: true });
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-9">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.academicList || [], 'asmaY_Id').map((yr: any) => (
                                                <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                    {yr.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="admname"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <Label className="font-semibold">Select Radio Button <span className="text-red-500">*</span></Label>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4 p-3 bg-slate-50 rounded-md border"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="regno" /></FormControl>
                                                <Label className="font-normal cursor-pointer">Adm.No.</Label>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="stdname" /></FormControl>
                                                <Label className="font-normal cursor-pointer">Name</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    {errors.admname && <FormError>{errors.admname.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="asmcL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold">Class <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null, { shouldValidate: true });
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-9">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.fillclass || [], 'asmcL_Id').map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="asmS_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold">Section <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null, { shouldValidate: true });
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white h-9">
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.fillsec || [], 'asmS_Id').map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="AMST_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold">Student Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between h-9 bg-white border-slate-300 font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {field.value
                                                                ? `${field.value.amsT_FirstName} ${field.value.amsT_MiddleName || ''} ${field.value.amsT_LastName || ''}`
                                                                : "Select Or Search Student"}
                                                        </span>
                                                        <Search className="h-4 w-4 opacity-50 shrink-0" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search student..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No student found.</CommandEmpty>
                                                        <CommandGroup className="max-h-64 overflow-y-auto">
                                                            {uniqueBy(studentList, 'amsT_Id').map((s: any) => (
                                                                <CommandItem
                                                                    key={s.amsT_Id}
                                                                    value={`${s.amsT_FirstName} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''} ${s.amsT_AdmNo || ''}`}
                                                                    onSelect={() => {
                                                                        field.onChange(s);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold">
                                                                            {s.amsT_FirstName}
                                                                            {s.amsT_MiddleName ? ` ${s.amsT_MiddleName}` : ''}
                                                                            {s.amsT_LastName ? ` ${s.amsT_LastName}` : ''}
                                                                        </span>
                                                                        {s.amsT_AdmNo && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Adm No: {s.amsT_AdmNo}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {field.value?.amsT_Id === s.amsT_Id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {searchMutation.isPending && (
                                            <div className="absolute right-10 top-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                            </div>
                                        )}

                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pervious"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold">Previous School</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter previous school name"
                                            className="h-9 bg-white"
                                            maxLength={50}
                                        />
                                    </FormControl>
                                    {errors.pervious && <FormError>{errors.pervious.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-200">
                    <Button
                        type="submit"
                        className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all"
                        disabled={searchMutation.isPending}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Report
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="min-w-[120px] shadow-sm active:scale-95 transition-all"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomTcSchema, type CustomTcFields } from '@/schemas/admission/preadmission/reports/custom-tc';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    useCustomTcInitialData,
    useCustomTcStudentList,
    useCustomTcStudentNameChange,
    useCustomTcTempPerChange
} from '@/hooks/admission/preadmission/useCustomTcReport';
import { useEffect, useState, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterFormProps {
    onSubmit: (data: CustomTcFields) => void;
    onReset: () => void;
    onStudentListUpdate: (list: any[]) => void;
}

export function FilterForm({ onSubmit, onReset, onStudentListUpdate }: FilterFormProps) {
    const { data: initialData } = useCustomTcInitialData();
    const studentListMutation = useCustomTcStudentList();
    const studentNameChangeMutation = useCustomTcStudentNameChange();
    const tempPerChangeMutation = useCustomTcTempPerChange();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [studentDetails, setStudentDetails] = useState<any>(null);

    const form = useForm<CustomTcFields>({
        resolver: zodResolver(CustomTcSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            admnoorname: 'regno',
            tctemporper: 'per',
            AMST_Id: 0,
        },
    });

    const { watch, setValue, reset, control } = form;
    const asmayId = watch('ASMAY_Id');
    const admnoorname = watch('admnoorname');
    const tctemporper = watch('tctemporper');
    const amstId = watch('AMST_Id');

    const accyear = (initialData as any)?.data?.accyear || [];

    // Trigger student list fetch when dependent fields change
    useEffect(() => {
        if (asmayId > 0) {
            const onSuccessCallback = (response: any) => {
                const responseData = response.data || {};
                const list = response.studentlist || responseData.studentlist || (Array.isArray(response.data) ? response.data : []);
                setStudentList(list);
                onStudentListUpdate(list);
                
                // Reset student selection if it's no longer in the list
                if (amstId > 0 && !list.some((s: any) => s.amsT_Id === amstId)) {
                    setValue('AMST_Id', 0);
                    setStudentDetails(null);
                }
            };

            const payload = {
                ASMAY_Id: asmayId,
                ASMCL_Id: 0,
                ASMS_Id: 0,
                admnoorname: admnoorname,
                tctemporper: tctemporper
            };

            studentListMutation.mutate(payload, { onSuccess: onSuccessCallback });
        }
    }, [asmayId, admnoorname, tctemporper]);

    // Handle Student Selection Change (mimicking stdnamechange)
    useEffect(() => {
        if (amstId > 0 && asmayId > 0) {
            studentNameChangeMutation.mutate({
                AMST_Id: amstId,
                ASMAY_Id: asmayId
            }, {
                onSuccess: (response: any) => {
                    const details = response.classsecregno || (Array.isArray(response.data) ? response.data : []);
                    if (details.length > 0) {
                        setStudentDetails(details[0]);
                    }
                }
            });
        } else {
            setStudentDetails(null);
        }
    }, [amstId, asmayId]);

    const handleReset = () => {
        reset();
        setStudentList([]);
        setStudentDetails(null);
        onReset();
    };

    const selectedStudent = studentList.find(s => s.amsT_Id === amstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Academic Year and Admno/Name */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="ASMAY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="font-semibold text-slate-700">Left Year <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value > 0 ? field.value.toString() : ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-slate-200 focus:ring-primary/20">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accyear.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.ASMAY_Id && <FormError>{form.formState.errors.ASMAY_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="admnoorname"
                            render={({ field }) => (
                                <FormItem className="space-y-3 p-4 border rounded-xl bg-slate-50/50">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex items-center gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="regno" id="regno" />
                                                <Label htmlFor="regno" className="font-medium cursor-pointer">Admno</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="stdname" id="stdname" />
                                                <Label htmlFor="stdname" className="font-medium cursor-pointer">Name</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    {form.formState.errors.admnoorname && <FormError>{form.formState.errors.admnoorname.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column: Temp/Per and Student Dropdown */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="tctemporper"
                            render={({ field }) => (
                                <FormItem className="space-y-3 p-4 border rounded-xl bg-slate-50/50">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="temp" id="temp" />
                                                <Label htmlFor="temp" className="font-medium cursor-pointer">Temp Student</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="per" id="per" />
                                                <Label htmlFor="per" className="font-medium cursor-pointer">Permanent Student</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    {form.formState.errors.tctemporper && <FormError>{form.formState.errors.tctemporper.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="AMST_Id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <Label className="font-semibold text-slate-700">Student <span className="text-red-500">*</span></Label>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between font-normal bg-white border-slate-200 h-10 hover:bg-slate-50",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value && selectedStudent
                                                        ? selectedStudent.studentname
                                                        : "Select Or Search Student"}
                                                    <div className="flex items-center gap-2">
                                                        {field.value ? (
                                                            <X
                                                                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(0);
                                                                }}
                                                            />
                                                        ) : null}
                                                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search student..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>No student found.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-y-auto">
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                value={s.studentname}
                                                                key={s.amsT_Id}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <span>{s.studentname}</span>
                                                                {field.value === s.amsT_Id && <Check className="h-4 w-4 text-primary" />}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {form.formState.errors.AMST_Id && <FormError>{form.formState.errors.AMST_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Student Info Labels (mimicking legacy) */}
                {studentDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Class</span>
                            <span className="font-semibold text-slate-900">{studentDetails.asmcL_ClassName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Section</span>
                            <span className="font-semibold text-slate-900">{studentDetails.asmC_SectionName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Reg. No</span>
                            <span className="font-semibold text-slate-900">{studentDetails.amsT_RegistrationNo}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                    <Button
                        type="submit"
                        disabled={studentListMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-md hover:shadow-lg transition-all"
                    >
                        {studentListMutation.isPending ? "Loading..." : "Report"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="min-w-[140px] border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}


'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, XCircle } from 'lucide-react';
import {
    ndaStudentProfileReportSchema,
    type NdaStudentProfileReportFields,
} from '@/schemas/admission/preadmission/reports/nda-student-profile-report';

interface ProfileReportFormProps {
    academicList: any[];
    classList: any[];
    sectionList: any[];
    onSubmit: (data: NdaStudentProfileReportFields) => void;
    onReset: () => void;
    isPending: boolean;
}

export function ProfileReportForm({
    academicList,
    classList,
    sectionList,
    onSubmit,
    onReset,
    isPending,
}: ProfileReportFormProps) {
    const form = useForm<NdaStudentProfileReportFields>({
        resolver: zodResolver(ndaStudentProfileReportSchema),
        defaultValues: {
            type: 'Student',
            academic_year: '',
            classname: '',
            sectionname: '',
        },
    });

    const reportType = form.watch('type');

    const handleReset = () => {
        form.reset();
        onReset();
    };

    return (
        <Card className="border-slate-200 shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-8">
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <FileText className="w-8 h-8" />
                    REPORT CRITERIA
                </CardTitle>
                <p className="text-indigo-100 font-medium opacity-90">Select the parameters to generate the profile status report</p>
            </CardHeader>
            <CardContent className="p-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        {/* Report Type Selection */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-lg font-bold text-slate-800 tracking-tight uppercase">SELECT REPORT TYPE</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50"
                                        >
                                            <div className="flex items-center space-x-3 group cursor-pointer">
                                                <RadioGroupItem value="Student" id="student" className="w-5 h-5 border-2 text-indigo-600" />
                                                <label htmlFor="student" className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors cursor-pointer">STUDENT</label>
                                            </div>
                                            <div className="flex items-center space-x-3 group cursor-pointer">
                                                <RadioGroupItem value="Staff" id="staff" className="w-5 h-5 border-2 text-indigo-600" />
                                                <label htmlFor="staff" className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors cursor-pointer">STAFF</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Student Specific Filters */}
                        {reportType === 'Student' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <FormField
                                    control={form.control}
                                    name="academic_year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700">ACADEMIC YEAR</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium">
                                                        <SelectValue placeholder="Select Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                                    {academicList.map((year: any, index: number) => (
                                                        <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()} className="h-12 font-medium">
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="classname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700">CLASS</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium">
                                                        <SelectValue placeholder="Select Class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                                    {classList.map((cls: any, index: number) => (
                                                        <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()} className="h-12 font-medium">
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sectionname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700">SECTION</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium">
                                                        <SelectValue placeholder="Select Section" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                                    {sectionList.map((sec: any, index: number) => (
                                                        <SelectItem key={`${sec.asmS_Id}-${index}`} value={sec.asmS_Id.toString()} className="h-12 font-medium">
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-6 pt-6">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full shadow-lg shadow-indigo-200 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 tracking-tighter text-lg"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <FileText className="w-6 h-6" />
                                )}
                                GENERATE REPORT
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="h-14 px-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-black rounded-full shadow-md transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 tracking-tighter text-lg dark:bg-white"
                            >
                                <XCircle className="w-6 h-6" />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIdCardClasses, useIdCardSections, useIdCardStudents } from '@/hooks/admission/preadmission/useStudentIdCardReportNda';
import { type NdaIdCardFilterFields, ndaIdCardFilterSchema } from '@/schemas/admission/preadmission/reports/nda-student-id-card-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Printer, RotateCcw, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface StudentIdCardSearchProps {
    academicList: any[];
    initialClassList: any[];
    onSubmit: (data: any, selectedStudents: any[]) => void;
    onReset: () => void;
    onPrint: () => void;
    showPrint: boolean;
    isLoading: boolean;
}

export function StudentIdCardSearch({
    academicList,
    initialClassList,
    onSubmit,
    onReset,
    onPrint,
    showPrint,
    isLoading
}: StudentIdCardSearchProps) {
    const [classList, setClassList] = useState<any[]>(initialClassList || []);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    const classMutation = useIdCardClasses();
    const sectionMutation = useIdCardSections();
    const studentMutation = useIdCardStudents();

    const form = useForm<NdaIdCardFilterFields>({
        resolver: zodResolver(ndaIdCardFilterSchema),
        defaultValues: {
            academic_year: '',
            classname: '',
            sectionname: '',
            house: ''
        }
    });

    const { watch, setValue } = form;
    const selectedYear = watch('academic_year');
    const selectedClass = watch('classname');
    const selectedSection = watch('sectionname');

    // Load Classes when Year changes
    useEffect(() => {
        async function fetchClasses() {
            if (selectedYear) {
                try {
                    const res = (await classMutation.mutateAsync({ ASMAY_Id: Number(selectedYear) })) as any;
                    const records = res?.getClassList || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setClassList(records);
                    setValue('classname', '');
                    setValue('sectionname', '');
                    setSectionList([]);
                    setStudentList([]);
                } catch (_error) {
                    toast.error('Failed to load classes');
                }
            }
        }
        fetchClasses();
    }, [selectedYear, setValue]);

    // Load Sections when Class changes
    useEffect(() => {
        async function fetchSections() {
            if (selectedYear && selectedClass) {
                try {
                    const res = (await sectionMutation.mutateAsync({
                        ASMAY_Id: Number(selectedYear),
                        ASMCL_Id: Number(selectedClass)
                    })) as any;
                    const records = res?.getSectionList || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setSectionList(records);
                    setValue('sectionname', '');
                    setStudentList([]);
                } catch (_error) {
                    toast.error('Failed to load sections');
                }
            }
        }
        fetchSections();
    }, [selectedYear, selectedClass, setValue]);

    // Load Students when Section changes
    useEffect(() => {
        async function fetchStudents() {
            if (selectedYear && selectedClass && selectedSection) {
                try {
                    const res = (await studentMutation.mutateAsync({
                        ASMAY_Id: Number(selectedYear),
                        ASMCL_Id: Number(selectedClass),
                        ASMS_Id: Number(selectedSection)
                    })) as any;
                    const records = res?.getStudentList || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setStudentList(records.map((s: any) => ({ ...s, selected: true })));
                } catch (_error) {
                    toast.error('Failed to load students');
                }
            }
        }
        fetchStudents();
    }, [selectedYear, selectedClass, selectedSection]);

    const toggleAllStudents = (checked: boolean) => {
        setStudentList(studentList.map((s) => ({ ...s, selected: checked })));
    };

    const toggleStudent = (id: number, checked: boolean) => {
        setStudentList(studentList.map((s) => (s.amsT_Id === id ? { ...s, selected: checked } : s)));
    };

    const filteredStudents = studentList.filter((s) => s.studentName.toLowerCase().includes(studentSearch.toLowerCase()));

    const handleFormSubmit = (data: NdaIdCardFilterFields) => {
        const selected = studentList.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }
        onSubmit(data, selected);
    };

    const handleFormReset = () => {
        form.reset();
        setClassList(initialClassList || []);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-10'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                    {/* Filters Column */}
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='academic_year'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='ml-1 font-black text-indigo-900/40 text-xs uppercase tracking-[0.2em]'>
                                        Academic Year
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {academicList?.map((year, index) => (
                                                <SelectItem
                                                    key={`${year.asmaY_Id}-${index}`}
                                                    value={year.asmaY_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 focus:bg-indigo-50 focus:text-indigo-700'>
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
                            name='classname'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='ml-1 font-black text-indigo-900/40 text-xs uppercase tracking-[0.2em]'>
                                        Class
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={classList.length === 0}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder={classMutation.isPending ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {classList.map((cls, index) => (
                                                <SelectItem
                                                    key={`${cls.asmcL_Id}-${index}`}
                                                    value={cls.asmcL_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 focus:bg-indigo-50 focus:text-indigo-700'>
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
                            name='sectionname'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='ml-1 font-black text-indigo-900/40 text-xs uppercase tracking-[0.2em]'>
                                        Section
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={sectionList.length === 0}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder={sectionMutation.isPending ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {sectionList.map((sec, index) => (
                                                <SelectItem
                                                    key={`${sec.asmS_Id}-${index}`}
                                                    value={sec.asmS_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 focus:bg-indigo-50 focus:text-indigo-700'>
                                                    {sec.asmC_SectionName}
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
                            name='house'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='ml-1 font-black text-indigo-900/40 text-xs uppercase tracking-[0.2em]'>
                                        House Color
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder='Select House' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            <SelectItem value='WHITE' className='py-3 focus:bg-slate-50'>
                                                WHITE
                                            </SelectItem>
                                            <SelectItem value='YELLOW' className='py-3 focus:bg-yellow-50 focus:text-yellow-700'>
                                                JULIE (YELLOW)
                                            </SelectItem>
                                            <SelectItem value='BLUE' className='py-3 focus:bg-blue-50 focus:text-blue-700'>
                                                PROVIDENCE (BLUE)
                                            </SelectItem>
                                            <SelectItem value='RED' className='py-3 focus:bg-red-50 focus:text-red-700'>
                                                ELTING (RED)
                                            </SelectItem>
                                            <SelectItem value='GREEN' className='py-3 focus:bg-emerald-50 focus:text-emerald-700'>
                                                LISETTE (GREEN)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Student Picker Column */}
                    <div className='space-y-4 rounded-[2rem] bg-slate-50/50 p-8 shadow-inner ring-1 ring-slate-200'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white'>
                                    <Users className='h-5 w-5' />
                                </div>
                                <h3 className='font-black text-slate-800 tracking-tight'>STUDENT SELECTOR</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='all-students'
                                    checked={studentList.length > 0 && studentList.every((s) => s.selected)}
                                    onCheckedChange={toggleAllStudents}
                                    className='rounded-md border-slate-300'
                                />
                                <label
                                    htmlFor='all-students'
                                    className='cursor-pointer font-black text-slate-500 text-xs uppercase tracking-tighter'>
                                    Select All
                                </label>
                            </div>
                        </div>

                        <div className='relative'>
                            <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400' />
                            <Input
                                placeholder='Filter student name...'
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className='h-12 rounded-xl border-slate-200 bg-white/80 pl-12 font-medium transition-all focus:bg-white'
                            />
                        </div>

                        <div className='custom-scrollbar h-64 space-y-2 overflow-y-auto pr-2'>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <div
                                        key={`${student.amsT_Id}-${index}`}
                                        className={`flex cursor-pointer items-center justify-between rounded-xl p-4 transition-all ${
                                            student.selected
                                                ? 'border-indigo-200 bg-indigo-50 shadow-sm ring-1 ring-indigo-200'
                                                : 'border-slate-100 bg-white hover:border-slate-300'
                                        } border`}
                                        onClick={() => toggleStudent(student.amsT_Id, !student.selected)}>
                                        <span
                                            className={`font-bold transition-colors ${student.selected ? 'text-indigo-700' : 'text-slate-600'}`}>
                                            {student.studentName}
                                        </span>
                                        <Checkbox
                                            checked={student.selected}
                                            onCheckedChange={(checked) => toggleStudent(student.amsT_Id, !!checked)}
                                            className='rounded-md'
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className='flex h-full flex-col items-center justify-center gap-2 text-slate-300'>
                                    <Users className='h-12 w-12 opacity-20' />
                                    <p className='font-bold text-slate-400 text-xs uppercase tracking-widest'>No students found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex translate-y-2 flex-wrap justify-center gap-6 pt-6'>
                    <Button
                        type='submit'
                        disabled={isLoading || studentMutation.isPending}
                        className='h-16 transform rounded-[2rem] bg-indigo-600 px-12 font-black text-lg text-white tracking-tighter shadow-2xl shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                        {isLoading ? <Loader2 className='mr-4 h-6 w-6 animate-spin' /> : <Search className='mr-4 h-6 w-6' />}
                        REPORT
                    </Button>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        className='h-16 transform rounded-[2rem] border-2 border-orange-100 bg-white px-12 font-black text-lg text-orange-600 tracking-tighter transition-all hover:scale-105 hover:bg-orange-50 active:scale-95'>
                        <RotateCcw className='mr-4 h-6 w-6' />
                        CANCEL
                    </Button>

                    {showPrint && (
                        <Button
                            type='button'
                            onClick={onPrint}
                            className='h-16 transform rounded-[2rem] bg-orange-500 px-12 font-black text-lg text-white tracking-tighter shadow-2xl shadow-orange-200 transition-all hover:scale-105 hover:bg-orange-600 active:scale-95'>
                            <Printer className='mr-4 h-6 w-6' />
                            PRINT
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}

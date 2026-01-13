'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { IVerifyClassWorkSearch, verifyClassWorkSearchSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { fetchSections, fetchSubjects } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SearchFormProps {
    yearList: any[];
    classList: any[];
}

export default function SearchForm({ yearList, classList }: SearchFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const defaultValues: Partial<IVerifyClassWorkSearch> = {
        asmaY_Id: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
        asmcL_Id: searchParams.get('class') ? Number(searchParams.get('class')) : undefined,
        asmS_Id: searchParams.get('section') ? Number(searchParams.get('section')) : undefined,
        ismS_Id: searchParams.get('subject') ? Number(searchParams.get('subject')) : undefined,
        from_date: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
        to_date: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
    };

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<IVerifyClassWorkSearch>({
        resolver: zodResolver(verifyClassWorkSearchSchema),
        defaultValues,
    });

    const selectedClass = watch('asmcL_Id');
    const selectedSection = watch('asmS_Id');

    // Load initial dependents if query params exist
    useEffect(() => {
        const loadInitial = async () => {
            if (defaultValues.asmcL_Id) {
                const secResult = await fetchSections(defaultValues.asmcL_Id);
                setSections(secResult.sectionlist || []);
            }
            if (defaultValues.asmcL_Id && defaultValues.asmS_Id) {
                // Currently fetchSubjects expects an array of sections, but here we pick one.
                // Adapting to existing API: wrap in array
                const subResult = await fetchSubjects(defaultValues.asmcL_Id, [{ asmS_Id: defaultValues.asmS_Id }]);
                setSubjects(subResult.subjectlist || []);
            }
        };
        loadInitial();
    }, []);

    // Fetch Sections when Class changes
    useEffect(() => {
        const loadSections = async () => {
            if (selectedClass && selectedClass !== defaultValues.asmcL_Id) {
                try {
                    const result = await fetchSections(selectedClass);
                    setSections(result.sectionlist || []);
                    setValue('asmS_Id', 0); // Reset section
                    setValue('ismS_Id', 0); // Reset subject
                } catch (error) {
                    toast.error('Failed to load sections');
                }
            }
        };
        if (selectedClass) loadSections();
    }, [selectedClass, setValue]);

    // Fetch Subjects when Section changes
    useEffect(() => {
        const loadSubjects = async () => {
            if (selectedClass && selectedSection && selectedSection !== defaultValues.asmS_Id) {
                try {
                    const result = await fetchSubjects(selectedClass, [{ asmS_Id: selectedSection }]);
                    setSubjects(result.subjectlist || []);
                    setValue('ismS_Id', 0); // Reset subject
                } catch (error) {
                    toast.error('Failed to load subjects');
                }
            }
        };
        if (selectedClass && selectedSection) loadSubjects();
    }, [selectedClass, selectedSection, setValue]);

    const onSubmit = (data: IVerifyClassWorkSearch) => {
        const params = new URLSearchParams();
        params.set('year', data.asmaY_Id.toString());
        params.set('class', data.asmcL_Id.toString());
        params.set('section', data.asmS_Id.toString());
        params.set('subject', data.ismS_Id.toString());
        params.set('from', data.from_date.toISOString());
        params.set('to', data.to_date.toISOString());
        router.push(`?${params.toString()}`);
    };

    const handleCancel = () => {
        router.push('?');
        // Ideally reset form too, but router push causing unmount/remount might be enough if parent structure changes, 
        // effectively resetting if state is lifted or we force reload. 
        // Here we just clear URL, user might want form cleared.
        setValue('asmaY_Id', undefined as any);
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
        setValue('from_date', undefined as any);
        setValue('to_date', undefined as any);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
                {/* Academic Year */}
                <div className="space-y-1">
                    <Label className='text-sm font-semibold'>Academic Year :<span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select Year--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                {/* Class */}
                <div className="space-y-1">
                    <Label className='text-sm font-semibold'>Class :<span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select Class--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classList.map((cls: any) => (
                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>

                {/* Section */}
                <div className="space-y-1">
                    <Label className='text-sm font-semibold'>Section :<span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select Section--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((sec: any) => (
                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                            {sec.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                </div>

                {/* Subject */}
                <div className="space-y-1">
                    <Label className='text-sm font-semibold'>Subject :<span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select Subject--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((sub: any) => (
                                        <SelectItem key={sub.ismS_Id} value={sub.ismS_Id.toString()}>
                                            {sub.ismS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ismS_Id && <FormError>{errors.ismS_Id.message}</FormError>}
                </div>

                {/* From Date */}
                <div className='flex flex-col space-y-1'>
                    <Label className='text-sm font-semibold'>From Date <span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='from_date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, 'dd/MM/yyyy')
                                        ) : (
                                            <span>Start Date</span>
                                        )}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                </div>

                {/* To Date */}
                <div className='flex flex-col space-y-1'>
                    <Label className='text-sm font-semibold'>To Date <span className='text-red-500'>*</span></Label>
                    <Controller
                        control={control}
                        name='to_date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, 'dd/MM/yyyy')
                                        ) : (
                                            <span>End Date</span>
                                        )}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.to_date && <FormError>{errors.to_date.message}</FormError>}
                </div>
            </div>

            <div className='flex items-center justify-center gap-4'>
                <Button type='submit' className='bg-blue-700/90 text-white hover:bg-blue-800'>
                    GET LIST
                </Button>
                <Button type='button' variant='destructive' onClick={handleCancel} className='bg-orange-600/90 text-white hover:bg-orange-700'>
                    <X className='mr-1 h-4 w-4' /> CANCEL
                </Button>
            </div>
        </form>
    );
}

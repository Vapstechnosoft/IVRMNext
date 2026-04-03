'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type IHomeWork, homeWorkSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getSubjectsDropDownByAcademicYearandClassandSectionlist } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { saveHomeWork } from '@/server/upload/transactions/ivrm-homework/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateHomeWorkFormProps {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
    selectedRow: any;
}

export default function UpdateHomeWorkForm({ onSuccess, yearList, classList, selectedRow }: UpdateHomeWorkFormProps) {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>(classList || []);
    const [isclassesLoading, setIsClassesLoading] = useState(false);
    const [isUrlMode, setIsUrlMode] = useState(false);

    useEffect(() => {
        if (classList?.length > 0) {
            setClasses(classList);
        }
    }, [classList]);

    const methods = useForm<IHomeWork>({
        resolver: zodResolver(homeWorkSchema.addOrUpdate)
    });

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        setValue,
        reset
    } = methods;

    useEffect(() => {
        if (selectedRow) {
            const row = selectedRow;
            const asmaY_Id = Number(row.asmaY_Id || row.ASMAY_Id || 0);
            const asmcL_Id = Number(row.asmcL_Id || row.ASMCL_Id || 0);
            const asmS_Id = Number(row.asmS_Id || row.ASMS_Id || 0);
            const ismS_Id = Number(row.ismS_Id || row.ISMS_Id || 0);

            reset({
                ...row,
                asmaY_Id,
                asmcL_Id,
                ismS_Id: ismS_Id > 0 ? ismS_Id : undefined,
                hm_section_list:
                    row.hm_section_list ||
                    (asmS_Id > 0 ? [{ asmS_Id }] : []),
                ihW_Date: row.ihW_Date || row.IHW_Date
                    ? typeof (row.ihW_Date || row.IHW_Date) === 'string'
                        ? parseISO(row.ihW_Date || row.IHW_Date)
                        : row.ihW_Date || row.IHW_Date
                    : new Date(),
                ihW_FilePath_Array: row.ihW_FilePath_Array || row.IHW_FilePath_Array || [{ ihW_FilePath: '', fileName: '' }]
            });
        }
    }, [selectedRow, reset]);
    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({ control, name: 'hm_section_list' });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'ihW_FilePath_Array'
    });

    useEffect(() => {
        if (selectedYear && selectedYear > 0 && classes.length === 0) {
            setIsClassesLoading(true);
            (async () => {
                try {
                    const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                    setClasses(Array.isArray(data) ? data : []);
                } catch {
                    toast.error('Failed to load classes');
                    setClasses([]);
                } finally {
                    setIsClassesLoading(false);
                }
            })();
        }
    }, [selectedYear, classes.length]);

    useEffect(() => {
        const loadSections = async () => {
            if (selectedClass && selectedYear) {
                try {
                    const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                    setSections(Array.isArray(data) ? data : []);
                } catch (error) {
                    toast.error('Failed to load sections');
                }
            } else {
                setSections([]);
            }
        };
        loadSections();
    }, [selectedClass, selectedYear]);

    useEffect(() => {
        const loadSubjects = async () => {
            if (selectedClass && selectedYear && selectedSections?.length > 0) {
                try {
                    const payload = {
                        asmaY_Id: selectedYear,
                        asmcL_Id: selectedClass,
                        hm_section_list: selectedSections
                    };
                    const { data } = await getSubjectsDropDownByAcademicYearandClassandSectionlist(payload);
                    setSubjects(Array.isArray(data) ? data : []);
                } catch (error) {
                    toast.error('Failed to load subjects');
                }
            } else {
                setSubjects([]);
            }
        };
        loadSubjects();
    }, [selectedClass, selectedYear, selectedSections]);

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue(`ihW_FilePath_Array.${index}.fileName`, file.name);
            setValue(`ihW_FilePath_Array.${index}.ihW_FilePath`, URL.createObjectURL(file));
        }
    };

    const handleSectionChange = (sectionId: number, isChecked: boolean, onChange: (val: any) => void, value: any) => {
        const current = value || [];
        if (isChecked) {
            onChange([...current, { asmS_Id: sectionId }]);
        } else {
            onChange(current.filter((x: any) => x.asmS_Id !== sectionId));
        }
    };

    const onSubmit = async (data: IHomeWork) => {
        try {
            const result = await saveHomeWork(data);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-xl border bg-card p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-4'>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-destructive'>*</span>
                                </Label>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isclassesLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (
                                            classes?.map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        name='hm_section_list'
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-destructive'>*</span>
                                </Label>
                                <div className='grid grid-cols-2 gap-2 rounded-md border p-3'>
                                    {sections.map((sec) => (
                                        <div key={sec.asmS_Id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`update-sec-${sec.asmS_Id}`}
                                                checked={field.value?.some((x: any) => x.asmS_Id === sec.asmS_Id)}
                                                onCheckedChange={(checked) => handleSectionChange(sec.asmS_Id, checked as boolean, field.onChange, field.value)}
                                            />
                                            <label htmlFor={`update-sec-${sec.asmS_Id}`} className='cursor-pointer text-sm'>
                                                {sec.asmC_SectionName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='ismS_Id'
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Subject <span className='text-destructive'>*</span>
                                </Label>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Subject' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((sub: any) => (
                                            <SelectItem key={sub.ismS_Id} value={sub.ismS_Id.toString()}>
                                                {sub.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='ihW_Topic'
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Topic <span className='text-destructive'>*</span>
                                </Label>
                                <Input {...field} placeholder='Enter Topic' />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                <div className='space-y-4'>
                    <Controller
                        control={control}
                        name='ihW_Date'
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    H.W Date <span className='text-destructive'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='ihW_Assignment'
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Assignment</Label>
                                <Textarea {...field} value={field.value || ''} placeholder='Enter Assignment' rows={4} />
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='ihW_AssignmentNo'
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Assignment No</Label>
                                <Input {...field} value={field.value || ''} placeholder='Enter Assignment Number' />
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className='space-y-4'>
                <Label className='font-semibold text-lg'>Attachments</Label>
                <div className='space-y-4 rounded-md border p-4'>
                    <div className='mb-4 flex items-center space-x-2'>
                        <Checkbox
                            id='update-url-mode'
                            checked={isUrlMode}
                            onCheckedChange={(checked) => setIsUrlMode(checked as boolean)}
                        />
                        <Label htmlFor='update-url-mode' className='font-normal'>
                            If URL
                        </Label>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='p-2 text-left'>SL NO</th>
                                    <th className='p-2 text-left'>{isUrlMode ? 'URL' : 'Upload File'}</th>
                                    {!isUrlMode && <th className='p-2 text-left'>File Name</th>}
                                    <th className='p-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((item, index) => (
                                    <tr key={item.id} className='border-b last:border-0'>
                                        <td className='p-2'>{index + 1}</td>
                                        <td className='p-2'>
                                            {isUrlMode ? (
                                                <Controller
                                                    control={control}
                                                    name={`ihW_FilePath_Array.${index}.ihW_FilePath`}
                                                    render={({ field }) => <Input {...field} placeholder='Enter URL' />}
                                                />
                                            ) : (
                                                <div className='space-y-1'>
                                                    <Input type='file' onChange={(e) => handleFileChange(index, e)} />
                                                    {item.ihW_FilePath && !item.ihW_FilePath.startsWith('blob:') && (
                                                        <a
                                                            href={item.ihW_FilePath}
                                                            target='_blank'
                                                            className='text-primary text-xs hover:underline'
                                                            rel='noreferrer'>
                                                            Existing File
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        {!isUrlMode && (
                                            <td className='p-2'>
                                                <Controller
                                                    control={control}
                                                    name={`ihW_FilePath_Array.${index}.fileName`}
                                                    render={({ field }) => <Input {...field} disabled placeholder='FileName' />}
                                                />
                                            </td>
                                        )}
                                        <td className='p-2'>
                                            <div className='flex items-center justify-center gap-2'>
                                                {index === fields.length - 1 && (
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        size='icon'
                                                        onClick={() => append({ ihW_FilePath: '', fileName: '' })}>
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                                {fields.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        size='icon'
                                                        className='text-destructive'
                                                        onClick={() => remove(index)}>
                                                        <Minus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className='flex justify-center pt-4'>
                <Button type='submit' size='lg' disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
            </div>
        </form>
    );
}

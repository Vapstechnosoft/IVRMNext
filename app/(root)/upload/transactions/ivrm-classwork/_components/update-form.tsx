'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useClassDropdownDropdown, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';
import { ClassWorkUploadedList } from '@/hooks/upload/transactions/useClassWork';
import { cn } from '@/lib/utils';
import { classWorkSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getSubjectsDropDownByAcademicYearandClassandSectionlist,
    uploadClassWork
} from '@/server/upload/transactions/ivrm-classwork/server-action';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Minus, Plus, Save, Search, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface UpdateClassWorkFormProps {
    onSuccess: () => void;
    classList: any[];
    selectedRow: IClassWorkDetails;
}

type FormFields = z.infer<typeof classWorkSchema.addOrUpdate>;

export default function UpdateClassWorkForm({ onSuccess, selectedRow }: UpdateClassWorkFormProps) {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<{ ismS_Id: number }[]>([]);
    const [sectionSearch, setSectionSearch] = useState('');
    const [showUrlSection, setShowUrlSection] = useState(false);

    const {
        handleSubmit,
        reset,
        setValue,
        getValues,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(classWorkSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: 0,
            icW_FilePath_Array: [{ icW_FilePath: '', fileName: '' }],
            icW_Attachment_Array: [{ icW_FilePath: '', fileName: '' }]
        }
    });
    const { data: academicResponse } = useAcademicYearDropdown();
    const { data: classData } = useClassDropdownDropdown();
    const { data: sectionListResponse } = useFeeSectionListDefaulterreport();
    const [classes, setClasses] = useState<any[]>([]);
    const [isclassesLoading, setIsClassesLoading] = useState(false);
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({
        control,
        name: 'hm_section_list'
    });
    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedAcademic = watch("asmaY_Id");

    useEffect(() => {
        if (selectedRow) {
            reset({
                asmaY_Id: selectedRow.asmaY_Id,
                asmcL_Id: selectedRow.asmcL_Id,
                hm_section_list: selectedRow.asmS_Id ? [{ asmS_Id: selectedRow.asmS_Id }] : [],
                ismS_Id: selectedRow.ismS_Id,
                icW_Topic: selectedRow.icW_Topic,
                icW_SubTopic: selectedRow.icW_SubTopic,
                icW_Content: selectedRow.icW_Content,
                icW_FromDate: selectedRow.icW_FromDate ? new Date(selectedRow.icW_FromDate) : undefined,
                icW_ToDate: selectedRow.icW_ToDate ? new Date(selectedRow.icW_ToDate) : undefined,
                icW_FilePath_Array: selectedRow.icW_FilePath
                    ? [{ icW_FilePath: selectedRow.icW_FilePath, fileName: selectedRow.icW_Attachment || 'File' }]
                    : [{ icW_FilePath: '', fileName: '' }],
                // Note: selectedRow doesn't seem to have a dedicated URL field in the interface provided,
                // but if icW_Attachment holds it, we verify. For now, defaulting or using icW_Attachment if it looks like a URL.
                icW_Attachment_Array: [{ icW_FilePath: '', fileName: '' }]
            });
            if (selectedRow.icW_FilePath) {
                // If there's a file, we might assume no separate URL section was active, or handle accordingly.
                // Logic based on requirements:
            }
        }
    }, [selectedRow]);

    useEffect(() => {
        if (!selectedYear || selectedYear === 0) {
            setClasses([]);
            setSections([]);
            return;
        }
        setIsClassesLoading(true);
        (async () => {
            try {
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                setClasses(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load classes');
                setClasses([]);
            }
        })();
        setIsClassesLoading(false);
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || selectedClass === 0) {
            setSections([]);
            return;
        }
        (async () => {
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                setSections(Array.isArray(data?.sectionlist) ? data.sectionlist : []);
            } catch {
                toast.error('Failed to load sections');
                setSections([]);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSections?.length) return;
        let mounted = true;
        (async () => {
            try {
                const payload = {
                    asmaY_Id: selectedYear,
                    asmcL_Id: selectedClass,
                    hm_section_list: selectedSections
                };
                const { data } = await getSubjectsDropDownByAcademicYearandClassandSectionlist(payload);
                if (!mounted) return;
                const newSubjects = Array.isArray(data) ? data : [];
                setSubjects(newSubjects);
                const currentSubject = getValues('ismS_Id');
                const subjectExists = newSubjects.some((sub: any) => sub.ismS_Id === currentSubject);
                if (!subjectExists) {
                    setValue('ismS_Id', 0);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
                toast.error('Failed to load subjects');
            }
        })();
        return () => {
            mounted = false;
        };
    }, [selectedYear, selectedClass, selectedSections, setValue, getValues]);

    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [isViewing, setIsViewing] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const {
        fields: fileFields,
        append: appendFile,
        remove: removeFile,
        update: updateFile
    } = useFieldArray({
        control,
        name: 'icW_FilePath_Array'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control,
        name: 'icW_Attachment_Array'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        // const allowedTypes = [ ... ];
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should not exceed 5MB');
            return;
        }

        try {
            const previewUrl = URL.createObjectURL(file);
            updateFile(index, {
                icW_FilePath: previewUrl,
                fileName: file.name,
                // @ts-ignore
                isUploading: true
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'ivrm_classwork');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                updateFile(index, {
                    icW_FilePath: response.data,
                    fileName: file.name,
                    // @ts-ignore
                    isUploading: false
                });
                toast.success('File uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
            updateFile(index, {
                icW_FilePath: '',
                fileName: '',
                // @ts-ignore
                isUploading: false
            });
            toast.error(`Failed to upload: ${errorMessage}`);
        } finally {
            if (fileInputRefs.current[index]) {
                fileInputRefs.current[index].value = '';
            }
        }
    };

    const handleViewImage = (imageUrl: string) => {
        setViewingImage(imageUrl);
        setIsViewing(true);
    };

    const handleUrlCheckboxChange = (checked: boolean) => {
        setShowUrlSection(checked);
        if (checked && urlFields.length === 0) {
            appendUrl({ icW_FilePath: '', fileName: '' });
        } else if (!checked) {
            // Optional: clear fields if unchecked
        }
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                icW_Id: selectedRow.icW_Id ?? 0,
                mI_Id: 0,
                icW_Topic: data.icW_Topic,
                icW_SubTopic: data.icW_SubTopic,
                icW_Content: data.icW_Content,
                icW_TeachingAid: 0,
                icW_FromDate: data.icW_FromDate,
                icW_ToDate: data.icW_ToDate,
                icW_Evaluation: 'string',
                icW_Attachment: 'string',
                icwatT_Attachment: 'string',
                icwatT_FileName: 'string',
                asmaY_Id: data.asmaY_Id,
                login_Id: 0,
                asmcL_Id: data.asmcL_Id,
                ismS_Id: data.ismS_Id,
                icW_Assignment: '',
                asmS_Id: 0,
                hm_section_list: data.hm_section_list,
                icW_FilePath_Array: data.icW_FilePath_Array?.map((f) => ({
                    icW_FilePath: f.icW_FilePath,
                    fileName: f.fileName
                })) || [],
                icW_Attachment_Array: data.icW_Attachment_Array?.map((f) => ({
                    icW_FilePath: f.icW_FilePath,
                    fileName: f.fileName
                })) || [],
                devicelist12: ['string']
            };

            const response = await uploadClassWork(payload);
            console.log('payload', payload);
            if (response?.success) {
                toast.success(response.message || 'Saved successfully');
                handleReset();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Save failed');
            }
        } catch (err: any) {
            console.error('API Error:', err);
            toast.error(err?.message || 'Something went wrong');
        }
    };

    const {
        fields: sectionFields,
        append: appendSection,
        remove: removeSection
    } = useFieldArray({
        control,
        name: 'hm_section_list'
    });

    const handleSectionChange = (sectionId: number, isChecked: boolean) => {
        if (isChecked) {
            appendSection({ asmS_Id: sectionId });
        } else {
            const index = selectedSections?.findIndex((x: any) => x.asmS_Id === sectionId);
            if (index !== undefined && index > -1) removeSection(index);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicResponse?.data?.map((year: any) => (
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

                    {/* Class */}
                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('hm_section_list', []);
                                        setSubjects([]);
                                    }}
                                    value={field.value?.toString()}>
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
                            <div className='flex flex-col gap-2'>
                                <Label className='font-semibold'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>

                                <div className='flex flex-col gap-2 rounded-md border border-primary/20 p-3 shadow-sm'>
                                    <div className='relative'>
                                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                                        <Input
                                            placeholder='search here...'
                                            className='h-9 pl-9 text-sm'
                                            value={sectionSearch}
                                            onChange={(e) => setSectionSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className='max-h-[160px] space-y-2 overflow-y-auto px-1 py-1'>
                                        {sections
                                            .filter((s) => s.asmC_SectionName?.toLowerCase().includes(sectionSearch.toLowerCase()))
                                            .map((s) => {
                                                const checked = field.value?.some((x: any) => x.asmS_Id === s.asmS_Id) ?? false;

                                                return (
                                                    <label
                                                        key={s.asmS_Id}
                                                        className='flex cursor-pointer items-center gap-2 rounded p-1 transition-colors hover:bg-muted/50'>
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...current, { asmS_Id: s.asmS_Id }]);
                                                                } else {
                                                                    field.onChange(current.filter((x: any) => x.asmS_Id !== s.asmS_Id));
                                                                }
                                                            }}
                                                        />
                                                        <span className='text-sm'>{s.asmC_SectionName}</span>
                                                    </label>
                                                );
                                            })}

                                        {sections.length === 0 && (
                                            <div className='py-4 text-center text-muted-foreground text-sm uppercase'>
                                                Select a class first
                                            </div>
                                        )}
                                        {sections.length > 0 &&
                                            sections.filter((s) => s.asmC_SectionName?.toLowerCase().includes(sectionSearch.toLowerCase()))
                                                .length === 0 && (
                                                <div className='py-4 text-center text-muted-foreground text-sm'>No sections found</div>
                                            )}
                                    </div>
                                </div>

                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Subject */}
                    <Controller
                        control={control}
                        name='ismS_Id'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Subject <span className='text-red-500'>*</span>
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

                    {/* Topic */}
                    <Controller
                        control={control}
                        name='icW_Topic'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Topic <span className='text-red-500'>*</span>
                                </Label>
                                <Input placeholder='Enter Topic' {...field} />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Sub Topic */}
                    <Controller
                        control={control}
                        name='icW_SubTopic'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Sub Topic <span className='text-red-500'>*</span>
                                </Label>
                                <Input placeholder='Enter Sub Topic' {...field} />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Start Date */}
                    <Controller
                        control={control}
                        name='icW_FromDate'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col'>
                                <Label>
                                    Start Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* End Date */}
                    <Controller
                        control={control}
                        name='icW_ToDate'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col'>
                                <Label>
                                    End Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* Content */}
                <div className='grid grid-cols-1'>
                    <Controller
                        control={control}
                        name='icW_Content'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Content <span className='text-red-500'>*</span>
                                </Label>
                                <Textarea placeholder='Enter Content' {...field} rows={3} />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* File Upload Section */}
                {/* File Upload Section */}
                <div className='space-y-4 rounded-md border p-4'>
                    <h3 className='font-semibold text-lg'>Attachments</h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full table-auto border-collapse border text-left text-sm'>
                            <thead className='bg-muted'>
                                <tr>
                                    <th className='w-12 border p-2 text-center'>SL. NO</th>
                                    <th className='border p-2 text-center'>Upload File</th>
                                    <th className='border p-2 text-center'>File Name</th>
                                    <th className='w-16 border p-2 text-center'>View</th>
                                    <th className='w-16 border p-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileFields.map((item, index) => (
                                    <tr key={item.id} className='border-b'>
                                        <td className='border p-2 text-center'>{index + 1}</td>
                                        <td className='border p-2'>
                                            <div className='flex justify-center'>
                                                <input
                                                    ref={(el) => {
                                                        fileInputRefs.current[index] = el;
                                                    }}
                                                    type='file'
                                                    className='hidden'
                                                    onChange={(e) => handleFileUpload(e, index)}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => fileInputRefs.current[index]?.click()}
                                                    className='h-8'
                                                    // @ts-ignore
                                                    disabled={item.isUploading}>
                                                    {/* @ts-ignore */}
                                                    {item.isUploading ? (
                                                        <>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className='mr-2 h-4 w-4' />
                                                            Choose File
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                        <td className='border p-2'>
                                            <Controller
                                                control={control}
                                                name={`icW_FilePath_Array.${index}.fileName`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        readOnly
                                                        disabled
                                                        placeholder='No file chosen'
                                                        className='h-9 bg-muted text-xs'
                                                        value={field.value || ''}
                                                    />
                                                )}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`icW_FilePath_Array.${index}.icW_FilePath`}
                                                render={({ field }) => (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => field.value && handleViewImage(field.value)}
                                                        // @ts-ignore
                                                        disabled={!field.value || item.isUploading}
                                                        className={!field.value ? 'cursor-not-allowed opacity-50' : ''}>
                                                        {/* @ts-ignore */}
                                                        {item.isUploading ? (
                                                            <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
                                                        ) : (
                                                            <Eye className='h-4 w-4 text-blue-600' />
                                                        )}
                                                    </Button>
                                                )}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <div className='flex justify-center gap-1'>
                                                {fileFields.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='destructive'
                                                        className='h-8 w-8'
                                                        onClick={() => removeFile(index)}
                                                        // @ts-ignore
                                                        disabled={item.isUploading}>
                                                        <Minus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                                {index === fileFields.length - 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='outline'
                                                        className='h-8 w-8'
                                                        onClick={() =>
                                                            appendFile({
                                                                icW_FilePath: '',
                                                                fileName: '',
                                                                // @ts-ignore
                                                                isUploading: false
                                                            })
                                                        }>
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {isViewing && viewingImage && (
                            <div
                                onClick={() => {
                                    setIsViewing(false);
                                    setViewingImage(null);
                                }}
                                className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
                                <img src={viewingImage} alt='preview' className='max-h-[90%] max-w-[90%] rounded-lg shadow-lg' />
                                <Button
                                    onClick={() => {
                                        setIsViewing(false);
                                        setViewingImage(null);
                                    }}
                                    className='absolute top-4 right-4'
                                    variant='destructive'
                                    size='icon'>
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                        )}
                        <p className='mt-2 text-sm text-green-700'>
                            <span className='font-bold text-red-500'>Accept File:</span> jpg, jpeg, png, doc, ppt, excel, mp3, mp4, wmv, pdf
                        </p>
                    </div>
                </div>

                {/* URL Section */}
                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='checklink'
                        checked={showUrlSection}
                        onCheckedChange={(checked) => handleUrlCheckboxChange(checked as boolean)}
                    />
                    <Label htmlFor='checklink'>If URL</Label>
                </div>

                {showUrlSection && (
                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='font-semibold text-lg'>URL Details</h3>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto border-collapse border text-left text-sm'>
                                <thead className='bg-muted'>
                                    <tr>
                                        <th className='w-12 border p-2 text-center'>SL NO</th>
                                        <th className='border p-2 text-center'>URL</th>
                                        <th className='w-16 border p-2 text-center'>View</th>
                                        <th className='w-16 border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urlFields.map((item, index) => (
                                        <tr key={item.id} className='border-b'>
                                            <td className='border p-2 text-center'>{index + 1}</td>
                                            <td className='border p-2'>
                                                <Controller
                                                    control={control}
                                                    name={`icW_Attachment_Array.${index}.icW_FilePath`}
                                                    render={({ field }) => (
                                                        <Input {...field} placeholder='Enter URL' className='h-9' />
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <Controller
                                                    control={control}
                                                    name={`icW_Attachment_Array.${index}.icW_FilePath`}
                                                    render={({ field }) => (
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => {
                                                                field.value?.startsWith('http')
                                                                    ? window.open(field.value, '_blank')
                                                                    : toast.error('Invalid URL');
                                                            }}>
                                                            <Eye className='h-4 w-4 text-blue-600' />
                                                        </Button>
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <div className='flex justify-center gap-1'>
                                                    {index === urlFields.length - 1 && (
                                                        <Button
                                                            type='button'
                                                            size='icon'
                                                            variant='outline'
                                                            className='h-8 w-8'
                                                            onClick={() => appendUrl({ icW_FilePath: '', fileName: '' })}>
                                                            <Plus className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                    {urlFields.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            size='icon'
                                                            variant='destructive'
                                                            className='h-8 w-8'
                                                            onClick={() => removeUrl(index)}
                                                            disabled={urlFields.length === 1}>
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
                )}

                {/* Checkboxes */}
                {/* <div className='flex flex-wrap gap-6'>
                        <Controller
                            control={control}
                            name='icW_Assignment'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label className='font-normal'>Assignment</Label>
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name='icW_Evaluation'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label className='font-normal'>Evaluation</Label>
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name='icW_TeachingAid'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label className='font-normal'>Teaching Aid</Label>
                                </div>
                            )}
                        />
                    </div> */}

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className=' h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Helper icons
// function PlusIcon(props: any) {
//     return (
//         <svg
//             {...props}
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <path d="M5 12h14" />
//             <path d="M12 5v14" />
//         </svg>
//     )
// }

// function MinusIcon(props: any) {
//     return (
//         <svg
//             {...props}
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <path d="M5 12h14" />
//         </svg>
//     )
// }

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
import { cn } from '@/lib/utils';
import { type IHomeWork, homeWorkSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import { getSubjectsDropDownByAcademicYearandClassandSectionlist } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { saveHomeWork } from '@/server/upload/transactions/ivrm-homework/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Minus, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface AddHomeWorkFormProps {
    onSuccess: () => void;
    classList: any[];
}

// Extend IHomeWork to include a separate array for URLs for the form state
interface IHomeWorkForm extends IHomeWork {
    ihW_Attachment_Array: { ihW_FilePath: string; fileName: string }[];
}

export default function AddHomeWorkForm({ onSuccess, classList }: AddHomeWorkFormProps) {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isclassesLoading, setIsClassesLoading] = useState(false);
    const [showUrlSection, setShowUrlSection] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const { data: academicResponse } = useAcademicYearDropdown();

    const methods = useForm<IHomeWorkForm>({
        resolver: zodResolver(homeWorkSchema.addOrUpdate),
        defaultValues: {
            ihW_ActiveFlag: true,
            hm_section_list: [],
            ihW_FilePath_Array: [{ ihW_FilePath: '', fileName: '' }],
            ihW_Attachment_Array: [{ ihW_FilePath: '', fileName: '' }],
            ihW_Date: new Date()
        }
    });

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        setValue
    } = methods;
    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({ control, name: 'hm_section_list' });

    const {
        fields: fileFields,
        append: appendFile,
        remove: removeFile,
        update: updateFile
    } = useFieldArray({
        control,
        name: 'ihW_FilePath_Array'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control,
        name: 'ihW_Attachment_Array'
    });

    const {
        fields: sectionFields,
        append: appendSection,
        remove: removeSection
    } = useFieldArray({
        control,
        name: 'hm_section_list'
    });

    // Populate classes when Academic Year changes
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
    }, [selectedYear]);

    // Populate sections when Class changes
    useEffect(() => {
        if (!selectedYear || !selectedClass || selectedClass === 0) {
            setSections([]);
            return;
        }
        (async () => {
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load sections');
                setSections([]);
            }
        })();
    }, [selectedYear, selectedClass]);

    // Populate subjects when Sections change
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSections?.length) {
            setSubjects([]);
            return;
        }
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
                setSubjects(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error('Failed to load subjects');
                setSubjects([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [selectedYear, selectedClass, selectedSections]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should not exceed 5MB');
            return;
        }

        try {
            const previewUrl = URL.createObjectURL(file);
            updateFile(index, {
                ihW_FilePath: previewUrl,
                fileName: file.name,
                // @ts-ignore
                isUploading: true
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'ivrm_homework');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                updateFile(index, {
                    ihW_FilePath: response.data,
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
                ihW_FilePath: '',
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
            appendUrl({ ihW_FilePath: '', fileName: '' });
        }
    };

    const onSubmit = async (data: IHomeWorkForm) => {
        try {
            // Merge files and URLs into ihW_FilePath_Array
            const mergedAttachments = [
                ...(data.ihW_FilePath_Array?.filter((f) => f.ihW_FilePath && f.fileName) || []),
                ...(data.ihW_Attachment_Array?.filter((f) => f.ihW_FilePath) || [])
            ];

            const payload: IHomeWork = {
                ...data,
                ihW_FilePath_Array: mergedAttachments
            };
            console.log('home work payload', payload);

            const result = await saveHomeWork(payload);
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

    const handleReset = () => {
        methods.reset();
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
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
                            <div className='flex flex-col gap-3 sm:flex-row'>
                                <Label className='w-32 font-medium'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>

                                <div className='flex-1'>
                                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                                        {sections.map((s) => {
                                            const checked = field.value?.some((x: any) => x.asmS_Id === s.asmS_Id) ?? false;

                                            return (
                                                <label key={s.asmS_Id} className='flex cursor-pointer items-center gap-2'>
                                                    <input
                                                        type='checkbox'
                                                        disabled={!selectedClass || selectedClass === 0}
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const current = field.value || [];
                                                            if (e.target.checked) {
                                                                field.onChange([...current, { asmS_Id: s.asmS_Id }]);
                                                            } else {
                                                                field.onChange(current.filter((x: any) => x.asmS_Id !== s.asmS_Id));
                                                            }
                                                        }}
                                                    />
                                                    <span>{s.asmC_SectionName}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            </div>
                        )}
                    />

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

                    <Controller
                        control={control}
                        name='ihW_Topic'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Topic <span className='text-red-500'>*</span>
                                </Label>
                                <Input {...field} placeholder='Enter Topic' />
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name='ihW_Date'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col'>
                                <Label>
                                    H.W Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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

                    <Controller
                        control={control}
                        name='ihW_AssignmentNo'
                        render={({ field }) => (
                            <div>
                                <Label>Assignment No </Label>
                                <Input {...field} value={field.value || ''} placeholder='Enter Assignment Number' />
                            </div>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1'>
                    <Controller
                        control={control}
                        name='ihW_Assignment'
                        render={({ field }) => (
                            <div>
                                <Label>
                                    Assignment <span className='text-red-500'>*</span>
                                </Label>
                                <Textarea {...field} value={field.value || ''} placeholder='Enter Assignment' rows={3} />
                            </div>
                        )}
                    />
                </div>

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
                                                    disabled={item.isUploading}
                                                >
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
                                                name={`ihW_FilePath_Array.${index}.fileName`}
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
                                                name={`ihW_FilePath_Array.${index}.ihW_FilePath`}
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
                                                        disabled={item.isUploading}
                                                    >
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
                                                                ihW_FilePath: '',
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
                        <p className='mt-2 text-green-700 text-sm'>
                            <span className='font-bold text-red-500'>Accept File:</span> jpg, jpeg, png, doc, ppt, excel, mp3, mp4, wmv, pdf
                        </p>
                    </div>
                </div>

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
                                                    name={`ihW_Attachment_Array.${index}.ihW_FilePath`}
                                                    render={({ field }) => <Input {...field} placeholder='Enter URL' className='h-9' />}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <Controller
                                                    control={control}
                                                    name={`ihW_Attachment_Array.${index}.ihW_FilePath`}
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
                                                            onClick={() => appendUrl({ ihW_FilePath: '', fileName: '' })}>
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

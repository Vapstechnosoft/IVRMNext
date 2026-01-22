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
import { classWorkSchema, type IClassWork } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { fetchSections, fetchSubjects, saveClassWork } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface AddClassWorkFormProps {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
}

export default function AddClassWorkForm({ onSuccess, yearList, classList }: AddClassWorkFormProps) {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showUrlSection, setShowUrlSection] = useState(false);

    const methods = useForm<IClassWork>({
        resolver: zodResolver(classWorkSchema),
        defaultValues: {
            icW_ActiveFlag: true,
            icW_Assignment: false,
            icW_TeachingAid: false,
            icW_Evaluation: false,
            hm_section_list: [],
            ICW_FilePath_Array: [{ icW_FilePath: '', FileName: '' }],
            ICW_Attachment_Array: []
        }
    });

    const { control, handleSubmit, formState: { isSubmitting }, setValue } = methods;
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({ control, name: 'hm_section_list' });

    // Arrays for Files and URLs
    const { fields: fileFields, append: appendFile, remove: removeFile } = useFieldArray({
        control,
        name: 'ICW_FilePath_Array'
    });

    const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
        control,
        name: 'ICW_Attachment_Array'
    });

    // Handle File Selection (Mock implementation for file path since we don't have real upload server yet)
    // In a real scenario, this would upload to server and get a path. 
    // For now, we mimic the behavior or just store the filename for display.
    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Logic to handle file upload would go here.
            // For now, we just update the model with a fake path or the filename.
            setValue(`ICW_FilePath_Array.${index}.FileName`, file.name);
            setValue(`ICW_FilePath_Array.${index}.icW_FilePath`, URL.createObjectURL(file));
        }
    };

    // Toggle URL Section
    const handleUrlCheckboxChange = (checked: boolean) => {
        setShowUrlSection(checked);
        if (checked && urlFields.length === 0) {
            appendUrl({ ICW_FilePath: '', FileName: '' });
        } else if (!checked) {
            setValue('ICW_Attachment_Array', []);
        }
    };

    // Fetch Sections when Class changes
    useEffect(() => {
        const loadSections = async () => {
            if (selectedClass) {
                try {
                    const result = await fetchSections(selectedClass);
                    setSections(result.sectionlist || []);
                    if (!sections.length) {
                        // Only reset if we are fetching new sections
                    }
                } catch (error) {
                    toast.error('Failed to load sections');
                }
            } else {
                setSections([]);
                setSubjects([]);
            }
        };
        loadSections();
    }, [selectedClass]);

    // Fetch Subjects when Sections change
    useEffect(() => {
        const loadSubjects = async () => {
            if (selectedClass && selectedSections && selectedSections.length > 0) {
                try {
                    const result = await fetchSubjects(selectedClass, selectedSections);
                    setSubjects(result.subjectlist || []);
                } catch (error) {
                    toast.error('Failed to load subjects');
                }
            } else {
                setSubjects([]);
            }
        };
        loadSubjects();
    }, [selectedClass, selectedSections]);

    const onSubmit = async (data: IClassWork) => {
        try {
            const result = await saveClassWork(data);
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

    const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
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

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Academic Year */}
                        <Controller
                            control={control}
                            name='asmaY_Id'
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Academic Year <span className='text-red-500'>*</span></Label>
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

                        {/* Class */}
                        <Controller
                            control={control}
                            name='asmcL_Id'
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Class <span className='text-red-500'>*</span></Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            setValue('hm_section_list', []);
                                            setSubjects([]);
                                        }}
                                        value={field.value?.toString()}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classList.map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Sections (Multi-Select) */}
                        <div className='flex flex-col space-y-3 rounded-md border p-4'>
                            <Label>Sections <span className='text-red-500'>*</span></Label>
                            <div className='grid grid-cols-2 gap-2'>
                                {sections.map((sec) => (
                                    <div key={sec.asmS_Id} className='flex items-center space-x-2'>
                                        <Checkbox
                                            checked={selectedSections?.some((x: any) => x.asmS_Id === sec.asmS_Id)}
                                            onCheckedChange={(checked) => handleSectionChange(sec.asmS_Id, checked as boolean)}
                                        />
                                        <span className='text-sm'>{sec.asmC_SectionName}</span>
                                    </div>
                                ))}
                            </div>
                            {methods.formState.errors.hm_section_list && <FormError>{methods.formState.errors.hm_section_list.message}</FormError>}
                        </div>


                        {/* Subject */}
                        <Controller
                            control={control}
                            name='ismS_Id'
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Subject <span className='text-red-500'>*</span></Label>
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
                                    <Label>Topic <span className='text-red-500'>*</span></Label>
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
                                    <Label>Sub Topic <span className='text-red-500'>*</span></Label>
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
                                    <Label>Start Date <span className='text-red-500'>*</span></Label>
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
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
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
                                    <Label>End Date <span className='text-red-500'>*</span></Label>
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
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
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
                                    <Label>Content <span className='text-red-500'>*</span></Label>
                                    <Textarea placeholder='Enter Content' {...field} rows={3} />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='text-lg font-semibold'>Attachments</h3>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto border-collaspe border text-left text-sm'>
                                <thead>
                                    <tr className='bg-muted'>
                                        <th className='border p-2 text-center'>SL NO</th>
                                        <th className='border p-2'>Upload File</th>
                                        <th className='border p-2'>File Name</th>
                                        <th className='border p-2 text-center'>View</th>
                                        <th className='border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileFields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className='border p-2 text-center'>{index + 1}</td>
                                            <td className='border p-2'>
                                                <Input
                                                    type='file'
                                                    onChange={(e) => handleFileChange(index, e)}
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <Controller
                                                    control={control}
                                                    name={`ICW_FilePath_Array.${index}.FileName`}
                                                    render={({ field }) => (
                                                        <Input {...field} disabled />
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    className='text-primary'
                                                    onClick={() => {
                                                        const filePath = methods.getValues(`ICW_FilePath_Array.${index}.icW_FilePath`);
                                                        if (filePath) window.open(filePath, '_blank');
                                                        else toast.error("No file uploaded to view");
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    {index === fileFields.length - 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            size='icon'
                                                            onClick={() => appendFile({ icW_FilePath: '', FileName: '' })}
                                                        >
                                                            <PlusIcon className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                    {fileFields.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='destructive'
                                                            size='icon'
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            <MinusIcon className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className='text-sm text-green-700'>
                            <span className='font-bold text-red-500'>Accept File:</span> jpg, jpeg, png, doc, ppt, excel, mp3, mp4, wmv, pdf
                        </p>
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
                            <h3 className='text-lg font-semibold'>URL Details</h3>
                            <div className='overflow-x-auto'>
                                <table className='w-full table-auto border-collaspe border text-left text-sm'>
                                    <thead>
                                        <tr className='bg-muted'>
                                            <th className='border p-2 text-center'>SL NO</th>
                                            <th className='border p-2'>URL</th>
                                            <th className='border p-2 text-center'>View</th>
                                            <th className='border p-2 text-center'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {urlFields.map((field, index) => (
                                            <tr key={field.id}>
                                                <td className='border p-2 text-center'>{index + 1}</td>
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`ICW_Attachment_Array.${index}.ICW_FilePath`}
                                                        render={({ field }) => (
                                                            <Input {...field} placeholder='Enter URL' />
                                                        )}
                                                    />
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        className='text-primary'
                                                        onClick={() => {
                                                            const url = methods.getValues(`ICW_Attachment_Array.${index}.ICW_FilePath`);
                                                            if (url) window.open(url, '_blank');
                                                            else toast.error("No URL provided");
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <div className='flex items-center justify-center gap-2'>
                                                        {index === urlFields.length - 1 && (
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='icon'
                                                                onClick={() => appendUrl({ ICW_FilePath: '', FileName: '' })}
                                                            >
                                                                <PlusIcon className='h-4 w-4' />
                                                            </Button>
                                                        )}
                                                        {urlFields.length > 1 && (
                                                            <Button
                                                                type='button'
                                                                variant='destructive'
                                                                size='icon'
                                                                onClick={() => removeUrl(index)}
                                                            >
                                                                <MinusIcon className='h-4 w-4' />
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
                    <div className='flex flex-wrap gap-6'>
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
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}

// Helper icons
function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

function MinusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
        </svg>
    )
}

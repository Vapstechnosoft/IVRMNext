'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { uploadDocument, deleteDocument } from '@/server/document_upload';
import { toast } from 'sonner';

export default function TabBookDetails({ dropdownData }: { dropdownData: any }) {
    const {
        control,
        register,
        setValue,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();

    const lmB_StudentPhoto = useWatch({ control, name: 'lmB_StudentPhoto' });

    return (
        <div className='flex flex-col gap-6 lg:flex-row'>
            <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Book Title' required {...register('lmB_BookTitle')} error={errors.lmB_BookTitle?.message} />
                <InputText label='Subtitle' {...register('mB_Subtitle')} error={errors.mB_Subtitle?.message} />

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Book Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmB_BookType'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Book Type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Issue'>Issue</SelectItem>
                                    <SelectItem value='Issuable'>Issuable</SelectItem>
                                    <SelectItem value='NotIssuable'>Not Issuable</SelectItem>
                                    <SelectItem value='ReferenceonlyIssuable'>Reference only Issuable</SelectItem>
                                    <SelectItem value='ReferenceonlyNon-Issuable'>Reference only Non-Issuable</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmB_BookType && <FormError>{errors.lmB_BookType.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Category <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmC_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.categorylist?.map((item: any) => (
                                        <SelectItem key={item.lmC_Id} value={item.lmC_Id.toString()}>
                                            {item.lmC_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmC_Id && <FormError>{errors.lmC_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Subject <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmS_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Subject' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.subjectlist?.map((item: any) => (
                                        <SelectItem key={item.lmS_Id} value={item.lmS_Id.toString()}>
                                            {item.lmS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmS_Id && <FormError>{errors.lmS_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Department <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmD_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Department' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.deptlist?.map((item: any) => (
                                        <SelectItem key={item.lmD_Id} value={item.lmD_Id.toString()}>
                                            {item.lmD_DepartmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmD_Id && <FormError>{errors.lmD_Id.message}</FormError>}
                </div>

                <InputText label='ISBN No' required {...register('lmB_ISBNNo')} error={errors.lmB_ISBNNo?.message} />

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Entry Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmB_EntryDate'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.lmB_EntryDate && <FormError>{errors.lmB_EntryDate.message}</FormError>}
                </div>

                <InputText label='Published Year' required {...register('lmB_PublishedYear')} error={errors.lmB_PublishedYear?.message} />

                <InputText label='Edition' {...register('lmB_Edition')} error={errors.lmB_Edition?.message} />

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Library <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmAL_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Library' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.liblist?.map((item: any) => (
                                        <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                            {item.lmaL_LibraryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmAL_Id && <FormError>{errors.lmAL_Id.message}</FormError>}
                </div>
            </div>

            <div className='flex w-full flex-col gap-4 lg:w-64'>
                <PhotoUploadBox
                    label='Student Photo'
                    value={lmB_StudentPhoto}
                    onChange={(val) => setValue('lmB_StudentPhoto', val)}
                    subContainer='library_student_photo'
                />
            </div>
        </div>
    );
}

function PhotoUploadBox({
    label,
    value,
    onChange,
    subContainer
}: {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    subContainer: string;
}) {
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PNG, JPG, and JPEG formats are allowed');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size should not exceed 2MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', subContainer);

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                onChange(response.data);
                toast.success(`${label} uploaded successfully`);
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(`Failed to upload: ${error.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handlePhotoDelete = async () => {
        if (!value) return;
        try {
            const response = await deleteDocument(value);
            if (response.success) {
                onChange('');
                toast.success(`${label} deleted successfully`);
            } else {
                toast.error(`Failed to delete ${label.toLowerCase()}`);
            }
        } catch (error) {
            toast.error('An error occurred while deleting photo');
        }
    };

    return (
        <div className='flex flex-col gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-4'>
            <Label className='font-semibold'>{label}</Label>
            {!value ? (
                <label
                    className={cn(
                        'flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all hover:border-primary hover:bg-white',
                        isUploading ? 'border-blue-400 bg-blue-100' : 'border-gray-300 bg-white'
                    )}>
                    {isUploading ? (
                        <div className='flex flex-col items-center gap-2'>
                            <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            <span className='font-medium text-primary text-xs'>Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <Upload className='h-8 w-8 text-primary' />
                            <span className='mt-2 font-medium text-gray-700 text-xs'>Upload {label}</span>
                        </>
                    )}
                    <input type='file' className='hidden' accept='image/*' onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
            ) : (
                <div className='space-y-2'>
                    <div className='relative h-40 overflow-hidden rounded-lg border-2 border-green-300 shadow-sm'>
                        <img src={value} alt={label} className='h-full w-full object-cover' />
                        <div className='absolute right-1 top-1 flex gap-1'>
                            <Button
                                type='button'
                                variant='secondary'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => window.open(value, '_blank')}>
                                <Eye className='h-3.5 w-3.5' />
                            </Button>
                            <Button type='button' variant='destructive' size='icon' className='h-7 w-7' onClick={handlePhotoDelete}>
                                <Trash className='h-3.5 w-3.5' />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

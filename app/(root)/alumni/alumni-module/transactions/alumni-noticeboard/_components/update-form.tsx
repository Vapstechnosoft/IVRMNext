'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import type { IAlumniNoticeBoard } from '@/types/alumni/alumni-notice-board';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type AlumniNoticeBoardSchema, alumniNoticeBoardSchema } from './schema';

interface UpdateAlumniNoticeBoardFormProps {
    selectedRow: IAlumniNoticeBoard;
    onSuccess?: () => void;
}

// Static edit data
const staticEditData = {
    editdetails: [
        {
            alntB_Id: 1,
            mI_Id: 30,
            alntB_Title: 'Annual Alumni Meet 2024',
            alntB_Description: 'Join us for the annual alumni meet on December 15th, 2024. Networking, dinner, and keynote speeches.',
            alntB_FilePath: '/documents/alumni/notice1.pdf',
            alntB_Attachment: 'notice1.pdf',
            alntB_StartDate: '2024-12-01T00:00:00.000Z',
            alntB_EndDate: '2024-12-31T23:59:59.000Z',
            alntB_DisplayDate: '2024-11-25T00:00:00.000Z',
            alntB_ActiveFlag: true,
            alntB_CreatedDate: '2024-10-01T10:30:00.000Z',
            alntB_UpdatedDate: '2024-10-01T10:30:00.000Z'
        }
    ],
    editdetailsfiles: [
        {
            alntbfL_Id: 101,
            alntbfL_FileName: 'meet-schedule.pdf',
            alntbfL_FilePath: '/uploads/alumni/meet-schedule.pdf'
        },
        {
            alntbfL_Id: 102,
            alntbfL_FileName: 'venue-map.jpg',
            alntbfL_FilePath: '/uploads/alumni/venue-map.jpg'
        }
    ]
};

// Mock save function
const mockSaveAlumniNoticeBoard = async (payload: any) => {
    console.info('Saving notice:', payload);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    return { success: true, message: 'Notice updated successfully' };
};

// Mock upload function
const mockUploadDocument = async (formData: FormData) => {
    console.info('Uploading file:', formData.get('File'));
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate upload delay
    return { path: `/uploads/alumni/${Date.now()}-${formData.get('File')?.toString()}` };
};

export default function UpdateAlumniNoticeBoardForm({ selectedRow, onSuccess }: UpdateAlumniNoticeBoardFormProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fetching, setFetching] = useState(true);

    const form = useForm<AlumniNoticeBoardSchema>({
        resolver: zodResolver(alumniNoticeBoardSchema),
        mode: 'onChange',
        defaultValues: {
            alntB_Id: selectedRow.alntB_Id,
            alntB_Title: '',
            alntB_Description: '',
            intB_DispalyDisableFlg: false,
            attachment_Array: []
        }
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'attachment_Array'
    });

    const displayDateEnabled = watch('intB_DispalyDisableFlg');
    const startDate = watch('alntB_StartDate');

    useEffect(() => {
        const loadData = async () => {
            if (selectedRow.alntB_Id) {
                try {
                    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay

                    // Use static data instead of API call
                    const res = staticEditData;

                    // biome-ignore lint/complexity/useOptionalChain: <explanation>
                    if (res && res.editdetails && res.editdetails.length > 0) {
                        const details = res.editdetails[0];
                        const files = res.editdetailsfiles || [];

                        const mappedFiles = files.map((f: any) => ({
                            alntbfL_Id: f.alntbfL_Id,
                            alntbfL_FilePath: f.alntbfL_FilePath,
                            alntbfL_FileName: f.alntbfL_FileName
                        }));

                        reset({
                            alntB_Id: details.alntB_Id,
                            alntB_Title: details.alntB_Title,
                            alntB_Description: details.alntB_Description,
                            alntB_StartDate: new Date(details.alntB_StartDate),
                            alntB_EndDate: new Date(details.alntB_EndDate),
                            alntB_DisplayDate: details.alntB_DisplayDate ? new Date(details.alntB_DisplayDate) : null,
                            intB_DispalyDisableFlg: !!details.alntB_DisplayDate,
                            attachment_Array: mappedFiles
                        });
                    }
                    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
                } catch (err) {
                    toast.error('Failed to load details');
                } finally {
                    setFetching(false);
                }
            }
        };
        loadData();
    }, [selectedRow.alntB_Id, reset]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('File', file);
            formData.append('folder', 'Alumni_Notice');

            try {
                const response = await mockUploadDocument(formData);
                const res: any = response;
                let path = '';

                if (typeof res === 'string') {
                    path = res;
                } else if (res?.path) {
                    path = res.path;
                }

                if (path) {
                    append({
                        alntbfL_FilePath: path,
                        alntbfL_FileName: file.name
                    });
                    toast.success('File uploaded successfully');
                } else {
                    toast.error('File upload failed');
                }
            } catch (err: any) {
                // biome-ignore lint/style/useTemplate: <explanation>
                toast.error('File upload error: ' + err.message);
            } finally {
                setUploading(false);
                e.target.value = '';
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        remove(index);
    };

    const onSubmit = async (data: AlumniNoticeBoardSchema) => {
        try {
            const payload: any = {
                alntB_Id: data.alntB_Id,
                mI_Id: selectedRow.mI_Id || 0,
                alntB_Title: data.alntB_Title,
                alntB_Description: data.alntB_Description || '',
                alntB_FilePath: selectedRow.alntB_FilePath || '',
                alntB_Attachment: selectedRow.alntB_Attachment || '',
                alntB_DisplayDate: data.alntB_DisplayDate ? new Date(data.alntB_DisplayDate).toISOString() : new Date().toISOString(),
                alntB_StartDate: data.alntB_StartDate ? new Date(data.alntB_StartDate).toISOString() : new Date().toISOString(),
                alntB_EndDate: data.alntB_EndDate ? new Date(data.alntB_EndDate).toISOString() : new Date().toISOString(),
                alntB_ActiveFlag: true,
                alntB_UpdatedDate: new Date().toISOString(),
                alntB_CreatedDate: selectedRow.alntB_CreatedDate || new Date().toISOString(),
                attachment_Array:
                    data.attachment_Array?.map((file) => ({
                        alntbfL_FileName: file.alntbfL_FileName,
                        alntbfL_FilePath: file.alntbfL_FilePath
                    })) || []
            };

            const res = await mockSaveAlumniNoticeBoard(payload);
            if (res) {
                toast.success('Notice updated successfully');
                onSuccess?.();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        }
    };

    if (fetching) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Notice Title' required {...register('alntB_Title')} error={errors.alntB_Title?.message} />

                <div className='md:col-span-2'>
                    <InputTextarea label='Description' {...register('alntB_Description')} error={errors.alntB_Description?.message} />
                </div>

                <Controller
                    control={control}
                    name='alntB_StartDate'
                    render={({ field, fieldState }) => (
                        <DateField field={field} fieldState={fieldState} label='Start Date' placeholder='Select Start Date' />
                    )}
                />

                <Controller
                    control={control}
                    name='alntB_EndDate'
                    render={({ field, fieldState }) => (
                        <DateField
                            field={field}
                            fieldState={fieldState}
                            label='End Date'
                            placeholder='Select End Date'
                            fromDate={startDate}
                        />
                    )}
                />

                <div className='mt-8 flex items-center space-x-2'>
                    <Controller
                        control={control}
                        name='intB_DispalyDisableFlg'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='dispDate' />}
                    />
                    <Label htmlFor='dispDate'>Display Date</Label>
                </div>

                {displayDateEnabled && (
                    <Controller
                        control={control}
                        name='alntB_DisplayDate'
                        render={({ field, fieldState }) => (
                            <DateField field={field} fieldState={fieldState} label='Display Date' placeholder='Select Display Date' />
                        )}
                    />
                )}
            </div>

            <div className='border-t pt-4'>
                <Label className='mb-2 block'>Attachments</Label>
                <div className='mb-4 flex items-center gap-4'>
                    <div className='relative'>
                        <input
                            type='file'
                            className='hidden'
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept='image/*,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,video/*'
                        />
                        <Button type='button' variant='outline' disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                            <Plus className='mr-2 h-4 w-4' />
                            Upload File
                        </Button>
                    </div>
                </div>

                {fields.length > 0 && (
                    <div className='space-y-2 rounded-md border p-2'>
                        {fields.map((field, index) => (
                            <div key={field.id} className='flex items-center justify-between rounded bg-secondary/20 p-2'>
                                <span className='max-w-[200px] truncate text-sm'>{field.alntbfL_FileName}</span>
                                <div className='flex gap-2'>
                                    <a
                                        href={field.alntbfL_FilePath}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-500 hover:underline'>
                                        View
                                    </a>
                                    <Button type='button' variant='ghost' size='icon' onClick={() => handleRemoveFile(index)}>
                                        <Trash2 className='h-4 w-4 text-destructive' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='flex gap-3'>
                <Button type='submit' disabled={isSubmitting || uploading} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' /> Update
                </Button>
            </div>
        </form>
    );
}

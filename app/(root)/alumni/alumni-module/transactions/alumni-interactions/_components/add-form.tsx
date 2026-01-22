'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAlumniDetails, saveAlumniInteraction } from '@/server/alumni/alumni-interactions';
import { uploadDocument } from '@/server/document_upload';
import type { IAlumniInteractionAlumni } from '@/types/alumni/alumni-interactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, Plus, Send, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type AlumniInteractionSchema, alumniInteractionSchema } from './schema';

interface AddInteractionFormProps {
    interactionType: 'Group' | 'Individual';
    roleFlg: string;
    asmaY_Id: number;
    ivrmrT_Id: number;
    almsT_Id: number;
    mI_Id: number;
    userHrmeId: number;
    onSuccess?: () => void;
    className?: string;
}

export default function AddInteractionForm({
    interactionType,
    roleFlg,
    asmaY_Id,
    ivrmrT_Id,
    almsT_Id,
    mI_Id,
    onSuccess,
    className = ''
}: AddInteractionFormProps) {
    const [uploading, setUploading] = useState(false);
    const [loadingAlumni, setLoadingAlumni] = useState(false);
    const [alumniList, setAlumniList] = useState<IAlumniInteractionAlumni[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<AlumniInteractionSchema>({
        resolver: zodResolver(alumniInteractionSchema),
        mode: 'onChange',
        defaultValues: {
            alsminT_Subject: '',
            alsminT_Interaction: '',
            userflag: 'SameBatch',
            ALMST_Id1: '',
            alumni_list: [],
            images_paths: []
        }
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = form;
    const userflag = watch('userflag');
    const images_paths = watch('images_paths') || [];

    useEffect(() => {
        const fetchAlumni = async () => {
            if (!roleFlg) return;
            setLoadingAlumni(true);
            try {
                const res = await getAlumniDetails({
                    userflag
                });
                if (res.success && res.data) {
                    setAlumniList(res.data.getdetails || []);
                }
                // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            } catch (error) {
                toast.error('Failed to load alumni list');
            } finally {
                setLoadingAlumni(false);
            }
        };
        fetchAlumni();
    }, [roleFlg, userflag, asmaY_Id, ivrmrT_Id, mI_Id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const file = e.target.files[0];

            const formData = new FormData();
            formData.append('File', file);
            formData.append('folder', 'Alumni_Interaction');

            try {
                const response = await uploadDocument(formData);
                console.info('Upload Response:', response);
                const res: any = response;
                let path = '';

                if (Array.isArray(res) && res.length > 0) {
                    path = res[0].path || res[0];
                } else if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    path = res.data[0].path || res.data[0];
                } else if (res?.path) {
                    path = res.path;
                }

                if (path) {
                    const currentFiles = form.getValues('images_paths') || [];
                    setValue('images_paths', [...currentFiles, { path, name: file.name }]);
                    toast.success('File uploaded');
                }
            } catch (err: any) {
                // biome-ignore lint/style/useTemplate: <explanation>
                toast.error('Upload failed: ' + err.message);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const onSubmit = async (data: AlumniInteractionSchema) => {
        try {
            const payload: any = {
                ASMAY_Id: asmaY_Id,
                IVRMRT_Id: ivrmrT_Id,
                ALMST_Id: almsT_Id,
                ALSMINT_GroupOrIndFlg: interactionType,
                ALSMINT_Subject: data.alsminT_Subject,
                ALSMINT_Interaction: data.alsminT_Interaction,
                userflag: data.userflag,
                IMN_Flag: 'InteractionAlumni',
                images_paths: data.images_paths?.map((f) => f.path) || []
            };

            if (interactionType === 'Group') {
                payload.arrayalumni = data.alumni_list?.map((id) => ({ ALMST_Id: Number(id) })) || [];
                if (payload.arrayalumni.length === 0) {
                    toast.error('Select at least one alumnus');
                    return;
                }
            } else {
                payload.ALSTINT_ToId = Number(data.ALMST_Id1);
                if (!payload.ALSTINT_ToId) {
                    toast.error('Select an alumnus');
                    return;
                }
            }

            const res = await saveAlumniInteraction(payload);
            const response = res as any;
            if (response.success || response === true || response?.data === true) {
                toast.success('Message sent successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to send');
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred while sending');
        }
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-4 rounded-md border bg-muted/20 p-4'>
                        <Controller
                            name='userflag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='SameBatch' id='same' />
                                        <Label htmlFor='same' className='cursor-pointer'>
                                            Same Batch
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='AllBatch' id='all' />
                                        <Label htmlFor='all' className='cursor-pointer'>
                                            All Batch
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {interactionType === 'Group' ? (
                            <div className='flex flex-col gap-2'>
                                <Label>
                                    Select Alumni <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='alumni_list'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={alumniList.map((a) => ({ label: a.alumniname, value: String(a.ALMST_Id) }))}
                                            onValueChange={(vals) => field.onChange(vals.map((v) => Number(v)))}
                                            placeholder={loadingAlumni ? 'Loading...' : 'Select Alumni'}
                                            maxCount={2}
                                            className='w-full'
                                        />
                                    )}
                                />
                                {errors.alumni_list && <FormError>{errors.alumni_list.message}</FormError>}
                            </div>
                        ) : (
                            <div className='flex flex-col gap-2'>
                                <Label>
                                    Alumnus <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='ALMST_Id1'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingAlumni ? 'Loading...' : 'Select Alumnus'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {alumniList.map((a) => (
                                                    <SelectItem key={a.ALMST_Id} value={String(a.ALMST_Id)}>
                                                        {a.alumniname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ALMST_Id1 && <FormError>{errors.ALMST_Id1.message}</FormError>}
                            </div>
                        )}

                        <InputText label='Subject' required {...register('alsminT_Subject')} error={errors.alsminT_Subject?.message} />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label>
                            Message Content <span className='text-red-500'>*</span>
                        </Label>
                        <textarea
                            placeholder='Write your message here...'
                            className='flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                            {...register('alsminT_Interaction')}
                        />
                        {errors.alsminT_Interaction && <FormError>{errors.alsminT_Interaction.message}</FormError>}
                    </div>

                    <div className='rounded-lg border border-primary/20 bg-primary/5 p-4'>
                        <div className='mb-4 flex items-center justify-between'>
                            <Label className='font-semibold text-base'>Attachments (Images, PDF, Doc)</Label>
                            <input
                                type='file'
                                className='hidden'
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            />
                            <Button
                                type='button'
                                variant='outline'
                                disabled={uploading}
                                size='sm'
                                onClick={() => fileInputRef.current?.click()}>
                                {uploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Plus className='mr-2 h-4 w-4' />}
                                Browse & Upload
                            </Button>
                        </div>

                        {images_paths.length > 0 && (
                            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                                {images_paths.map((file, index) => (
                                    <div
                                        key={index}
                                        className='group relative rounded-lg border bg-card p-2 shadow-sm transition-all hover:ring-2 hover:ring-primary/50'>
                                        <div className='mb-1 flex items-center justify-between'>
                                            <span className='max-w-[80%] truncate font-medium text-[10px]' title={file.name}>
                                                {file.name}
                                            </span>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    const updated = [...images_paths];
                                                    updated.splice(index, 1);
                                                    setValue('images_paths', updated);
                                                }}
                                                className='text-destructive transition-transform hover:scale-110'>
                                                <X className='h-3 w-3' />
                                            </button>
                                        </div>
                                        <a href={file.path} target='_blank' rel='noopener noreferrer' className='mt-1 block'>
                                            {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img src={file.path} alt={file.name} className='h-20 w-full rounded-md object-cover' />
                                            ) : (
                                                <div className='flex h-20 w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/50'>
                                                    {file.name.endsWith('.pdf') ? (
                                                        <FileText className='h-8 w-8 text-red-500' />
                                                    ) : (
                                                        <FileText className='h-8 w-8 text-blue-500' />
                                                    )}
                                                    <span className='mt-1 text-[8px] text-muted-foreground uppercase'>
                                                        {file.name.split('.').pop()}
                                                    </span>
                                                </div>
                                            )}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                        {uploading && <div className='mt-2 animate-pulse text-muted-foreground text-xs'>Uploading document...</div>}
                    </div>
                </div>

                <div className='flex justify-end gap-3 border-t pt-4'>
                    <Button type='button' variant='ghost' onClick={() => reset()} disabled={isSubmitting}>
                        Clear Form
                    </Button>
                    <Button type='submit' size='lg' disabled={isSubmitting || uploading} isLoading={isSubmitting}>
                        <Send className='mr-2 h-4 w-4' /> Send Interaction
                    </Button>
                </div>
            </form>
        </div>
    );
}

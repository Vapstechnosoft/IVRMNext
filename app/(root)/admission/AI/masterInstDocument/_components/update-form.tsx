'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { useMasterInstDocument } from '@/hooks/admission/AI/useMasterInstDocument';
import { masterInstDocumentSchema } from '@/schemas/admission/AI/masterInstDocument';
import { addOrUpdateMasterInstDocument } from '@/server/admission/AI/masterInstDocument';
import type { IMasterInstDocumentList } from '@/types/admission/AI/masterInstDocument';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterInstDocumentSchema.addOrUpdate>;

interface UpdateDocumentFormProps {
    selectedRow: IMasterInstDocumentList;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateDocumentForm({ selectedRow, onSuccess, className = '' }: UpdateDocumentFormProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstDocumentSchema.addOrUpdate),
        defaultValues: {
            aiD_Id: selectedRow.aiD_Id,
            fileName: selectedRow.fileName,
            filePath: selectedRow.filePath,
            fileType: selectedRow.fileType,
            fileSize: selectedRow.fileSize ?? 0,
            documentType: selectedRow.documentType,
            description: selectedRow.description
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                aiD_Id: selectedRow.aiD_Id,
                fileName: selectedRow.fileName,
                filePath: selectedRow.filePath,
                fileType: selectedRow.fileType,
                fileSize: selectedRow.fileSize ?? 0,
                documentType: selectedRow.documentType,
                description: selectedRow.description
            });
        }
    }, [selectedRow, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('fileName', file.name);
            setValue('fileType', file.type || 'unknown');
            setValue('fileSize', file.size);
            setValue('filePath', `documents/${file.name.replace(/ /g, '_')}`);
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                aiD_Id: data.aiD_Id,
                fileName: data.fileName,
                filePath: data.filePath,
                fileType: data.fileType,
                fileSize: data.fileSize,
                documentType: data.documentType,
                description: data.description
            };

            const response = await addOrUpdateMasterInstDocument(payload);

            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: [ADMISSION_QUERY_KEYS.MASTER_INST_DOCUMENT] });
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5 space-y-2'>
                            <Label aria-label='Update File' htmlFor='fileUploadUpdate'>
                                Update File (Optional)
                            </Label>
                            <input
                                id="fileUploadUpdate"
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary/10 file:text-primary
                                  hover:file:bg-primary/20
                                  border border-input rounded-md p-2"
                            />
                            {/* Hidden inputs to maintain file data if not updated */}
                            <input type="hidden" {...register('fileName')} />
                            <input type="hidden" {...register('filePath')} />
                            <input type="hidden" {...register('fileType')} />
                            <input type="hidden" {...register('fileSize')} />
                            <p className="text-xs text-muted-foreground mt-1">Current file: {selectedRow.fileName}</p>
                            {errors.fileName && <FormError>{errors.fileName.message}</FormError>}
                        </div>

                        <InputText
                            label='Document Name'
                            placeholder='Enter Document Name'
                            required
                            id='documentType'
                            {...register('documentType')}
                            error={errors.documentType?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='md:col-span-2'>
                            <InputTextarea
                                label='Description'
                                placeholder='Enter Description'
                                required
                                id='description'
                                {...register('description')}
                                error={errors.description?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                minHeight={20}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-fit transition-all duration-200 hover:scale-105'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Document
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}

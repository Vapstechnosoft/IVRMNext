'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';

import { useMasterSubject } from '@/hooks/library/useMasters';

import {  masterSubjectSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterSubject } from '@/server/library/masters/master_subject';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubjectSchema.addOrUpdate>;

interface AddMasterSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubjectForm({ onSuccess, className = '' }: AddMasterSubjectFormProps) {
    //const { refetchAll: refetchMasterCasteCategoryCode } = useMasterSubject();

    const { refetchAll } = useMasterSubject();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { lmS_SubjectName } = data;
            const payload = {
                lmS_Id: 0,
                lmS_SubjectName: lmS_SubjectName
            };

            const response = await addOrUpdateMasterSubject(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                //refetchMasterCasteCategoryCode();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Parent Subject:'
                            required
                            id='ismS_Id'
                            placeholder='Enter subject name'
                            {...register('ismS_Id', {
                                required: 'Parent Subject is required',
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: 'Only letters allowed'
                                }
                            })}
                            error={errors.ismS_Id?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                         <InputText
                            label='Sub-Subject :'
                            required
                           
                            placeholder='Enter Sub Subject'
                            {...register('lmS_SubjectName', {
                               
                            })}
                            error={errors.lmS_SubjectName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Level:'                           
                           
                            placeholder='Enter subject name'
                            {...register('lmS_Level', {
                               
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: 'Only letters allowed'
                                }
                            })}
                            error={errors.lmS_Level?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                         <InputText
                            label='Subject No :'                          
                          
                            placeholder='Enter subject no'
                            {...register('lmS_SubjectNo', {
                               
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: 'Only letters allowed'
                                }
                            })}
                            error={errors.lmS_SubjectNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                             
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                               <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Class No :'
                            
                            id='lmS_ClassNo'
                            placeholder='Enter Class No'
                            {...register('lmS_ClassNo', {
                                required: 'Subject Name is required',
                                pattern: {
                                    value: /^[A-Za-z]+$/,
                                    message: 'Only letters allowed'
                                }
                            })}
                            error={errors.lmS_ClassNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>
                {/* Action Buttons */}
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
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Subject
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}

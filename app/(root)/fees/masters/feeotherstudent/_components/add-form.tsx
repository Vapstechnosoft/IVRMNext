'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputText } from '@/components/ui/extension/input-text';
import { saveFeeOtherStudent } from '@/server/fees/masters/fee_other_student';
import { RotateCcw, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddFeeOtherStudentFromProps {
    onSuccess?: () => void;
    className?: string;
}

interface FormData {
    studentName: string;
    mobileno: string;
    emailno: string;
}

export default function AddFeeOtherStudentFrom({ onSuccess, className = '' }: AddFeeOtherStudentFromProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isValid }
    } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            studentName: '',
            mobileno: '',
            emailno: ''
        }
    });
    const studentName = watch('studentName');
    const studentMobileNo = watch('mobileno');
    const studentEmailNo = watch('emailno');
    const onsubmit = async () => {
        const buildpayload = () => {
            return {
                mI_Id: 30,
                fmosT_StudentName: studentName,
                fmosT_StudentMobileNo: studentMobileNo,
                fmosT_StudentEmailId: studentEmailNo
            };
        };
        const payload = buildpayload();
        try {
            const res = await saveFeeOtherStudent(payload);
            if (res?.success) {
                toast.success(res.message || 'Saved successfully');
                handleReset();
                onSuccess?.();
            } else {
                toast.error(res?.message || 'Save failed');
            }
        } catch (err: any) {
            console.error('API Error:', err);
            toast.error(err?.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className} w-full`}>
            <Card className='mx-auto w-full max-w-4xl border-gray-300 shadow-md'>
                <CardContent className='p-6'>
                    <form onSubmit={handleSubmit(onsubmit)} className='space-y-6'>
                        <InputText
                            label='Name'
                            required
                            id='studentName'
                            placeholder='Enter Student Name'
                            {...register('studentName', {
                                required: 'Student name is required'
                            })}
                            error={errors.studentName?.message}
                        />

                        <InputText
                            label='Mobile No'
                            required
                            id='mobileno'
                            placeholder='Enter Student Mobile Number'
                            {...register('mobileno', {
                                required: 'Mobile number is required',
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: 'Enter a valid 10-digit mobile number'
                                }
                            })}
                            error={errors.mobileno?.message}
                        />

                        <InputText
                            label='Email'
                            required
                            id='emailno'
                            type='email'
                            placeholder='Enter Student Email'
                            {...register('emailno', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Enter a valid email address'
                                }
                            })}
                            error={errors.emailno?.message}
                        />

                        {/* Buttons */}
                        <div className='flex justify-start gap-3 border-t pt-5'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className='flex items-center gap-2'>
                                <RotateCcw className='h-4 w-4' />
                                Reset
                            </Button>

                            <Button type='submit' disabled={isSubmitting || !isValid} className='flex items-center gap-2'>
                                <Save className='h-4 w-4' />
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

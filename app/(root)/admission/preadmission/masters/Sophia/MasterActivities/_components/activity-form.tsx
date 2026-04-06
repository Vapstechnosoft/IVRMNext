'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MasterActivitySchema, type IMasterActivity } from '@/schemas/admission/preadmission/master_activity';
import { useSaveMasterActivity } from '@/hooks/admission/preadmission/useMasterActivity';

interface ActivityFormProps {
    initialData?: Partial<IMasterActivity>;
    onSuccess: () => void;
}

export default function ActivityForm({ initialData, onSuccess }: ActivityFormProps) {
    const isEditing = !!initialData?.amA_Id;
    const saveMutation = useSaveMasterActivity();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<IMasterActivity>({
        resolver: zodResolver(MasterActivitySchema),
        defaultValues: {
            amA_Id: initialData?.amA_Id,
            amA_Activity: initialData?.amA_Activity || '',
            amA_Activity_Desc: initialData?.amA_Activity_Desc || ''
        }
    });

    const onSubmit = async (data: IMasterActivity) => {
        toast.loading(isEditing ? 'Updating...' : 'Saving...', { id: 'save' });
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res.returnval) {
                toast.success(isEditing ? 'Record Updated Successfully' : 'Record Saved Successfully', { id: 'save' });
                onSuccess();
            } else {
                toast.error(isEditing ? 'Record Failed To Update' : 'Record Failed To Save', { id: 'save' });
            }
        } catch (error) {
            toast.error('An error occurred during submission.', { id: 'save' });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Activity Name */}
                <div className='space-y-2'>
                    <Label>Activity Name *</Label>
                    <Input
                        {...register('amA_Activity')}
                        placeholder='Enter Activity Name'
                        maxLength={20}
                        onKeyDown={(e) => {
                            if (!/^[a-zA-Z\s]*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    />
                    {errors.amA_Activity && <p className='text-xs text-red-500 font-medium'>{errors.amA_Activity.message}</p>}
                </div>

                {/* Activity Description */}
                <div className='space-y-2'>
                    <Label>Activity Description *</Label>
                    <Textarea
                        {...register('amA_Activity_Desc')}
                        placeholder='Enter Activity Description'
                        rows={4}
                        maxLength={50}
                        onKeyDown={(e) => {
                            if (!/^[a-zA-Z\s]*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    />
                    {errors.amA_Activity_Desc && <p className='text-xs text-red-500 font-medium'>{errors.amA_Activity_Desc.message}</p>}
                </div>
            </div>

            <div className='flex justify-center gap-3 pt-6 border-t'>
                <Button type='submit' isLoading={saveMutation.isPending}>
                    <Save className='mr-2 h-4 w-4' />
                    {isEditing ? 'Update' : 'Save'}
                </Button>
                <Button variant='outline' type='button' onClick={() => reset()}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
            </div>
        </form>
    );
}

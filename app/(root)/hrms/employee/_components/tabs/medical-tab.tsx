'use client';

import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { StandardTabActions } from './standard-tab-actions';

export function MedicalRecordTab({ control, register, errors, isSubmitting }: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = { control, register, errors, isSubmitting };
    return (
        <div className='space-y-4'>
            <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>Medical Record</h3>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <div className='grid grid-cols-2 gap-2'>
                    <InputText
                        label="Employee's Height"
                        id='employeeHeight'
                        placeholder='Height'
                        {...register('employeeHeight')}
                        error={errors.employeeHeight?.message}
                    />
                    <InputText
                        label='Unit of measure (Height)'
                        id='employeeHeightUnit'
                        placeholder='Unit of measure'
                        {...register('employeeHeightUnit')}
                        error={errors.employeeHeightUnit?.message}
                    />
                </div>

                <InputText
                    label='Eye Sight Issue'
                    id='eyeSightIssue'
                    {...register('eyeSightIssue')}
                    error={errors.eyeSightIssue?.message}
                />

                <div className='grid grid-cols-2 gap-2'>
                    <InputText
                        label="Employee's Weight"
                        id='employeeWeight'
                        placeholder='Weight'
                        {...register('employeeWeight')}
                        error={errors.employeeWeight?.message}
                    />
                    <InputText
                        label='Unit of measure (Weight)'
                        id='employeeWeightUnit'
                        placeholder='Unit of measure'
                        {...register('employeeWeightUnit')}
                        error={errors.employeeWeightUnit?.message}
                    />
                </div>

                <InputText
                    label='Any Health Issue'
                    id='anyHealthIssue'
                    {...register('anyHealthIssue')}
                    error={errors.anyHealthIssue?.message}
                />
            </div>

            <div className='space-y-2'>
                <Label>Identification Mark</Label>
                <textarea
                    id='identificationMark'
                    {...register('identificationMark')}
                    className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    placeholder='Enter identification mark details...'
                />
            </div>
            <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
        </div>
    );
}

// Other Details Tab Component

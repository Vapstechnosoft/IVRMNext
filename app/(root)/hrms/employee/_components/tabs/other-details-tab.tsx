'use client';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';
import { useState } from 'react';

interface OtherDetailsTabProps {
    control: any;
    register: any;
    errors: any;
    isSubmitting: boolean;
    watch: any;
    onClear?: () => void;
}

export function OtherDetailsTab({ control, register, errors, isSubmitting, watch, onClear }: OtherDetailsTabProps) {
    const stopPension = watch('stopPension');
    const employeeLeft = watch('employeeLeft');
    const [stopPensionDateOpen, setStopPensionDateOpen] = useState(false);
    const [lastWorkingDayOpen, setLastWorkingDayOpen] = useState(false);

    return (
        <div className='space-y-4'>
            <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>Other Details</h3>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <InputText
                    label='Biometric Code'
                    id='biometricCode'
                    placeholder='48'
                    {...register('biometricCode')}
                    error={errors.biometricCode?.message}
                />

                <div className='space-y-2'>
                    <Label className='mb-2 block'>Options</Label>
                    <div className='space-y-3'>
                        <Controller
                            name='punchRelaxation'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='punchRelaxation' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='punchRelaxation' className='cursor-pointer leading-none'>
                                        Punch Relaxation ?
                                    </Label>
                                </div>
                            )}
                        />
                        <Controller
                            name='stopPension'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='stopPension' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='stopPension' className='cursor-pointer leading-none'>
                                        Stop Pension ?
                                    </Label>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <InputText label='RF card ID' id='rfCardId' {...register('rfCardId')} error={errors.rfCardId?.message} />

                {stopPension && (
                    <div className='space-y-2'>
                        <Label>Date of Stop Pension</Label>
                        <Controller
                            name='dateOfStopPension'
                            control={control}
                            render={({ field }) => (
                                <Popover open={stopPensionDateOpen} onOpenChange={setStopPensionDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal h-9',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(day) => {
                                                if (day) {
                                                    field.onChange(format(day, 'yyyy-MM-dd'));
                                                    setStopPensionDateOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>
                )}

                <InputText
                    label='MS Teams UserName'
                    id='msTeamsUserName'
                    placeholder='STCSAdmin'
                    {...register('msTeamsUserName')}
                    error={errors.msTeamsUserName?.message}
                />

                <Controller
                    name='employeeLeft'
                    control={control}
                    render={({ field }) => (
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='employeeLeft' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                            <Label htmlFor='employeeLeft' className='cursor-pointer leading-none'>
                                Employee Left ?
                            </Label>
                        </div>
                    )}
                />

                <InputText
                    label='MS Teams Password'
                    id='msTeamsPassword'
                    type='password'
                    {...register('msTeamsPassword')}
                    error={errors.msTeamsPassword?.message}
                />
            </div>

            {employeeLeft && (
                <div className='rounded-lg border bg-muted/50 p-4'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Last Working day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='lastWorkingDay'
                                control={control}
                                render={({ field }) => (
                                    <Popover open={lastWorkingDayOpen} onOpenChange={setLastWorkingDayOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal h-9',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <DatePickerWithYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(day) => {
                                                    if (day) {
                                                        field.onChange(format(day, 'yyyy-MM-dd'));
                                                        setLastWorkingDayOpen(false);
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                        <div className='space-y-2 lg:col-span-2'>
                            <Label>Reason for Leaving</Label>
                            <textarea
                                id='reasonForLeaving'
                                {...register('reasonForLeaving')}
                                className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                placeholder='Enter reason for leaving...'
                            />
                        </div>
                    </div>
                </div>
            )}

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

// Qualification Tab Component
function QualificationTab({ control, register, errors, isSubmitting, onClear }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'qualificationDetails'
    });

    const addEmptyRow = () => {
        append({
            cgpaOrPercentage: 'CGPA',
            qualificationCountry: 'India',
            qualificationState: 'Assam'
        } as any);
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>EMPLOYEE QUALIFICATION DETAILS</h3>
                <Button type='button' size='sm' variant='secondary' onClick={addEmptyRow}>
                    <Plus className='mr-1 h-4 w-4' /> Add Qualification
                </Button>
            </div>

            {fields.length === 0 && (
                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                    No qualifications added yet. Click "Add Qualification" to start.
                </div>
            )}

            <div className='space-y-4'>
                {fields.map((field: any, index: number) => (
                    <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                        <div className='mb-3 flex items-center justify-between'>
                            <div className='font-semibold'>Qualification #{index + 1}</div>
                            <div className='flex gap-2'>
                                <Badge variant='secondary'>Row {index + 1}</Badge>
                                <Button type='button' variant='ghost' size='sm' onClick={() => remove(index)}>
                                    <Trash2 className='mr-1 h-4 w-4' /> Remove
                                </Button>
                            </div>
                        </div>

                        {/* Top essentials */}
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                            <InputText
                                label='Qualification'
                                id={`qualificationDetails.${index}.qualification`}
                                {...register(`qualificationDetails.${index}.qualification`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.course`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>Course</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='B.A'>B.A</SelectItem>
                                                <SelectItem value='B.Sc'>B.Sc</SelectItem>
                                                <SelectItem value='B.Com'>B.Com</SelectItem>
                                                <SelectItem value='M.A'>M.A</SelectItem>
                                                <SelectItem value='M.Sc'>M.Sc</SelectItem>
                                                <SelectItem value='M.Com'>M.Com</SelectItem>
                                                <SelectItem value='B.Ed'>B.Ed</SelectItem>
                                                <SelectItem value='M.Ed'>M.Ed</SelectItem>
                                                <SelectItem value='PhD'>PhD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <InputText
                                label='College'
                                id={`qualificationDetails.${index}.college`}
                                {...register(`qualificationDetails.${index}.college`)}
                            />

                            <InputText
                                label='University'
                                id={`qualificationDetails.${index}.university`}
                                {...register(`qualificationDetails.${index}.university`)}
                            />

                            <InputText
                                label='Year Of Passing'
                                id={`qualificationDetails.${index}.yearOfPassing`}
                                {...register(`qualificationDetails.${index}.yearOfPassing`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.qualificationCountry`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>Country</Label>
                                        <Select onValueChange={field.onChange} value={field.value || 'India'}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Country' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='India'>India</SelectItem>
                                                <SelectItem value='USA'>USA</SelectItem>
                                                <SelectItem value='UK'>UK</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.qualificationState`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>State</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select State' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Assam'>Assam</SelectItem>
                                                <SelectItem value='Delhi'>Delhi</SelectItem>
                                                <SelectItem value='Maharashtra'>Maharashtra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <InputText
                                label='Registration No.'
                                id={`qualificationDetails.${index}.registrationNo`}
                                {...register(`qualificationDetails.${index}.registrationNo`)}
                            />

                            <InputText
                                label='Result'
                                id={`qualificationDetails.${index}.result`}
                                {...register(`qualificationDetails.${index}.result`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.cgpaOrPercentage`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>CGPA Or Percentage</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='CGPA'>CGPA</SelectItem>
                                                <SelectItem value='Percentage'>Percentage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <InputText
                                label='CGPA'
                                id={`qualificationDetails.${index}.cgpa`}
                                {...register(`qualificationDetails.${index}.cgpa`)}
                            />

                            <InputText
                                label='Percentage'
                                id={`qualificationDetails.${index}.percentage`}
                                {...register(`qualificationDetails.${index}.percentage`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.areaOfSpecialization`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>Area Of Specialization</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Computer Science'>Computer Science</SelectItem>
                                                <SelectItem value='Mathematics'>Mathematics</SelectItem>
                                                <SelectItem value='Physics'>Physics</SelectItem>
                                                <SelectItem value='Chemistry'>Chemistry</SelectItem>
                                                <SelectItem value='Biology'>Biology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id={`qualificationDetails.${index}.phd`}
                                    {...register(`qualificationDetails.${index}.phd` as const)}
                                />
                                <Label htmlFor={`qualificationDetails.${index}.phd`}>PHD</Label>
                            </div>

                            <InputText
                                label='PHD Details'
                                id={`qualificationDetails.${index}.phdDetails`}
                                {...register(`qualificationDetails.${index}.phdDetails`)}
                            />

                            <InputText
                                label='Medical Council'
                                id={`qualificationDetails.${index}.medicalCouncil`}
                                {...register(`qualificationDetails.${index}.medicalCouncil`)}
                            />

                            <InputText
                                label='Thesis Title'
                                id={`qualificationDetails.${index}.thesisTitle`}
                                {...register(`qualificationDetails.${index}.thesisTitle`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.registrationYear`}
                                control={control}
                                render={({ field }) => {
                                    const [open, setOpen] = useState(false);
                                    return (
                                        <div className='space-y-2'>
                                            <Label>Registration Year</Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='w-full justify-start font-normal'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'yyyy') : 'Select'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(day) => {
                                                            if (day) {
                                                                field.onChange(format(day, 'yyyy-MM-dd'));
                                                                setOpen(false);
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    );
                                }}
                            />

                            <InputText
                                label='Guide Name'
                                id={`qualificationDetails.${index}.guideName`}
                                {...register(`qualificationDetails.${index}.guideName`)}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.specialization`}
                                control={control}
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>Specialization</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Research'>Research</SelectItem>
                                                <SelectItem value='Teaching'>Teaching</SelectItem>
                                                <SelectItem value='Industry'>Industry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            <Controller
                                name={`qualificationDetails.${index}.qualifiedDate`}
                                control={control}
                                render={({ field }) => {
                                    const [open, setOpen] = useState(false);
                                    return (
                                        <div className='space-y-2'>
                                            <Label>Qualified Date</Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='w-full justify-start font-normal'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(day) => {
                                                            if (day) {
                                                                field.onChange(format(day, 'yyyy-MM-dd'));
                                                                setOpen(false);
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

// Upload Document Tab Component

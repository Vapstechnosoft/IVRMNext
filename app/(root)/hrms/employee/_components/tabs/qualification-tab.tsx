'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

interface QualificationTabProps {
    control: any;
    register: any;
    errors: any;
    isSubmitting: boolean;
    options?: any;
    countries?: any[];
    states?: any[];
}

export function QualificationTab({ control, register, errors, isSubmitting, options, countries = [], states = [] }: QualificationTabProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'qualificationDetails'
    });

    // Watch all qualification details at once (must be at top level, not inside map)
    const qualificationDetails =
        useWatch({
            control,
            name: 'qualificationDetails'
        }) || [];

    const addEmptyRow = () => {
        append({
            qualification: '',
            course: '',
            college: '',
            university: '',
            yearOfPassing: '',
            cgpaOrPercentage: 'CGPA',
            cgpa: '',
            qualificationCountry: '',
            qualificationState: '',
            registrationNo: '',
            result: '',
            areaOfSpecialisation: '',
            medicalCouncil: '',
            phdFlag: false,
            thesisTitle: '',
            registrationYear: '',
            guideName: '',
            qualifiedDate: '',
            HRMEQ_Id: 0
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
                {fields.map((field, index) => {
                    // Get values from watched array (not using hooks inside map)
                    const cgpaOrPercentage = qualificationDetails[index]?.cgpaOrPercentage || 'CGPA';
                    const _phdFlag = qualificationDetails[index]?.phdFlag || false;

                    return (
                        <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                            <div className='mb-4 flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Badge variant='secondary'>Serial NO. {index + 1}</Badge>
                                    <div className='font-semibold'>Qualification #{index + 1}</div>
                                </div>
                                <Button type='button' variant='ghost' size='sm' onClick={() => remove(index)}>
                                    <Trash2 className='mr-1 h-4 w-4' /> Remove
                                </Button>
                            </div>

                            <div className='space-y-4'>
                                {/* Row 1: Qualification, Course */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <InputText
                                        label='Qualification *'
                                        id={`qualificationDetails.${index}.qualification`}
                                        {...register(`qualificationDetails.${index}.qualification`)}
                                    />

                                    <Controller
                                        name={`qualificationDetails.${index}.course`}
                                        control={control}
                                        render={({ field }) => {
                                            const courses = options?.courses || [];

                                            return (
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label>Course *</Label>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <SelectTrigger className='h-9'>
                                                            <SelectValue placeholder='Select Course' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {courses.map((course: any, courseIndex: number) => {
                                                                const courseId = (
                                                                    course.HRMC_Id ||
                                                                    course.id ||
                                                                    course.value ||
                                                                    course.HRMC_CourseId ||
                                                                    courseIndex
                                                                )?.toString();
                                                                const courseName =
                                                                    course.HRMC_QualificationDesc ||
                                                                    course.HRMC_QulaificationName ||
                                                                    course.HRMC_CourseName ||
                                                                    course.CourseName ||
                                                                    course.courseName ||
                                                                    course.name ||
                                                                    course.label ||
                                                                    course.HRMC_Name ||
                                                                    course.text ||
                                                                    `Course ${courseId}`;

                                                                return (
                                                                    <SelectItem key={courseId} value={courseId}>
                                                                        {courseName}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                            {courses.length === 0 && (
                                                                <>
                                                                    <SelectItem value='B.A'>B.A</SelectItem>
                                                                    <SelectItem value='B.Sc'>B.Sc</SelectItem>
                                                                    <SelectItem value='B.Com'>B.Com</SelectItem>
                                                                    <SelectItem value='M.A'>M.A</SelectItem>
                                                                    <SelectItem value='M.Sc'>M.Sc</SelectItem>
                                                                    <SelectItem value='M.Com'>M.Com</SelectItem>
                                                                    <SelectItem value='B.Ed'>B.Ed</SelectItem>
                                                                    <SelectItem value='M.Ed'>M.Ed</SelectItem>
                                                                    <SelectItem value='PhD'>PhD</SelectItem>
                                                                </>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>

                                {/* Row 2: College, University */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <InputText
                                        label='College *'
                                        id={`qualificationDetails.${index}.college`}
                                        {...register(`qualificationDetails.${index}.college`)}
                                    />

                                    <InputText
                                        label='University *'
                                        id={`qualificationDetails.${index}.university`}
                                        {...register(`qualificationDetails.${index}.university`)}
                                    />
                                </div>

                                {/* Row 3: Year Of Passing, Country, State - all in same row */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <InputText
                                        label='Year Of Passing *'
                                        id={`qualificationDetails.${index}.yearOfPassing`}
                                        {...register(`qualificationDetails.${index}.yearOfPassing`)}
                                    />

                                    <Controller
                                        name={`qualificationDetails.${index}.qualificationCountry`}
                                        control={control}
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1.5'>
                                                <Label>Country*</Label>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select Country' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countries.map((country: any, countryIndex: number) => {
                                                            const countryId = (
                                                                country.IVRMMC_Id ||
                                                                country.IVRMMCO_Id ||
                                                                country.id ||
                                                                country.value ||
                                                                countryIndex
                                                            )?.toString();
                                                            const countryName =
                                                                country.IVRMMC_CountryName ||
                                                                country.IVRMMCO_CountryName ||
                                                                country.name ||
                                                                country.label ||
                                                                `Country ${countryId}`;
                                                            return (
                                                                <SelectItem key={countryId} value={countryId}>
                                                                    {countryName}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name={`qualificationDetails.${index}.qualificationState`}
                                        control={control}
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1.5'>
                                                <Label>State*</Label>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select State' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {states.map((state: any, stateIndex: number) => {
                                                            const stateId = (
                                                                state.IVRMMS_Id ||
                                                                state.id ||
                                                                state.value ||
                                                                stateIndex
                                                            )?.toString();
                                                            const stateName =
                                                                state.IVRMMS_Name ||
                                                                state.Name ||
                                                                state.name ||
                                                                state.label ||
                                                                `State ${stateId}`;
                                                            return (
                                                                <SelectItem key={stateId} value={stateId}>
                                                                    {stateName}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Row 4: Registration No., Result */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <InputText
                                        label='Registration No.'
                                        id={`qualificationDetails.${index}.registrationNo`}
                                        {...register(`qualificationDetails.${index}.registrationNo`)}
                                    />

                                    <InputText
                                        label='Result *'
                                        id={`qualificationDetails.${index}.result`}
                                        {...register(`qualificationDetails.${index}.result`)}
                                    />
                                </div>

                                {/* Row 5: CGPA Or Percentage dropdown */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <Controller
                                        name={`qualificationDetails.${index}.cgpaOrPercentage`}
                                        control={control}
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1.5'>
                                                <Label>CGPA Or Percentage *</Label>
                                                <Select onValueChange={field.onChange} value={field.value || 'CGPA'}>
                                                    <SelectTrigger className='h-9'>
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

                                    {/* CGPA or Percentage input - dynamically shown based on selection */}
                                    <InputText
                                        label={cgpaOrPercentage === 'Percentage' ? 'Percentage' : 'CGPA'}
                                        id={`qualificationDetails.${index}.cgpa`}
                                        {...register(`qualificationDetails.${index}.cgpa`)}
                                    />
                                </div>

                                {/* Row 6: Area Of Specialization */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <Controller
                                        name={`qualificationDetails.${index}.areaOfSpecialisation`}
                                        control={control}
                                        render={({ field }) => {
                                            const specialisations = options?.specialisations || [];

                                            return (
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label>Area Of Specialization*</Label>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <SelectTrigger className='h-9'>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {specialisations.map((spec: any, specIndex: number) => {
                                                                // Use HRMSPL_Id for ID and HRMSPL_SpecialisationName for name
                                                                const specId = (
                                                                    spec.HRMSPL_Id ||
                                                                    spec.id ||
                                                                    spec.value ||
                                                                    spec.SpecialisationId ||
                                                                    specIndex
                                                                )?.toString();

                                                                const specName =
                                                                    spec.HRMSPL_SpecialisationName ||
                                                                    spec.SpecialisationName ||
                                                                    spec.name ||
                                                                    spec.label ||
                                                                    spec.specialisation ||
                                                                    spec.HRMS_SpecialisationName ||
                                                                    spec.areaOfSpecialisation ||
                                                                    spec.AreaOfSpecialisation ||
                                                                    (typeof spec === 'string' ? spec : '') ||
                                                                    `Specialisation ${specId}`;

                                                                return (
                                                                    <SelectItem key={specId} value={specId}>
                                                                        {specName}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>

                                {/* Row 7: PHD checkbox */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            name={`qualificationDetails.${index}.phdFlag`}
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`qualificationDetails.${index}.phdFlag`}
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor={`qualificationDetails.${index}.phdFlag`} className='cursor-pointer'>
                                                        PHD
                                                    </Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Row 8: Thesis Title and Medical Council - side by side, always visible */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <InputText
                                        label='Thesis Title'
                                        id={`qualificationDetails.${index}.thesisTitle`}
                                        {...register(`qualificationDetails.${index}.thesisTitle`)}
                                    />

                                    <InputText
                                        label='Medical Council'
                                        id={`qualificationDetails.${index}.medicalCouncil`}
                                        {...register(`qualificationDetails.${index}.medicalCouncil`)}
                                    />
                                </div>

                                {/* Row 9: Registration Year, Guide Name, Qualified Date */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <Controller
                                        name={`qualificationDetails.${index}.registrationYear`}
                                        control={control}
                                        render={({ field }) => {
                                            const [open, setOpen] = useState(false);
                                            return (
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label>Registration Year</Label>
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant='outline'
                                                                className='h-9 w-full justify-start text-left font-normal'
                                                                type='button'>
                                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                                {field.value ? field.value : <span>Select year</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='w-auto p-0'>
                                                            <DatePickerWithYear
                                                                mode='single'
                                                                selected={field.value ? new Date(`${field.value}-01-01`) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        const year = format(date, 'yyyy');
                                                                        field.onChange(year);
                                                                        setOpen(false);
                                                                    }
                                                                }}
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
                                        name={`qualificationDetails.${index}.qualifiedDate`}
                                        control={control}
                                        render={({ field }) => {
                                            const [open, setOpen] = useState(false);
                                            return (
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label>Qualified Date</Label>
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant='outline'
                                                                className='h-9 w-full justify-start text-left font-normal'
                                                                type='button'>
                                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                                {field.value ? (
                                                                    format(new Date(field.value), 'PPP')
                                                                ) : (
                                                                    <span>Select date</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className='w-auto p-0'>
                                                            <DatePickerWithYear
                                                                mode='single'
                                                                selected={field.value ? new Date(field.value) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        field.onChange(date.toISOString().split('T')[0]);
                                                                        setOpen(false);
                                                                    }
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
        </div>
    );
}

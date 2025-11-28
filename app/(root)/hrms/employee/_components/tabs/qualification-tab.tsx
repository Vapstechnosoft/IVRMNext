'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HRMSDateField as DateField } from '@/app/(root)/hrms/_components/hrms-date-field';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';
import { useStatesByCountryId } from '@/hooks/hrms/useEmployeeRegister';

// Note: We render SelectItem directly in the map (not via helper function)
// This ensures collectItemValues can find them by type check (child.type === SelectItem)

// Helper function to ensure SelectItem value is never empty string
const ensureNonEmptyValue = (value: any, fallback: any = null): string | null => {
    // Handle null/undefined
    if (value == null || value === undefined) {
        if (fallback != null && fallback !== undefined) {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Handle empty string explicitly
    if (value === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Convert to string
    const str = String(value);

    // Check if empty or whitespace
    if (str === '' || str.trim() === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Final check - ensure it's not empty
    const trimmed = str.trim();
    if (trimmed === '' || trimmed.length === 0) {
        return null;
    }

    return trimmed;
};

interface QualificationTabProps {
    control: any;
    register: any;
    errors: any;
    isSubmitting: boolean;
    options?: any;
    countries?: any[];
    states?: any[];
    setValue?: any;
    onClear?: () => void;
}

// Component for state dropdown that fetches states based on country
function QualificationStateDropdown({
    control,
    index,
    countryId,
    setValue,
    fallbackStates = []
}: {
    control: any;
    index: number;
    countryId: string | null;
    setValue?: any;
    fallbackStates?: any[];
}) {
    // Convert country string to number for API call
    const countryIdNum = countryId ? Number(countryId) : null;
    
    // Fetch states for the selected country
    const { data: fetchedStates = [], isLoading } = useStatesByCountryId(countryIdNum);
    
    // Use fetched states if country is selected, otherwise fall back to passed states
    const availableStates = countryIdNum ? (Array.isArray(fetchedStates) ? fetchedStates : []) : fallbackStates;
    
    // Track previous country ID to detect changes
    const prevCountryIdRef = useRef<string | null>(countryId);
    
    // Clear state when country changes (only when country actually changes)
    useEffect(() => {
        if (!setValue) return;
        
        // Only proceed if country actually changed
        if (prevCountryIdRef.current !== countryId) {
            prevCountryIdRef.current = countryId;
            // Clear state when country changes
            setValue(`qualificationDetails.${index}.qualificationState`, '', { shouldValidate: false });
        }
        // Only depend on countryId to avoid infinite loops
    }, [countryId, index, setValue]);
    
    return (
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
                            {isLoading ? (
                                <SelectItem value="loading" disabled>Loading states...</SelectItem>
                            ) : (
                                availableStates
                                    .filter((state: any, stateIndex: number) => {
                                        const stateId = (
                                            state.IVRMMS_Id ||
                                            state.id ||
                                            state.value ||
                                            stateIndex
                                        )?.toString();
                                        return stateId && stateId.trim() !== '';
                                    })
                                    .map((state: any, stateIndex: number) => {
                                        const stateIdRaw = state.IVRMMS_Id ?? state.id ?? state.value ?? stateIndex;
                                        const stateId = ensureNonEmptyValue(stateIdRaw, stateIndex);
                                        if (!stateId) return null;
                                        const stateName =
                                            state.IVRMMS_Name ||
                                            state.Name ||
                                            state.name ||
                                            state.label ||
                                            `State ${stateId}`;
                                        if (!stateId || stateId.trim() === '') return null;
                                        // Render SelectItem directly so collectItemValues can find it
                                        return (
                                            <SelectItem key={stateId} value={stateId} textValue={stateName}>
                                                {stateName}
                                            </SelectItem>
                                        );
                                    })
                                    .filter(Boolean)
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}
        />
    );
}

export function QualificationTab({
    control,
    register,
    errors,
    isSubmitting,
    options,
    countries = [],
    states = [],
    setValue,
    onClear,
    currentTab,
    onPreviousTab
}: QualificationTabProps & { currentTab?: string; onPreviousTab?: () => void }) {
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
            <div className='rounded-md border'>
                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>EMPLOYEE QUALIFICATION DETAILS</h3>
                    <Button 
                        type='button' 
                        className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80'
                        onClick={addEmptyRow}>
                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Qualification
                    </Button>
                </div>
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
                                <Button 
                                    type='button' 
                                    className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                    onClick={() => remove(index)}>
                                    <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                </Button>
                            </div>

                            <div className='space-y-4'>
                                {/* Row 1: Qualification, Course */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <HRMSInputText
                                        label='Qualification *'
                                        id={`qualificationDetails.${index}.qualification`}
                                        maxLength={50}
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
                                                            {courses
                                                                .filter((course: any, courseIndex: number) => {
                                                                    const courseId = (
                                                                        course.HRMC_Id ||
                                                                        course.id ||
                                                                        course.value ||
                                                                        course.HRMC_CourseId ||
                                                                        courseIndex
                                                                    )?.toString();
                                                                    return courseId && courseId.trim() !== '';
                                                                })
                                                                .map((course: any, courseIndex: number) => {
                                                                    const courseIdRaw =
                                                                        course.HRMC_Id ??
                                                                        course.id ??
                                                                        course.value ??
                                                                        course.HRMC_CourseId ??
                                                                        courseIndex;
                                                                    const courseId = ensureNonEmptyValue(courseIdRaw, courseIndex);
                                                                    // Ensure value is never empty string
                                                                    if (!courseId) return null;
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

                                                                    // Final safety check - ensure value is never empty
                                                                    if (!courseId || courseId.trim() === '') return null;
                                                                    // Render SelectItem directly so collectItemValues can find it
                                                                    return (
                                                                        <SelectItem key={courseId} value={courseId} textValue={courseName}>
                                                                            {courseName}
                                                                        </SelectItem>
                                                                    );
                                                                })
                                                                .filter(Boolean)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>

                                {/* Row 2: College, University */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <HRMSInputText
                                        label='College *'
                                        id={`qualificationDetails.${index}.college`}
                                        maxLength={100}
                                        {...register(`qualificationDetails.${index}.college`)}
                                    />

                                    <HRMSInputText
                                        label='University *'
                                        id={`qualificationDetails.${index}.university`}
                                        maxLength={100}
                                        {...register(`qualificationDetails.${index}.university`)}
                                    />
                                </div>

                                {/* Row 3: Year Of Passing, Country, State - all in same row */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <HRMSInputText
                                        label='Year Of Passing *'
                                        id={`qualificationDetails.${index}.yearOfPassing`}
                                        maxLength={4}
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
                                                        {countries
                                                            .filter((country: any, countryIndex: number) => {
                                                                const countryId = (
                                                                    country.IVRMMC_Id ||
                                                                    country.IVRMMCO_Id ||
                                                                    country.id ||
                                                                    country.value ||
                                                                    countryIndex
                                                                )?.toString();
                                                                return countryId && countryId.trim() !== '';
                                                            })
                                                            .map((country: any, countryIndex: number) => {
                                                                const countryIdRaw =
                                                                    country.IVRMMC_Id ??
                                                                    country.IVRMMCO_Id ??
                                                                    country.id ??
                                                                    country.value ??
                                                                    countryIndex;
                                                                const countryId = ensureNonEmptyValue(countryIdRaw, countryIndex);
                                                                // Ensure value is never empty string
                                                                if (!countryId) return null;
                                                                const countryName =
                                                                    country.IVRMMC_CountryName ||
                                                                    country.IVRMMCO_CountryName ||
                                                                    country.name ||
                                                                    country.label ||
                                                                    `Country ${countryId}`;
                                                                // Final safety check - ensure value is never empty
                                                                if (!countryId || countryId.trim() === '') return null;
                                                                // Render SelectItem directly so collectItemValues can find it
                                                                return (
                                                                    <SelectItem key={countryId} value={countryId} textValue={countryName}>
                                                                        {countryName}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                            .filter(Boolean)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    <QualificationStateDropdown
                                        control={control}
                                        index={index}
                                        countryId={qualificationDetails[index]?.qualificationCountry || null}
                                        setValue={setValue}
                                        fallbackStates={states}
                                    />
                                </div>

                                {/* Row 4: Registration No., Result */}
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <HRMSInputText
                                        label='Registration No.'
                                        id={`qualificationDetails.${index}.registrationNo`}
                                        maxLength={50}
                                        {...register(`qualificationDetails.${index}.registrationNo`)}
                                    />

                                    <HRMSInputText
                                        label='Result *'
                                        id={`qualificationDetails.${index}.result`}
                                        maxLength={20}
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
                                                        <SelectItem value="CGPA" textValue="CGPA">CGPA</SelectItem>
                                                        <SelectItem value="Percentage" textValue="Percentage">Percentage</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    {/* CGPA or Percentage input - dynamically shown based on selection */}
                                    <HRMSInputText
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
                                                            {specialisations
                                                                .filter((spec: any, specIndex: number) => {
                                                                    const specId = (
                                                                        spec.HRMSPL_Id ||
                                                                        spec.id ||
                                                                        spec.value ||
                                                                        spec.SpecialisationId ||
                                                                        specIndex
                                                                    )?.toString();
                                                                    return specId && specId.trim() !== '';
                                                                })
                                                                .map((spec: any, specIndex: number) => {
                                                                    // Use HRMSPL_Id for ID and HRMSPL_SpecialisationName for name
                                                                    const specIdRaw =
                                                                        spec.HRMSPL_Id ??
                                                                        spec.id ??
                                                                        spec.value ??
                                                                        spec.SpecialisationId ??
                                                                        specIndex;
                                                                    const specId = ensureNonEmptyValue(specIdRaw, specIndex);
                                                                    // Ensure value is never empty string
                                                                    if (!specId) return null;

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

                                                                    // Final safety check - ensure value is never empty
                                                                    if (!specId || specId.trim() === '') return null;
                                                                    // Render SelectItem directly so collectItemValues can find it
                                                                    return (
                                                                        <SelectItem key={specId} value={specId} textValue={specName}>
                                                                            {specName}
                                                                        </SelectItem>
                                                                    );
                                                                })
                                                                .filter(Boolean)}
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
                                    <HRMSInputText
                                        label='Thesis Title'
                                        id={`qualificationDetails.${index}.thesisTitle`}
                                        maxLength={255}
                                        {...register(`qualificationDetails.${index}.thesisTitle`)}
                                    />

                                    <HRMSInputText
                                        label='Medical Council'
                                        id={`qualificationDetails.${index}.medicalCouncil`}
                                        maxLength={50}
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

                                    <HRMSInputText
                                        label='Guide Name'
                                        id={`qualificationDetails.${index}.guideName`}
                                        maxLength={100}
                                        {...register(`qualificationDetails.${index}.guideName`)}
                                    />

                                    <Controller
                                        name={`qualificationDetails.${index}.qualifiedDate`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                                <DateField
                                                    field={field}
                                                    fieldState={fieldState}
                                                    label='Qualified Date'
                                                    placeholder='Pick qualified date'
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} currentTab={currentTab} onPreviousTab={onPreviousTab} />
        </div>
    );
}

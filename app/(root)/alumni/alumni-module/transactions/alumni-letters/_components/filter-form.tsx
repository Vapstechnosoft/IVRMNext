'use client';

import {
    type AlumniLettersSchema,
    alumniLettersSchema
} from '@/app/(root)/alumni/alumni-module/transactions/alumni-letters/_components/schema';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IAcademicYear, IClassDetails } from '@/types/alumni/alumni-letters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, X, Plus, Minus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';

interface FilterFormProps {
    years: IAcademicYear[];
    classes: IClassDetails[];
    onShowReport: (values: AlumniLettersSchema) => void;
    onClear: () => void;
    onPrint: (values: AlumniLettersSchema) => void;
    onSearch: (values: AlumniLettersSchema) => void;
    canPrint: boolean;
}

export default function FilterForm({ years, classes, onShowReport, onClear, onPrint, onSearch, canPrint }: FilterFormProps) {
    const form = useForm<AlumniLettersSchema>({
        resolver: zodResolver(alumniLettersSchema),
        defaultValues: {
            reporttype: 'Alumni',
            letter_list: '',
            display_DateandTime: '',
            asmaY_Id: '',
            asmcL_Id: ''
        }
    });

    const [resetKey, setResetKey] = useState(0);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        trigger,
        getValues,
        formState: { errors }
    } = form;
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'searchRows'
    });

    const asmcL_Id = watch('asmcL_Id');
    const asmaY_Id = watch('asmaY_Id');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const reporttype = watch('reporttype');

    // Automatically trigger search when class changes
    useEffect(() => {
        if (asmcL_Id && asmaY_Id) {
            onShowReport(form.getValues());
        }
    }, [asmcL_Id, onShowReport]); // Trigger ONLY on class change

    const handleClear = () => {
        reset({
            reporttype: 'Alumni',
            letter_list: '',
            display_DateandTime: '',
            asmaY_Id: '',
            asmcL_Id: ''
        });
        setResetKey((prev) => prev + 1);
        onClear();
    };

    const handlePrintClick = async () => {
        const isValid = await trigger();
        if (isValid) {
            onPrint(getValues());
        }
    };

    const FIELDS = [
        { value: "AMST_FirstName", name: "First Name" },
        { value: "AMST_RegistrationNo", name: "Reg No" },
        { value: "AMST_AdmNo", name: "Admission No" },
        { value: "AMST_MobileNo", name: "Mobile No" },
        { value: "AMST_emailId", name: "Email id" },
        { value: "StudentName", name: "Student Name" }
    ];

    const OPERATORS = [
        { value: "=", name: "Equal to" },
        { value: "!=", name: "Not Equal to" },
        { value: "like", name: "Like" },
        { value: ">", name: "Greater than" },
        { value: "<", name: "Less than" },
    ];

    const CONDITIONS = [
        { value: "AND", name: "AND" },
        { value: "OR", name: "OR" },
    ];

    const handleSearchClick = async () => {
        const result = await trigger('searchRows');
        if (result) {
            onSearch(getValues());
        }
    };

    return (
        <form onSubmit={handleSubmit(onShowReport)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='flex flex-col gap-4 rounded-xl border bg-muted/20 p-4'>
                    <Label className='font-bold'>
                        Select Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='reporttype'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Alumni' id='type-alumni' />
                                    <Label htmlFor='type-alumni' className='cursor-pointer'>
                                        Alumni Students
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Regular' id='type-regular' />
                                    <Label htmlFor='type-regular' className='cursor-pointer'>
                                        Regular Students
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select key={resetKey} onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y, index) => (
                                        <SelectItem key={`${y.asmaY_Id}-${index}`} value={String(y.asmaY_Id)}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select key={resetKey} onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c, index) => (
                                        <SelectItem key={`${c.asmcL_Id}-${index}`} value={String(c.asmcL_Id)}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>
                        Letter Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='letter_list'
                        control={control}
                        render={({ field }) => (
                            <Select key={resetKey} onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='OBA'>OBA Games Meet</SelectItem>
                                    <SelectItem value='ENR'>Enrolling As Member-10th</SelectItem>
                                    <SelectItem value='ENR3'>Enrolling As Member-PUC II</SelectItem>
                                    <SelectItem value='ADR'>Change of Address</SelectItem>
                                    <SelectItem value='PTRN'>Enrolling as Patron</SelectItem>
                                    <SelectItem value='LFMB'>Enrolling as Life Member</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.letter_list && <FormError>{errors.letter_list.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>Date and Time</Label>
                    <InputText
                        placeholder='yyyy/MM/dd hh:mm'
                        {...register('display_DateandTime')}
                        onKeyDown={(e) => {
                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '/', ':', ' '];
                            if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                    {errors.display_DateandTime && <FormError>{errors.display_DateandTime.message}</FormError>}
                </div>
            </div>

            <div className="mt-8 space-y-4 rounded-xl border bg-muted/10 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Search Criteria</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ condition: 'AND', field: '', operator: '', value: '' })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Row
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b text-sm font-medium text-muted-foreground">
                                <th className="py-2 px-2 text-left">Field *</th>
                                <th className="py-2 px-2 text-left">Operator *</th>
                                <th className="py-2 px-2 text-left">Value *</th>
                                <th className="py-2 px-2 text-left">Condition</th>
                                <th className="py-2 px-2 text-center w-[80px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-2 min-w-[150px]">
                                        <Controller
                                            name={`searchRows.${index}.field`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="--Select--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {FIELDS.map(f => (
                                                            <SelectItem key={f.value} value={f.value}>{f.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.searchRows?.[index]?.field && (
                                            <FormError>{errors.searchRows[index]?.field?.message}</FormError>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 min-w-[150px]">
                                        <Controller
                                            name={`searchRows.${index}.operator`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="--Select--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OPERATORS.map(o => (
                                                            <SelectItem key={o.value} value={o.value}>{o.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.searchRows?.[index]?.operator && (
                                            <FormError>{errors.searchRows[index]?.operator?.message}</FormError>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 min-w-[200px]">
                                        <InputText
                                            {...register(`searchRows.${index}.value`)}
                                            placeholder="Enter value"
                                            className="h-9"
                                        />
                                        {errors.searchRows?.[index]?.value && (
                                            <FormError>{errors.searchRows[index]?.value?.message}</FormError>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 min-w-[100px]">
                                        {index < fields.length - 1 && (
                                            <Controller
                                                name={`searchRows.${index}.condition`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CONDITIONS.map(c => (
                                                                <SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => remove(index)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fields.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground italic">
                            No search criteria added. Click "Add Row" to start.
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-4'>
                <Button type='button' variant='default' onClick={handleSearchClick} className='min-w-[120px]'>
                    <Search className='mr-2 h-4 w-4' /> Search
                </Button>
                <Button type='button' variant='destructive' onClick={handleClear} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </form>
    );
}

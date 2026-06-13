'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRegNumbering } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { transactionnumberingSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdateTransactionNumbering, deleteRollnoconfig } from '@/server/preconfiguration/transaction-numbering';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';

type FormFields = z.infer<typeof transactionnumberingSchema>;

interface NumberingConfigUpdateFormProps {
    numberingType: string;
    onSuccess?: () => void;
    className?: string;
    selectedRow: any;
    initialData?: Partial<FormFields>;
}

export default function UpdateTransactionNumberingForm({
    numberingType,
    onSuccess,
    className = '',
    selectedRow,
    initialData
}: NumberingConfigUpdateFormProps) {
    const { refetchAll } = useRegNumbering(numberingType);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(transactionnumberingSchema),
        defaultValues: {
            auto_manual_flag: 'Auto',
            duplicates_flag: 'No',
            prefix_type: 'academic',
            suffix_type: 'academic',
            prefix_particulars: '',
            suffix_particulars: '',
            prefix_numeric_width: 2,
            suffix_starting_from: 1,
            prefix_with_zero: 'no',
            restart_frequency: 'never',
            transaction_name: '',
            restart_acad_year: false,
            restart_fin_year: false,
            restart_cal_year: false,
            voucher_name: '',
            voucher_type: '',
            rollNumberingconfig: [],
            ...initialData
        }
    });

    const { fields: rollConfigFields, append, remove } = useFieldArray({
        control,
        name: 'rollNumberingconfig'
    });

    const prefixType = watch('prefix_type');
    const suffixType = watch('suffix_type');
    const autoManualFlag = watch('auto_manual_flag');

    useEffect(() => {
        if (selectedRow) {
            const mappedData: Partial<FormFields> = {
                auto_manual_flag: selectedRow.imN_AutoManualFlag === 'M' ? 'Manual' : 'Auto',
                duplicates_flag: selectedRow.imN_DuplicatesFlag === 'Y' ? 'Yes' : 'No',
                prefix_type: (numberingType === 'Voucher' ? selectedRow.imN_PrefixFinYearCode : selectedRow.imN_PrefixAcadYearCode)
                    ? 'academic'
                    : selectedRow.imN_PrefixParticular
                        ? 'particulars'
                        : 'academic',
                prefix_particulars: selectedRow.imN_PrefixParticular || '',
                prefix_numeric_width: selectedRow.imN_WidthNumeric ? Number(selectedRow.imN_WidthNumeric) : 0,
                suffix_type: (numberingType === 'Voucher' ? selectedRow.imN_SuffixFinYearCode : selectedRow.imN_SuffixAcadYearCode)
                    ? 'academic'
                    : selectedRow.imN_SuffixParticular
                        ? 'particulars'
                        : 'academic',
                suffix_particulars: selectedRow.imN_SuffixParticular || '',
                suffix_starting_from: selectedRow.imN_StartingNo ? Number(selectedRow.imN_StartingNo) : 0,
                prefix_with_zero: selectedRow.imN_ZeroPrefixFlag === 'Y' || selectedRow.imN_ZeroPrefixFlag === 'Yes' ? 'yes' : 'no',
                restart_frequency: selectedRow.imN_RestartNumFlag === 'Y' || selectedRow.imN_RestartNumFlag === 'Yearly' ? 'yearly' : (selectedRow.imN_RestartNumFlag === 'M' || selectedRow.imN_RestartNumFlag === 'Monthly' ? 'monthly' : 'never'),
                transaction_name: selectedRow.irN_TransactionName || '',
                restart_acad_year: !!selectedRow.irN_RestartAcadYear,
                restart_fin_year: !!selectedRow.irN_RestartFinYear,
                restart_cal_year: !!selectedRow.irN_RestartcalendYear,
                voucher_name: selectedRow.voucherName || '',
                voucher_type: selectedRow.voucherType || '',
                rollNumberingconfig: selectedRow.rollNumberingconfig || []
            };

            reset(mappedData);
        }
    }, [selectedRow, reset, numberingType]);

    const handleDeleteRollConfig = async (index: number, id: number) => {
        if (id === 0) {
            remove(index);
            return;
        }
        try {
            setIsDeleting(true);
            const res = await deleteRollnoconfig(id);
            if (res?.success || res) {
                toast.success('Roll config deleted successfully');
                remove(index);
                refetchAll();
            } else {
                toast.error('Failed to delete config');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (data: FormFields) => {
        try {
            // Default Master Payload
            let payload: any = {
                imN_Id: selectedRow?.imN_Id || 0,
                imN_AutoManualFlag: data.auto_manual_flag === 'Manual' ? 'M' : 'A',
                imN_DuplicatesFlag: data.auto_manual_flag === 'Manual' ? (data.duplicates_flag === 'Yes' ? 'Y' : 'N') : 'N',
                imN_StartingNo: data.suffix_starting_from?.toString() || '1',
                imN_WidthNumeric: data.prefix_numeric_width?.toString() || '1',
                imN_ZeroPrefixFlag: data.prefix_with_zero === 'yes' ? 'Y' : 'N',
                imN_PrefixParticular: data.prefix_type === 'particulars' ? data.prefix_particulars || '' : '',
                imN_SuffixParticular: data.suffix_type === 'particulars' ? data.suffix_particulars || '' : '',
                imN_RestartNumFlag: data.restart_frequency === 'yearly' ? 'Y' : (data.restart_frequency === 'monthly' ? 'M' : 'N'),
                imN_Flag: numberingType,

                // Defaults for Master
                imN_PrefixAcadYearCode: data.prefix_type === 'academic',
                imN_PrefixFinYearCode: false,
                imN_PrefixCalYearCode: false,
                imN_SuffixAcadYearCode: data.suffix_type === 'academic',
                imN_SuffixFinYearCode: false,
                imN_SuffixCalYearCode: false
            };

            if (numberingType === 'Receipt') {
                payload = {
                    ...payload,
                    irN_TransactionName: data.transaction_name,
                    irN_RestartAcadYear: !!data.restart_acad_year,
                    irN_RestartFinYear: !!data.restart_fin_year,
                    irN_RestartcalendYear: !!data.restart_cal_year
                };
            } else if (numberingType === 'Voucher') {
                payload = {
                    ...payload,
                    voucherName: data.voucher_name,
                    voucherType: data.voucher_type,
                    imN_PrefixAcadYearCode: false,
                    imN_PrefixFinYearCode: data.prefix_type === 'academic',
                    imN_SuffixAcadYearCode: false,
                    imN_SuffixFinYearCode: data.suffix_type === 'academic'
                };
            } else if (numberingType === 'RollNumber') {
                payload = {
                    ...payload,
                    rollNumberingconfig: data.rollNumberingconfig?.map((item, index) => ({
                        ivrmarnC_Field: item.ivrmarnC_Field,
                        ivrmarnC_AscDscOrder: item.ivrmarnC_AscDscOrder,
                        ivrmarnC_Order: item.ivrmarnC_Order || (index + 1),
                        ivrmarnC_Id: item.ivrmarnC_Id || 0
                    }))
                };
            }

            const response = await addOrUpdateTransactionNumbering(payload);
            if (response.success || response) {
                toast.success('Updated Successfully');
                reset();
                onSuccess?.();
                refetchAll();
            } else {
                toast.error('Failed to update');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update configuration');
        }
    };

    const handleReset = () => {
        if (selectedRow) {
            const mappedData: Partial<FormFields> = {
                auto_manual_flag: selectedRow.imN_AutoManualFlag === 'M' ? 'Manual' : 'Auto',
                duplicates_flag: selectedRow.imN_DuplicatesFlag === 'Y' ? 'Yes' : 'No',
                prefix_type: (numberingType === 'Voucher' ? selectedRow.imN_PrefixFinYearCode : selectedRow.imN_PrefixAcadYearCode)
                    ? 'academic'
                    : selectedRow.imN_PrefixParticular
                        ? 'particulars'
                        : 'academic',
                prefix_particulars: selectedRow.imN_PrefixParticular || '',
                prefix_numeric_width: selectedRow.imN_WidthNumeric ? Number(selectedRow.imN_WidthNumeric) : 0,
                suffix_type: (numberingType === 'Voucher' ? selectedRow.imN_SuffixFinYearCode : selectedRow.imN_SuffixAcadYearCode)
                    ? 'academic'
                    : selectedRow.imN_SuffixParticular
                        ? 'particulars'
                        : 'academic',
                suffix_particulars: selectedRow.imN_SuffixParticular || '',
                suffix_starting_from: selectedRow.imN_StartingNo ? Number(selectedRow.imN_StartingNo) : 0,
                prefix_with_zero: selectedRow.imN_ZeroPrefixFlag === 'Y' || selectedRow.imN_ZeroPrefixFlag === 'Yes' ? 'yes' : 'no',
                restart_frequency: selectedRow.imN_RestartNumFlag === 'Y' || selectedRow.imN_RestartNumFlag === 'Yearly' ? 'yearly' : (selectedRow.imN_RestartNumFlag === 'M' || selectedRow.imN_RestartNumFlag === 'Monthly' ? 'monthly' : 'never'),
                transaction_name: selectedRow.irN_TransactionName || '',
                restart_acad_year: !!selectedRow.irN_RestartAcadYear,
                restart_fin_year: !!selectedRow.irN_RestartFinYear,
                restart_cal_year: !!selectedRow.irN_RestartcalendYear,
                voucher_name: selectedRow.voucherName || '',
                voucher_type: selectedRow.voucherType || '',
                rollNumberingconfig: selectedRow.rollNumberingconfig || []
            };
            reset(mappedData);
        } else {
            reset({
                auto_manual_flag: 'Auto',
                duplicates_flag: 'No',
                prefix_type: 'academic',
                suffix_type: 'academic',
                prefix_particulars: '',
                suffix_particulars: '',
                prefix_numeric_width: 2,
                suffix_starting_from: 1,
                prefix_with_zero: 'no',
                restart_frequency: 'never',
                ...initialData
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-8 rounded-lg border bg-white p-6 shadow-sm', className)}>

            {/* conditional fields for Receipt */}
            {numberingType === 'Receipt' && (
                <div className='rounded-md border bg-muted/20 p-4'>
                    <Label htmlFor='transaction_name_update'>Transaction Name</Label>
                    <Controller
                        name='transaction_name'
                        control={control}
                        render={({ field }) => (
                            <Input {...field} id='transaction_name_update' placeholder='e.g. Fee Receipt' />
                        )}
                    />
                </div>
            )}

            {/* conditional fields for Voucher */}
            {numberingType === 'Voucher' && (
                <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                    <div>
                        <Label htmlFor='voucher_name_update'>Voucher Name</Label>
                        <Controller
                            name='voucher_name'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} id='voucher_name_update' placeholder='e.g. Payment Voucher' />
                            )}
                        />
                    </div>
                    <div>
                        <Label htmlFor='voucher_type_update'>Voucher Type</Label>
                        <Controller
                            name='voucher_type'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} id='voucher_type_update' placeholder='e.g. PV' />
                            )}
                        />
                    </div>
                </div>
            )}

            {/* === AUTO / MANUAL SELECTION === */}
            <div className='flex items-start gap-8 rounded-md border bg-muted/20 p-4'>
                <Label className='font-medium text-primary mt-1'>Please Select Radio Button <span className="text-red-500">*</span></Label>
                <Controller
                    name='auto_manual_flag'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Manual' id={`manual_${numberingType}_update`} />
                                <Label htmlFor={`manual_${numberingType}_update`} className='cursor-pointer'>
                                    Manual
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Auto' id={`auto_${numberingType}_update`} />
                                <Label htmlFor={`auto_${numberingType}_update`} className='cursor-pointer'>
                                    Auto
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            {/* === MANUAL SETTINGS === */}
            {autoManualFlag === 'Manual' && (
                <div className='flex items-start gap-8 rounded-md border bg-muted/20 p-4'>
                    <Label className='font-medium text-primary mt-1'>Prevent Duplicate: <span className="text-red-500">*</span></Label>
                    <Controller
                        name='duplicates_flag'
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1">
                                <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Yes' id={`dup_yes_${numberingType}_update`} />
                                        <Label htmlFor={`dup_yes_${numberingType}_update`} className='cursor-pointer'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='No' id={`dup_no_${numberingType}_update`} />
                                        <Label htmlFor={`dup_no_${numberingType}_update`} className='cursor-pointer'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.duplicates_flag && <FormError>{errors.duplicates_flag.message}</FormError>}
                            </div>
                        )}
                    />
                </div>
            )}

            {/* === AUTO SETTINGS === */}
            {autoManualFlag === 'Auto' && (
                <>
                    {/* === PREFIX SECTION === */}
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <h3 className='mb-3 font-medium text-primary'>Prefix</h3>

                            <div className='space-y-2'>
                                <Label>Prefix Type *</Label>
                                <Controller
                                    name='prefix_type'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='academic' id={`prefix-academic-${numberingType}-update`} />
                                                <Label htmlFor={`prefix-academic-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='particulars' id={`prefix-particulars-${numberingType}-update`} />
                                                <Label htmlFor={`prefix-particulars-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    Particulars
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {prefixType === 'particulars' && (
                                <div className='space-y-2'>
                                    <Label htmlFor={`prefix_particulars_${numberingType}_update`}>Particulars</Label>
                                    <Controller
                                        name='prefix_particulars'
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} id={`prefix_particulars_${numberingType}_update`} placeholder='e.g., INV, REG' className='w-full' />
                                        )}
                                    />
                                    {errors.prefix_particulars && <FormError>{errors.prefix_particulars.message}</FormError>}
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor={`prefix_numeric_width_${numberingType}_update`}>Width of Numeric Part</Label>
                                <Controller
                                    name='prefix_numeric_width'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={`prefix_numeric_width_${numberingType}_update`}
                                            type='number'
                                            min='1'
                                            max='10'
                                            placeholder='e.g., 4'
                                            className='w-full'
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    )}
                                />
                                {errors.prefix_numeric_width && <FormError>{errors.prefix_numeric_width.message}</FormError>}
                            </div>
                        </div>

                        {/* === SUFFIX SECTION === */}
                        <div className='space-y-4'>
                            <h3 className='mb-3 font-medium text-primary'>Suffix</h3>

                            <div className='space-y-2'>
                                <Label>Suffix Type *</Label>
                                <Controller
                                    name='suffix_type'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='academic' id={`suffix-academic-${numberingType}-update`} />
                                                <Label htmlFor={`suffix-academic-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='particulars' id={`suffix-particulars-${numberingType}-update`} />
                                                <Label htmlFor={`suffix-particulars-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    Particulars
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {suffixType === 'particulars' && (
                                <div className='space-y-2'>
                                    <Label htmlFor={`suffix_particulars_${numberingType}_update`}>Particulars</Label>
                                    <Controller
                                        name='suffix_particulars'
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} id={`suffix_particulars_${numberingType}_update`} placeholder='e.g., FY, SEM' className='w-full' />
                                        )}
                                    />
                                    {errors.suffix_particulars && <FormError>{errors.suffix_particulars.message}</FormError>}
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor={`suffix_starting_from_${numberingType}_update`}>SLNO Starting From</Label>
                                <Controller
                                    name='suffix_starting_from'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={`suffix_starting_from_${numberingType}_update`}
                                            type='number'
                                            min='1'
                                            placeholder='e.g., 1'
                                            className='w-full'
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    )}
                                />
                                {errors.suffix_starting_from && <FormError>{errors.suffix_starting_from.message}</FormError>}
                            </div>
                        </div>
                    </div>
                    {/* === OTHER SETTINGS === */}
                    <div className='space-y-6 border-t pt-6'>
                        <div className='space-y-2'>
                            <Label>Prefix with Zero</Label>
                            <Controller
                                name='prefix_with_zero'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='yes' id={`prefix-zero-yes-${numberingType}-update`} />
                                            <Label htmlFor={`prefix-zero-yes-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                Yes
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='no' id={`prefix-zero-no-${numberingType}-update`} />
                                            <Label htmlFor={`prefix-zero-no-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Restart Numbering Frequency</Label>
                            <div className='flex flex-col gap-4'>
                                <Controller
                                    name='restart_frequency'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='never' id={`restart-never-${numberingType}-update`} />
                                                <Label htmlFor={`restart-never-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    Never
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='yearly' id={`restart-yearly-${numberingType}-update`} />
                                                <Label htmlFor={`restart-yearly-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    Yearly
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='monthly' id={`restart-monthly-${numberingType}-update`} />
                                                <Label htmlFor={`restart-monthly-${numberingType}-update`} className='cursor-pointer font-normal'>
                                                    Monthly
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {numberingType === 'Receipt' && watch('restart_frequency') === 'yearly' && (
                                    <div className='flex gap-6 pt-2'>
                                        <Controller
                                            name='restart_acad_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox id='restart_acad_year_u' checked={!!field.value} onCheckedChange={field.onChange} />
                                                    <Label htmlFor='restart_acad_year_u'>Academic Year</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name='restart_fin_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox id='restart_fin_year_u' checked={!!field.value} onCheckedChange={field.onChange} />
                                                    <Label htmlFor='restart_fin_year_u'>Financial Year</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name='restart_cal_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox id='restart_cal_year_u' checked={!!field.value} onCheckedChange={field.onChange} />
                                                    <Label htmlFor='restart_cal_year_u'>Calendar Year</Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* === ROLL NUMBERING CONFIG === */}
            {numberingType === 'RollNumber' && (
                <div className='rounded-md border bg-muted/20 p-4 mt-6'>
                    <div className='flex justify-between items-center mb-3'>
                        <h3 className='font-medium text-primary'>Roll Numbering Configuration</h3>
                        <Button type="button" size="sm" variant="outline" onClick={() => append({ ivrmarnC_Field: 'AMST_FirstName', ivrmarnC_AscDscOrder: 'ASC', ivrmarnC_Order: rollConfigFields.length + 1, ivrmarnC_Id: 0 })}>
                            <Plus className="w-4 h-4 mr-1" /> Add Rule
                        </Button>
                    </div>

                    <div className='space-y-3'>
                        {rollConfigFields.map((field, index) => (
                            <div key={field.id} className='flex items-center gap-4 bg-white p-2 border rounded-md shadow-sm'>
                                <div className='flex-1'>
                                    <Label className='text-xs text-muted-foreground'>Field to sort</Label>
                                    <Controller
                                        name={`rollNumberingconfig.${index}.ivrmarnC_Field`}
                                        control={control}
                                        render={({ field: inputField }) => (
                                            <select
                                                {...inputField}
                                                value={inputField.value ?? ''}
                                                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                            >
                                                <option value="AMST_FirstName">First Name</option>
                                                <option value="AMST_AdmNo">Admission Number</option>
                                                <option value="AMST_RegistrationNo">Registration Number</option>
                                                <option value="AMST_Date">Date</option>
                                            </select>
                                        )}
                                    />
                                </div>
                                <div className='flex-1'>
                                    <Label className='text-xs text-muted-foreground'>Order</Label>
                                    <Controller
                                        name={`rollNumberingconfig.${index}.ivrmarnC_AscDscOrder`}
                                        control={control}
                                        render={({ field: inputField }) => (
                                            <select
                                                {...inputField}
                                                value={inputField.value ?? ''}
                                                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                            >
                                                <option value="ASC">Ascending (ASC)</option>
                                                <option value="DESC">Descending (DESC)</option>
                                            </select>
                                        )}
                                    />
                                </div>
                                <div className='flex items-end'>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className='text-destructive mb-0.5'
                                        disabled={isDeleting}
                                        onClick={() => handleDeleteRollConfig(index, control._formValues.rollNumberingconfig?.[index]?.ivrmarnC_Id || 0)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === ACTION BUTTONS === */}
            <div className='flex justify-start gap-3 border-t pt-6 mt-6'>
                <Button type='button' className='w-fit' variant='outline' onClick={handleReset} disabled={isSubmitting || isDeleting}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
                <Button type='submit' className='w-fit' disabled={isSubmitting || isDeleting}>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    );
}

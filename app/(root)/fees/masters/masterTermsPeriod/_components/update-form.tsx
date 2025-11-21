'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MASTER_HEADS_DROPDOWN, TERM_DROPDOWN_DATA, useMasterTermsPeriod } from '@/hooks/fees/useMasters';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { masterTermPeriodSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterfeehead } from '@/server/fees/masters/feehead';
import type { IMasterTermsPeriodList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterTermPeriodSchema.addOrUpdate>;

interface UpdateMasterTermsPeriodFormProps {
    onSuccess?: () => void;
    feeheadname?: string;
    selectedRow: IMasterTermsPeriodList;
}

export default function UpdateMasterTermsPeriodForm({ onSuccess, feeheadname = '', selectedRow: row }: UpdateMasterTermsPeriodFormProps) {
    const { refetchAll } = useMasterTermsPeriod();

    // Fetch hooks
    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const { data: terms, isLoading: termsLoading, error: termsError, refetchAll: refetchterms } = TERM_DROPDOWN_DATA();

    const { data: masterHeads, isLoading: masterHeadsLoading, error: headerror, refetchAll: refetchMasterHeads } = MASTER_HEADS_DROPDOWN();

    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [filterType, setFilterType] = useState<string>('');

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterTermPeriodSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                // fmH_Id: row.fmH_Id,
                // fmH_FeeName: row.fmH_FeeName,
                // fmH_Order: row.fmH_Order,
                // fmH_Flag: row.fmH_Flag,
                // fmH_PDAFlag: row.fmH_PDAFlag,
                // fmH_SpecialFeeFlag: row.fmH_SpecialFeeFlag,
                // fmH_RefundFlag: row.fmH_RefundFlag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // const { fmH_FeeName, fmH_Id, fmH_Flag, fmH_Order, fmH_PDAFlag, fmH_SpecialFeeFlag, fmH_RefundFlag } = data;
            // const payload = {
            //     MI_Id: 30,
            //     fmH_Id: fmH_Id,
            //     fmH_FeeName: fmH_FeeName,
            //     fmH_Flag: fmH_Flag,
            //     ASMCL_ActiveFlag: true,
            //     fmH_Order: fmH_Order,
            //     fmH_PDAFlag: fmH_PDAFlag,
            //     fmH_SpecialFeeFlag: fmH_SpecialFeeFlag,
            //     fmH_RefundFlag: fmH_RefundFlag
            // };
            const payload = data;
            const response = await addOrUpdateMasterfeehead(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
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
        <div className={`${feeheadname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col items-center justify-center space-y-6'>
                {/* Academic Year */}
                <div className='flex items-center gap-6'>
                    <Label className='min-w-[150px] text-right'>
                        Academic Year:<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <div className='flex w-full max-w-[400px] flex-col'>
                        <Controller
                            name='asmay_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => {
                                        const id = Number(val);
                                        field.onChange(id);
                                        setSelectedAcademicYear(id);
                                    }}
                                    value={typeof field.value === 'number' || typeof field.value === 'string' ? String(field.value) : ''}
                                    disabled={academicYearLoading}>
                                    <SelectTrigger className='min-w-[400px] text-center'>
                                        <SelectValue placeholder='--Select Academic Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : academicYearError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            academicYear?.data?.map((item: any, index: number) => (
                                                <SelectItem key={`${item.asmaY_Id}-${index}`} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmay_Id && <FormError>{errors.asmay_Id.message}</FormError>}
                    </div>
                </div>

                {/* Term Name */}
                <div className='flex items-center gap-6'>
                    <Label className='min-w-[150px] text-right'>
                        Term Name :<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <div className='flex w-full max-w-[400px] flex-col'>
                        <Controller
                            name='fmt_id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => {
                                        const id = Number(val);
                                        field.onChange(id);
                                        setSelectedTerm(id);
                                    }}
                                    value={typeof field.value === 'number' || typeof field.value === 'string' ? String(field.value) : ''}
                                    disabled={termsLoading}>
                                    <SelectTrigger className='min-w-[400px] text-center'>
                                        <SelectValue placeholder='--Select Term--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {termsLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : termsError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            terms?.data?.map((item: any, index: number) => (
                                                <SelectItem key={`${item.fmT_Id}-${index}`} value={item.fmT_Id.toString()}>
                                                    {item.fmT_Name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmt_id && <FormError>{errors.fmt_id.message}</FormError>}
                    </div>
                </div>

                {/* Fees Head */}
                {/* <div className="flex items-center gap-6">
          <Label className="min-w-[150px] text-right">
            Fees Head :<span className="ml-1 text-red-500">*</span>
          </Label>
          <div className="flex w-full max-w-[400px] flex-col">
            <Controller
              name="fmh_id"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value || "empty"}
                  onValueChange={(val) => {
                    const id = Number(val);
                    field.onChange(id);
                    setSelectedHead(id);
                  }}
                  value={
                    typeof field.value === "number" ||
                    typeof field.value === "string"
                      ? String(field.value)
                      : ""
                  }
                  disabled={masterHeadsLoading}
                >
                  <SelectTrigger className="min-w-[400px] text-center">
                    <SelectValue placeholder="--Select Fees Head--" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterHeadsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : headerror ? (
                      <SelectItem value="error" disabled>
                        Error loading
                      </SelectItem>
                    ) : (
                      masterHeads?.data?.map((item: any, index: number) => (
                        <SelectItem
                          key={`${item.fmH_Id}-${index}`}
                          value={item.fmH_Id.toString()}
                        >
                          {item.fmH_FeeName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.fmh_id && <FormError>{errors.fmh_id.message}</FormError>}
          </div>
        </div> */}

                <div className='flex items-center gap-6'>
                    <Label className='min-w-[150px] text-right'>
                        From Month :<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <div className='flex w-full max-w-[400px] flex-col'>
                        <Controller
                            name='from_Month'
                            control={control}
                            render={({ field }) => (
                                <>
                                    <InputText
                                        {...field}
                                        id='from_Month'
                                        required
                                        onKeyDown={(e) => {
                                            const allowed = /^[A-Za-z0-9 ]$/;
                                            if (e.key.length === 1 && !allowed.test(e.key)) e.preventDefault();
                                        }}
                                        onPaste={(e) => {
                                            const pasteText = e.clipboardData.getData('text');
                                            if (!/^[A-Za-z0-9 ]*$/.test(pasteText)) e.preventDefault();
                                        }}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                    {errors.from_Month && <FormError>{errors.from_Month.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className='flex items-center gap-6'>
                    <Label className='min-w-[150px] text-right'>
                        To Month :<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <div className='flex w-full max-w-[400px] flex-col'>
                        <Controller
                            name='to_Month'
                            control={control}
                            render={({ field }) => (
                                <>
                                    <InputText
                                        {...field}
                                        id='to_Month'
                                        required
                                        onKeyDown={(e) => {
                                            const allowed = /^[A-Za-z0-9 ]$/;
                                            if (e.key.length === 1 && !allowed.test(e.key)) e.preventDefault();
                                        }}
                                        onPaste={(e) => {
                                            const pasteText = e.clipboardData.getData('text');
                                            if (!/^[A-Za-z0-9 ]*$/.test(pasteText)) e.preventDefault();
                                        }}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                    {errors.to_Month && <FormError>{errors.to_Month.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className='flex justify-center'>
                    <Controller
                        name='filterType'
                        control={control}
                        render={({ field }) => (
                            <div className='flex flex-col items-center'>
                                <Card className='p-4'>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setFilterType(val);
                                        }}>
                                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5'>
                                            {[
                                                { value: 'N', label: 'New Admission Fee' },
                                                { value: 'F', label: 'Regular Fee' },
                                                { value: 'T', label: 'TransportFee' },
                                                { value: 'R', label: 'Registration Fee' }
                                            ].map((item) => (
                                                <div key={item.value} className='flex items-center space-x-2'>
                                                    <RadioGroupItem value={item.value} id={item.value} />
                                                    <Label htmlFor={item.value} className='cursor-pointer text-sm'>
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </Card>

                                {/* Error BELOW the card */}
                                {errors.filterType && <FormError className='mt-2'>{errors.filterType.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

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
                            Update Master Fee Head
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}

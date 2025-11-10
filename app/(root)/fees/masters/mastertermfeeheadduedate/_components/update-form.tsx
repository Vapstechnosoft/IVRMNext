'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MASTER_HEADS_DROPDOWN, TERM_DROPDOWN_DATA, useMasterTermsHeadDueDate } from '@/hooks/fees/useMasters';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { masterTermFeeHeadDuedateSchema } from '@/schemas/fees/masters';
import { addOrUpdateFeeTermHeadDueDate, getFeeTermHeadDueDateGridList } from '@/server/fees/masters/fee-term-head-duedate';
import type { IFeeTermFeeHeadDueDateGridList, IMasterTermFeeHeadDueDateList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterTermFeeHeadDuedateSchema.addOrUpdate>;

interface UpdateFeeTermsHeadDueDateFormProps {
    onSuccess?: () => void;
    termname?: string;
    selectedRow?: IMasterTermFeeHeadDueDateList;
}

export default function UpdateFeeTermsHeadDueDateForm({ onSuccess, termname = '', selectedRow }: UpdateFeeTermsHeadDueDateFormProps) {
    const { refetchAll } = useMasterTermsHeadDueDate();

    // ✅ fallback static row
    // const staticRow: IMasterTermFeeHeadDueDateList = {
    //   asmaY_Id: 231,
    //   fmT_Id: 61,
    //   fmH_Id: 303,
    //   termname: "Term 1",
    //   headnamed: "Tuition Fee",
    //   yearname: "2024-2025",
    //   fdate1: "2023-08-01",
    //   tdate1: "2023-08-31",
    //   aplc1: "2023-08-01",
    //   ddate1: "2023-08-31",
    //   fmtfhdD_Id: 1,
    // };

    //const rowData = staticRow;
    //selectedRow ||

    const rowData = selectedRow;

    // dropdown data
    const { data: academicYear, isLoading: academicYearLoading } = useacademicyerdropdowndatafee();

    console.log('academicYear:', academicYear);
    const { data: terms, isLoading: termsLoading } = TERM_DROPDOWN_DATA();
    console.log('terms:', terms);
    const { data: masterHeads, isLoading: headsLoading } = MASTER_HEADS_DROPDOWN();

    console.log('masterHeads:', masterHeads);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);

    const isEditMode = !!rowData;

    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [selectedHead, setSelectedHead] = useState<number | null>(null);
    const [gridData, setGridData] = useState<IFeeTermFeeHeadDueDateGridList[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterTermFeeHeadDuedateSchema.addOrUpdate),
        mode: 'onChange'
    });

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && rowData && academicYear?.data?.length && terms?.data?.length && masterHeads?.data?.length) {
            reset({
                asmay_Id: rowData.asmaY_Id,
                fmt_id: rowData.fmT_Id,
                fmh_id: rowData.fmH_Id
            });

            setSelectedAcademicYear(rowData.asmaY_Id);
            setSelectedTerm(rowData.fmT_Id);
            setSelectedHead(rowData.fmH_Id);

            setInitialized(true); // ✅ prevent re-trigger
        }
    }, [initialized, rowData, academicYear?.data?.length, terms?.data?.length, masterHeads?.data?.length, reset]);

    // ✅ fetch grid data dynamically
    useEffect(() => {
        async function fetchGrid() {
            if (selectedAcademicYear && selectedTerm && selectedHead) {
                const toastId = toast.loading('Fetching due date data...');
                try {
                    const res = await getFeeTermHeadDueDateGridList(selectedAcademicYear, selectedTerm, selectedHead);

                    if (res?.success && Array.isArray(res.data)) {
                        setGridData(res.data);
                        toast.success('Data loaded successfully', { id: toastId });
                    } else {
                        setGridData([]);
                        toast.info('No records found', { id: toastId });
                    }
                } catch (err: any) {
                    toast.error(err?.message || 'Error fetching grid data');
                }
            }
        }
        fetchGrid();
    }, [selectedAcademicYear, selectedTerm, selectedHead]);

    // ✅ Submit
    const onSubmit: SubmitHandler<FormFields> = async () => {
        if (!gridData.length) {
            toast.error('No grid data found to update');
            return;
        }

        const payload = {
            mI_Id: 30,
            temyrid: selectedAcademicYear ?? 0,
            fmT_Id: selectedTerm ?? 0,
            fmH_Id: selectedHead ?? 0,
            mainid: 0,
            //insname: rowData.headnamed,
            feetfhddd: gridData.map((item) => ({
                //fmtfhdD_Id: item.fmtfhdD_Id ?? 0,
                fmtfH_Id: item.fmtfH_Id ?? 0,
                asmaY_Id: selectedAcademicYear ?? 0,
                FMTFHDD_FromDate: item.fmtfhdD_FromDate?.split('T')[0] ?? null,
                FMTFHDD_ToDate: item.fmtfhdD_ToDate?.split('T')[0] ?? null,
                FMTFHDD_ApplicableDate: item.fmtfhdD_ApplicableDate?.split('T')[0] ?? null,
                FMTFHDD_DueDate: item.fmtfhdD_DueDate?.split('T')[0] ?? null
            }))
        };

        console.log('Final Payload:', payload);

        const response = await addOrUpdateFeeTermHeadDueDate(payload);
        if (response.success) {
            toast.success('Updated successfully');
            onSuccess?.();
            refetchAll();
        } else {
            toast.error(response.message || 'Update failed');
        }
    };

    return (
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
                                onValueChange={(val) => {
                                    const id = Number(val);
                                    field.onChange(id);
                                    setSelectedAcademicYear(id);
                                }}
                                value={field.value ? String(field.value) : ''}
                                disabled={isEditMode || academicYearLoading}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYear?.data?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmay_Id && <FormError>{errors.asmay_Id.message}</FormError>}
                </div>
            </div>

            {/* Term */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    Term:<span className='ml-1 text-red-500'>*</span>
                </Label>
                <div className='flex w-full max-w-[400px] flex-col'>
                    <Controller
                        name='fmt_id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => {
                                    const id = Number(val);
                                    field.onChange(id);
                                    setSelectedTerm(id);
                                }}
                                value={field.value ? String(field.value) : ''}
                                disabled={isEditMode || termsLoading}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Term' />
                                </SelectTrigger>
                                <SelectContent>
                                    {terms?.data?.map((item: any) => (
                                        <SelectItem key={item.fmT_Id} value={String(item.fmT_Id)}>
                                            {item.fmT_Name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fmt_id && <FormError>{errors.fmt_id.message}</FormError>}
                </div>
            </div>

            {/* Fees Head */}
            <div className='flex items-center gap-6'>
                <Label className='min-w-[150px] text-right'>
                    Fees Head:<span className='ml-1 text-red-500'>*</span>
                </Label>
                <div className='flex w-full max-w-[400px] flex-col'>
                    <Controller
                        name='fmh_id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => {
                                    const id = Number(val);
                                    field.onChange(id);
                                    setSelectedHead(id);
                                }}
                                value={field.value ? String(field.value) : ''}
                                disabled={isEditMode || headsLoading}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Fees Head' />
                                </SelectTrigger>
                                <SelectContent>
                                    {masterHeads?.data?.map((item: any) => (
                                        <SelectItem key={item.fmH_Id} value={String(item.fmH_Id)}>
                                            {item.fmH_FeeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fmh_id && <FormError>{errors.fmh_id.message}</FormError>}
                </div>
            </div>

            {/* Grid */}
            {gridData.length > 0 && (
                <div className='mt-6 w-full overflow-x-auto rounded border border-gray-300'>
                    <table className='min-w-full text-sm'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='border px-3 py-2'>SL No</th>
                                <th className='border px-3 py-2'>Installment Name</th>
                                <th className='border px-3 py-2'>From Date</th>
                                <th className='border px-3 py-2'>To Date</th>
                                <th className='border px-3 py-2'>Applicable Date</th>
                                <th className='border px-3 py-2'>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map((item, index) => (
                                <tr key={index} className='hover:bg-gray-50'>
                                    <td className='border px-3 py-2'>{index + 1}</td>
                                    <td className='border px-3 py-2'>{item.insname}</td>
                                    {['fmtfhdD_FromDate', 'fmtfhdD_ToDate', 'fmtfhdD_ApplicableDate', 'fmtfhdD_DueDate'].map((key) => (
                                        <td key={key} className='border px-3 py-2'>
                                            <input
                                                type='date'
                                                value={(item as any)[key]?.split('T')[0] || ''}
                                                onChange={(e) => {
                                                    const updated = [...gridData];
                                                    (updated[index] as any)[key] = e.target.value;
                                                    setGridData(updated);
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Submit */}
            {gridData.length > 0 && (
                <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:justify-start'>
                    <Button type='submit' disabled={isSubmitting}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' /> Save
                        </div>
                    </Button>
                </div>
            )}
        </form>
    );
}

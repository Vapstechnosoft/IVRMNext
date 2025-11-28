'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { feesStudentTransactionSchema } from '@/schemas/fees/trasactions';
import type { z } from 'zod';

/* -------------------------------------------------------
   MOCK STATIC API — remove & replace later
------------------------------------------------------- */
async function fetchStudents(filterType: string) {
    return [
        { amst_Id: 474, name: 'KRITHIKA V – VI C' },
        { amst_Id: 475, name: 'STUDENT 475 – V A' }
    ];
}

async function fetchTerms(studentId: number) {
    return [
        { id: 1, name: 'TERM 1' },
        { id: 2, name: 'VAN FEES' }
    ];
}

async function fetchFeeDetails(studentId: number, termId: number) {
    return {
        heads: [
            {
                fmH_Id: 1,
                headName: 'ILM & OTHER FEES',
                installment: 'Yearly',
                currentCharges: 17000,
                totalAdjusted: 0
            }
        ],

        summary: {
            currentFee: 17000,
            concession: 0,
            outstanding: 2000,
            fine: 0,
            nowPaying: 2000
        }
    };
}

/* -------------------------------------------------------
   FORM FIELDS TYPE
------------------------------------------------------- */
type FormFields = z.infer<typeof feesStudentTransactionSchema.addOrUpdate>;

interface FeestudentTrasactionsFormProps {
    onSuccess?: () => void;
}

export default function StudentFeeTransaction({ onSuccess }: FeestudentTrasactionsFormProps) {
    /* -------------------------------------------------------
     FORM INITIALIZATION
  ------------------------------------------------------- */
    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesStudentTransactionSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: 231,
            amst_Id: 0,
            feeGroupIds: [],
            paymentRows: [],
            gridRows: [],
            payModeType: 'Single',
            amountCheck: false,
            showReceiptNo: false,
            rebateFlag: false
        }
    });

    const [filterType, setFilterType] = useState('regular');

    /* -------------------------------------------------------
     STATE FOR UI
  ------------------------------------------------------- */
    const [students, setStudents] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [feeHeads, setFeeHeads] = useState<any[]>([]);
    const [summary, setSummary] = useState<any | null>(null);

    const selectedStudent = watch('amst_Id');
    const selectedTerm = watch('asmcl_Id');

    /* -------------------------------------------------------
     LOAD STUDENTS ON FILTER CHANGE
  ------------------------------------------------------- */
    useEffect(() => {
        (async () => {
            const s = await fetchStudents(filterType);
            setStudents(s);
        })();
    }, [filterType]);

    /* -------------------------------------------------------
     LOAD TERMS WHEN STUDENT SELECTED
  ------------------------------------------------------- */
    useEffect(() => {
        if (!selectedStudent) return;

        (async () => {
            const t = await fetchTerms(selectedStudent);
            setTerms(t);

            // Reset term + fee data
            setValue('asmcl_Id', undefined);
            setFeeHeads([]);
            setSummary(null);
        })();
    }, [selectedStudent]);

    /* -------------------------------------------------------
     LOAD FEE DETAILS WHEN TERM SELECTED
  ------------------------------------------------------- */
    useEffect(() => {
        if (!selectedTerm || !selectedStudent) return;

        (async () => {
            const data = await fetchFeeDetails(selectedStudent, selectedTerm);
            setFeeHeads(data.heads);
            setSummary(data.summary);
        })();
    }, [selectedTerm]);

    /* -------------------------------------------------------
     SUBMIT HANDLER
  ------------------------------------------------------- */
    const onSubmit = async () => {
        toast.success('Fee Transaction Saved Successfully!');
    };

    /* -------------------------------------------------------
     RESET HANDLER
  ------------------------------------------------------- */
    const handleReset = () => {
        reset();
        setStudents([]);
        setTerms([]);
        setFeeHeads([]);
        setSummary(null);
    };

    /* -------------------------------------------------------
     UI START
  ------------------------------------------------------- */
    return (
        <div className='mx-auto max-w-6xl space-y-6 p-4'>
            {/* -------- FILTER OPTIONS -------- */}
            <Card className='p-4'>
                <RadioGroup value={filterType} onValueChange={setFilterType}>
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5'>
                        {[
                            { value: 'regular', label: 'Regular' },
                            { value: 'regno', label: 'Reg No' },
                            { value: 'admno', label: 'Adm No' },
                            { value: 'nameadmno', label: 'Name:Adm.No.' },
                            { value: 'father', label: 'Father Name' },
                            { value: 'mother', label: 'Mother Name' },
                            { value: 'mobile', label: 'Mobile No' }
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

            {/* -------- STUDENT DROPDOWN -------- */}
            <Card className='space-y-4 p-4'>
                <div>
                    <Label>Student *</Label>
                    <Controller
                        name='amst_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Student' />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.amst_Id} value={s.amst_Id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* TERM DROPDOWN */}
                {selectedStudent ? (
                    <div>
                        <Label>Term *</Label>
                        <Controller
                            name='asmcl_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Term' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terms.map((t) => (
                                            <SelectItem value={t.id.toString()} key={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                ) : null}
            </Card>

            {/* -------- FEE GRID -------- */}
            {feeHeads.length > 0 && (
                <Card className='p-4'>
                    <h2 className='mb-3 font-semibold text-lg'>Fee Details</h2>

                    <table className='w-full border text-sm'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='border p-2'>Fee Head</th>
                                <th className='border p-2'>Installment</th>
                                <th className='border p-2'>Current Charges</th>
                                <th className='border p-2'>Adjusted</th>
                            </tr>
                        </thead>

                        <tbody>
                            {feeHeads.map((f) => (
                                <tr key={f.fmH_Id}>
                                    <td className='border p-2'>{f.headName}</td>
                                    <td className='border p-2'>{f.installment}</td>
                                    <td className='border p-2'>{f.currentCharges}</td>
                                    <td className='border p-2'>{f.totalAdjusted}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* -------- SUMMARY -------- */}
            {summary && (
                <Card className='grid grid-cols-1 gap-4 p-4 text-sm md:grid-cols-3'>
                    <div>
                        Current Fee: <b>{summary.currentFee}</b>
                    </div>
                    <div>
                        Concession: <b>{summary.concession}</b>
                    </div>
                    <div>
                        Outstanding: <b>{summary.outstanding}</b>
                    </div>
                    <div>
                        Fine: <b>{summary.fine}</b>
                    </div>
                </Card>
            )}

            {/* -------- ACTION BUTTONS -------- */}
            <div className='flex justify-end gap-3 border-t pt-4'>
                <Button type='button' variant='outline' className='flex items-center gap-2' onClick={handleReset}>
                    <RotateCcw className='h-4 w-4' /> Reset
                </Button>

                <Button type='submit' disabled={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' /> Save
                </Button>
            </div>
        </div>
    );
}

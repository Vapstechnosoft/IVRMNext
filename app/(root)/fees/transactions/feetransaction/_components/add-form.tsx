'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
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

async function fetchBank() {
    return {
        bank: [
            {
                fmB_Id: 1,
                bank: 'Cash'
            },
            { fmB_Id: 2, bank: 'Bank' },
            {
                fmB_Id: 3,
                bank: 'RTGS/NEFT'
            },
            { fmB_Id: 4, bank: 'Swipe/Card' },
            { fmB_Id: 5, bank: 'UPI' }
        ]
    };
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
    const [bankDetails, setBankDetails] = useState<any[]>([]);
    const [chequeNo, setChequeNo] = useState('0');
    const [amount, setAmount] = useState('0');
    const [payType, setPayType] = useState<string>('Bank');
    const [modeType, setModeType] = useState<string>('Single');
    const [checkPayType, setCheckPayType] = useState<string[]>([]);
    const [dates, setDates] = useState<Record<number, Date | null>>({});
    const [selectedBanks, setSelectedBanks] = useState<Record<number, string>>({});

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

    useEffect(() => {
        if (!selectedTerm || !selectedStudent) return;

        (async () => {
            const data = await fetchBank();
            setBankDetails(data.bank);
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
        <div>
            {/* -------- FILTER OPTIONS -------- */}
            <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-6xl space-y-6 p-4'>
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
                                        <SelectValue placeholder='Search or Select Student' />
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
                        <div>
                            Now Paying: <b>{summary.fine}</b>
                        </div>
                    </Card>
                )}

                {summary && (
                    <Card className='grid grid-cols-1 gap-4 p-4 text-sm md:grid-cols-3'>
                        <div>
                            Total Payable: <b>{summary.currentFee}</b>
                        </div>
                        <div>
                            Total Concession: <b>{summary.concession}</b>
                        </div>
                        <div>
                            Total Waived off: <b>{summary.outstanding}</b>
                        </div>
                        <div>
                            Overall Outstanding: <b>{summary.fine}</b>
                        </div>
                    </Card>
                )}
                {summary && (
                    <Card className='p-4'>
                        <div className='flex items-center gap-6'>
                            {' '}
                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='radio'
                                    value='Single'
                                    className='form-radio h-4 w-4 text-blue-600'
                                    checked={modeType === 'Single'}
                                    onChange={(e) => {
                                        setModeType(e.target.value);
                                        setDates({});
                                    }}
                                />
                                <span className='text-gray-900 text-sm'>Single</span>
                            </label>
                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='radio'
                                    value='Multiple'
                                    className='form-radio h-4 w-4 text-gray-600'
                                    checked={modeType === 'Multiple'}
                                    onChange={(e) => {
                                        setModeType(e.target.value);
                                        setDates({});
                                    }}
                                />
                                <span className='text-gray-900 text-sm'>Multiple</span>
                            </label>
                        </div>
                    </Card>
                )}
                {summary && (
                    <Card className='p-4'>
                        <table className='w-full border text-sm'>
                            <thead className='bg-gray-100'>
                                <tr>
                                    <th className='border p-2'> </th>
                                    <th className='border p-2'>Type</th>
                                    <th className='border p-2'>Cheque/DD Date</th>
                                    <th className='border p-2'>Cheque/DD No./Card No</th>
                                    <th className='border p-2'>Bank Name</th>
                                    <th className='border p-2'>Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bankDetails?.map((f) => (
                                    <tr key={f.fmB_Id}>
                                        <td className='border p-2'>
                                            {modeType === 'Single' && (
                                                <input
                                                    type='radio'
                                                    value={f.bank}
                                                    className='form-radio h-4 w-4 text-gray-600'
                                                    checked={payType === f.bank}
                                                    onChange={(e) => setPayType(e.target.value)}
                                                />
                                            )}
                                            {modeType === 'Multiple' && (
                                                <Checkbox
                                                    checked={checkPayType.includes(f.bank)}
                                                    onCheckedChange={(value) => {
                                                        if (value) {
                                                            setCheckPayType((prev) => [...prev, f.bank]);
                                                        } else {
                                                            setCheckPayType((prev) => prev.filter((b) => b !== f.bank));
                                                        }
                                                    }}
                                                    aria-label='Select row'
                                                />
                                            )}
                                        </td>
                                        <td className='border p-2'>{f.bank}</td>
                                        <td className='border p-2'>
                                            {payType !== 'Cash' && modeType === 'Single' && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            className='w-full justify-start text-left font-normal'
                                                            disabled={payType !== f.bank && modeType === 'Single'}>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {dates[f.fmB_Id] ? format(dates[f.fmB_Id]!, 'PPP') : 'Select Date'}
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={dates[f.fmB_Id] ?? undefined}
                                                            onSelect={(date) =>
                                                                setDates((prev) => ({
                                                                    ...prev,
                                                                    [f.fmB_Id]: date ?? null
                                                                }))
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                            {checkPayType.includes(f.bank) && modeType === 'Multiple' && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {dates[f.fmB_Id] ? format(dates[f.fmB_Id]!, 'PPP') : 'Select Date'}
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={dates[f.fmB_Id] ?? undefined}
                                                            onSelect={(date) =>
                                                                setDates((prev) => ({
                                                                    ...prev,
                                                                    [f.fmB_Id]: date ?? null
                                                                }))
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </td>
                                        <td className='border p-2'>
                                            {payType !== 'Cash' && modeType === 'Single' && (
                                                <input
                                                    type='number'
                                                    value={chequeNo}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setChequeNo('');
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setChequeNo(v);
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 text-sm'
                                                    disabled={payType !== f.bank}
                                                />
                                            )}
                                            {checkPayType.includes(f.bank) && modeType === 'Multiple' && (
                                                <input
                                                    type='number'
                                                    value={chequeNo}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setChequeNo('');
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setChequeNo(v);
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 text-sm'
                                                    // disabled={payType !== f.bank}
                                                />
                                            )}
                                        </td>

                                        <td className='border p-2'>
                                            <Select
                                                value={selectedBanks[f.fmB_Id] || ''} // get value for this row
                                                onValueChange={(val) =>
                                                    setSelectedBanks((prev) => ({
                                                        ...prev,
                                                        [f.fmB_Id]: val // update only this row
                                                    }))
                                                }>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Bank' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='sbi'>State Bank Of India</SelectItem>
                                                    <SelectItem value='canara'>Canara Bank</SelectItem>
                                                    <SelectItem value='ka'>Karnataka Bank</SelectItem>
                                                    <SelectItem value='hdfc'>HDFC</SelectItem>
                                                    <SelectItem value='unionBank'>Union Bank</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className='border p-2'>
                                            <input
                                                type='number'
                                                value={amount}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (v === '') {
                                                        setAmount('');
                                                        return;
                                                    }
                                                    if (/^\d*\.?\d*$/.test(v)) {
                                                        setAmount(v);
                                                    }
                                                }}
                                                //  onBlur={handleBlur}
                                                className='w-full rounded border px-2 py-1 text-sm'
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
            </form>
        </div>
    );
}

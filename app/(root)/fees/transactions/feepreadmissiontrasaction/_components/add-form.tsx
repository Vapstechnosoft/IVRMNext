import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { feePreadmissionTransactionSchema } from '@/schemas/fees/trasactions';
import {
    addOrUpdatepaymentgatewaydetails,
    getPreadmissionStudentDropdownData,
    getPreadmissionStudentInformation,
    getPreadmissionStudentTermsData,
    getPreadmissionStudentTrasactionData
} from '@/server/fees/trasactions/feepreadmissiontrasaction';
import type {
    IFeePreAdmissionStudentInformation,
    IFeePreAdmissionStudentTermsDetails,
    IFeePreAdmissionStudentsDropDownList,
    IFeePreAdmissionTransactionDetails
} from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// 🔹 Form type from Zod schema
type FormFields = z.infer<typeof feePreadmissionTransactionSchema.addOrUpdate>;

interface AddFeePreAdmissionTransactionProps {
    onSuccess?: () => void;
    headname?: string;
}
//, headname = ''
export default function AddFeePreAdmissionTransactionForm({ onSuccess }: AddFeePreAdmissionTransactionProps) {
    const { data: academicYeardata, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const [date, setDate] = useState('2025-11-06');
    const [admissionType, setAdmissionType] = useState<'prospectus' | 'Preadmission'>('Preadmission');
    //const [academicYear, setAcademicYear] = useState('');
    const [termName, setTermName] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<IFeePreAdmissionStudentsDropDownList | null>(null);

    const [studentInfo, setStudentInfo] = useState<IFeePreAdmissionStudentInformation | null>(null);

    //   const [selectedStudentTerms, setSelectedStudentTerms] =
    // useState<IFeePreAdmissionStudentTermsDetails[]>([]);

    const [selectedStudentTerms, setSelectedStudentTerms] = useState<SelectableStudentTerm[]>([]);

    const [loadingStudentTerms, setLoadingStudentTerms] = useState(false);

    const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);

    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [transactionData, setTransactionData] = useState<IFeePreAdmissionTransactionDetails[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feePreadmissionTransactionSchema.addOrUpdate),
        mode: 'onChange'
    });

    const [students, setStudents] = useState<IFeePreAdmissionStudentsDropDownList[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (!studentSearch.trim()) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const studentsArray = await getPreadmissionStudentDropdownData(studentSearch, admissionType);
                setStudents(studentsArray);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [studentSearch, admissionType]);

    useEffect(() => {
        setSelectedStudent(null);
        setStudents([]);
        setStudentInfo(null);
        setSelectedStudentTerms([]);
    }, [admissionType]);

    useEffect(() => {
        if (!selectedStudent) {
            setSelectedStudentTerms([]);
            return;
        }

        const fetchStudentTerms = async () => {
            setLoadingStudentTerms(true);
            try {
                const information = await getPreadmissionStudentTermsData(Number(selectedStudent.amsT_Id));

                //setSelectedStudentTerms(information);

                // Ensure every term has a `selected` field (default false)
                const mappedTerms = information.map((term: IFeePreAdmissionStudentTermsDetails) => ({
                    ...term,
                    selected: false
                }));

                setSelectedStudentTerms(mappedTerms);
            } catch (error) {
                console.error('Failed to fetch student terms:', error);

                setSelectedStudentTerms([]);
            } finally {
                setLoadingStudentTerms(false);
            }
        };

        fetchStudentTerms();
    }, [selectedStudent]);

    useEffect(() => {
        if (!selectedStudent) {
            setStudentInfo(null);
            return;
        }

        const fetchStudentInfo = async () => {
            setLoadingStudentInfo(true);
            try {
                const information = await getPreadmissionStudentInformation(Number(selectedStudent.amsT_Id), admissionType);
                console.log('Fetched student info:', information);
                // info is already an object
                const info = JSON.parse(JSON.stringify(information));
                setStudentInfo(info);
            } catch (error) {
                console.error('Failed to fetch student info:', error);

                setStudentInfo(null);
            } finally {
                setLoadingStudentInfo(false);
            }
        };

        fetchStudentInfo();
    }, [selectedStudent, admissionType]);

    // 🔹 Fetch transaction grid data when student is selected
    // useEffect(() => {

    // const selectedTermIds = selectedStudentTerms.filter(t => t.selected).map(t => t.fmT_Id);

    //   if (!selectedStudent || selectedTermIds.length === 0) {
    //     setTransactionData([]);
    //     return;
    //   }
    //   const fetchTransactions = async () => {
    //     setLoadingTransactions(true);
    //     try {
    //       const res = await getPreadmissionStudentTrasactionData(
    //         Number(selectedStudent.amsT_Id),Number(selectedAcademicYear)
    //       );

    //       console.log("Fetched transactions:", res);
    //       setTransactionData(res);
    //     } catch (err) {
    //       console.error("Failed to fetch transactions", err);
    //       setTransactionData([]);
    //     } finally {
    //       setLoadingTransactions(false);
    //     }
    //   };
    //   fetchTransactions();
    // }, [selectedStudent]);

    useEffect(() => {
        const selectedTermIds = selectedStudentTerms.filter((t) => t.selected).map((t) => t.fmT_Id);

        if (!selectedStudent || selectedTermIds.length === 0) {
            setTransactionData([]);
            return;
        }

        const fetchTransactions = async () => {
            setLoadingTransactions(true);
            try {
                const res = await getPreadmissionStudentTrasactionData(
                    Number(selectedStudent.amsT_Id),
                    Number(selectedAcademicYear)
                    //,selectedTermIds // ✅ pass term IDs
                );
                setTransactionData(res);
            } catch (err) {
                console.error('Failed to fetch transactions', err);
                setTransactionData([]);
            } finally {
                setLoadingTransactions(false);
            }
        };

        fetchTransactions();
    }, [selectedStudentTerms, selectedStudent, selectedAcademicYear]);

    type SelectableStudentTerm = IFeePreAdmissionStudentTermsDetails & {
        selected?: boolean;
    };

    const selectedTermIds = selectedStudentTerms.filter((t) => t.selected).map((t) => t.fmT_Id);

    const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

    const handleStudentSelect = (id: number) => {
        const student = students.find((s) => s.amsT_Id === id) ?? null;
        setSelectedStudent(student);
        setStudentSearch(student ? student.studentName : '');
    };

    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // Toggle a single row
    const handleRowSelect = (index: number) => {
        setSelectedRows((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    // Select/Deselect all
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(transactionData.map((_, idx) => idx));
        } else {
            setSelectedRows([]);
        }
    };

    // Editable Payable Amount
    //   const handlePayableChange = (index: number, value: string) => {
    //     transactionData[index].payableAmount = Number(value);
    //   };

    const handlePayableChange = (index: number, value: number) => {
        setTransactionData((prev) => prev.map((item, i) => (i === index ? { ...item, payableAmount: value } : item)));
    };

    const allSelected = selectedRows.length === transactionData.length && transactionData.length > 0;

    interface PaymentData {
        narration: string;
        chequeDate: string;
        chequeNo: string;
        bankName: string;
        totalFee: number;
        concession: number;
        fine: number;
        nowPaying: number;
        currentBalance: number;
    }

    const [paymentMode, setPaymentMode] = useState<string>('Cash');
    const [paymentData, setPaymentData] = useState<PaymentData>({
        narration: '',
        chequeDate: new Date().toISOString().split('T')[0],
        chequeNo: '',
        bankName: '',
        totalFee: 70270,
        concession: 0,
        fine: 0,
        nowPaying: 2027,
        currentBalance: 70270
    });

    // ✅ Fully typed handleChange
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setPaymentData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // ---- 1. Validate selection -------------------------------------------------
            if (selectedRows.length === 0) {
                toast.error('Please select at least one transaction row');
                return;
            }

            // ---- 2. Selected rows ------------------------------------------------------
            const selectedTransactions = transactionData.filter((_, idx) => selectedRows.includes(idx));

            // ---- 3. Build headInstallments --------------------------------------------
            const headInstallments = selectedTransactions.map((row) => ({
                FMG_Id: row.fmG_Id ?? 0, // renamed to match the JSON
                FMH_Id: row.fmH_Id ?? 0,
                FMA_Id: row.fmA_Id ?? 0,
                ToBePaid: row.toBePaid ?? 0,
                ConcessionAmount: row.concessionAmount ?? 0,
                FineAmount: row.fineAmount ?? 0
            }));

            // ---- 4. Totals -------------------------------------------------------------
            const totalAmount = selectedTransactions.reduce((sum, r) => sum + (r.toBePaid ?? 0), 0);
            const totalConcession = selectedTransactions.reduce((sum, r) => sum + (r.concessionAmount ?? 0), 0);
            const totalFine = selectedTransactions.reduce((sum, r) => sum + (r.fineAmount ?? 0), 0);

            // ---- 5. Payload ------------------------------------------------------------
            const payload = {
                asmaY_Id: data.asmaY_Id ?? selectedAcademicYear ?? 0,
                auto_receipt_flag: 1,
                automanualreceiptno: '',
                filterInitialData: admissionType,
                fyP_Bank_Name: paymentMode !== 'Cash' ? paymentData.bankName : '',
                fyP_Bank_Or_Cash: paymentMode,
                fyP_DD_Cheque_Date: paymentMode !== 'Cash' ? new Date(paymentData.chequeDate).toISOString() : new Date(date).toISOString(),
                fyP_DD_Cheque_No: paymentMode !== 'Cash' ? paymentData.chequeNo : '',
                fyP_Date: new Date(date).toISOString(),
                fyP_Remarks: paymentData.narration,
                fyP_Tot_Amount: totalAmount,
                fyP_Tot_Concession_Amt: totalConcession,
                fyP_Tot_Fine_Amt: totalFine,
                fyP_Tot_Waived_Amt: 0,
                grp_count: selectedTransactions.length,
                head_installments: headInstallments, // camelCase + underscore
                mI_Id: 30,
                pasR_Id: selectedStudent?.amsT_Id ?? 0,
                userId: 0
            };
            // -----------------------------------------------------------------------
            // (rest of the function – loading toast, API call, success/error handling)
            const loadingToast = toast.loading('Saving transaction...');
            const response = await addOrUpdatepaymentgatewaydetails(payload);
            toast.dismiss(loadingToast);
            toast.success('Transaction saved successfully!');

            console.log('API response:', response);
            onSuccess?.();
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? error?.message ?? 'Failed to save transaction';
            toast.error(msg);
            console.error('Submit error:', error);
        }
    };
    const handleReset = () => {
        reset();
    };

    return (
        <div className='mx-auto max-w-7xl p-2'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='flex gap-8'>
                    {/* First Column: Date + Radio */}
                    <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-3 shadow-inner' style={{ width: '30%' }}>
                        <label htmlFor='dateInput' className='mr-4 whitespace-nowrap font-semibold'>
                            Date:
                        </label>
                        <input
                            id='dateInput'
                            type='date'
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className='rounded border px-1 py-1'
                        />

                        <fieldset className='mt-4 flex space-x-6'>
                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='radio'
                                    name='admissionType'
                                    value='Prospectus'
                                    checked={admissionType === 'prospectus'}
                                    onChange={() => setAdmissionType('prospectus')}
                                    className='cursor-pointer'
                                />
                                <span>Prospectus</span>
                            </label>
                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='radio'
                                    name='admissionType'
                                    value='Preadmission'
                                    checked={admissionType === 'Preadmission'}
                                    onChange={() => setAdmissionType('Preadmission')}
                                    className='cursor-pointer'
                                />
                                <span>Preadmission</span>
                            </label>
                        </fieldset>
                    </div>

                    {/* Second Column: Academic Year, Student Search, Term Checkbox */}
                    <div className='max-h-[600px] overflow-auto rounded border bg-gray-50 p-6 shadow-inner' style={{ width: '40%' }}>
                        <div className='mb-4 flex items-center space-x-4'>
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                            <label className='whitespace-nowrap font-semibold'>
                                Academic Year:<span className='ml-1 text-red-600'>*</span>
                            </label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(val) => {
                                            const id = Number(val);
                                            field.onChange(id);
                                            setSelectedAcademicYear(id);
                                        }}
                                        value={field.value?.toString() || ''}
                                        // value={field.value ? String(field.value) || ''}
                                        disabled={academicYearLoading}
                                    >
                                        <SelectTrigger className='min-w-[100px] text-center'>
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
                                                academicYeardata?.data?.map((item: any, index: number) => (
                                                    <SelectItem key={`${item.asmaY_Id}-${index}`} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        <div className='mb-4'>
                            <div className='flex items-center space-x-4'>
                                {/* Label */}

                                <label htmlFor='studentSearchInput' className='whitespace-nowrap font-semibold'>
                                    Student Name:<span className='ml-1 text-red-600'>*</span>
                                </label>

                                {/* Input */}
                                <div className='relative'>
                                    <input
                                        id='studentSearchInput'
                                        type='text'
                                        placeholder='Search student...'
                                        value={studentSearch}
                                        onChange={(e) => {
                                            setStudentSearch(e.target.value);
                                            setSelectedStudent(null);
                                        }}
                                        className='w-72 rounded border px-3 py-2'
                                        autoComplete='off'
                                    />

                                    {/* Dropdown */}
                                    {studentSearch.trim() !== '' && !selectedStudent && (
                                        <ul className='absolute top-full left-0 z-10 mt-1 max-h-40 w-72 overflow-y-auto rounded border bg-white shadow-md'>
                                            {loadingStudents ? (
                                                <li className='px-3 py-2 text-gray-500'>Loading...</li>
                                            ) : students.length === 0 ? (
                                                <li className='px-3 py-2 text-gray-500'>No students found</li>
                                            ) : (
                                                students.map((student) => (
                                                    <li
                                                        key={student.amsT_Id}
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setStudentSearch(student.studentName);
                                                        }}
                                                        className='cursor-pointer px-3 py-2 hover:bg-blue-100'>
                                                        {student.studentName}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}

                                    {/* <input
                    type="text"
                    placeholder="Select or search student in the list..."
                    value={studentSearch}
                    onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setSelectedStudent(null);
                    }}
                    className="w-72 rounded border px-3 py-2"
                    autoComplete="off"
                    />

                
                    {studentSearch.trim() !== "" &&
                    filteredStudents.length > 0 &&
                    !selectedStudent && (
                        <ul className="absolute top-full left-0 z-10 mt-1 max-h-40 w-72 overflow-y-auto rounded border bg-white shadow-md">
                        {filteredStudents.map((student) => (
                            <li
                            key={student.id}
                            onClick={() => handleStudentSelect(student.id)}
                            className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                            >
                            {student.name}
                            </li>
                        ))}
                        </ul>
                    )} */}
                                </div>
                            </div>
                        </div>

                        {/* <div className="mt-14 flex items-center space-x-2">
            <input
              type="checkbox"
              id="termName"
              checked={termName}
              onChange={(e) => setTermName(e.target.checked)}
              className="cursor-pointer"
            />
            <label htmlFor="termName" className="cursor-pointer font-semibold">
              Term Name
            </label>
          </div> */}
                        {/* Term Name Checkbox + Term List */}
                        <div className='mt-14'>
                            <div className='mt-10 flex items-start space-x-4'>
                                {/* Label + Main Checkbox */}
                                <div className='flex items-center space-x-2'>
                                    <label htmlFor='termName' className='whitespace-nowrap font-semibold'>
                                        Term Name:
                                    </label>
                                    <input
                                        type='checkbox'
                                        id='termName'
                                        checked={termName}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setTermName(checked);

                                            // ✅ Select or unselect all terms based on main checkbox
                                            setSelectedStudentTerms((prev) => prev.map((t) => ({ ...t, selected: checked })));
                                        }}
                                        className='cursor-pointer'
                                    />
                                </div>

                                {/* ✅ Dropdown Box (aligned beside) */}
                                <div className='max-h-40 w-72 overflow-y-auto rounded-md border border-blue-300 bg-white p-2 shadow-sm'>
                                    {loadingStudentTerms ? (
                                        <p className='text-gray-500 italic'>Loading terms...</p>
                                    ) : selectedStudentTerms.length === 0 ? (
                                        <p className='text-gray-500 italic'>No terms available</p>
                                    ) : (
                                        selectedStudentTerms.map((term, index) => (
                                            <div key={term.fmT_Id || index} className='flex items-center space-x-2'>
                                                <input
                                                    type='checkbox'
                                                    id={`term-${term.fmT_Id}`}
                                                    checked={term.selected || false}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const updated = selectedStudentTerms.map((t) =>
                                                            t.fmT_Id === term.fmT_Id ? { ...t, selected: checked } : t
                                                        );

                                                        setSelectedStudentTerms(updated);

                                                        // ✅ Update main checkbox state based on individual selections
                                                        const allChecked = updated.every((t) => t.selected);
                                                        setTermName(allChecked);
                                                    }}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor={`term-${term.fmT_Id}`} className='cursor-pointer'>
                                                    {term.fmT_Name}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Column: Student Info Panel */}
                    <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-4 shadow-inner' style={{ width: '30%' }}>
                        <h3 className='mb-3 font-bold text-lg'>Student Information</h3>

                        {loadingStudentInfo ? (
                            <p className='text-gray-500 italic'>Loading student info...</p>
                        ) : (
                            <table className='w-full text-left text-sm'>
                                <tbody>
                                    <tr>
                                        <td className='w-32 font-semibold'>Name</td>
                                        <td>: {studentInfo?.studentName || ''}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Reg No</td>
                                        <td>: {studentInfo?.regNo || ''}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Class</td>
                                        <td>: {studentInfo?.className || ''}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Mobile</td>
                                        <td>: {studentInfo?.mobileNo || ''}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Email</td>
                                        <td>: {studentInfo?.emailId || ''}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Father</td>
                                        <td>: {studentInfo?.fatherName || ''}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                {/* 🌀 Show loader while fetching */}
                {loadingTransactions && (
                    <div className='mt-6 rounded border bg-gray-50 p-4 text-center text-gray-600 italic shadow-inner'>
                        Loading transaction data...
                    </div>
                )}

                {/* ⚠️ Show message when no data is found */}
                {!loadingTransactions && selectedStudent && Array.isArray(transactionData) && transactionData.length === 0 && (
                    <div className='mt-6 rounded border bg-gray-50 p-4 text-center text-gray-600 italic shadow-inner'>
                        No transaction data available for this student.
                    </div>
                )}

                {/* ✅ Show grid only when data exists */}
                {!loadingTransactions && Array.isArray(transactionData) && transactionData.length > 0 && (
                    <div className='mt-6 rounded border bg-white p-4 shadow-md'>
                        <h3 className='mb-3 font-bold text-gray-700 text-lg'>Transaction Details</h3>

                        <div className='overflow-x-auto'>
                            <table className='min-w-full border-collapse border text-sm'>
                                <thead className='bg-gray-100'>
                                    <tr>
                                        <th className='w-12 border border-gray-400 px-2 py-2'>Sno</th>
                                        <th className='w-8 border border-gray-400 px-2 py-2'>
                                            <input type='checkbox' checked={allSelected} onChange={handleSelectAll} />
                                        </th>
                                        <th className='border px-4 py-2 text-left'>Fee Group</th>
                                        <th className='border px-4 py-2 text-left'>Fee Head</th>
                                        <th className='border px-4 py-2 text-right'>Installment</th>
                                        <th className='border px-4 py-2 text-right'>Current Charges</th>
                                        <th className='border px-4 py-2 text-right'>Total Charges</th>
                                        <th className='border px-4 py-2 text-right'>Concession</th>
                                        <th className='border px-4 py-2 text-right'>Fine</th>
                                        <th className='border px-4 py-2 text-right'>Payable Amount</th>
                                        <th className='border px-4 py-2 text-right'>Net Amount</th>
                                    </tr>
                                </thead>
                                {/* <tbody>
                  {transactionData.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="border px-4 py-2">
                        {row?.feeGroup ?? "--"}
                      </td>
                      <td className="border px-4 py-2">
                        {row?.feeHead ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.installment ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.currentCharges ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.totalCharges ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.concession ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.fine ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.payableAmount ?? "--"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row?.netAmount ?? "--"}
                      </td>
                    </tr>
                  ))}
                </tbody> */}

                                <tbody>
                                    {transactionData.map((row, index) => {
                                        const isSelected = selectedRows.includes(index);

                                        return (
                                            <tr key={index} className='transition-colors duration-150 hover:bg-blue-50'>
                                                {/* 🔹 Serial Number */}
                                                <td className='border border-gray-400 px-2 py-2 text-center'>{index + 1}</td>

                                                {/* 🔹 Row Checkbox */}
                                                <td className='border border-gray-400 px-2 py-2 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={isSelected}
                                                        onChange={() => handleRowSelect(index)}
                                                        className='cursor-pointer'
                                                    />
                                                </td>

                                                {/* 🔹 Fee Group */}
                                                <td className='select-none border border-gray-400 px-2 py-2'>{row?.fmG_GroupName ?? ''}</td>

                                                {/* 🔹 Fee Head */}
                                                <td className='select-none border border-gray-400 px-2 py-2'>{row?.fmH_FeeName ?? ''}</td>

                                                {/* 🔹 Installment */}
                                                <td className='select-none border border-gray-400 px-2 py-2'>{row?.ftI_Id ?? ''}</td>

                                                {/* 🔹 Current Charges */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='text'
                                                        readOnly
                                                        value={row?.currentYrCharges ?? ''}
                                                        className='w-full rounded border border-gray-300 bg-gray-50 text-center outline-none focus:outline-none'
                                                    />
                                                </td>

                                                {/* 🔹 Total Charges */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='text'
                                                        readOnly
                                                        value={row?.totalCharges ?? ''}
                                                        className='w-full rounded border border-gray-300 bg-gray-50 text-center outline-none focus:outline-none'
                                                    />
                                                </td>

                                                {/* 🔹 Concession */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='text'
                                                        readOnly
                                                        value={row?.concessionAmount ?? ''}
                                                        className='w-full rounded border border-gray-300 bg-gray-50 text-center outline-none focus:outline-none'
                                                    />
                                                </td>

                                                {/* 🔹 Fine */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='text'
                                                        readOnly
                                                        value={row?.fineAmount ?? ''}
                                                        className='w-full rounded border border-gray-300 bg-gray-50 text-center outline-none focus:outline-none'
                                                    />
                                                </td>

                                                {/* ✅ Payable Amount — Editable only if selected */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='number'
                                                        readOnly={!isSelected}
                                                        min={0}
                                                        step='0.01'
                                                        value={row?.toBePaid ?? ''}
                                                        onKeyDown={(e) => {
                                                            // ❌ Block unwanted keys
                                                            if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
                                                        }}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            // ✅ Allow empty (for clearing) or positive numbers
                                                            if (value === '' || Number(value) >= 0) {
                                                                if (isSelected) handlePayableChange(index, Number(value));
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            // ✅ Optional: round to 2 decimals on blur
                                                            if (isSelected && e.target.value !== '') {
                                                                handlePayableChange(
                                                                    index,
                                                                    Number.parseFloat(Number(e.target.value).toFixed(2))
                                                                );
                                                            }
                                                        }}
                                                        className={`w-full rounded text-center transition-all duration-150 ${
                                                            isSelected
                                                                ? 'border border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400'
                                                                : 'border border-gray-300 bg-gray-50 text-gray-700 outline-none focus:outline-none'
                                                        }`}
                                                    />
                                                </td>

                                                {/* 🔹 Net Amount */}
                                                <td className='border border-gray-400 px-2 py-2'>
                                                    <input
                                                        type='text'
                                                        readOnly
                                                        value={row?.netAmount ?? ''}
                                                        className='w-full rounded border border-gray-300 bg-gray-50 text-center outline-none focus:outline-none'
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {transactionData && transactionData.length > 0 && (
                    <div className='mt-6 grid grid-cols-2 gap-6 rounded-lg border border-gray-300 p-4 shadow-sm'>
                        {/* LEFT SIDE */}
                        <div>
                            <div className='mb-3'>
                                <label htmlFor='narrationInput' className='mr-2 font-semibold'>
                                    Narration :
                                </label>
                                <input
                                    id='narrationInput'
                                    type='text'
                                    name='narration'
                                    value={paymentData.narration}
                                    onChange={handleChange}
                                    className='w-2/3 rounded border border-gray-300 px-2 py-1'
                                    aria-label='Narration'
                                />
                            </div>

                            {/* Payment Mode */}
                            <div className='mb-3 flex gap-4'>
                                {['Cash', 'Bank', 'RTGS/NTF', 'Card No'].map((mode) => (
                                    <label key={mode} className='flex items-center space-x-1'>
                                        <input
                                            type='radio'
                                            name='paymentMode'
                                            checked={paymentMode === mode}
                                            onChange={() => setPaymentMode(mode)}
                                        />
                                        <span>{mode}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Conditional Fields */}
                            {paymentMode !== 'Cash' && (
                                <>
                                    <div className='mb-3 flex items-center gap-2'>
                                        <label htmlFor='chequeDateInput' className='w-32 font-semibold'>
                                            Cheque/DD Date :
                                        </label>
                                        <input
                                            id='chequeDateInput'
                                            type='date'
                                            name='chequeDate'
                                            value={paymentData.chequeDate}
                                            onChange={handleChange}
                                            className='rounded border border-gray-300 px-2 py-1'
                                        />
                                    </div>

                                    <div className='mb-3 flex items-center gap-2'>
                                        <label htmlFor='chequeNoInput' className='w-32 font-semibold'>
                                            Cheque/DD No/Card No :
                                        </label>
                                        <input
                                            id='chequeNoInput'
                                            type='text'
                                            name='chequeNo'
                                            value={paymentData.chequeNo}
                                            onChange={handleChange}
                                            className='w-2/3 rounded border border-gray-300 px-2 py-1'
                                        />
                                    </div>

                                    <div className='mb-3 flex items-center gap-2'>
                                        <label htmlFor='bankNameInput' className='w-32 font-semibold'>
                                            Bank Name :
                                        </label>
                                        <input
                                            id='bankNameInput'
                                            type='text'
                                            name='bankName'
                                            value={paymentData.bankName}
                                            onChange={handleChange}
                                            className='w-2/3 rounded border border-gray-300 px-2 py-1'
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT SIDE */}
                        <div>
                            {[
                                { label: 'Total Fee', name: 'totalFee' },
                                { label: 'Concession', name: 'concession' },
                                { label: 'Fine', name: 'fine' },
                                { label: 'Now Paying', name: 'nowPaying' },
                                { label: 'Current Balance', name: 'currentBalance' }
                            ].map((item) => (
                                <div key={item.name} className='mb-2 flex items-center gap-2'>
                                    <label htmlFor={`${item.name}Input`} className='w-32 font-semibold'>
                                        {item.label}:
                                    </label>
                                    <input
                                        id={`${item.name}Input`}
                                        type='text'
                                        name={item.name}
                                        value={paymentData[item.name as keyof PaymentData]}
                                        readOnly
                                        className='w-2/3 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-right'
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {transactionData && transactionData.length > 0 && (
                    <div className='flex gap-3 pt-4'>
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
                                Save Preadmission Transaction
                            </div>
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}

import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { amountEntrySchema, type feePreadmissionTransactionSchema } from '@/schemas/fees/trasactions';
import {
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
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

// 🔹 Form type from Zod schema
type FormFields = z.infer<typeof feePreadmissionTransactionSchema.addOrUpdate>;

interface AddFeePreAdmissionTransactionProps {
    onSuccess?: () => void;
    headname?: string;
}

export default function AddFeePreAdmissionTransactionForm({ onSuccess, headname = '' }: AddFeePreAdmissionTransactionProps) {
    const { data: academicYeardata, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const [date, setDate] = useState('2025-11-06');
    const [admissionType, setAdmissionType] = useState<'prospectus' | 'Preadmission'>('Preadmission');
    const [academicYear, setAcademicYear] = useState('');
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
        resolver: zodResolver(amountEntrySchema.addOrUpdate),
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

                console.log('Fetched students:', studentsArray);
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
                console.log('Fetched student terms:', information);

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
    useEffect(() => {
        if (!selectedStudent) {
            setTransactionData([]);
            return;
        }
        const fetchTransactions = async () => {
            setLoadingTransactions(true);
            try {
                const res = await getPreadmissionStudentTrasactionData(Number(selectedStudent.amsT_Id));

                console.log('Fetched transactions:', res);
                setTransactionData(res);
            } catch (err) {
                console.error('Failed to fetch transactions', err);
                setTransactionData([]);
            } finally {
                setLoadingTransactions(false);
            }
        };
        fetchTransactions();
    }, [selectedStudent]);

    type SelectableStudentTerm = IFeePreAdmissionStudentTermsDetails & {
        selected?: boolean;
    };

    const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

    const handleStudentSelect = (id: number) => {
        const student = students.find((s) => s.amsT_Id === id) ?? null;
        setSelectedStudent(student);
        setStudentSearch(student ? student.studentName : '');
    };

    return (
        <div className='mx-auto max-w-7xl p-2'>
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
                        {/* <select
                className="w-72 rounded border px-3 py-2"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                >
                <option value="">-- Select Academic Year --</option>
                {academicYears.map((year) => (
                    <option key={year} value={year}>
                    {year}
                    </option>
                ))}
                </select> */}
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
            {/* 🔹 Transaction Grid */}
            <div className='mt-6 rounded border bg-white p-4 shadow-md'>
                <div className='overflow-x-auto'>
                    <table className='min-w-full border-collapse border text-sm'>
                        <thead className='bg-gray-100'>
                            <tr>
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
                        <tbody>
                            {loadingTransactions ? (
                                <tr>
                                    <td colSpan={6} className='border px-4 py-3 text-center text-gray-500 italic'>
                                        Loading transaction data...
                                    </td>
                                </tr>
                            ) : transactionData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='border px-4 py-3 text-center text-gray-500 italic'>
                                        No transaction data available.
                                    </td>
                                </tr>
                            ) : (
                                transactionData.map((row, index) => (
                                    <tr key={index} className='hover:bg-blue-50'>
                                        <td className='border px-4 py-2'>{row.feeGroup}</td>
                                        <td className='border px-4 py-2'>{row.feeHead}</td>
                                        <td className='border px-4 py-2'>{row.installment}</td>
                                        <td className='border px-4 py-2'>{row.currentCharges}</td>
                                        <td className='border px-4 py-2'>{row.totalCharges}</td>
                                        <td className='border px-4 py-2'>{row.concession}</td>
                                        <td className='border px-4 py-2'>{row.fine}</td>
                                        <td className='border px-4 py-2'>{row.payableAmount}</td>
                                        <td className='border px-4 py-2'>{row.netAmount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

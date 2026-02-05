// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { excelImportNotDoneReportSchema } from '@/schemas/fees/reports';
import type { ExcelNotImportedStudentDetailsReport } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useEffect, useRef, useState } from 'react'; // Added useRef
import { Input } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { excelnotimportedstudentColumns, printTable } from './_components/columns';
import DeleteExcelNotImportedForm from './_components/deleteform';

type FormFields = z.infer<typeof excelImportNotDoneReportSchema.addOrUpdate>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

// Create a separate component for the form content that can use FormContext
function ExcelNotImportedReportContent() {
    const [filters, setFilters] = useState({
        fromDate: new Date(),
        toDate: new Date(),
        breakdown: 'ALL',
        academicYearId: ''
    });

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(excelImportNotDoneReportSchema.addOrUpdate),
        defaultValues: {
            academicYearId: '',
            fromDate: new Date(),
            toDate: new Date()
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [selectedAcademicYearLabel, setSelectedAcademicYearLabel] = useState<string>('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [reportData, setReportData] = useState<ExcelNotImportedStudentDetailsReport[]>([]);

    // Use ref to track deleted IDs persistently
    const deletedIdsRef = useRef<Set<number>>(new Set());

    // Original data - keep this constant for reference
    const initialStaticData: ExcelNotImportedStudentDetailsReport[] = [
        {
            academicyear: '2024-2025',
            admissionNo: 'ADM2024001',
            paiddate: '2024-03-15',
            remarks: 'Paid',
            amount: 25000,
            paymentmode: 'Cheque',
            id: 1
        },
        {
            academicyear: '2024-2025',
            admissionNo: 'ADM2024002',
            paiddate: '2024-03-16',
            remarks: 'Paid',
            amount: 30000,
            paymentmode: 'Cheque',
            id: 2
        },
        {
            academicyear: '2023-2024',
            admissionNo: 'ADM2024003',
            paiddate: '2024-03-17',
            remarks: 'Paid',
            amount: 28000,
            paymentmode: 'Cheque',
            id: 3
        },
        {
            academicyear: '2023-2024',
            admissionNo: 'ADM2024004',
            paiddate: '2024-03-18',
            remarks: 'Paid',
            amount: 32000,
            paymentmode: 'Cheque',
            id: 4
        },
        {
            academicyear: '2024-2025',
            admissionNo: 'ADM2024005',
            paiddate: '2024-03-19',
            remarks: 'Paid',
            amount: 27000,
            paymentmode: 'Cheque',
            id: 5
        }
    ];

    // Get form context for delete form
    const { isDeleteFormOpen, selectedRow, closeToggleForm } = useFormContext<ExcelNotImportedStudentDetailsReport>();

    const academicYearId = watch('academicYearId');

    // Update selected academic year label when academicYearId changes
    useEffect(() => {
        if (academicYearId && academicYears.length > 0) {
            const selectedYear = academicYears.find((year) => year.asmaY_Id.toString() === academicYearId);
            if (selectedYear) {
                setSelectedAcademicYearLabel(selectedYear.asmaY_Year);
            }
        } else {
            setSelectedAcademicYearLabel('');
        }
    }, [academicYearId, academicYears]);

    // Function to handle delete
    const handleDelete = (id: number) => {
        setIsDeleting(true);

        // Add the ID to the deleted IDs set
        deletedIdsRef.current.add(id);

        // Update report data by filtering out the deleted ID
        setReportData((prevData) => prevData.filter((item) => item.id !== id));

        toast.success('Record deleted successfully!');

        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
            setIsDeleting(false);
        }, 100);
    };

    const tableProps = {
        data: reportData,
        totalCount: reportData.length,
        pageSize: 10,
        currentPage: 1,
        totalPages: Math.ceil(reportData.length / 10)
    };

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            // formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const handleCancel = () => {
        setShowReport(false);
        setReportData([]);
        setIsGeneratingReport(false);
        // Clear deleted IDs when canceling
        deletedIdsRef.current.clear();
        toast.info('Report cancelled');
    };

    const handlePrint = () => {
        // Define columns for printing with Sl No
        const columns = [
            { key: 'slNo', label: 'Sl No' },
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'academicyear', label: 'Academic Year' },
            { key: 'paiddate', label: 'Paid Date' },
            { key: 'paymentmode', label: 'Payment Mode' },
            { key: 'amount', label: 'Amount' },
            { key: 'remarks', label: 'Remarks' }
        ];

        // Use all reportData rows and add serial numbers
        const rowsToPrint = reportData.map((row, index) => ({
            ...row,
            slNo: index + 1
        }));

        // Call printTable without totalRow
        printTable(columns, rowsToPrint);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        // Check if we're in the middle of a delete operation
        if (isDeleting) {
            return;
        }
        if (!isDeleting) {
            // Set loading state
            setIsGeneratingReport(true);
            setShowReport(false);

            const payload = {
                asmayId: data.academicYearId,
                fromDate: filters.fromDate.toISOString().split('T')[0],
                toDate: filters.toDate.toISOString().split('T')[0],
                flag: filters.breakdown
            };

            // Simulate 1-second loading delay
            setTimeout(() => {
                // Find the selected academic year
                const selectedYear = academicYears.find((year) => year.asmaY_Id.toString() === data.academicYearId);
                const selectedYearLabel = selectedYear ? selectedYear.asmaY_Year : '';

                // Filter out deleted IDs from initial static data
                const filteredData = initialStaticData.filter((item) => !deletedIdsRef.current.has(item.id));

                // Update data with selected academic year
                if (selectedYearLabel) {
                    const updatedData = filteredData.map((item) => ({
                        ...item,
                        academicyear: selectedYearLabel
                    }));
                    setReportData(updatedData);
                } else {
                    // If no academic year selected, show filtered data
                    setReportData(filteredData);
                }

                // Show the report
                setShowReport(true);
                setIsGeneratingReport(false);
                toast.success('Report generated successfully!');
            }, 1000);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                <div className='flex flex-col items-center justify-center gap-8'>
                                    {/* Academic Year */}
                                    <div className='flex min-w-[500px] items-center gap-3'>
                                        <Label>
                                            Academic Year :<span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='academicYearId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    key={field.value || 'empty'}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setFilters((prev) => ({ ...prev, academicYearId: value }));
                                                    }}
                                                    value={field.value?.toString() || undefined}
                                                    disabled={loadingAcademic || isGeneratingReport}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue
                                                            placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingAcademic ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : academicError ? (
                                                            <SelectItem value='error' disabled>
                                                                Failed to load years
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((item) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                    </div>
                                </div>

                                <div className='mt-4 flex items-center justify-center rounded border bg-gray-50 p-4 shadow-sm'>
                                    <div className='flex items-center gap-6'>
                                        <div className='flex items-center gap-2'>
                                            <Label htmlFor='fromDate' className='font-medium'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                id='fromDate'
                                                type='date'
                                                value={filters.fromDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        fromDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                                disabled={isGeneratingReport}
                                            />
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <Label htmlFor='toDate' className='font-medium'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                id='toDate'
                                                type='date'
                                                value={filters.toDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        toDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                                disabled={isGeneratingReport}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <div className='min-w-0 flex-1'>
                                            <Button
                                                size='lg'
                                                variant='outline'
                                                className='w-full px-8'
                                                onClick={() => handleCancel()}
                                                disabled={isGeneratingReport}>
                                                Cancel
                                            </Button>
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <Button type='submit' disabled={isSubmitting || isGeneratingReport} className='w-full px-12'>
                                                {isGeneratingReport ? 'Generating...' : 'Report'}
                                            </Button>
                                        </div>
                                        {showReport && !isGeneratingReport && (
                                            <div className='min-w-0 flex-1'>
                                                <Button
                                                    variant='outline'
                                                    className='w-full transition-all duration-200 hover:scale-105'
                                                    onClick={handlePrint}>
                                                    Print
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Loading state */}
                                {isGeneratingReport && (
                                    <div className='mt-8'>
                                        <CollapsibleSection defaultOpen={true}>
                                            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white'>
                                                <div className='text-center'>
                                                    <div className='mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent' />
                                                    <p className='mt-4 font-medium text-gray-700 text-lg'>Generating report...</p>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    </div>
                                )}

                                {showReport && !isGeneratingReport && (
                                    <>
                                        <CollapsibleSection defaultOpen={true}>
                                            <GenericDataTable<ExcelNotImportedStudentDetailsReport>
                                                {...tableProps}
                                                columns={excelnotimportedstudentColumns}
                                                isLoading={false}
                                                error={null}
                                                columnPinning={{ right: ['actions'] }}
                                                loadingMessage='Loading Excel Not Imported Student Data...'
                                                noDataTitle='No Excel Not Imported Student Data Found'
                                                noDataDescription=''
                                                errorTitle='Error Loading Excel Not Imported Student Data'
                                                isPaginationRequired={false}
                                            />
                                        </CollapsibleSection>

                                        {isDeleteFormOpen && selectedRow && (
                                            <DeleteExcelNotImportedForm
                                                rowData={selectedRow}
                                                onClose={closeToggleForm}
                                                onDelete={handleDelete}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}

export default function ExcelNotImportedReport() {
    return (
        <FormProvider<ExcelNotImportedStudentDetailsReport>>
            <ExcelNotImportedReportContent />
        </FormProvider>
    );
}

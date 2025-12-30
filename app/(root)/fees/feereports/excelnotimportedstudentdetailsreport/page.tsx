// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider'; // Added useFormContext
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { excelImportNotDoneReportSchema } from '@/schemas/fees/reports';
import type { ExcelNotImportedStudentDetailsReport } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useEffect, useState } from 'react';
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

    // Get form context for delete form
    const { isDeleteFormOpen, selectedRow, closeToggleForm } = useFormContext<ExcelNotImportedStudentDetailsReport>();

    // Static data for demonstration
    const staticData: ExcelNotImportedStudentDetailsReport[] = [
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

    const tableProps = {
        data: staticData,
        totalCount: staticData.length,
        pageSize: 10,
        currentPage: 1,
        totalPages: Math.ceil(staticData.length / 10)
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
            formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);
    const handleCancel = () => {
        setShowReport(false);

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

        // Use all staticData rows and add serial numbers
        const rowsToPrint = staticData.map((row, index) => ({
            ...row,
            slNo: index + 1
        }));

        // Call printTable without totalRow
        printTable(columns, rowsToPrint);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        const payload = {
            asmayId: data.academicYearId,
            fromDate: filters.fromDate.toISOString().split('T')[0],
            toDate: filters.toDate.toISOString().split('T')[0],
            flag: filters.breakdown
        };

        console.log('payload', payload);
        // For now, just show the static data
        setShowReport(true);
        toast.success('Report generated successfully!');
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
                                                    disabled={loadingAcademic}>
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
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <div className='min-w-0 flex-1'>
                                            <Button size='lg' variant='outline' className='w-full px-8' onClick={() => handleCancel()}>
                                                Cancel
                                            </Button>
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <Button type='submit' disabled={isSubmitting} className='w-full px-12'>
                                                {isSubmitting ? 'Generating...' : 'Report'}
                                            </Button>
                                        </div>
                                        {showReport && (
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
                                {showReport && (
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
                                            />
                                        </CollapsibleSection>

                                        {isDeleteFormOpen && selectedRow && (
                                            <DeleteExcelNotImportedForm rowData={selectedRow} onClose={closeToggleForm} />
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

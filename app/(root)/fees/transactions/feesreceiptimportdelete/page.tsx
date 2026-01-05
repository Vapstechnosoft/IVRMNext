'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeRefundableList, useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import type { IFeeReceiptImportDelate } from '@/types/fees/transactions/transactions';
import { X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { feereceiptimportdeleteColumns } from './_components/redeiptdetails';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeesReceiptImportDelete(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [isReportGenerated, setIsReportGenerated] = useState(false);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: response, isLoading, error } = useFeeRefundableList(Number(selectedAsmayId), searchParams);
    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();

    // Static data for demonstration
    const initialStaticData: IFeeReceiptImportDelate[] = [
        {
            studentname: 'John Doe',
            admissionnumber: 'ADM2024001',
            date: '2024-03-15',
            receiptno: 'RCPT20240315001',
            amount: 25000,
            fyP_Id: 1
        },
        {
            studentname: 'Jane Smith',
            admissionnumber: 'ADM2024002',
            date: '2024-03-16',
            receiptno: 'RCPT20240316001',
            amount: 30000,
            fyP_Id: 2
        },
        {
            studentname: 'Robert Johnson',
            admissionnumber: 'ADM2024003',
            date: '2024-03-17',
            receiptno: 'RCPT20240317001',
            amount: 28000,
            fyP_Id: 3
        },
        {
            studentname: 'Emily Davis',
            admissionnumber: 'ADM2024004',
            date: '2024-03-18',
            receiptno: 'RCPT20240318001',
            amount: 32000,
            fyP_Id: 4
        },
        {
            studentname: 'Michael Brown',
            admissionnumber: 'ADM2024005',
            date: '2024-03-19',
            receiptno: 'RCPT20240319001',
            amount: 27000,
            fyP_Id: 5
        }
    ];

    // Working data that can be modified
    const [staticData, setStaticData] = useState<IFeeReceiptImportDelate[]>(initialStaticData);

    useEffect(() => {
        if (!loadingYears && academicYearData?.data?.length && selectedAsmayId === null) {
            setSelectedAsmayId(Number(academicYearData.data[0].asmaY_Id));
        }
    }, [loadingYears, academicYearData, selectedAsmayId]);

    const handleReportClick = () => {
        // Validate academic year and date
        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }

        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }
        setTimeout(() => {
            setIsReportGenerated(true);

            toast.success('Report generated successfully!');
        }, 1000);
        // Add your report generation logic here
    };

    const handleResetClick = () => {
        setIsReportGenerated(false);
        setStaticData(initialStaticData);
        // toast.info("Report reset successfully");
    };

    const handleDeleteAll = () => {
        setIsDeleting(true);

        // Simulate delete operation with loading
        setTimeout(() => {
            setStaticData([]);
            setIsDeleting(false);
            toast.success('All data deleted successfully!');
            setIsReportGenerated(false);
        }, 1000);
    };

    return (
        <>
            <FormProvider<IFeeReceiptImportDelate>>
                <FeesReceiptImportDeletePageContent
                    response={staticData} // Pass working data
                    isLoading={isLoading}
                    error={error}
                    selectedAsmayId={selectedAsmayId}
                    setSelectedAsmayId={setSelectedAsmayId}
                    academicYearData={academicYearData}
                    loadingYears={loadingYears}
                    isReportGenerated={isReportGenerated}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    onReportClick={handleReportClick}
                    onResetClick={handleResetClick}
                    onDeleteAll={handleDeleteAll}
                    isDeleting={isDeleting}
                />
            </FormProvider>
        </>
    );
}

function FeesReceiptImportDeletePageContent({
    response,
    isLoading,
    error,
    academicYearData,
    loadingYears,
    selectedAsmayId,
    setSelectedAsmayId,
    isReportGenerated,
    selectedDate,
    setSelectedDate,
    onReportClick,
    onResetClick,
    onDeleteAll,
    isDeleting
}: {
    response: any;
    isLoading: boolean;
    error: any;
    academicYearData: any;
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    loadingYears: boolean;
    isReportGenerated: boolean;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    onReportClick: () => void;
    onResetClick: () => void;
    onDeleteAll: () => void;
    isDeleting: boolean;
}) {
    const { openAddForm } = useFormContext<IFeeReceiptImportDelate>();

    // Create proper table props for static data
    const tableProps = {
        data: response || [],
        totalCount: response?.length || 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: Math.ceil((response?.length || 0) / 10)
    };

    const handleReport = () => {
        onReportClick();
    };

    const handleReset = () => {
        onResetClick();
    };

    // Get selected academic year label
    const selectedAcademicYearLabel =
        selectedAsmayId && academicYearData?.data
            ? academicYearData.data.find((item: any) => item.asmaY_Id === selectedAsmayId)?.asmaY_Year
            : '';

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-1'>
                {/* Centered Academic Year and Date Section */}
                <div className='flex flex-col items-center justify-center gap-4 rounded-lg border bg-white p-6 shadow-sm'>
                    {/* Academic Year */}
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex items-center gap-2'>
                            <Label className='whitespace-nowrap font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                value={selectedAsmayId?.toString() || ''}
                                onValueChange={(v) => setSelectedAsmayId(v ? Number(v) : null)}
                                disabled={loadingYears}>
                                <SelectTrigger className='w-64'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearData?.data?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date - Below Academic Year */}
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex items-center gap-2'>
                            <Label htmlFor='fromDate' className='font-medium'>
                                Date: <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='fromDate'
                                type='date'
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className='w-48 rounded border px-3 py-2'
                            />
                        </div>
                    </div>

                    {/* Centered Buttons */}
                    <div className='mt-4 flex items-center gap-4'>
                        <Button
                            type='button'
                            onClick={handleReport}
                            disabled={isDeleting}
                            className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            Report
                        </Button>

                        <Button variant='outline' onClick={handleReset} type='button' disabled={isDeleting}>
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Conditional Table Display - Only show when report is generated */}
                {isReportGenerated && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        {/* Display Academic Year and Date Info */}
                        {/* <div className="mb-4 rounded-lg bg-blue-50 p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-700">Academic Year:</span>
                                    <span className="text-blue-900">{selectedAcademicYearLabel || 'Not selected'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-700">Date:</span>
                                    <span className="text-blue-900">{selectedDate || 'Not selected'}</span>
                                </div>
                            </div>
                        </div> */}

                        <GenericDataTable<IFeeReceiptImportDelate>
                            {...tableProps}
                            columns={feereceiptimportdeleteColumns}
                            isLoading={false} // Set to false since we're using static data
                            error={null}
                            columnPinning={{ right: [] }} // Remove actions since we don't have action column
                            loadingMessage='Loading Fees Receipt Import Delete Data...'
                            noDataTitle='No Fees Receipt Import Delete Data Found'
                            noDataDescription=''
                            errorTitle='Error Loading Fees Receipt Import Delete Data'
                        />

                        {/* Action Buttons */}
                        <div className='flex flex-col items-center justify-center'>
                            <div className='mt-4 flex items-center gap-4'>
                                <Button
                                    type='button'
                                    onClick={onDeleteAll}
                                    disabled={isDeleting || response.length === 0}
                                    className='bg-red-500 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:shadow-lg'>
                                    {isDeleting ? <div className='flex items-center gap-2'>Deleting...</div> : 'Delete All'}
                                </Button>

                                <Button variant='outline' onClick={handleReset} type='button' disabled={isDeleting}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                {/* Delete Loading State */}
                {isDeleting && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                        <div className='rounded-lg bg-white p-8 shadow-2xl'>
                            <div className='flex flex-col items-center gap-4'>
                                <p className='font-semibold text-gray-700 text-lg'>Deleting all data...</p>
                            </div>
                        </div>
                    </div>
                )}

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDeleteFormOpen,
        isDetailsViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IFeeReceiptImportDelate>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New third Party Transaction'
                        description='Add a new third party transaction entry here.'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            {/* <AddThirdPartyTransactionForm onSuccess={closeAddForm} /> */}
                            {/* <FeePaymentForm  /> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* {isDetailsViewOpen && selectedRow && <ReceiptPage rowData={selectedRow} onClose={closeDetailsView} />} */}
        </>
    );
}

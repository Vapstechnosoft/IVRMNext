'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { getFeeReceiptimportCommon } from '@/server/fees/reports/feereceiptimportdelete';
import type { IFeeReceiptImportDelate } from '@/types/fees/transactions/transactions';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { feereceiptimportdeleteColumns } from './_components/redeiptdetails';

export default function FeesReceiptImportDelete() {
    const [isReportGenerated, setIsReportGenerated] = useState(false);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);
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

    const [staticData, setStaticData] = useState<IFeeReceiptImportDelate[]>(initialStaticData);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

    useEffect(() => {
        if (!loadingYears && academicYearData?.data?.length && selectedAsmayId === null) {
            setSelectedAsmayId(Number(academicYearData.data[0].asmaY_Id));
        }
    }, [loadingYears, academicYearData, selectedAsmayId]);

    const handleReportClick = () => {
        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }

        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }

        const fetchReport = async () => {
            setIsReportLoading(true);
            try {
                const report = await getFeeReceiptimportCommon(Number(selectedAsmayId), selectedDate);
                setReportData(report?.data || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setReportData([]);
            } finally {
                setIsReportLoading(false);
            }
        };
        fetchReport();
        // setTimeout(() => {
        //     setIsReportGenerated(true);

        //     toast.success('Report generated successfully!');
        // }, 1000);
        // Add your report generation logic here
    };

    const handleResetClick = () => {
        setSelectedDate('');
        setReportData([]);
    };

    const handleDeleteAll = () => {
        setIsDeleting(true);
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
                    response={staticData}
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
                    isReportLoading={isReportLoading}
                    report={reportData}
                />
            </FormProvider>
        </>
    );
}

function FeesReceiptImportDeletePageContent({
    response,
    academicYearData,
    loadingYears,
    selectedAsmayId,
    setSelectedAsmayId,
    selectedDate,
    setSelectedDate,
    onReportClick,
    onResetClick,
    onDeleteAll,
    isDeleting,
    isReportLoading,
    report
}: {
    response: any;
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
    isReportLoading: boolean;
    report: any;
}) {
    const tableProps = {
        data: report || [],
        totalCount: report?.length || 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: Math.ceil((report?.length || 0) / 10)
    };

    const handleReport = () => {
        onReportClick();
    };

    const handleReset = () => {
        onResetClick();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-1'>
                <div className='flex flex-col items-center justify-center gap-4 rounded-lg border bg-white p-6 shadow-sm'>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex items-center gap-2'>
                            <Label className='whitespace-nowrap font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                value={selectedAsmayId?.toString() || ''}
                                onValueChange={(v) => setSelectedAsmayId(v ? Number(v) : null)}>
                                <SelectTrigger className='w-64'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingYears ? (
                                        <div className='flex items-center justify-center p-4'>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            <span>Loading...</span>
                                        </div>
                                    ) : (
                                        academicYearData?.data?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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

                    <div className='mt-4 flex items-center gap-4'>
                        <Button
                            type='button'
                            onClick={handleReport}
                            disabled={isReportLoading}
                            className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            Report
                        </Button>

                        <Button variant='outline' onClick={handleReset} type='button' disabled={isDeleting}>
                            Reset
                        </Button>
                    </div>
                </div>

                {report.length > 0 && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IFeeReceiptImportDelate>
                            {...tableProps}
                            columns={feereceiptimportdeleteColumns}
                            isLoading={isReportLoading}
                            error={null}
                            columnPinning={{ right: [] }}
                            loadingMessage='Loading Fees Receipt Import Delete Data...'
                            noDataTitle='No Fees Receipt Import Delete Data Found'
                            noDataDescription=''
                            errorTitle='Error Loading Fees Receipt Import Delete Data'
                        />
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
                {isDeleting && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                        <div className='rounded-lg bg-white p-8 shadow-2xl'>
                            <div className='flex flex-col items-center gap-4'>
                                <p className='font-semibold text-gray-700 text-lg'>Deleting all data...</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* <FormSections /> */}
            </div>
        </div>
    );
}

// function FormSections() {
//     const {
//         isAddFormOpen,
//         isEditFormOpen,
//         isToggleFormOpen,
//         isDeleteFormOpen,
//         isDetailsViewOpen,
//         selectedRow,
//         closeAddForm,
//         closeEditForm,
//         closeToggleForm,
//         closeDetailsView,
//         addFormRef,
//         editFormRef
//     } = useFormContext<IFeeReceiptImportDelate>();

//     return (
//         <>
//             {isAddFormOpen && (
//                 <div ref={addFormRef}>
//                     <CollapsibleSection
//                         title='Add New third Party Transaction'
//                         description='Add a new third party transaction entry here.'
//                         defaultOpen={true}
//                         variant='outline'
//                         size='md'
//                         className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
//                         <div className='relative'>
//                             <Button
//                                 type='button'
//                                 onClick={closeAddForm}
//                                 variant='ghost'
//                                 size='sm'
//                                 className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
//                                 <X className='h-4 w-4 text-destructive' /> Close
//                             </Button>
//                         </div>
//                     </CollapsibleSection>
//                 </div>
//             )}

//             {/* {isDetailsViewOpen && selectedRow && <ReceiptPage rowData={selectedRow} onClose={closeDetailsView} />} */}
//         </>
//     );
// }

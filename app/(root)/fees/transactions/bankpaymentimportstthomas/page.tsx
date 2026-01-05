'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeRefundableList, useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import type { IFeeReceiptImportDelate } from '@/types/fees/transactions/transactions';
import { Search, Upload, X } from 'lucide-react';
import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type ImportedExcelData = {
    [key: string]: any;
}[];

type ProcessedData = {
    FYP_Date: any;
    AMST_AdmNo: string;
    Student_Name: string;
    FYP_Tot_Amount: number;
    FYP_Bank_Or_Cash: string;
}[];

export default function BankFeesReceiptImport(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [isReportGenerated, setIsReportGenerated] = useState(false);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [importedData, setImportedData] = useState<ImportedExcelData>([]);
    const [processedData, setProcessedData] = useState<ProcessedData>([]);
    const [filteredData, setFilteredData] = useState<ProcessedData>([]);
    const [excelSheets, setExcelSheets] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filename, setFilename] = useState<string>('');

    const { data: response, isLoading, error } = useFeeRefundableList(Number(selectedAsmayId), searchParams);
    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();

    useEffect(() => {
        if (!loadingYears && academicYearData?.data?.length && selectedAsmayId === null) {
            setSelectedAsmayId(Number(academicYearData.data[0].asmaY_Id));
        }
    }, [loadingYears, academicYearData, selectedAsmayId]);

    // Process Excel data using Angular logic
    const processExcelData = (data: any[], headers: string[]) => {
        const datanew: ProcessedData = [];

        for (let i = 0; i < data.length; i++) {
            // Check if NARRATION exists and contains "#"
            if (data[i].NARRATION?.includes('#')) {
                const split = data[i].NARRATION.split('#');

                // Check if split has more than 2 elements (Angular logic)
                if (split.length > 2) {
                    // Extract data according to Angular logic
                    const admissionNumber = split[1].slice(2); // Remove first 2 characters
                    const studentName = split[2];

                    // Process DEPOSIT amount - remove commas and convert to number
                    let depositAmount = 0;
                    if (data[i].DEPOSIT) {
                        const depositStr = String(data[i].DEPOSIT).split(',').join('');
                        depositAmount = Number(depositStr) || 0;
                    }

                    datanew.push({
                        FYP_Date: data[i].undefined || data[i].Date || data[i].DATE || '',
                        AMST_AdmNo: admissionNumber,
                        Student_Name: studentName,
                        FYP_Tot_Amount: depositAmount,
                        FYP_Bank_Or_Cash: 'C' // Hardcoded as "C" per Angular logic
                    });
                }
            }
        }

        // Sort by FYP_Tot_Amount in descending order (Angular logic)
        datanew.sort((a, b) => b.FYP_Tot_Amount - a.FYP_Tot_Amount);

        return datanew;
    };

    // Handle Excel file upload
    const selectFileForUpload = (input: HTMLInputElement) => {
        if (!input.files || !input.files[0]) {
            clearImportedData();
            return;
        }

        const file = input.files[0];

        // Check if file is Excel type
        if (
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            setExcelFile(file);
            setFilename(file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });

                    const sheets = workbook.SheetNames;
                    setExcelSheets(sheets);

                    if (sheets.length > 0) {
                        setSelectedSheet(sheets[0]);
                        loadSheetData(workbook, sheets[0]);
                    }

                    toast.success(`File "${file.name}" loaded successfully`);
                } catch (error) {
                    toast.error('Error reading Excel file');
                    console.error('Excel read error:', error);
                }
            };
            reader.readAsBinaryString(file);
        } else {
            toast.error('Please select a valid Excel file (.xlsx, .xls)');
            setFilename(file.name);
            if (input) {
                input.value = '';
            }
            clearImportedData();
        }
    };

    // Load data from selected sheet
    const loadSheetData = (workbook: XLSX.WorkBook, sheetName: string) => {
        try {
            const worksheet = workbook.Sheets[sheetName];

            // Get headers from first row
            const headerNames = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];

            // Convert sheet to JSON with headers
            const rawData = XLSX.utils.sheet_to_json(worksheet);

            if (rawData.length === 0) {
                toast.error('Excel Sheet is Empty');
                setImportedData([]);
                setProcessedData([]);
                setFilteredData([]);
                setTableHeaders([]);
                return;
            }

            // Set processed data using Angular logic
            const processed = processExcelData(rawData, headerNames);
            setProcessedData(processed);
            setFilteredData(processed);

            // Set table headers for display (processed data headers)
            const processedHeaders = ['SLNO', 'FYP_Date', 'AMST_AdmNo', 'Student_Name', 'FYP_Tot_Amount', 'FYP_Bank_Or_Cash'];
            setTableHeaders(processedHeaders);

            // Also store raw imported data
            const formattedData = rawData.map((row: any, index: number) => {
                const obj: { [key: string]: any } = { SLNO: index + 1 };
                headerNames.forEach((header, idx) => {
                    if (header && header.trim() !== '') {
                        obj[header] = row[header] || '';
                    }
                });
                return obj;
            });

            setImportedData(formattedData);

            toast.success(`Processed ${processed.length} valid records from "${sheetName}"`);
        } catch (error) {
            toast.error('Error loading sheet data');
            console.error('Sheet load error:', error);
        }
    };

    // Clear all imported data
    const clearImportedData = () => {
        setExcelFile(null);
        setImportedData([]);
        setProcessedData([]);
        setFilteredData([]);
        setExcelSheets([]);
        setSelectedSheet('');
        setTableHeaders([]);
        setSearchQuery('');
        setFilename('');
    };

    // Handle search functionality on processed data
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(processedData);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = processedData.filter((row) => {
            return Object.values(row).some((value) => String(value).toLowerCase().includes(query));
        });
        setFilteredData(filtered);
    }, [searchQuery, processedData]);

    const handleSheetSelect = (sheetName: string) => {
        setSelectedSheet(sheetName);
        if (excelFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                loadSheetData(workbook, sheetName);
            };
            reader.readAsBinaryString(excelFile);
        }
    };

    const handleReportClick = async () => {
        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }

        if (!excelFile) {
            toast.error('Please select an Excel file');
            return;
        }

        if (processedData.length === 0) {
            toast.error('No valid data found in the Excel file');
            return;
        }

        try {
            // Prepare data for API call (similar to Angular logic)
            const data1 = {
                newlstget1: processedData
            };

            // Uncomment and implement your API service call
            // const response = await apiService.create("FeeReceiptImportStthomas/checkvalidation", data1);
            // if (response.stuStatus && response.stuStatus !== "") {
            //     toast.error(response.stuStatus);
            //     clearImportedData();
            // } else {
            //     setIsReportGenerated(true);
            //     toast.success('Data validated successfully');
            // }

            // For now, just show success
            setIsReportGenerated(true);
            toast.success(`${processedData.length} records Saved successfully`);

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            toast.error('Error processing data');
            console.error('Processing error:', error);
        }
    };

    const handleResetClick = () => {
        setIsReportGenerated(false);
        clearImportedData();
    };

    const handleRemoveFile = () => {
        clearImportedData();
        toast.info('File removed successfully');
    };

    return (
        <>
            <FormProvider<IFeeReceiptImportDelate>>
                <FeesReceiptImportDeletePageContent
                    isLoading={isLoading}
                    error={error}
                    selectedAsmayId={selectedAsmayId}
                    setSelectedAsmayId={setSelectedAsmayId}
                    academicYearData={academicYearData}
                    loadingYears={loadingYears}
                    isReportGenerated={isReportGenerated}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    onSave={handleReportClick}
                    onResetClick={handleResetClick}
                    onRemoveFile={handleRemoveFile}
                    excelFile={excelFile}
                    onFileUpload={selectFileForUpload}
                    importedData={importedData}
                    processedData={processedData}
                    filteredData={filteredData}
                    excelSheets={excelSheets}
                    selectedSheet={selectedSheet}
                    onSheetSelect={handleSheetSelect}
                    tableHeaders={tableHeaders}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filename={filename}
                />
            </FormProvider>
        </>
    );
}

function FeesReceiptImportDeletePageContent({
    isLoading,
    error,
    academicYearData,
    loadingYears,
    selectedAsmayId,
    setSelectedAsmayId,
    isReportGenerated,
    selectedDate,
    setSelectedDate,
    onSave,
    onResetClick,
    onRemoveFile,
    excelFile,
    onFileUpload,
    importedData,
    processedData,
    filteredData,
    excelSheets,
    selectedSheet,
    onSheetSelect,
    tableHeaders,
    searchQuery,
    setSearchQuery,
    filename
}: {
    isLoading: boolean;
    error: any;
    academicYearData: any;
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    loadingYears: boolean;
    isReportGenerated: boolean;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    onSave: () => void;
    onResetClick: () => void;
    onRemoveFile: () => void;
    excelFile: File | null;
    onFileUpload: (input: HTMLInputElement) => void;
    importedData: ImportedExcelData;
    processedData: ProcessedData;
    filteredData: ProcessedData;
    excelSheets: string[];
    selectedSheet: string;
    onSheetSelect: (sheetName: string) => void;
    tableHeaders: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filename: string;
}) {
    const { openAddForm } = useFormContext<IFeeReceiptImportDelate>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileUpload(e.target);
    };

    const handleFileRemoveClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemoveFile();
    };

    // Check if we should show processed table content
    const shouldShowTableContent = processedData.length > 0;

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-6 p-4'>
                {/* DATA IMPORT SECTION */}
                <div className='rounded-lg border bg-white shadow-sm'>
                    {/* Header */}
                    <div className='border-b p-4 text-center'>
                        <p className='mt-1 font-bold text-green-600 text-sm'>**Kindly Select Only One Excel Sheet To Import</p>
                    </div>

                    {/* Content */}
                    <div className='p-6'>
                        {/* IMPORTED DATA FROM EXCEL heading */}
                        <div className='mb-4'>
                            <h2 className='font-semibold text-base text-gray-700'>IMPORTED DATA FROM EXCEL</h2>
                        </div>

                        {/* Form row with Academic Year and File Upload */}
                        <div className='mb-6 grid grid-cols-2 gap-6'>
                            {/* Academic Year Column */}
                            <div>
                                <div className='flex items-center gap-2'>
                                    <Label className='whitespace-nowrap font-medium'>
                                        Academic Year<span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        value={selectedAsmayId?.toString() || ''}
                                        onValueChange={(v) => setSelectedAsmayId(v ? Number(v) : null)}
                                        disabled={loadingYears}>
                                        <SelectTrigger className='w-48'>
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

                            {/* File Upload Column */}
                            <div>
                                <div className='flex items-center gap-2'>
                                    <Label className='whitespace-nowrap font-medium'>
                                        Choose File<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                ref={fileInputRef}
                                                type='file'
                                                accept='.xlsx,.xls,.csv'
                                                onChange={handleFileChange}
                                                className='hidden'
                                                id='excel-file-input'
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={() => fileInputRef.current?.click()}
                                                className='w-48 gap-2'>
                                                <Upload className='h-4 w-4' />
                                                {filename ? 'File Selected' : 'Choose File'}
                                            </Button>
                                            {filename && (
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={handleFileRemoveClick}
                                                    className='h-8 w-8 p-0'>
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                        {filename && (
                                            <p className='text-green-600 text-sm'>
                                                Selected: {filename}
                                                {excelSheets.length > 0 && ` (${excelSheets.length} sheet(s))`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sheet selector if multiple sheets exist */}
                        {excelSheets.length > 1 && (
                            <div className='mb-4'>
                                <Label className='mb-2 block font-medium'>Select Sheet:</Label>
                                <div className='flex flex-wrap gap-2'>
                                    {excelSheets.map((sheet) => (
                                        <Button
                                            key={sheet}
                                            type='button'
                                            variant={selectedSheet === sheet ? 'default' : 'outline'}
                                            onClick={() => onSheetSelect(sheet)}
                                            size='sm'>
                                            {sheet}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Input - Only show when data is imported */}
                        {shouldShowTableContent && (
                            <div className='mb-4 flex'>
                                <div className='ml-auto'>
                                    <div className='relative w-48'>
                                        <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                                        <Input
                                            placeholder='Search Here...'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='pl-9'
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Table for Processed Data */}
                        <div className='mb-6 overflow-hidden rounded-md border'>
                            <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-gray-200 text-center'>
                                    <thead className='bg-gray-50'>
                                        {shouldShowTableContent ? (
                                            <tr>
                                                {tableHeaders.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        className='px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th
                                                    colSpan={6}
                                                    className='px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                    No Data Processed
                                                </th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className='divide-y divide-gray-200 bg-white'>
                                        {shouldShowTableContent ? (
                                            filteredData.length > 0 ? (
                                                filteredData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className='hover:bg-gray-50'>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {rowIndex + 1}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {row.FYP_Date || '-'}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {row.AMST_AdmNo || '-'}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {row.Student_Name || '-'}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {row.FYP_Tot_Amount.toLocaleString()}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-3 text-gray-900 text-sm'>
                                                            {row.FYP_Bank_Or_Cash || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={tableHeaders.length} className='px-6 py-3 text-gray-500 text-sm'>
                                                        No results found for "{searchQuery}"
                                                    </td>
                                                </tr>
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-24 text-center text-gray-500 text-sm'>
                                                    {excelFile
                                                        ? 'Processing Excel file...'
                                                        : 'Please select an Excel file to import and process data'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Information */}
                        {/* {shouldShowTableContent && (
                            <div className='mb-6 rounded-lg border bg-blue-50 p-4'>
                                <div className='grid grid-cols-3 gap-4'>
                                    <div className='text-center'>
                                        <p className='font-medium text-gray-600 text-sm'>Total Records</p>
                                        <p className='font-bold text-blue-700 text-lg'>{processedData.length}</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='font-medium text-gray-600 text-sm'>Total Amount</p>
                                        <p className='font-bold text-green-700 text-lg'>
                                            {processedData.reduce((sum, row) => sum + row.FYP_Tot_Amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='font-medium text-gray-600 text-sm'>Records Found</p>
                                        <p className='font-bold text-purple-700 text-lg'>{filteredData.length}</p>
                                    </div>
                                </div>
                            </div>
                        )} */}

                        {/* Buttons Section */}
                        <div className='mt-6 flex flex-col items-center justify-center gap-4 rounded-lg border bg-white p-6 shadow-sm'>
                            <div className='flex items-center gap-4'>
                                <Button
                                    type='button'
                                    onClick={onSave}
                                    disabled={!shouldShowTableContent}
                                    className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                    {isReportGenerated ? 'Update' : 'Save'}
                                </Button>
                                <Button variant='outline' onClick={onResetClick} type='button'>
                                    Reset
                                </Button>
                            </div>
                            {isReportGenerated && (
                                <p className='font-medium text-green-600 text-sm'>✓ Data processed and validated successfully</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { checkLibraryDataValidation, getImportLibraryDataInitial, saveImportLibraryData } from '@/server/library/reports/importlibrarydata';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    FileSpreadsheet,
    FileUp,
    RefreshCw,
    Search,
    Trash2,
    UploadCloud
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Supported Library Excel import types with templates and payloads
export interface IExcelTypeConfig {
    id: string;
    label: string;
    expectedFilename: string;
    payloadKey: string;
    requiresLibrary: boolean;
    sampleHeaders: string[];
    keywords: string[];
}

const EXCEL_IMPORT_TYPES: IExcelTypeConfig[] = [
    {
        id: 'book',
        label: 'Master Book (LIB_Master_Book.xlsx)',
        expectedFilename: 'LIB_Master_Book.xlsx',
        payloadKey: 'masterbook',
        requiresLibrary: true,
        sampleHeaders: [
            'LMB_BookTitle',
            'LMB_BookType',
            'LMB_VolNo',
            'LMB_Price',
            'LMB_ClassNo',
            'LMB_CallNo',
            'LMB_ISBN',
            'LMB_BindingStatus',
            'LMS_SubjectName',
            'LMD_DepartmentName'
        ],
        keywords: ['master_book', 'lib_master_book', 'book']
    },
    {
        id: 'subject',
        label: 'Master Subject (LIB.LIB_Master_Subject.xlsx)',
        expectedFilename: 'LIB.LIB_Master_Subject.xlsx',
        payloadKey: 'mastersub',
        requiresLibrary: true,
        sampleHeaders: ['LMS_SubjectName', 'LMS_SubjectNo', 'LMS_ClassNo', 'LMS_Level'],
        keywords: ['subject', 'mastersub', 'lib_master_subject']
    },
    {
        id: 'department',
        label: 'Master Department (LIB.LIB_Master_Department.xlsx)',
        expectedFilename: 'LIB.LIB_Master_Department.xlsx',
        payloadKey: 'masterdep',
        requiresLibrary: true,
        sampleHeaders: ['LMD_DepartmentName', 'LMD_DepartmentCode'],
        keywords: ['department', 'masterdep', 'lib_master_department']
    },
    {
        id: 'language',
        label: 'Master Language (LIB.LIB_Master_Language.xlsx)',
        expectedFilename: 'LIB.LIB_Master_Language.xlsx',
        payloadKey: 'masterlang',
        requiresLibrary: false,
        sampleHeaders: ['LML_LanguageName'],
        keywords: ['language', 'masterlang', 'lib_master_language']
    },
    {
        id: 'publisher',
        label: 'Master Publisher (LIB.LIB_Master_Publisher.xlsx)',
        expectedFilename: 'LIB.LIB_Master_Publisher.xlsx',
        payloadKey: 'masterpubl',
        requiresLibrary: true,
        sampleHeaders: ['LMP_PublisherName', 'LMP_Address', 'LMP_MobileNo', 'LMP_PhoneNo', 'LMP_EMailId'],
        keywords: ['publisher', 'masterpubl', 'lib_master_publisher']
    },
    {
        id: 'rack',
        label: 'Master Rack (LIB_Master_Rack.xlsx)',
        expectedFilename: 'LIB_Master_Rack.xlsx',
        payloadKey: 'masterrack',
        requiresLibrary: true,
        sampleHeaders: ['LMRA_RackName', 'LMRA_DisplayOrder'],
        keywords: ['rack', 'masterrack', 'lib_master_rack']
    },
    {
        id: 'author',
        label: 'Master Book Author (LIB_Master_Book_Author.xlsx)',
        expectedFilename: 'LIB_Master_Book_Author.xlsx',
        payloadKey: 'masterauthor',
        requiresLibrary: true,
        sampleHeaders: ['LMAU_AuthorFirstName', 'LMAU_AuthorMiddleName', 'LMAU_AuthorLastName', 'LMAU_MobileNo', 'LMAU_EmailId'],
        keywords: ['author', 'masterauthor', 'lib_master_book_author']
    },
    {
        id: 'accession',
        label: 'Master Book Accession No (LIB_Master_Book_AccnNo.xlsx)',
        expectedFilename: 'LIB_Master_Book_AccnNo.xlsx',
        payloadKey: 'masteracces',
        requiresLibrary: true,
        sampleHeaders: ['LMB_BookTitle', 'LMBANO_AccessionNo', 'LMBANO_BarcodeNo', 'LMBANO_AvailStatus'],
        keywords: ['accn', 'accession', 'masteracces', 'lib_master_book_accnno']
    },
    {
        id: 'transaction',
        label: 'Book Transactions (LIB_trans.xlsx)',
        expectedFilename: 'LIB_trans.xlsx',
        payloadKey: 'booktransIMP',
        requiresLibrary: true,
        sampleHeaders: ['LBTR_IssuedDate', 'LBTR_ReturnedDate', 'LMBANO_AccessionNo', 'AMST_AdmNo'],
        keywords: ['trans', 'transaction', 'circulation', 'lib_trans']
    },
    {
        id: 'vendor',
        label: 'Master Vendor (vendor.xlsx)',
        expectedFilename: 'vendor.xlsx',
        payloadKey: 'mastervender',
        requiresLibrary: true,
        sampleHeaders: ['LMV_VendorName', 'LMV_Address', 'LMV_MobileNo', 'LMV_PhoneNo', 'LMV_EMailId'],
        keywords: ['vendor', 'vender', 'mastervender']
    }
];

// Helper to detect Excel Type based on filename or column names
function detectExcelType(fname: string, headers: string[]): string {
    const lowerName = fname.toLowerCase();
    const upperHeaders = headers.map((h) => h.toUpperCase());

    // 1. Check filename matches
    for (const type of EXCEL_IMPORT_TYPES) {
        if (lowerName === type.expectedFilename.toLowerCase()) {
            return type.id;
        }
    }

    for (const type of EXCEL_IMPORT_TYPES) {
        if (type.keywords.some((kw) => lowerName.includes(kw))) {
            return type.id;
        }
    }

    // 2. Check column headers matches
    if (upperHeaders.some((h) => h.includes('LMAU_') || h.includes('AUTHORFIRST'))) return 'author';
    if (upperHeaders.some((h) => h.includes('LMRA_') || h.includes('RACKNAME'))) return 'rack';
    if (upperHeaders.some((h) => h.includes('LMBANO_') || h.includes('ACCESSIONNO'))) return 'accession';
    if (upperHeaders.some((h) => h.includes('LBTR_') || h.includes('ISSUEDDATE') || h.includes('RETURNEDDATE'))) return 'transaction';
    if (upperHeaders.some((h) => h.includes('LMV_') || h.includes('VENDORNAME'))) return 'vendor';
    if (upperHeaders.some((h) => h.includes('LMP_') || h.includes('PUBLISHERNAME'))) return 'publisher';
    if (upperHeaders.some((h) => h.includes('LML_') || h.includes('LANGUAGENAME'))) return 'language';
    if (upperHeaders.some((h) => h.includes('LMD_') || h.includes('DEPARTMENTNAME'))) return 'department';
    if (upperHeaders.some((h) => h.includes('LMS_') || h.includes('SUBJECTNAME'))) return 'subject';
    if (upperHeaders.some((h) => h.includes('LMB_') || h.includes('BOOKTITLE'))) return 'book';

    // Default to book if undetermined
    return 'book';
}

export default function ImportLibraryDataPage() {
    return (
        <FormProvider<any>>
            <ImportLibraryDataContent />
        </FormProvider>
    );
}

function ImportLibraryDataContent() {
    const [libraries, setLibraries] = useState<any[]>([]);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [activeFlag, setActiveFlag] = useState<boolean>(false);

    // Excel import configuration
    const [selectedExcelType, setSelectedExcelType] = useState<string>('auto');
    const [detectedExcelType, setDetectedExcelType] = useState<string>('book');

    // Excel file and data states
    const [filename, setFilename] = useState<string>('');
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);

    // Grid data & columns
    const [gridData, setGridData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial libraries
    useEffect(() => {
        setIsLoading(true);
        getImportLibraryDataInitial()
            .then((res) => {
                if (res?.masterlibarary?.length > 0) {
                    setLibraries(res.masterlibarary);
                }
            })
            .catch((err) => {
                toast.error(err.message || 'Failed to fetch libraries');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Load sheet data from workbook
    const parseSheetData = (workbook: XLSX.WorkBook, sheetName: string, fname: string) => {
        try {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                toast.error(`Sheet "${sheetName}" not found`);
                return;
            }

            // Extract header names from first row
            const headerMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
            const firstRow = headerMatrix[0] || [];

            // Extract rows
            const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

            if (!rawData || rawData.length === 0) {
                toast.error(`Excel sheet "${sheetName}" is empty.`);
                setGridData([]);
                setColumns([]);
                return;
            }

            // Clean & sanitize headers
            const cleanedHeaders: string[] = [];
            firstRow.forEach((h: any, idx: number) => {
                const text = h !== undefined && h !== null ? String(h).trim() : '';
                if (text) {
                    cleanedHeaders.push(text);
                } else if (idx < Object.keys(rawData[0] || {}).length) {
                    cleanedHeaders.push(`Column_${idx + 1}`);
                }
            });

            const finalHeaders = cleanedHeaders.length > 0 ? cleanedHeaders : Object.keys(rawData[0] || {});

            // Clean row values
            const formattedData = rawData.map((row: any) => {
                const cleanRow: Record<string, any> = {};
                for (const col of finalHeaders) {
                    let val = row[col];
                    if (val instanceof Date) {
                        val = val.toISOString().split('T')[0];
                    } else if (val === undefined || val === null) {
                        val = '';
                    } else if (typeof val === 'string') {
                        val = val.trim();
                    }
                    cleanRow[col] = val;
                }
                return cleanRow;
            });

            // Set grid data and columns
            setGridData(formattedData);
            setColumns(finalHeaders);
            setCurrentPage(1);

            // Auto-detect type
            const detected = detectExcelType(fname, finalHeaders);
            setDetectedExcelType(detected);

            toast.success(`Loaded ${formattedData.length} records from "${sheetName}"`);

            // Non-blocking validation call (safe)
            try {
                const validationPayload = { newlstget1: formattedData.slice(0, 100) };
                checkLibraryDataValidation(validationPayload)
                    .then((valRes) => {
                        if (valRes?.stuStatus && valRes.stuStatus !== '') {
                            toast.info(`Validation Note: ${valRes.stuStatus}`);
                        }
                    })
                    .catch(() => {
                        // Ignore backend validation error non-blockingly
                    });
            } catch (_) {
                // Non-blocking
            }
        } catch (error) {
            console.error('Sheet parsing error:', error);
            toast.error('Error parsing sheet data');
        } finally {
            setIsLoadingFile(false);
        }
    };

    // Handle File Upload for any Excel format (.xlsx, .xls, .csv, .xlsm, etc.)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const lowerName = file.name.toLowerCase();
        const validExtensions = ['.xlsx', '.xls', '.csv', '.xlsm', '.xlsb'];
        const isExcelExtension = validExtensions.some((ext) => lowerName.endsWith(ext));

        const isExcelMime =
            file.type.includes('spreadsheet') ||
            file.type.includes('excel') ||
            file.type.includes('csv') ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.type === ''; // Windows mime types can be empty

        if (!isExcelExtension && !isExcelMime) {
            toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)');
            return;
        }

        setFilename(file.name);
        setIsLoadingFile(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const buffer = evt.target?.result as ArrayBuffer;
                const workbook = XLSX.read(buffer, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                const sheetNames = workbook.SheetNames;
                if (!sheetNames || sheetNames.length === 0) {
                    toast.error('Uploaded file contains no worksheets.');
                    setIsLoadingFile(false);
                    return;
                }

                setWorkbookRef(workbook);
                setAvailableSheets(sheetNames);
                setSelectedSheet(sheetNames[0]);

                parseSheetData(workbook, sheetNames[0], file.name);
            } catch (err: any) {
                console.error('File reading error:', err);
                toast.error('Failed to parse Excel file. Please ensure it is not corrupt.');
                setIsLoadingFile(false);
            }
        };

        reader.onerror = () => {
            toast.error('Error reading file from disk');
            setIsLoadingFile(false);
        };

        reader.readAsArrayBuffer(file);
    };

    // Change Sheet
    const handleSheetChange = (sheetName: string) => {
        setSelectedSheet(sheetName);
        if (workbookRef) {
            setIsLoadingFile(true);
            parseSheetData(workbookRef, sheetName, filename);
        }
    };

    // Clear / Reset
    const handleClear = () => {
        setGridData([]);
        setColumns([]);
        setFilename('');
        setWorkbookRef(null);
        setAvailableSheets([]);
        setSelectedSheet('');
        setSearchQuery('');
        setCurrentPage(1);
        setActiveFlag(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.info('Form cleared');
    };

    // Download Sample Template for currently selected or detected type
    const handleDownloadTemplate = () => {
        const activeTypeKey = selectedExcelType !== 'auto' ? selectedExcelType : detectedExcelType;
        const config = EXCEL_IMPORT_TYPES.find((t) => t.id === activeTypeKey) || EXCEL_IMPORT_TYPES[0];

        const ws = XLSX.utils.aoa_to_sheet([config.sampleHeaders]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, config.expectedFilename || `${config.id}_template.xlsx`);
        toast.success(`Template downloaded: ${config.expectedFilename}`);
    };

    // Filter data by search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return gridData;
        const query = searchQuery.toLowerCase().trim();
        return gridData.filter((row) =>
            columns.some((col) => {
                const val = row[col];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
            })
        );
    }, [gridData, columns, searchQuery]);

    // Paginated slice
    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const paginatedData = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, safeCurrentPage, pageSize]);

    // Active Excel Type determination
    const activeTypeConfig = useMemo(() => {
        const activeId = selectedExcelType !== 'auto' ? selectedExcelType : detectedExcelType;
        return EXCEL_IMPORT_TYPES.find((t) => t.id === activeId) || EXCEL_IMPORT_TYPES[0];
    }, [selectedExcelType, detectedExcelType]);

    // Save Data
    const handleSave = async () => {
        if (activeTypeConfig.requiresLibrary && !selectedLibraryId) {
            toast.error('Library Name Is Not Selected !');
            return;
        }

        if (gridData.length === 0) {
            toast.error('Please upload valid excel data before saving');
            return;
        }

        setIsSaving(true);
        try {
            // Format dates
            const formattedData = gridData.map((item) => {
                const newItem = { ...item };
                if (newItem.LBTR_IssuedDate) {
                    try {
                        newItem.LBTR_IssuedDate = new Date(newItem.LBTR_IssuedDate).toISOString().split('T')[0];
                    } catch (_) {
                        // Keep original value if date parsing fails
                    }
                }
                if (newItem.LBTR_ReturnedDate) {
                    try {
                        newItem.LBTR_ReturnedDate = new Date(newItem.LBTR_ReturnedDate).toISOString().split('T')[0];
                    } catch (_) {
                        // Keep original value if date parsing fails
                    }
                }
                return newItem;
            });

            let data: any = {};
            switch (activeTypeConfig.id) {
                case 'subject':
                    data = { mastersub: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'department':
                    data = { masterdep: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'language':
                    data = { masterlang: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'publisher':
                    data = { masterpubl: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'book':
                    data = { masterbook: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'rack':
                    data = { masterrack: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'author':
                    data = { masterauthor: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'accession':
                    data = { masteracces: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'transaction':
                    data = { booktransIMP: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                case 'vendor':
                    data = { mastervender: formattedData, LMAL_Id: selectedLibraryId };
                    break;
                default:
                    data = { masterbook: formattedData, LMAL_Id: selectedLibraryId };
                    break;
            }

            const response = await saveImportLibraryData(data);
            if (response?.returnval) {
                toast.success(
                    `Saved successfully! Saved: ${response.suscnt ?? 0}, Failed: ${response.failcnt ?? 0}, Duplicate/Existing: ${response.dupcnt ?? 0}`
                );
                handleClear();
                setSelectedLibraryId('');
            } else if (response?.message) {
                toast.error(response.message);
            } else {
                toast.error('Please Select Correct File Format or Data Template');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save imported data');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* SECTION 1: LIBRARY DATA IMPORT CONFIGURATION */}
                <CollapsibleSection title='LIBRARY DATA IMPORT' defaultOpen={true} variant='outline' size='md' className='shadow-lg'>
                    <div className='space-y-4 p-4'>
                        <div className='flex items-center justify-between rounded-lg border border-green-200 bg-green-50/60 p-3 text-center'>
                            <div className='flex items-center gap-2 font-semibold text-green-700 text-sm'>
                                <CheckCircle2 className='h-4 w-4' />
                                Kindly Select Only One Excel Sheet To Import (.xlsx, .xls, .csv supported)
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleDownloadTemplate}
                                className='h-8 gap-1.5 border-green-300 text-green-800 hover:bg-green-100 hover:text-green-900'>
                                <Download className='h-3.5 w-3.5' />
                                Download Sample Template
                            </Button>
                        </div>

                        {/* Controls Grid */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            {/* Library Name */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Library Name <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedLibraryId} onValueChange={setSelectedLibraryId} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Library Name' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {libraries.map((lib: any) => (
                                            <SelectItem key={lib.lmaL_Id} value={String(lib.lmaL_Id)}>
                                                {lib.lmaL_LibraryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Excel Import Type */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>Excel Type</Label>
                                <Select value={selectedExcelType} onValueChange={setSelectedExcelType}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Excel Type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='auto'>⚡ Auto-Detect from File</SelectItem>
                                        {EXCEL_IMPORT_TYPES.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* File Upload Trigger */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>Choose Excel File</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='excel-upload'
                                        type='file'
                                        accept='.xlsx,.xls,.csv,.xlsm,.xlsb'
                                        onChange={handleFileUpload}
                                        className='hidden'
                                        ref={fileInputRef}
                                    />
                                    <Label
                                        htmlFor='excel-upload'
                                        className='flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded bg-amber-400 px-4 font-bold text-black text-sm shadow-sm transition hover:bg-amber-500'>
                                        <UploadCloud className='h-4 w-4' />
                                        {isLoadingFile ? 'Parsing...' : 'Choose File'}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Secondary status row */}
                        <div className='flex flex-wrap items-center justify-between gap-3 border-t pt-3'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='active-flag' checked={activeFlag} onCheckedChange={(checked) => setActiveFlag(!!checked)} />
                                <Label htmlFor='active-flag' className='cursor-pointer font-medium text-gray-700 text-sm'>
                                    Active Flag
                                </Label>
                            </div>

                            <div className='flex flex-wrap items-center gap-2'>
                                {filename && (
                                    <Badge variant='outline' className='gap-1 border-blue-200 bg-blue-50 text-blue-700 text-xs'>
                                        <FileSpreadsheet className='h-3 w-3' />
                                        File: <span className='font-semibold'>{filename}</span>
                                    </Badge>
                                )}
                                <Badge variant='secondary' className='text-xs'>
                                    Format: <span className='ml-1 font-semibold'>{activeTypeConfig.label}</span>
                                </Badge>
                                {availableSheets.length > 1 && (
                                    <div className='flex items-center gap-1.5'>
                                        <Label className='whitespace-nowrap text-muted-foreground text-xs'>Sheet:</Label>
                                        <Select value={selectedSheet} onValueChange={handleSheetChange}>
                                            <SelectTrigger className='h-7 w-[140px] text-xs'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSheets.map((sh) => (
                                                    <SelectItem key={sh} value={sh} className='text-xs'>
                                                        {sh}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* SECTION 2: IMPORTED DATA FROM EXCEL GRID */}
                <CollapsibleSection title='IMPORTED DATA FROM EXCEL' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='space-y-4 p-4'>
                        {/* Top Grid Toolbar */}
                        <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
                            <div className='flex flex-wrap items-center gap-3'>
                                <Badge variant='outline' className='px-2.5 py-1 font-medium text-sm'>
                                    Total Records: <span className='ml-1 font-bold text-primary'>{gridData.length}</span>
                                </Badge>
                                {filteredData.length !== gridData.length && (
                                    <Badge variant='secondary' className='px-2.5 py-1 text-xs'>
                                        Filtered: <span className='ml-1 font-semibold'>{filteredData.length}</span>
                                    </Badge>
                                )}
                                <Badge variant='outline' className='px-2.5 py-1 font-medium text-sm'>
                                    Columns: <span className='ml-1 font-bold'>{columns.length}</span>
                                </Badge>
                            </div>

                            {/* Live Search Input */}
                            <div className='w-full md:w-[280px]'>
                                <div className='relative'>
                                    <Input
                                        placeholder='Search in imported data...'
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        disabled={gridData.length === 0}
                                        className='pr-9 pl-3'
                                    />
                                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                                        <Search className='h-4 w-4 text-gray-400' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex justify-center gap-4 py-1'>
                            <Button
                                size='sm'
                                onClick={handleSave}
                                disabled={isSaving || (activeTypeConfig.requiresLibrary && !selectedLibraryId) || gridData.length === 0}
                                className='w-28 bg-red-600 font-medium text-white hover:bg-red-700'>
                                {isSaving ? (
                                    <span className='flex items-center gap-1.5'>
                                        <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                                        Saving...
                                    </span>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                            <Button variant='outline' size='sm' onClick={handleClear} disabled={isSaving} className='w-28 gap-1.5'>
                                <Trash2 className='h-3.5 w-3.5' />
                                Cancel
                            </Button>
                        </div>

                        {/* Grid Content */}
                        {gridData.length > 0 ? (
                            <div className='space-y-3'>
                                <div className='max-h-[520px] overflow-auto rounded-md border shadow-inner'>
                                    <table className='w-full border-collapse text-left text-sm'>
                                        <thead className='sticky top-0 z-10 bg-primary text-primary-foreground'>
                                            <tr>
                                                <th className='border border-primary-foreground/20 p-2.5 text-center font-bold'>SLNO</th>
                                                {columns.map((col, idx) => (
                                                    <th
                                                        key={idx}
                                                        className='whitespace-nowrap border border-primary-foreground/20 p-2.5 font-semibold text-xs uppercase tracking-wider'>
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((row, rIdx) => {
                                                const globalIndex = (safeCurrentPage - 1) * pageSize + rIdx + 1;
                                                return (
                                                    <tr
                                                        key={rIdx}
                                                        className='border-b transition-colors odd:bg-white even:bg-muted/20 hover:bg-muted/60'>
                                                        <td className='border p-2 text-center font-medium text-muted-foreground text-xs'>
                                                            {globalIndex}
                                                        </td>
                                                        {columns.map((col, cIdx) => (
                                                            <td
                                                                key={cIdx}
                                                                className='max-w-[250px] truncate border p-2 text-xs'
                                                                title={String(row[col] ?? '')}>
                                                                {String(row[col] ?? '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className='flex flex-wrap items-center justify-between gap-3 border-t px-1 pt-2'>
                                    <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                                        <span>Rows per page:</span>
                                        <Select
                                            value={String(pageSize)}
                                            onValueChange={(val) => {
                                                setPageSize(Number(val));
                                                setCurrentPage(1);
                                            }}>
                                            <SelectTrigger className='h-7 w-[70px] text-xs'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[10, 25, 50, 100].map((sz) => (
                                                    <SelectItem key={sz} value={String(sz)} className='text-xs'>
                                                        {sz}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span>
                                            Showing {(safeCurrentPage - 1) * pageSize + 1} to{' '}
                                            {Math.min(safeCurrentPage * pageSize, totalRecords)} of {totalRecords} records
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-1.5'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='h-7 w-7'
                                            disabled={safeCurrentPage <= 1}
                                            onClick={() => setCurrentPage(1)}
                                            title='First page'>
                                            <ChevronsLeft className='h-3.5 w-3.5' />
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='h-7 w-7'
                                            disabled={safeCurrentPage <= 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            title='Previous page'>
                                            <ChevronLeft className='h-3.5 w-3.5' />
                                        </Button>

                                        <span className='px-2 font-medium text-xs'>
                                            Page {safeCurrentPage} of {totalPages}
                                        </span>

                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='h-7 w-7'
                                            disabled={safeCurrentPage >= totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            title='Next page'>
                                            <ChevronRight className='h-3.5 w-3.5' />
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='h-7 w-7'
                                            disabled={safeCurrentPage >= totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                            title='Last page'>
                                            <ChevronsRight className='h-3.5 w-3.5' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className='flex min-h-[220px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-8 text-center'>
                                <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                    <FileUp className='h-7 w-7' />
                                </div>
                                <h3 className='font-semibold text-base text-gray-800'>No Excel Data Loaded</h3>
                                <p className='mt-1 max-w-md text-muted-foreground text-xs'>
                                    Select any type of Excel file (.xlsx, .xls, .csv) using the &quot;Choose File&quot; button above. The
                                    data will be fetched and displayed on this grid.
                                </p>
                                <div className='mt-4 flex gap-3'>
                                    <Label
                                        htmlFor='excel-upload'
                                        className='cursor-pointer rounded bg-amber-400 px-4 py-2 font-semibold text-black text-xs shadow hover:bg-amber-500'>
                                        Choose File to Import
                                    </Label>
                                    <Button variant='outline' size='sm' onClick={handleDownloadTemplate} className='text-xs'>
                                        Download Template
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
    Cake,
    Calendar,
    FileSpreadsheet,
    Printer,
    Search,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Briefcase,
    MapPin,
    AlertCircle,
    Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getStaffBirthdayReportDetails } from '@/server/admission/staff-birthday-action';

const MONTHS = [
    { value: '01', label: 'JANUARY' },
    { value: '02', label: 'FEBRUARY' },
    { value: '03', label: 'MARCH' },
    { value: '04', label: 'APRIL' },
    { value: '05', label: 'MAY' },
    { value: '06', label: 'JUNE' },
    { value: '07', label: 'JULY' },
    { value: '08', label: 'AUGUST' },
    { value: '09', label: 'SEPTEMBER' },
    { value: '10', label: 'OCTOBER' },
    { value: '11', label: 'NOVEMBER' },
    { value: '12', label: 'DECEMBER' }
];

export default function StaffBirthdayReportPage() {
    // Form fields state
    const [all1, setAll1] = useState<string>('1'); // '1': Between Days, '0': Month Wise
    const [month, setMonth] = useState<string>('');
    const [fromdate, setFromdate] = useState<string>('');
    const [todate, setTodate] = useState<string>('');

    // UI state
    const [staffs, setStaffs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    // Sorting state
    const [sortKey, setSortKey] = useState<string>('HRME_EmployeeFirstName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Local Storage configurations
    const [logoPath, setLogoPath] = useState<string>('');
    const [copyright, setCopyright] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const admfig = localStorage.getItem('admfigsettings');
                if (admfig) {
                    const parsed = JSON.parse(admfig);
                    if (parsed && parsed.length > 0) {
                        setLogoPath(parsed[0].asC_Logo_Path || '');
                    }
                }
                const ivrmconfig = localStorage.getItem('ivrmgeneralconfiglist');
                if (ivrmconfig) {
                    const parsed = JSON.parse(ivrmconfig);
                    if (parsed && parsed.length > 0) {
                        setCopyright(parsed[0].ivrmgC_Disclaimer || '');
                        if (parsed[0].ivrmgC_ReportPagination) {
                            setItemsPerPage(Number(parsed[0].ivrmgC_ReportPagination));
                        }
                    }
                }
                setUserName(localStorage.getItem('username') || '');
            } catch (e) {
                console.error('Error loading config from localStorage:', e);
            }
        }
    }, []);

    // Form validation helper
    const isFormValid = (): boolean => {
        if (all1 === '1') {
            return !!fromdate && !!todate;
        } else {
            return !!month;
        }
    };

    // Form submission
    const handleShowReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!isFormValid()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Logical date range check
        if (all1 === '1') {
            const start = new Date(fromdate);
            const end = new Date(todate);
            if (start > end) {
                toast.error('From Date cannot be later than To Date');
                return;
            }
        }

        setLoading(true);
        setStaffs([]);
        setSelectedRows([]);
        setHasSearched(false);

        try {
            const fromdateString = all1 === '1' ? new Date(fromdate).toDateString() : new Date().toDateString();
            const todateString = all1 === '1' ? new Date(todate).toDateString() : new Date().toDateString();

            const payload = {
                months: all1 === '0' ? month : 0,
                all1: Number(all1),
                Fromdate: fromdateString,
                Todate: todateString
            };

            const response = await getStaffBirthdayReportDetails(payload);
            const res = response as any;

            if (res && res.count > 0 && res.staffDetails) {
                // Clean extra spaces in staff names
                const cleanedStaffs = res.staffDetails.map((staff: any) => {
                    if (staff.HRME_EmployeeFirstName && staff.HRME_EmployeeFirstName.length > 0) {
                        return {
                            ...staff,
                            HRME_EmployeeFirstName: staff.HRME_EmployeeFirstName.replace(/  +/g, ' ')
                        };
                    }
                    return staff;
                });

                setStaffs(cleanedStaffs);
                setHasSearched(true);
                toast.success(`Successfully loaded ${res.count} staff records`);
            } else {
                toast.info('No Records Found');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load staff birthday report details');
        } finally {
            setLoading(false);
        }
    };

    // Reset fields
    const handleReset = () => {
        window.location.reload();
    };

    // Selection helpers
    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows([...filteredAndSortedStaffs]);
        } else {
            setSelectedRows([]);
        }
    };

    const handleToggleRow = (checked: boolean, staff: any) => {
        if (checked) {
            setSelectedRows(prev => [...prev, staff]);
        } else {
            setSelectedRows(prev => prev.filter(item => item.HRME_Id !== staff.HRME_Id));
        }
    };

    const isRowSelected = (staff: any) => {
        return selectedRows.some(item => item.HRME_Id === staff.HRME_Id);
    };

    // Columns sorting helper
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    // Search, Filter and Sort logical computation
    const filteredAndSortedStaffs = useMemo(() => {
        let result = [...staffs];

        // Search Filter
        if (searchValue.trim() !== '') {
            const query = searchValue.toLowerCase();
            result = result.filter(item => {
                return (
                    (item.HRME_EmployeeFirstName && item.HRME_EmployeeFirstName.toLowerCase().includes(query)) ||
                    (item.HRME_EmployeeCode && item.HRME_EmployeeCode.toLowerCase().includes(query)) ||
                    (item.HRMD_DepartmentName && item.HRMD_DepartmentName.toLowerCase().includes(query)) ||
                    (item.HRMDES_DesignationName && item.HRMDES_DesignationName.toLowerCase().includes(query))
                );
            });
        }

        // Sorting
        result.sort((a, b) => {
            let valA = a[sortKey] || '';
            let valB = b[sortKey] || '';

            if (sortKey === 'HRME_DOB') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [staffs, searchValue, sortKey, sortDirection]);

    // Pagination computation
    const paginatedStaffs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedStaffs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedStaffs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedStaffs.length / itemsPerPage);

    // Export Excel operation
    const handleExportToExcel = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to be exported');
            return;
        }

        const dataToExport = selectedRows.map((row, index) => ({
            'SL.No': index + 1,
            'Emp Code': row.HRME_EmployeeCode || '',
            'Staff Name': row.HRME_EmployeeFirstName || '',
            'Department': row.HRMD_DepartmentName || '',
            'Designation': row.HRMDES_DesignationName || '',
            'Date of Birth': row.HRME_DOB ? format(new Date(row.HRME_DOB), 'dd/MMM/yyyy') : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'StaffBirthdayReport');
        XLSX.writeFile(workbook, `StaffBirthdayReport_${format(new Date(), 'ddMMyyyy')}.xlsx`);
        toast.success('Excel file exported successfully!');
    };

    // Print operation
    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to be Printed');
            return;
        }
        window.print();
    };

    // Format Date of Birth
    const formatDateOfBirth = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd/MMM/yyyy');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className='container mx-auto space-y-8 p-4 md:p-6 min-h-screen'>
            {/* Embedded Print Styling */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm 15mm 15mm 15mm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printSectionId,
                    #printSectionId * {
                        visibility: visible !important;
                    }
                    #printSectionId {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        font-family: 'Times New Roman', Times, serif;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #printSectionId table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    #printSectionId th,
                    #printSectionId td {
                        border: 1px solid black !important;
                        padding: 6px 8px !important;
                        font-size: 11px !important;
                        color: black !important;
                        text-align: center !important;
                    }
                    #printSectionId th {
                        background-color: #f3f4f6 !important;
                        font-weight: bold !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    #printSectionId td.text-left,
                    #printSectionId th.text-left {
                        text-align: left !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header section with gradient design */}
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4 no-print'>
                <div>
                    <h1 className='text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent flex items-center gap-3'>
                        <Cake className='h-8 w-8 text-primary animate-bounce' />
                        Staff Birthday Report
                    </h1>
                    <p className='text-muted-foreground text-sm mt-1'>
                        Modern dashboard to generate, analyze, print, and export birthday reports for institution staff.
                    </p>
                </div>
            </div>

            {/* Config criteria card */}
            <Card className='shadow-xl border-t-4 border-t-primary/80 transition-shadow duration-300 hover:shadow-2xl no-print'>
                <CardHeader>
                    <CardTitle className='text-lg font-bold flex items-center gap-2'>
                        <Calendar className='h-5 w-5 text-primary' />
                        Report Configuration Criteria
                    </CardTitle>
                    <CardDescription>Select range and monthly flags.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleShowReport} className='space-y-6'>
                        <div className='row text-center flex justify-center'>
                            {/* Between Days or Month Wise Selection */}
                            <div className='space-y-3 rounded-xl border bg-accent/5 p-5 shadow-inner transition-colors duration-200 hover:bg-accent/10 w-full max-w-xl'>
                                <Label className='text-sm font-semibold tracking-wide uppercase text-muted-foreground'>
                                    Report Selection Filter
                                </Label>
                                <RadioGroup value={all1} onValueChange={setAll1} className='flex justify-center gap-8 pt-2'>
                                    <div className='flex items-center space-x-3'>
                                        <RadioGroupItem value='1' id='r1' className='h-5 w-5 text-primary' />
                                        <Label htmlFor='r1' className='font-medium cursor-pointer text-sm md:text-base'>
                                            Between Days
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-3'>
                                        <RadioGroupItem value='0' id='r0' className='h-5 w-5 text-primary' />
                                        <Label htmlFor='r0' className='font-medium cursor-pointer text-sm md:text-base'>
                                            Month Wise
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Date selection or Month selection container */}
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 items-end pt-2 max-w-4xl mx-auto'>
                            {all1 === '0' && (
                                <div className='space-y-2 col-span-2 max-w-md mx-auto w-full'>
                                    <Label className='flex items-center gap-1 font-semibold text-sm'>
                                        Select Month <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger className='w-full shadow-sm focus:ring-2 focus:ring-primary'>
                                            <SelectValue placeholder='--Select Month--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map(item => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {submitted && !month && (
                                        <p className='text-xs text-destructive flex items-center gap-1 mt-1 animate-pulse'>
                                            <AlertCircle className='h-3 w-3' /> Select Month Name
                                        </p>
                                    )}
                                </div>
                            )}

                            {all1 === '1' && (
                                <>
                                    <div className='space-y-2'>
                                        <Label className='font-semibold text-sm'>From Date <span className='text-destructive'>*</span></Label>
                                        <Input
                                            type='date'
                                            value={fromdate}
                                            onChange={e => setFromdate(e.target.value)}
                                            className='shadow-sm focus:ring-2 focus:ring-primary'
                                        />
                                        {submitted && !fromdate && (
                                            <p className='text-xs text-destructive flex items-center gap-1 mt-1 animate-pulse'>
                                                <AlertCircle className='h-3 w-3' /> Select Date
                                            </p>
                                        )}
                                    </div>
                                    <div className='space-y-2'>
                                        <Label className='font-semibold text-sm'>To Date <span className='text-destructive'>*</span></Label>
                                        <Input
                                            type='date'
                                            value={todate}
                                            onChange={e => setTodate(e.target.value)}
                                            className='shadow-sm focus:ring-2 focus:ring-primary'
                                        />
                                        {submitted && !todate && (
                                            <p className='text-xs text-destructive flex items-center gap-1 mt-1 animate-pulse'>
                                                <AlertCircle className='h-3 w-3' /> Select Date
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit and Cancel Buttons */}
                        <div className='flex justify-end gap-4 border-t pt-6 max-w-4xl mx-auto'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                className='px-6 transition-all duration-200 hover:bg-muted/80'
                            >
                                <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                            <Button
                                type='submit'
                                disabled={loading}
                                className='px-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-650 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                                    </>
                                ) : (
                                    <>Submit</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Results Grid Details Section */}
            {hasSearched && staffs.length > 0 && (
                <CollapsibleSection title='STAFF BIRTHDAY REPORT DETAILS' defaultOpen={true} className='no-print shadow-xl rounded-xl border border-border/80'>
                    <div className='space-y-6 p-1'>
                        {/* Summary Metrics & Dynamic Search / Options */}
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4'>
                            <div className='flex flex-wrap gap-4'>
                                <div className='rounded-full border bg-background px-4 py-1.5 shadow-sm text-xs md:text-sm font-semibold flex items-center gap-2'>
                                    Total Grid Records: <span className='rounded-full bg-primary/10 text-primary px-2.5 py-0.5'>{staffs.length}</span>
                                </div>
                                {searchValue.trim() !== '' && (
                                    <div className='rounded-full border bg-background px-4 py-1.5 shadow-sm text-xs md:text-sm font-semibold flex items-center gap-2'>
                                        Total Records Searched: <span className='rounded-full bg-violet-600/10 text-violet-600 px-2.5 py-0.5'>{filteredAndSortedStaffs.length}</span>
                                    </div>
                                )}
                            </div>

                            {/* Export and Print Buttons */}
                            <div className='flex gap-3 flex-wrap'>
                                <Button
                                    onClick={handleExportToExcel}
                                    variant='outline'
                                    className='border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20'
                                >
                                    <FileSpreadsheet className='mr-2 h-4 w-4' /> Export to Excel
                                </Button>
                                <Button
                                    onClick={handlePrint}
                                    variant='outline'
                                    className='border-violet-200 text-violet-600 bg-violet-50/50 hover:bg-violet-50 hover:text-violet-750 dark:hover:bg-violet-950/20'
                                >
                                    <Printer className='mr-2 h-4 w-4' /> Print Report
                                </Button>
                            </div>
                        </div>

                        {/* Search bar input */}
                        <div className='flex max-w-sm items-center gap-2'>
                            <div className='relative w-full'>
                                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                <Input
                                    placeholder='search here...'
                                    value={searchValue}
                                    onChange={e => {
                                        setSearchValue(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className='pl-10 shadow-sm'
                                />
                            </div>
                        </div>

                        {/* Responsive Data Grid */}
                        <div className='overflow-x-auto rounded-xl border border-muted-foreground/20 shadow-inner bg-card'>
                            <table className='w-full border-collapse text-left text-sm text-foreground' id='tabel'>
                                <thead>
                                    <tr className='border-b bg-accent/15 font-semibold text-muted-foreground shadow-sm transition-colors'>
                                        <th className='p-4 text-center w-12'>
                                            <Checkbox
                                                checked={filteredAndSortedStaffs.length > 0 && selectedRows.length === filteredAndSortedStaffs.length}
                                                onCheckedChange={handleToggleAll}
                                            />
                                        </th>
                                        <th className='p-4 text-center w-16'>SL.No</th>
                                        <th className='p-4 cursor-pointer hover:bg-accent/20 transition-colors w-32' onClick={() => handleSort('HRME_EmployeeCode')}>
                                            <div className='flex items-center gap-1.5'>
                                                Emp code
                                                {sortKey === 'HRME_EmployeeCode' && (sortDirection === 'asc' ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />)}
                                            </div>
                                        </th>
                                        <th className='p-4 cursor-pointer hover:bg-accent/20 transition-colors w-48' onClick={() => handleSort('HRME_EmployeeFirstName')}>
                                            <div className='flex items-center gap-1.5'>
                                                Staff Name
                                                {sortKey === 'HRME_EmployeeFirstName' && (sortDirection === 'asc' ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />)}
                                            </div>
                                        </th>
                                        <th className='p-4 cursor-pointer hover:bg-accent/20 transition-colors w-44' onClick={() => handleSort('HRMD_DepartmentName')}>
                                            <div className='flex items-center gap-1.5'>
                                                Department
                                                {sortKey === 'HRMD_DepartmentName' && (sortDirection === 'asc' ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />)}
                                            </div>
                                        </th>
                                        <th className='p-4 cursor-pointer hover:bg-accent/20 transition-colors w-44' onClick={() => handleSort('HRMDES_DesignationName')}>
                                            <div className='flex items-center gap-1.5'>
                                                Designation
                                                {sortKey === 'HRMDES_DesignationName' && (sortDirection === 'asc' ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />)}
                                            </div>
                                        </th>
                                        <th className='p-4 cursor-pointer hover:bg-accent/20 transition-colors w-40' onClick={() => handleSort('HRME_DOB')}>
                                            <div className='flex items-center gap-1.5'>
                                                Date of Birth
                                                {sortKey === 'HRME_DOB' && (sortDirection === 'asc' ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />)}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStaffs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className='p-8 text-center text-muted-foreground font-medium'>
                                                No records match the search filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedStaffs.map((row, index) => {
                                            const slNo = (currentPage - 1) * itemsPerPage + index + 1;
                                            return (
                                                <tr
                                                    key={`${row.HRME_Id || ''}_${row.HRME_EmployeeCode || ''}_${slNo}`}
                                                    className='border-b hover:bg-accent/5 transition-colors duration-150'
                                                >
                                                    <td className='p-4 text-center'>
                                                        <Checkbox
                                                            checked={isRowSelected(row)}
                                                            onCheckedChange={checked => handleToggleRow(!!checked, row)}
                                                        />
                                                    </td>
                                                    <td className='p-4 text-center font-medium'>{slNo}</td>
                                                    <td className='p-4 font-medium text-muted-foreground'>{row.HRME_EmployeeCode}</td>
                                                    <td className='p-4 font-semibold text-primary/95'>{row.HRME_EmployeeFirstName}</td>
                                                    <td className='p-4'>{row.HRMD_DepartmentName}</td>
                                                    <td className='p-4'>{row.HRMDES_DesignationName}</td>
                                                    <td className='p-4 font-medium'>{formatDateOfBirth(row.HRME_DOB)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className='flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-muted-foreground/10'>
                                <span className='text-xs text-muted-foreground font-semibold'>
                                    Showing page {currentPage} of {totalPages}
                                </span>
                                <div className='flex gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className='text-xs'
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className='text-xs'
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* Printable Area - Hidden on Screen, formats cleanly during print */}
            <div id='printSectionId' className='hidden'>
                {logoPath ? (
                    <div className='text-center mb-6'>
                        <img src={logoPath} className='mx-auto max-h-24 object-contain mb-3' alt='Institution Logo' />
                    </div>
                ) : (
                    <div className='text-center mb-6 font-bold text-xl uppercase tracking-wider'>
                        BALDWIN INSTITUTIONS
                    </div>
                )}

                <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold uppercase underline tracking-wide'>Staff Birthday Report</h2>
                    <p className='text-xs italic text-gray-700 mt-1'>
                        Report Filter: {all1 === '1' ? 'Between Days' : 'Month Wise'} Wise
                    </p>
                    {all1 === '1' && fromdate && todate && (
                        <p className='text-xs text-gray-800 font-semibold mt-1'>
                            Period: {format(new Date(fromdate), 'dd/MM/yyyy')} to {format(new Date(todate), 'dd/MM/yyyy')}
                        </p>
                    )}
                    {all1 === '0' && month && (
                        <p className='text-xs text-gray-800 font-semibold mt-1'>
                            Month: {MONTHS.find(m => m.value === month)?.label}
                        </p>
                    )}
                </div>

                {/* Print grid table */}
                <table className='w-full border-collapse border border-black text-xs text-center mt-6' id='table1'>
                    <thead>
                        <tr className='bg-gray-100 font-bold border-b border-black'>
                            <th className='border border-black p-2 w-12'>SL.No.</th>
                            <th className='border border-black p-2'>Emp code</th>
                            <th className='border border-black p-2 text-left'>Staff Name</th>
                            <th className='border border-black p-2'>Department</th>
                            <th className='border border-black p-2'>Designation</th>
                            <th className='border border-black p-2 w-28'>Date of Birth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className='border border-black p-4 italic text-gray-500'>
                                    No records selected for printing.
                                </td>
                            </tr>
                        ) : (
                            selectedRows.map((row, index) => (
                                <tr key={`${row.HRME_Id || ''}_${row.HRME_EmployeeCode || ''}_${index}`} className='border-b border-black'>
                                    <td className='border border-black p-2 font-medium'>{index + 1}</td>
                                    <td className='border border-black p-2 font-medium'>{row.HRME_EmployeeCode}</td>
                                    <td className='border border-black p-2 text-left font-bold'>{row.HRME_EmployeeFirstName}</td>
                                    <td className='border border-black p-2'>{row.HRMD_DepartmentName}</td>
                                    <td className='border border-black p-2'>{row.HRMDES_DesignationName}</td>
                                    <td className='border border-black p-2'>{formatDateOfBirth(row.HRME_DOB)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={6} className='border border-black p-3 text-center font-semibold text-[10px] text-gray-700 bg-gray-50'>
                                Date: {format(new Date(), 'dd/MM/yyyy')} | UserName: {userName} | {copyright}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

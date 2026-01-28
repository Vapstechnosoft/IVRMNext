'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IAlumniSearchResult } from '@/types/alumni/clg-alumni-student-search';
import { format } from 'date-fns';
import { Download, Filter, Search as SearchIcon, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface SearchResultsTableProps {
    data: IAlumniSearchResult[];
    onExport: (selectedData: IAlumniSearchResult[]) => void;
}

export default function SearchResultsTable({ data, onExport }: SearchResultsTableProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [filterField, setFilterField] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        let filtered = [...data];

        // Apply search filter
        if (searchValue) {
            const lower = searchValue.toLowerCase();
            filtered = filtered.filter((item) => {
                if (filterField === 'all' || filterField === 'name') {
                    if (`${item.ALCMST_FirstName} ${item.ALCMST_LastName}`.toLowerCase().includes(lower)) return true;
                }
                if (filterField === 'all' || filterField === 'admno') {
                    if (item.ALCMST_AdmNo.toLowerCase().includes(lower)) return true;
                }
                if (filterField === 'all' || filterField === 'course') {
                    if (item.AMCO_CourseName.toLowerCase().includes(lower)) return true;
                }
                if (filterField === 'all' || filterField === 'email') {
                    if (item.ALCMST_emailId.toLowerCase().includes(lower)) return true;
                }
                return false;
            });
        }

        return filtered;
    }, [data, searchValue, filterField]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(paginatedData.map((item) => item.ALCMST_Id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        }
    };

    const handleExport = () => {
        const selectedData = data.filter((item) => selectedIds.includes(item.ALCMST_Id));
        if (selectedData.length === 0) {
            alert('Please select at least one record to export.');
            return;
        }
        onExport(selectedData);
    };

    const handleSelectAllOnPage = () => {
        setSelectedIds(paginatedData.map((item) => item.ALCMST_Id));
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
    };

    const allCheckedOnPage = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(item.ALCMST_Id));

    return (
        <div className='fade-in animate-in space-y-6 duration-500'>
            {/* Toolbar */}
            <div className='flex flex-col items-start justify-between gap-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 lg:flex-row lg:items-center'>
                <div className='flex items-center gap-4'>
                    <div className='rounded-lg border bg-white p-3 shadow-sm'>
                        <Users className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-800'>Search Results</h3>
                        <p className='text-gray-600 text-sm'>
                            Showing {paginatedData.length} of {filteredData.length} records • {selectedIds.length} selected
                        </p>
                    </div>
                </div>

                <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center gap-2'>
                        <div className='relative'>
                            <SearchIcon className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                            <InputText
                                placeholder='Quick search...'
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className='h-10 w-full border-gray-300 pl-9 sm:w-48'
                            />
                        </div>
                        <Select value={filterField} onValueChange={setFilterField}>
                            <SelectTrigger className='h-10 w-32 border-gray-300'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Fields</SelectItem>
                                <SelectItem value='name'>Name</SelectItem>
                                <SelectItem value='admno'>Adm No</SelectItem>
                                <SelectItem value='course'>Course</SelectItem>
                                <SelectItem value='email'>Email</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleSelectAllOnPage}
                            disabled={allCheckedOnPage}
                            className='border-green-200 text-green-700 hover:bg-green-50'>
                            Select All
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleClearSelection}
                            disabled={selectedIds.length === 0}
                            className='border-red-200 text-red-700 hover:bg-red-50'>
                            Clear
                        </Button>
                        <Button
                            variant='default'
                            onClick={handleExport}
                            disabled={selectedIds.length === 0}
                            className='bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:from-green-700 hover:to-emerald-700'>
                            <Download className='mr-2 h-4 w-4' />
                            Export ({selectedIds.length})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className='overflow-hidden rounded-xl border bg-white shadow-lg'>
                <ScrollArea className='h-[500px]'>
                    <Table>
                        <TableHeader className='sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100'>
                            <TableRow className='border-b hover:bg-transparent'>
                                <TableHead className='w-[50px] p-4 text-center'>
                                    <Checkbox checked={allCheckedOnPage} onCheckedChange={(v) => handleToggleAll(!!v)} />
                                </TableHead>
                                <TableHead className='w-[60px] p-4 text-center'>#</TableHead>
                                <TableHead className='min-w-[180px] p-4'>Student Name</TableHead>
                                <TableHead className='min-w-[120px] p-4'>Adm No</TableHead>
                                <TableHead className='min-w-[150px] p-4'>Course</TableHead>
                                <TableHead className='min-w-[120px] p-4'>Branch</TableHead>
                                <TableHead className='w-[80px] p-4 text-center'>Sem</TableHead>
                                <TableHead className='w-[100px] p-4 text-center'>DOB</TableHead>
                                <TableHead className='w-[80px] p-4 text-center'>Gender</TableHead>
                                <TableHead className='min-w-[180px] p-4'>Email</TableHead>
                                <TableHead className='w-[120px] p-4'>Mobile</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className='h-64 text-center'>
                                        <div className='flex flex-col items-center justify-center gap-4 py-8'>
                                            <div className='rounded-full bg-gray-100 p-4'>
                                                <Filter className='h-10 w-10 text-gray-400' />
                                            </div>
                                            <div>
                                                <h4 className='mb-2 font-bold text-gray-700'>No Results Found</h4>
                                                <p className='max-w-md text-gray-500 text-sm'>
                                                    No records match your search criteria. Try adjusting your filters or search terms.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                                    return (
                                        <TableRow
                                            key={item.ALCMST_Id}
                                            className={`group transition-all hover:bg-blue-50/30 ${selectedIds.includes(item.ALCMST_Id) ? 'border-primary border-l-4 bg-blue-50' : ''}`}>
                                            <TableCell className='p-4 text-center'>
                                                <Checkbox
                                                    checked={selectedIds.includes(item.ALCMST_Id)}
                                                    onCheckedChange={(v) => handleToggleOne(item.ALCMST_Id, !!v)}
                                                    className='data-[state=checked]:bg-primary'
                                                />
                                            </TableCell>
                                            <TableCell className='p-4 text-center font-medium text-gray-500'>{globalIndex}</TableCell>
                                            <TableCell className='p-4'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20'>
                                                        <span className='font-bold text-primary'>{item.ALCMST_FirstName.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className='font-semibold text-gray-800'>
                                                            {`${item.ALCMST_FirstName} ${item.ALCMST_MiddleName || ''} ${item.ALCMST_LastName}`}
                                                        </div>
                                                        <div className='mt-0.5 text-gray-500 text-xs'>ID: {item.ALCMST_Id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className='p-4'>
                                                <span className='rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-sm'>
                                                    {item.ALCMST_AdmNo}
                                                </span>
                                            </TableCell>
                                            <TableCell className='p-4'>
                                                <div className='font-medium text-gray-700'>{item.AMCO_CourseName}</div>
                                            </TableCell>
                                            <TableCell className='p-4'>
                                                <span className='rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 text-xs'>
                                                    {item.AMB_BranchName}
                                                </span>
                                            </TableCell>
                                            <TableCell className='p-4 text-center'>
                                                <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-700'>
                                                    {item.AMSE_SEMName.split(' ')[1]}
                                                </span>
                                            </TableCell>
                                            <TableCell className='p-4 text-center text-gray-600 text-sm'>
                                                {item.ALCMST_DOB ? format(new Date(item.ALCMST_DOB), 'dd/MM/yy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className='p-4 text-center'>
                                                <span
                                                    className={`rounded-full px-3 py-1 font-medium text-xs ${item.ALCMST_Sex === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                    {item.ALCMST_Sex}
                                                </span>
                                            </TableCell>
                                            <TableCell className='p-4'>
                                                <a
                                                    href={`mailto:${item.ALCMST_emailId}`}
                                                    className='block truncate text-blue-600 text-sm hover:text-blue-800 hover:underline'
                                                    title={item.ALCMST_emailId}>
                                                    {item.ALCMST_emailId}
                                                </a>
                                            </TableCell>
                                            <TableCell className='p-4'>
                                                <a
                                                    href={`tel:${item.ALCMST_MobileNo}`}
                                                    className='font-mono text-gray-700 text-sm hover:text-primary'>
                                                    {item.ALCMST_MobileNo}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                {paginatedData.length > 0 && (
                    <div className='flex flex-col items-center justify-between gap-4 border-t bg-gray-50 p-4 sm:flex-row'>
                        <div className='text-gray-600 text-sm'>
                            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
                            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                        </div>
                        <div className='flex items-center gap-3'>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(v) => {
                                    setPageSize(Number(v));
                                    setCurrentPage(1);
                                }}>
                                <SelectTrigger className='h-9 w-24 border-gray-300'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='5'>5 per page</SelectItem>
                                    <SelectItem value='10'>10 per page</SelectItem>
                                    <SelectItem value='25'>25 per page</SelectItem>
                                    <SelectItem value='50'>50 per page</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className='h-9 w-9 p-0'>
                                    ←
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size='sm'
                                            onClick={() => setCurrentPage(pageNum)}
                                            className='h-9 w-9 p-0'>
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className='h-9 w-9 p-0'>
                                    →
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

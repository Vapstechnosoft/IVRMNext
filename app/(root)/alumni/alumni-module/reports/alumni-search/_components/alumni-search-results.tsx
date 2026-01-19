'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IAlumniSearchResultItem } from '@/types/alumni/alumni-search';
import { BookOpen, FileDown, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AlumniSearchResultsProps {
    data: IAlumniSearchResultItem[];
}

export default function AlumniSearchResults({ data }: AlumniSearchResultsProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [showAddressBook, setShowAddressBook] = useState(false);

    const filteredData = useMemo(() => {
        if (!searchValue) return data;
        const lower = searchValue.toLowerCase();
        return data.filter(
            (item) =>
                item.amsT_FirstName.toLowerCase().includes(lower) ||
                item.ALMST_MembershipId.toLowerCase().includes(lower) ||
                item.amsT_emailId.toLowerCase().includes(lower) ||
                item.amsT_MobileNo.toLowerCase().includes(lower)
        );
    }, [data, searchValue]);

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredData.map((item) => item.almst_id));
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
        const selectedData = data.filter((item) => selectedIds.includes(item.almst_id));
        if (selectedData.length === 0) {
            toast.warning('Please select at least one record to export.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
            selectedData.map((item, index) => ({
                'SL NO': index + 1,
                'Alumni Name': item.amsT_FirstName,
                DOB: item.amsT_DOB,
                'Mobile No': item.amsT_MobileNo,
                'Email Id': item.amsT_emailId,
                'Joined Year': item.ASMAY_Id_Join,
                'Left Year': item.ASMAY_Id_Left,
                'Member Id': item.ALMST_MembershipId,
                'Member Category': item.ALMMC_MembershipCategory,
                District: item.IVRMMD_Name,
                'Blood Group': item.amsT_BloodGroup,
                Profession: item.ALSPR_Designation,
                'City:State': `${item.ALMST_ConCity}:${item.IVRMMS_Name}`,
                'Full Address': item.ALMST_FullAddess,
                'Pin Code': item.ALMST_PerPincode
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'AlumniSearch');
        XLSX.writeFile(workbook, 'Alumni_Search_Results.xlsx');
    };

    const handlePrint = () => {
        if (selectedIds.length === 0) {
            toast.warning('Please select at least one record to print.');
            return;
        }
        window.print();
    };

    const allChecked = filteredData.length > 0 && selectedIds.length === filteredData.length;

    if (showAddressBook) {
        return (
            <div className='fade-in animate-in space-y-4 duration-500'>
                <div className='flex items-center justify-between px-2'>
                    <h3 className='font-bold text-lg'>Address Book View</h3>
                    <Button variant='outline' onClick={() => setShowAddressBook(false)}>
                        Back to Grid
                    </Button>
                </div>
                <div className='grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 print:block print:border-none'>
                    {data
                        .filter((item) => selectedIds.includes(item.almst_id))
                        .map((item, index) => (
                            <div
                                key={index}
                                className='mb-4 min-h-[160px] break-inside-avoid rounded-lg border border-dashed bg-muted/20 p-4'>
                                <p className='font-mono text-muted-foreground text-xs'>
                                    ({item.ASMAY_Id_NEW_Left || 'N/A'}) ({item.ALMST_MembershipId}) ({item.ALMMC_MembershipCategory})
                                </p>
                                <p className='mt-1 font-bold text-lg'>{item.amsT_FirstName}</p>
                                <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed'>
                                    {item.ALMST_FullAddess} {item.ALMST_District}
                                </p>
                                <p className='mt-1 text-sm'>{item.amsT_MobileNo}</p>
                                <p className='truncate text-primary text-sm underline'>{item.amsT_emailId}</p>
                            </div>
                        ))}
                </div>
                <div className='flex justify-center pt-4 print:hidden'>
                    <Button onClick={() => window.print()}>
                        <Printer className='mr-2 h-4 w-4' /> Print Address Book
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='fade-in animate-in space-y-4 duration-500'>
            <div className='flex flex-col items-center justify-between gap-4 px-2 sm:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <Checkbox id='email_toggle' defaultChecked />
                        <label htmlFor='email_toggle' className='font-medium text-sm'>
                            Email
                        </label>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Checkbox id='ph_toggle' defaultChecked />
                        <label htmlFor='ph_toggle' className='font-medium text-sm'>
                            Phone No.
                        </label>
                    </div>
                </div>
                <div className='relative w-full sm:w-64'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <InputText
                        placeholder='Quick search results...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='h-9 pl-9'
                    />
                </div>
            </div>

            <ScrollArea className='h-[500px] overflow-hidden rounded-xl border bg-card shadow-sm'>
                <Table className='print:hidden'>
                    <TableHeader className='sticky top-0 z-20 bg-muted/50 backdrop-blur-sm'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>
                                <Checkbox checked={allChecked} onCheckedChange={(v) => handleToggleAll(!!v)} />
                            </TableHead>
                            <TableHead className='w-[60px] text-center'>SL NO</TableHead>
                            <TableHead className='min-w-[150px]'>Alumni Name</TableHead>
                            <TableHead className='w-[100px]'>DOB</TableHead>
                            <TableHead className='w-[120px]'>Mobile No</TableHead>
                            <TableHead className='min-w-[150px]'>Email Id</TableHead>
                            <TableHead className='w-[100px]'>Joined Year</TableHead>
                            <TableHead className='w-[100px]'>Left Year</TableHead>
                            <TableHead className='w-[120px]'>Member Id</TableHead>
                            <TableHead className='min-w-[150px]'>Category</TableHead>
                            <TableHead className='min-w-[150px]'>Profession</TableHead>
                            <TableHead className='min-w-[200px]'>Full Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={12} className='h-32 text-center text-muted-foreground'>
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item, index) => (
                                <TableRow key={item.almst_id} className={selectedIds.includes(item.almst_id) ? 'bg-primary/5' : ''}>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedIds.includes(item.almst_id)}
                                            onCheckedChange={(v) => handleToggleOne(item.almst_id, !!v)}
                                        />
                                    </TableCell>
                                    <TableCell className='text-center'>{index + 1}</TableCell>
                                    <TableCell className='font-medium'>{item.amsT_FirstName}</TableCell>
                                    <TableCell className='text-xs'>{item.amsT_DOB}</TableCell>
                                    <TableCell className='font-mono text-xs'>{item.amsT_MobileNo}</TableCell>
                                    <TableCell className='text-xs'>{item.amsT_emailId}</TableCell>
                                    <TableCell className='text-center'>{item.ASMAY_Id_Join}</TableCell>
                                    <TableCell className='text-center'>{item.ASMAY_Id_Left}</TableCell>
                                    <TableCell className='text-xs'>{item.ALMST_MembershipId}</TableCell>
                                    <TableCell className='text-xs'>{item.ALMMC_MembershipCategory}</TableCell>
                                    <TableCell className='text-xs'>{item.ALSPR_Designation}</TableCell>
                                    <TableCell className='max-w-[200px] truncate text-xs' title={item.ALMST_FullAddess}>
                                        {item.ALMST_FullAddess}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Print only table */}
                <table className='hidden w-full border-collapse print:table'>
                    <thead>
                        <tr>
                            <th className='border p-1'>SL</th>
                            <th className='border p-1 text-left'>Name</th>
                            <th className='border p-1'>DOB</th>
                            <th className='border p-1'>Mobile</th>
                            <th className='border p-1 text-left'>Email</th>
                            <th className='border p-1 text-left'>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data
                            .filter((item) => selectedIds.includes(item.almst_id))
                            .map((item, index) => (
                                <tr key={index}>
                                    <td className='border p-1 text-center'>{index + 1}</td>
                                    <td className='border p-1'>{item.amsT_FirstName}</td>
                                    <td className='border p-1 text-center text-xs'>{item.amsT_DOB}</td>
                                    <td className='border p-1 text-center text-xs'>{item.amsT_MobileNo}</td>
                                    <td className='border p-1 text-xs'>{item.amsT_emailId}</td>
                                    <td className='border p-1 text-xs'>{item.ALMST_FullAddess}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </ScrollArea>

            <div className='flex flex-wrap justify-center gap-3 pt-2 print:hidden'>
                <Button
                    variant='outline'
                    onClick={handleExport}
                    disabled={selectedIds.length === 0}
                    className='min-w-[140px] border-primary/20 text-primary'>
                    <FileDown className='mr-2 h-4 w-4' /> Export Excel
                </Button>
                <Button variant='outline' onClick={handlePrint} disabled={selectedIds.length === 0} className='min-w-[120px]'>
                    <Printer className='mr-2 h-4 w-4' /> Print Grid
                </Button>
                <Button
                    variant='outline'
                    onClick={() => setShowAddressBook(true)}
                    disabled={selectedIds.length === 0}
                    className='min-w-[140px] border-orange-200 text-orange-600 hover:bg-orange-50'>
                    <BookOpen className='mr-2 h-4 w-4' /> Address Book
                </Button>
            </div>
        </div>
    );
}
